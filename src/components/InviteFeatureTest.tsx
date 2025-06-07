import React, { useState } from 'react';
import { Card, Button, Space, Typography, Divider, message } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import apiService from '../services/api';
import { checkApiHealth } from '../utils/apiHealth';

const { Title, Paragraph, Text } = Typography;

const InviteFeatureTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    try {
      setTesting(true);
      await testFn();
      setTestResults(prev => ({ ...prev, [testName]: true }));
      message.success(`✅ ${testName} passed`);
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: false }));
      message.error(`❌ ${testName} failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const tests = [
    {
      name: 'API Health Check',
      test: async () => {
        const health = await checkApiHealth();
        if (!health.usingMockData) {
          throw new Error('Expected to use mock data in development');
        }
      }
    },
    {
      name: 'Fetch Invites with Mock Data',
      test: async () => {
        try {
          await apiService.getInvites({ limit: 10 });
          throw new Error('API should fail and use mock data');
        } catch (error) {
          // Expected to fail and use mock data
          if (error instanceof Error && error.message.includes('404')) {
            // This is the expected behavior
            return;
          }
          throw error;
        }
      }
    },
    {
      name: 'Fetch Clinicians with Mock Data',
      test: async () => {
        try {
          await apiService.getClinicians();
          throw new Error('API should fail and use mock data');
        } catch (error) {
          // Expected to fail and use mock data
          if (error instanceof Error && error.message.includes('404')) {
            // This is the expected behavior
            return;
          }
          throw error;
        }
      }
    }
  ];

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.name, test.test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <Card title="🧪 Invite Management Feature Test">
      <Paragraph>
        This component tests the invite management system functionality and mock data integration.
      </Paragraph>

      <Divider />

      <Space direction="vertical" className="w-full">
        <div>
          <Title level={5}>Test Suite</Title>
          {tests.map(test => (
            <div key={test.name} className="flex items-center justify-between py-2">
              <Text>{test.name}</Text>
              <div className="flex items-center gap-2">
                {testResults[test.name] !== undefined && (
                  <span>
                    {testResults[test.name] ? 
                      <CheckCircleOutlined className="text-green-500" /> : 
                      <Text type="danger">❌</Text>
                    }
                  </span>
                )}
                <Button 
                  size="small" 
                  onClick={() => runTest(test.name, test.test)}
                  loading={testing}
                >
                  Run
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Divider />

        <div>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={runAllTests}
            loading={testing}
            block
          >
            Run All Tests
          </Button>
        </div>

        <Divider />

        <div>
          <Title level={5}>Feature Links</Title>
          <Space wrap>
            <Button onClick={() => window.open('/manage-invites', '_blank')}>
              Open Invite Manager
            </Button>
            <Button onClick={() => window.open('/dashboard', '_blank')}>
              Open Dashboard
            </Button>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default InviteFeatureTest;
