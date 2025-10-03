import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Title level={1}>Dashboard</Title>
        <Card>
          <Paragraph>
            Welcome to GenAScope! This is the main dashboard where you can manage 
            patients, appointments, and genetic analysis results.
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};
