import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import ChatComponent from '../../../components/ChatComponent';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the API service
vi.mock('../../../services/api', () => {
  return {
    default: {
      startChat: vi.fn(),
      submitAnswer: vi.fn(),
      getChatHistory: vi.fn(),
    },
    // Add other exports if needed by the component
  };
});

// Import the mocked API service
import apiService from '../../../services/api';

describe('ChatComponent', () => {
  const sessionId = "test_session_123";
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', async () => {
    // Mock the startChat function to return a promise that doesn't resolve yet
    const startChatPromise = new Promise(() => {});
    (apiService.startChat as any).mockReturnValue(startChatPromise);
    
    render(<ChatComponent sessionId={sessionId} />);
    
    expect(screen.getByText(/loading chat.../i)).toBeInTheDocument();
    expect(apiService.startChat).toHaveBeenCalledWith(sessionId);
  });

  it('displays first question after successful fetch', async () => {
    // Mock successful API response with a first question
    (apiService.startChat as any).mockResolvedValue({
      question: { id: 1, text: "Welcome! What is your diagnosis?" }
    });
    
    render(<ChatComponent sessionId={sessionId} />);
    
    await waitFor(() => {
      expect(screen.getByText("Welcome! What is your diagnosis?")).toBeInTheDocument();
    });
    
    // Input field should be visible for answering
    const inputField = screen.getByPlaceholderText(/type your response.../i);
    expect(inputField).toBeInTheDocument();
    
    // Send button should be visible
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    // Mock API failure
    (apiService.startChat as any).mockRejectedValue(new Error("API Error"));
    
    render(<ChatComponent sessionId={sessionId} />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to connect to the chat service/i)).toBeInTheDocument();
    });
  });

  it('allows sending a message and receiving a response', async () => {
    // Mock successful initial question
    (apiService.startChat as any).mockResolvedValue({
      question: { id: 1, text: "What is your diagnosis?" }
    });
    
    // Mock successful answer submission
    (apiService.submitAnswer as any).mockResolvedValue({
      nextQuestion: { id: 2, text: "What treatments have you received?" }
    });
    
    render(<ChatComponent sessionId={sessionId} />);
    
    // Wait for initial question to load
    await waitFor(() => {
      expect(screen.getByText("What is your diagnosis?")).toBeInTheDocument();
    });
    
    // Type and send a response
    const inputField = screen.getByPlaceholderText(/type your response.../i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(inputField, { target: { value: "Breast cancer" } });
    fireEvent.click(sendButton);
    
    // Verify user's message appears
    expect(screen.getByText("Breast cancer")).toBeInTheDocument();
    
    // Verify API was called with correct params
    expect(apiService.submitAnswer).toHaveBeenCalledWith({
      sessionId,
      questionId: 1,
      answer: "Breast cancer"
    });
    
    // Wait for bot response to appear
    await waitFor(() => {
      expect(screen.getByText("What treatments have you received?")).toBeInTheDocument();
    });
  });

  it('allows submitting with Enter key', async () => {
    // Mock successful initial question
    (apiService.startChat as any).mockResolvedValue({
      question: { id: 1, text: "What is your diagnosis?" }
    });
    
    // Mock successful answer submission
    (apiService.submitAnswer as any).mockResolvedValue({
      nextQuestion: { id: 2, text: "Thank you for your response" }
    });
    
    render(<ChatComponent sessionId={sessionId} />);
    
    // Wait for initial question to load
    await waitFor(() => {
      expect(screen.getByText("What is your diagnosis?")).toBeInTheDocument();
    });
    
    // Type and press Enter to send
    const inputField = screen.getByPlaceholderText(/type your response.../i);
    
    fireEvent.change(inputField, { target: { value: "Lung cancer" } });
    fireEvent.keyPress(inputField, { key: 'Enter', code: 'Enter', charCode: 13 });
    
    // Verify API was called
    await waitFor(() => {
      expect(apiService.submitAnswer).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error when submitAnswer API fails', async () => {
    // Mock successful initial question
    (apiService.startChat as any).mockResolvedValue({
      question: { id: 1, text: "What is your diagnosis?" }
    });
    
    // Mock failed answer submission
    (apiService.submitAnswer as any).mockRejectedValue(new Error("Network error"));
    
    render(<ChatComponent sessionId={sessionId} />);
    
    // Wait for initial question to load
    await waitFor(() => {
      expect(screen.getByText("What is your diagnosis?")).toBeInTheDocument();
    });
    
    // Type and send a response
    const inputField = screen.getByPlaceholderText(/type your response.../i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(inputField, { target: { value: "Prostate cancer" } });
    fireEvent.click(sendButton);
    
    // Verify user's message appears
    expect(screen.getByText("Prostate cancer")).toBeInTheDocument();
    
    // Wait for error message to appear
    await waitFor(() => {
      // Using getAllByText because there might be multiple elements with this text
      expect(screen.getAllByText(/Sorry, there was an error submitting your answer/i).length).toBeGreaterThan(0);
    });
  });

  it('shows chat finished message when no next question is returned', async () => {
    // Mock successful initial question
    (apiService.startChat as any).mockResolvedValue({
      question: { id: 1, text: "What is your diagnosis?" }
    });
    
    // Mock successful answer submission with no next question (end of chat)
    (apiService.submitAnswer as any).mockResolvedValue({
      nextQuestion: null
    });
    
    render(<ChatComponent sessionId={sessionId} />);
    
    // Wait for initial question to load
    await waitFor(() => {
      expect(screen.getByText("What is your diagnosis?")).toBeInTheDocument();
    });
    
    // Type and send a response
    const inputField = screen.getByPlaceholderText(/type your response.../i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(inputField, { target: { value: "Final answer" } });
    fireEvent.click(sendButton);
    
    // Wait for thank you message and chat finished message
    await waitFor(() => {
      expect(screen.getByText(/Thank you! Your responses have been recorded./i)).toBeInTheDocument();
      expect(screen.getByText(/Chat finished./i)).toBeInTheDocument();
    });
    
    // Input field should no longer be visible
    expect(screen.queryByPlaceholderText(/type your response.../i)).not.toBeInTheDocument();
  });
});