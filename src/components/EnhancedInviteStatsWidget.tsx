import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Button, Typography } from 'antd';
import { EyeOutlined, MailOutlined } from '@ant-design/icons';
import InviteStatsChart from './InviteStatsChart';
import apiService from '../services/api';
import type { InviteStatus } from '../types/patients';

const { Title } = Typography;

interface InviteStats {
  pending: number;
  completed: number;
  expired: number;
  cancelled: number;
  total: number;
}

interface EnhancedInviteStatsWidgetProps {
  onApiUnavailable?: () => void;
}

const EnhancedInviteStatsWidget: React.FC<EnhancedInviteStatsWidgetProps> = ({ onApiUnavailable }) => {
  const [stats, setStats] = useState<InviteStats>({
    pending: 0,
    completed: 0,
    expired: 0,
    cancelled: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInviteStats();
  }, []);

  const fetchInviteStats = async () => {
    try {
      setLoading(true);
      
      // Fetch invite statistics in a single API call for better performance
      const newStats = await apiService.getInviteStatistics();
      
      setStats(newStats);
      console.log('📊 Enhanced Widget - Loaded invite statistics:', newStats);
    } catch (error) {
      console.error('Failed to fetch invite statistics:', error);
      
      // Notify parent component that API is unavailable
      onApiUnavailable?.();
      
      // Use mock data when API is not available
      const mockStats = {
        pending: 12,
        completed: 45,
        expired: 3,
        cancelled: 2,
        total: 62
      };
      
      setStats(mockStats);
      console.log('📊 Enhanced Widget - Using mock data:', mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    window.location.href = '/manage-invites';
  };

  if (loading) {
    return (
      <Card title="Invite Analytics" className="h-full">
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <span>
            <MailOutlined className="mr-2" />
            Invite Analytics
          </span>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={handleViewAll}
            size="small"
          >
            View All
          </Button>
        </div>
      }
      className="h-full"
    >
      <Row gutter={[16, 16]}>
        {/* Statistics Summary */}
        <Col span={24}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              {stats.total}
            </Title>
            <div style={{ color: '#666', fontSize: '14px' }}>Total Invites Sent</div>
          </div>
        </Col>
        
        {/* Pie Chart */}
        <Col span={24}>
          <InviteStatsChart 
            stats={{
              pending: stats.pending,
              completed: stats.completed,
              expired: stats.expired,
              cancelled: stats.cancelled
            }}
            title=""
            loading={loading}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default EnhancedInviteStatsWidget;
