// Comprehensive Appointment Dashboard
import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  Card, 
  Badge, 
  Statistic, 
  Row, 
  Col, 
  Button,
  Select,
  DatePicker,
  Space,
  Typography,
  Alert
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons';
import AppointmentsList from './AppointmentsList';
import SchedulingComponent from './SchedulingComponent';
import ClinicianAvailabilityManager from './ClinicianAvailabilityManager';
import apiService from '../services/api';
import type { AppointmentResponse } from '../services/api';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

interface AppointmentDashboardProps {
  userRole: 'clinician' | 'patient' | 'admin';
  userId: string;
  clinicianId?: string;
  patientId?: string;
}

interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  today: number;
  thisWeek: number;
}

const AppointmentDashboard: React.FC<AppointmentDashboardProps> = ({
  userRole,
  userId,
  clinicianId,
  patientId
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    thisWeek: 0
  });
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate statistics from appointments
  const calculateStats = (appointmentList: AppointmentResponse[]): AppointmentStats => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    const getAppointmentDate = (apt: AppointmentResponse): Date => {
      // Handle new API format with separate date and time fields
      if (apt.date && apt.time) {
        return new Date(`${apt.date}T${apt.time}`);
      }
      // Fallback to old format with combined date_time field
      if (apt.date_time) {
        return new Date(apt.date_time);
      }
      return new Date(0); // Invalid date fallback
    };

    return {
      total: appointmentList.length,
      scheduled: appointmentList.filter(apt => apt.status === 'scheduled').length,
      completed: appointmentList.filter(apt => apt.status === 'completed').length,
      cancelled: appointmentList.filter(apt => apt.status === 'cancelled').length,
      today: appointmentList.filter(apt => {
        const aptDate = getAppointmentDate(apt);
        return aptDate.toDateString() === today.toDateString();
      }).length,
      thisWeek: appointmentList.filter(apt => {
        const aptDate = getAppointmentDate(apt);
        return aptDate >= startOfWeek && aptDate <= endOfWeek;
      }).length
    };
  };

  // Fetch appointments and calculate stats
  const fetchAppointmentData = async () => {
    setLoading(true);
    try {
      let response;
      if (userRole === 'clinician' && clinicianId) {
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        response = await apiService.getClinicianAppointments(clinicianId, startDate, endDate);
      } else if (userRole === 'patient' && patientId) {
        response = await apiService.getPatientAppointments(patientId);
      } else if (userRole === 'admin') {
        // For admin users, fetch all organization appointments
        response = await apiService.getOrganizationAppointments();
      }
      
      if (response?.appointments) {
        setAppointments(response.appointments);
        setStats(calculateStats(response.appointments));
      }
    } catch (error) {
      console.error('Error fetching appointment data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentData();
  }, [userRole, clinicianId, patientId]);

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'processing';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2}>
          {userRole === 'clinician' ? 'Clinician Dashboard' : 
           userRole === 'admin' ? 'Admin Dashboard - All Appointments' : 
           'Patient Dashboard'}
        </Title>
        <p className="text-gray-600">
          {userRole === 'clinician' 
            ? 'Manage your appointments, availability, and patient scheduling'
            : userRole === 'admin'
            ? 'View and manage all appointments across the organization'
            : 'View and book your appointments with healthcare providers'}
        </p>
      </div>

      {/* Statistics Overview */}
      <Card className="mb-6">
        <Title level={4}>Appointment Statistics</Title>
        <Row gutter={16}>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="Total Appointments"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="Scheduled"
              value={stats.scheduled}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="Today"
              value={stats.today}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Statistic
              title="This Week"
              value={stats.thisWeek}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Badge count={stats.cancelled} offset={[10, 0]}>
              <Statistic
                title="Cancelled"
                value={stats.cancelled}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Badge>
          </Col>
        </Row>
      </Card>

      {/* Main Content Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Overview" key="overview">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Recent Appointments" loading={loading}>
                <AppointmentsList 
                  clinicianId={userRole === 'clinician' ? clinicianId : undefined}
                  patientId={userRole === 'patient' ? patientId : undefined}
                  showFilters={false}
                  pageSize={5}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Quick Actions">
                <Space direction="vertical" className="w-full">
                  {userRole === 'clinician' && (
                    <>
                      <Button 
                        type="primary" 
                        icon={<CalendarOutlined />} 
                        block
                        onClick={() => setActiveTab('availability')}
                      >
                        Set Availability
                      </Button>
                      <Button 
                        icon={<UserOutlined />} 
                        block
                        onClick={() => setActiveTab('manage')}
                      >
                        Manage Appointments
                      </Button>
                    </>
                  )}
                  {userRole === 'patient' && (
                    <Button 
                      type="primary" 
                      icon={<CalendarOutlined />} 
                      block
                      onClick={() => setActiveTab('schedule')}
                    >
                      Book Appointment
                    </Button>
                  )}
                  <Button 
                    icon={<SettingOutlined />} 
                    block
                    onClick={() => setActiveTab('all-appointments')}
                  >
                    View All Appointments
                  </Button>
                </Space>
              </Card>

              {/* Today's Appointments */}
              <Card title="Today's Schedule" className="mt-4">
                {appointments
                  .filter(apt => {
                    const aptDate = apt.date && apt.time
                      ? new Date(`${apt.date}T${apt.time}`)
                      : apt.date_time
                        ? new Date(apt.date_time)
                        : new Date(0);
                    const today = new Date();
                    return aptDate.toDateString() === today.toDateString();
                  })
                  .slice(0, 3)
                  .map((apt, index) => {
                    const aptTime = apt.time
                      ? new Date(`${apt.date}T${apt.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : apt.date_time
                        ? new Date(apt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Invalid time';

                    return (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">
                            {userRole === 'clinician' ? apt.patient_name : apt.clinician_name}
                          </p>
                          <p className="text-sm text-gray-500">{aptTime}</p>
                        </div>
                        <Badge status={getStatusColor(apt.status)} text={apt.status} />
                      </div>
                    );
                  })}
                {stats.today === 0 && (
                  <p className="text-gray-500 text-center py-4">No appointments scheduled for today</p>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="All Appointments" key="all-appointments">
          <AppointmentsList
            appointments={appointments}
            isClinicianView={userRole === 'clinician'}
            isOrganizationView={userRole === 'admin'}
            showFilters={true}
          />
        </TabPane>

        {userRole === 'patient' && (
          <TabPane tab="Book Appointment" key="schedule">
            <Card>
              <SchedulingComponent 
                patientId={patientId}
                afterBooking={() => {
                  fetchAppointmentData();
                  setActiveTab('overview');
                }}
              />
            </Card>
          </TabPane>
        )}

        {userRole === 'clinician' && (
          <>
            <TabPane tab="Set Availability" key="availability">
              <Card>
                <ClinicianAvailabilityManager 
                  clinicianId={clinicianId || ''}
                />
              </Card>
            </TabPane>

            <TabPane tab="Manage Appointments" key="manage">
              <AppointmentsList 
                appointments={appointments}
                clinicianId={clinicianId}
                isClinicianView={true}
              />
            </TabPane>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default AppointmentDashboard;
