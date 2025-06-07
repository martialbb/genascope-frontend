import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Space, Typography, Divider } from 'antd';
import { PlusOutlined, FileTextOutlined, DownloadOutlined } from '@ant-design/icons';
import InviteManager from './InviteManager';
import InviteStatsWidget from './InviteStatsWidget';
import ApiStatusBanner from './ApiStatusBanner';

const { Title, Text } = Typography;

interface InviteDashboardProps {
  currentUserId?: string;
}

const InviteDashboard: React.FC<InviteDashboardProps> = ({ currentUserId }) => {
  const [user, setUser] = useState<any>(null);
  const [showApiWarning, setShowApiWarning] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('authUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleCreateInvite = () => {
    window.location.href = '/patients';
  };

  const handleViewPatients = () => {
    window.location.href = '/patients';
  };

  const handleBulkInvite = () => {
    window.location.href = '/patients';
  };

  const canManageInvites = user && (user.role === 'admin' || user.role === 'clinician' || user.role === 'physician');

  if (!canManageInvites) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Title level={4}>Access Denied</Title>
            <Text type="secondary">
              You don't have permission to manage invites. Please contact your administrator.
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2}>Invite Management Dashboard</Title>
          <Text type="secondary">
            Manage patient invitations, track status, and view analytics
          </Text>
        </div>

        {/* Stats and Quick Actions */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={8}>
            <InviteStatsWidget onApiUnavailable={() => setShowApiWarning(true)} />
          </Col>
          
          <Col xs={24} md={16}>
            <Card title="Quick Actions" className="h-full">
              <Space direction="vertical" size="middle" className="w-full">
                <div>
                  <Text strong>Patient Management</Text>
                  <div className="mt-2">
                    <Space wrap>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleViewPatients}
                      >
                        Create & Invite Patients
                      </Button>
                      <Button 
                        icon={<FileTextOutlined />}
                        onClick={handleBulkInvite}
                      >
                        Bulk Invite
                      </Button>
                    </Space>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <Text strong>Reports & Analytics</Text>
                  <div className="mt-2">
                    <Space wrap>
                      <Button 
                        icon={<DownloadOutlined />}
                        disabled
                      >
                        Export Report (Coming Soon)
                      </Button>
                    </Space>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* API Status Banner */}
        <ApiStatusBanner show={showApiWarning} />

        {/* Main Invite Manager */}
        <InviteManager 
          currentUserId={currentUserId} 
          onApiUnavailable={() => setShowApiWarning(true)}
        />
      </div>
    </div>
  );
};

export default InviteDashboard;
