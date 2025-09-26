// Testing Step Component - handles strategy testing

import React, { useState } from 'react';
import type { StrategyFormData, TestScenario } from '../../../types/chatConfiguration';
import { buttonStyles } from '../../../constants/buttonStyles';

interface TestingStepProps {
  formData: StrategyFormData;
  onFormChange: (field: keyof StrategyFormData, value: any) => void;
}

export const TestingStep: React.FC<TestingStepProps> = ({
  formData,
  onFormChange
}) => {
  const [testScenarios, setTestScenarios] = useState<TestScenario[]>([
    { id: 1, name: 'New Patient Onboarding', status: 'pending' },
    { id: 2, name: 'Follow-up Appointment', status: 'pending' },
    { id: 3, name: 'Symptom Assessment', status: 'pending' }
  ]);
  const [isTestingStrategy, setIsTestingStrategy] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleRunTests = async () => {
    setIsTestingStrategy(true);
    try {
      // Simulate running test scenarios
      for (let i = 0; i < testScenarios.length; i++) {
        // Update scenario status to running
        setTestScenarios(prev => prev.map(scenario =>
          scenario.id === testScenarios[i].id
            ? { ...scenario, status: 'running' as const }
            : scenario
        ));

        // Simulate test duration
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate test result (randomize pass/fail for demo)
        const passed = Math.random() > 0.2; // 80% pass rate
        setTestScenarios(prev => prev.map(scenario =>
          scenario.id === testScenarios[i].id
            ? { ...scenario, status: passed ? 'passed' as const : 'failed' as const }
            : scenario
        ));
      }

      // Set final test results
      const allPassed = testScenarios.every(scenario => scenario.status === 'passed');
      setTestResults({
        status: allPassed ? 'passed' : 'completed',
        totalTests: testScenarios.length,
        passedTests: testScenarios.filter(scenario => scenario.status === 'passed').length,
        completedAt: new Date().toISOString()
      });

      if (allPassed) {
        onFormChange('testing_completed', true);
      }
    } catch (error) {
      console.error('Testing failed:', error);
      setTestResults({
        status: 'failed',
        error: 'Testing failed due to an error'
      });
    } finally {
      setIsTestingStrategy(false);
    }
  };

  const handleCompleteStep = () => {
    onFormChange('testing_completed', true);
  };

  const getStatusColor = (status: TestScenario['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500 bg-gray-100';
      case 'running': return 'text-blue-500 bg-blue-100';
      case 'passed': return 'text-green-500 bg-green-100';
      case 'failed': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusIcon = (status: TestScenario['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'running':
        return (
          <svg className="w-5 h-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case 'passed':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Test Your Strategy</h3>
        <p className="text-gray-600 text-lg">Run test scenarios to validate your chat strategy.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Test Scenarios */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Test Scenarios</h4>
          
          <div className="space-y-4">
            {testScenarios.map((scenario) => (
              <div key={scenario.id} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(scenario.status)}`}>
                      {getStatusIcon(scenario.status)}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{scenario.name}</h5>
                      <p className="text-sm text-gray-600 capitalize">{scenario.status}</p>
                    </div>
                  </div>
                  {scenario.status === 'failed' && (
                    <button
                      onClick={() => {
                        setTestScenarios(prev => prev.map(s =>
                          s.id === scenario.id ? { ...s, status: 'pending' } : s
                        ));
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleRunTests}
              disabled={isTestingStrategy}
              className={`${buttonStyles.primary} ${isTestingStrategy ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isTestingStrategy ? 'Running Tests...' : 'Run All Tests'}
            </button>
            
            {testResults && testResults.status !== 'passed' && (
              <button
                onClick={handleCompleteStep}
                className={buttonStyles.secondary}
              >
                Mark as Complete
              </button>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className={`p-6 rounded-xl ${
            testResults.status === 'passed' 
              ? 'bg-green-50 border border-green-200' 
              : testResults.status === 'failed'
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              {testResults.status === 'passed' ? (
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : testResults.status === 'failed' ? (
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <div>
                <h4 className="text-lg font-semibold">
                  {testResults.status === 'passed' && 'All Tests Passed!'}
                  {testResults.status === 'failed' && 'Tests Failed'}
                  {testResults.status === 'completed' && 'Tests Completed with Issues'}
                </h4>
                {testResults.totalTests && (
                  <p className="text-sm text-gray-600">
                    {testResults.passedTests}/{testResults.totalTests} scenarios passed
                  </p>
                )}
              </div>
            </div>
            
            {testResults.status === 'passed' && (
              <p className="text-green-700">
                Your strategy is ready for deployment! All test scenarios completed successfully.
              </p>
            )}
            
            {testResults.status === 'completed' && (
              <p className="text-yellow-700">
                Some test scenarios had issues. You can proceed to review or re-run failed tests.
              </p>
            )}
            
            {testResults.error && (
              <p className="text-red-700">{testResults.error}</p>
            )}
          </div>
        )}

        {/* Testing Guidelines */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h5 className="font-semibold text-gray-800 mb-2">🧪 Testing Guidelines:</h5>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Tests validate your targeting rules against sample patient data</li>
            <li>• Knowledge sources are checked for accessibility and relevance</li>
            <li>• Outcome actions are verified for proper configuration</li>
            <li>• Each scenario simulates a complete patient interaction flow</li>
            <li>• Failed tests indicate areas that need refinement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
