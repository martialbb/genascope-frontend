import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
  // Setup authentication before tests
  test.beforeEach(async ({ page }) => {
    // Mock authentication state by setting localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('genascopeUser', JSON.stringify({
        id: '1',
        name: 'Test Patient',
        role: 'patient',
        token: 'fake-jwt-token'
      }));
    });
    
    // Navigate to chat page
    await page.goto('/chat');
  });
  
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Clear authentication
    await page.evaluate(() => localStorage.removeItem('genascopeUser'));
    
    // Try to access chat page
    await page.goto('/chat');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });
  
  test('should display chat interface', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Chat | Genascope/);
    
    // Check for chat container
    const chatContainer = page.locator('.chat-container');
    await expect(chatContainer).toBeVisible();
    
    // Check for message input
    const messageInput = page.getByPlaceholder(/type.*message/i) || page.getByLabel(/message/i);
    await expect(messageInput).toBeVisible();
    
    // Check for send button
    const sendButton = page.getByRole('button', { name: /send/i });
    await expect(sendButton).toBeVisible();
  });
  
  test('should send and receive messages', async ({ page }) => {
    // Mock chat API response
    await page.route('**/api/start_chat', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, sessionId: 'test-session-123' })
      });
    });
    
    await page.route('**/api/submit_answer', async route => {
      const postData = route.request().postData();
      let message = "Default response";
      
      if (postData && postData.includes("How are you")) {
        message = "I'm doing well, thank you for asking!";
      }
      
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          success: true, 
          message: message
        })
      });
    });
    
    // Type a message
    const messageInput = page.getByPlaceholder(/type.*message/i) || page.getByLabel(/message/i);
    await messageInput.fill('How are you today?');
    
    // Click send button
    const sendButton = page.getByRole('button', { name: /send/i });
    await sendButton.click();
    
    // Check that user message appears in chat
    const userMessage = page.getByText('How are you today?');
    await expect(userMessage).toBeVisible({ timeout: 5000 });
    
    // Check that response appears
    const botResponse = page.getByText("I'm doing well, thank you for asking!");
    await expect(botResponse).toBeVisible({ timeout: 5000 });
  });
  
  test('should handle empty message validation', async ({ page }) => {
    // Try to send empty message
    const sendButton = page.getByRole('button', { name: /send/i });
    await sendButton.click();
    
    // Check for validation message
    const validationMessage = page.getByText(/please enter a message/i);
    await expect(validationMessage).toBeVisible();
  });
  
  test('should display chat history', async ({ page }) => {
    // Mock chat history API response
    await page.route('**/api/chat_history', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          history: [
            { sender: 'user', message: 'Hello, I have a question.' },
            { sender: 'bot', message: 'Hi there! How can I help you today?' },
            { sender: 'user', message: 'What are my treatment options?' },
            { sender: 'bot', message: 'Based on your diagnosis, there are several treatment options available...' }
          ]
        })
      });
    });
    
    // Reload page to trigger history fetch
    await page.reload();
    
    // Check that history messages are displayed
    const historyMessages = page.locator('.message');
    await expect(historyMessages).toHaveCount(4);
    
    // Check specific messages
    await expect(page.getByText('Hello, I have a question.')).toBeVisible();
    await expect(page.getByText('What are my treatment options?')).toBeVisible();
  });
});