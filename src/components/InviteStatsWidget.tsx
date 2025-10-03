import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Spin, Button } from 'antd';
import { 
  MailOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  EyeOutlined 
} from '@ant-design/icons';
import apiService from '../services/api';
import type { InviteStatus } from '../types/patients';

interface InviteStats {
  pending: number;
  completed: number;
  expired: number;
  cancelled: number;
  total: number;
}

interface InviteStatsWidgetProps {
  onApiUnavailable?: () => void;
}

const InviteStatsWidget: React.FC<InviteStatsWidgetProps> = ({ onApiUnavailable }) => {
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
      
      // Fetch invites for each status to get counts
      const [pendingRes, completedRes, expiredRes, cancelledRes] = await Promise.all([
        apiService.getInvites({ status: 'pending' as InviteStatus, limit: 1 }),
        apiService.getInvites({ status: 'completed' as InviteStatus, limit: 1 }),
        apiService.getInvites({ status: 'expired' as InviteStatus, limit: 1 }),
        apiService.getInvites({ status: 'cancelled' as InviteStatus, limit: 1 })
      ]);

      const newStats = {
        pending: pendingRes.total,
        completed: completedRes.total,
        expired: expiredRes.total,
        cancelled: cancelledRes.total,
        total: pendingRes.total + completedRes.total + expiredRes.total + cancelledRes.total
      };

      setStats(newStats);
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
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    window.location.href = '/manage-invites';
  };

  if (loading) {
    return (
      <Card title="Invite Statistics" className="h-full">
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
            Invite Statistics
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
        <Col span={12}>
          <Statistic
            title="Pending"
            value={stats.pending}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Completed"
            value={stats.completed}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Expired"
            value={stats.expired}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="Total"
            value={stats.total}
            valueStyle={{ color: '#1890ff' }}
            prefix={<MailOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default InviteStatsWidget;
