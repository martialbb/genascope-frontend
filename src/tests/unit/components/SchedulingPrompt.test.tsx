import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SchedulingPrompt from '../../../components/SchedulingPrompt';

describe('SchedulingPrompt', () => {
  const patientId = 'patient-123';
  
  beforeEach(() => {
    // Mock window location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });
  
  it('should render default prompt content', () => {
    render(<SchedulingPrompt patientId={patientId} />);
    
    // Check default content
    expect(screen.getByText('Schedule a Follow-Up')).toBeInTheDocument();
    expect(screen.getByText(/Connect with a genetic counselor/i)).toBeInTheDocument();
    expect(screen.getByText('Schedule Consultation')).toBeInTheDocument();
  });
  
  it('should show high risk prompt for eligible results', () => {
    const eligibilityResult = {
      is_eligible: true,
      nccn_eligible: true,
      tyrer_cuzick_score: 25,
      tyrer_cuzick_threshold: 20
    };
    
    render(
      <SchedulingPrompt 
        patientId={patientId} 
        eligibilityResult={eligibilityResult} 
      />
    );
    
    // Check high risk content
    expect(screen.getByText('Genetic Testing Recommended')).toBeInTheDocument();
    expect(screen.getByText(/Based on your risk assessment/i)).toBeInTheDocument();
    expect(screen.getByText('Schedule Priority Consultation')).toBeInTheDocument();
    
    // Should have high urgency styling
    const container = screen.getByText('Genetic Testing Recommended').closest('div');
    expect(container).toHaveClass('border-red-300 bg-red-50');
  });
  
  it('should show lower risk prompt for non-eligible results', () => {
    const eligibilityResult = {
      is_eligible: false,
      nccn_eligible: false,
      tyrer_cuzick_score: 15,
      tyrer_cuzick_threshold: 20
    };
    
    render(
      <SchedulingPrompt 
        patientId={patientId} 
        eligibilityResult={eligibilityResult} 
      />
    );
    
    // Check lower risk content
    expect(screen.getByText('Risk Assessment Complete')).toBeInTheDocument();
    expect(screen.getByText(/You may benefit from discussing/i)).toBeInTheDocument();
    expect(screen.getByText('Schedule Optional Consultation')).toBeInTheDocument();
    
    // Should have low urgency styling
    const container = screen.getByText('Risk Assessment Complete').closest('div');
    expect(container).toHaveClass('border-green-300 bg-green-50');
  });
  
  it('should show test results prompt when results are available', () => {
    render(
      <SchedulingPrompt 
        patientId={patientId} 
        testResultsAvailable={true} 
      />
    );
    
    // Check test results content
    expect(screen.getByText('Your Test Results Are Ready')).toBeInTheDocument();
    expect(screen.getByText(/Schedule a consultation with a genetic counselor/i)).toBeInTheDocument();
    expect(screen.getByText('Schedule Results Consultation')).toBeInTheDocument();
    
    // Should have medium urgency styling
    const container = screen.getByText('Your Test Results Are Ready').closest('div');
    expect(container).toHaveClass('border-blue-300 bg-blue-50');
  });
  
  it('should navigate to scheduling page when button is clicked', () => {
    render(<SchedulingPrompt patientId={patientId} />);
    
    // Click the scheduling button
    const button = screen.getByText('Schedule Consultation');
    button.click();
    
    // Check that we would navigate to the scheduling page with correct params
    expect(window.location.href).toBe(`/schedule-appointment?type=patient&patientId=${patientId}`);
  });
});
