import React from 'react';
import { Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface ApiStatusBannerProps {
  show: boolean;
  message?: string;
}

const ApiStatusBanner: React.FC<ApiStatusBannerProps> = ({ 
  show, 
  message = "Backend API is not available. Using mock data for demonstration purposes." 
}) => {
  if (!show) return null;

  return (
    <Alert
      message="Development Mode"
      description={message}
      type="info"
      icon={<InfoCircleOutlined />}
      showIcon
      closable
      className="mb-4"
      banner
    />
  );
};

export default ApiStatusBanner;
