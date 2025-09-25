import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Button, Typography } from 'antd';
import { EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import AppointmentStatsChart from './AppointmentStatsChart';
import apiService from '../services/api';

const { Title } = Typography;

interface AppointmentStats {
  scheduled: number;
  completed: number;
  cancelled: number;
  rescheduled: number;
  total: number;
  today: number;
  thisWeek: number;
}

interface EnhancedAppointmentStatsWidgetProps {
  onApiUnavailable?: () => void;
}

const EnhancedAppointmentStatsWidget: React.FC<EnhancedAppointmentStatsWidgetProps> = ({ onApiUnavailable }) => {
  const [stats, setStats] = useState<AppointmentStats>({
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    rescheduled: 0,
    total: 0,
    today: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentStats();
  }, []);

  const fetchAppointmentStats = async () => {
    try {
      setLoading(true);
      
      // Get current user from localStorage
      const userData = localStorage.getItem('authUser');
      if (!userData) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userData);
      const userId = user.user_id || user.id;
      
      console.log('📅 Fetching appointment statistics for user:', userId);
      
      // Fetch appointments for current user
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      let response;
      if (user.role === 'clinician' || user.role === 'physician') {
        response = await apiService.getClinicianAppointments(userId, startDate, endDate);
      } else {
        response = await apiService.getPatientAppointments(userId);
      }
      
      const appointments = response.appointments || [];
      
      // Calculate statistics
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
      
      const newStats = {
        scheduled: appointments.filter(apt => apt.status === 'scheduled').length,
        completed: appointments.filter(apt => apt.status === 'completed').length,
        cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
        rescheduled: appointments.filter(apt => apt.status === 'rescheduled').length,
        total: appointments.length,
        today: appointments.filter(apt => {
          const aptDate = new Date(apt.date_time);
          return aptDate.toDateString() === today.toDateString();
        }).length,
        thisWeek: appointments.filter(apt => {
          const aptDate = new Date(apt.date_time);
          return aptDate >= startOfWeek && aptDate <= endOfWeek;
        }).length
      };
      
      setStats(newStats);
      console.log('📅 Enhanced Widget - Loaded appointment statistics:', newStats);
    } catch (error) {
      console.error('Failed to fetch appointment statistics:', error);
      
      // Notify parent component that API is unavailable
      onApiUnavailable?.();
      
      // Use mock data when API is not available
      const mockStats = {
        scheduled: 8,
        completed: 25,
        cancelled: 3,
        rescheduled: 2,
        total: 38,
        today: 2,
        thisWeek: 7
      };
      
      setStats(mockStats);
      console.log('📅 Enhanced Widget - Using mock data:', mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    window.location.href = '/appointments-dashboard';
  };

  if (loading) {
    return (
      <Card title="Appointment Analytics" className="h-full">
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
            <CalendarOutlined className="mr-2" />
            Appointment Analytics
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
            <div style={{ color: '#666', fontSize: '14px' }}>Total Appointments</div>
            <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
              {stats.today} today • {stats.thisWeek} this week
            </div>
          </div>
        </Col>
        
        {/* Pie Chart */}
        <Col span={24}>
          <AppointmentStatsChart 
            stats={{
              scheduled: stats.scheduled,
              completed: stats.completed,
              cancelled: stats.cancelled,
              rescheduled: stats.rescheduled
            }}
            title=""
            loading={loading}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default EnhancedAppointmentStatsWidget;
