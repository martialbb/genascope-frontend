import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Result, Button, Card, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined, HomeOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class InviteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console for debugging
    console.error('Invite Management Error:', error, errorInfo);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="m-4">
          <Result
            status="error"
            icon={<ExclamationCircleOutlined />}
            title="Invite Management Error"
            subTitle="Something went wrong while loading the invite management system."
            extra={
              <Space direction="vertical" size="middle" className="mt-4">
                <Space>
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    onClick={this.handleRetry}
                  >
                    Try Again
                  </Button>
                  <Button 
                    icon={<HomeOutlined />}
                    onClick={this.handleGoHome}
                  >
                    Go to Dashboard
                  </Button>
                </Space>
                
                {(import.meta.env as any).DEV && this.state.error && (
                  <div className="mt-6 p-4 bg-gray-50 rounded border text-left">
                    <Text strong className="block mb-2">Debug Information:</Text>
                    <Paragraph className="mb-2">
                      <Text code className="text-red-600">{this.state.error.message}</Text>
                    </Paragraph>
                    {this.state.errorInfo?.componentStack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                          Component Stack
                        </summary>
                        <pre className="mt-2 text-xs bg-white p-2 border rounded overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </Space>
            }
          />
        </Card>
      );
    }

    return this.props.children;
  }
}

export default InviteErrorBoundary;
