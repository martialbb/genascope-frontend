import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Select, Input, DatePicker, Space, Tag, message, Modal, Form, Tooltip, Typography } from 'antd';
import { 
  MailOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  SearchOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SendOutlined,
  FilterOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import apiService from '../services/api';
import InviteStatusIndicator from './InviteStatusIndicator';
import type { 
  Invite, 
  InviteStatus, 
  InviteListParams, 
  ResendInviteRequest,
  Clinician 
} from '../types/patients';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { confirm } = Modal;

interface InviteManagerProps {
  currentUserId?: string;
  onApiUnavailable?: () => void;
}

const InviteManager: React.FC<InviteManagerProps> = ({ currentUserId, onApiUnavailable }) => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  
  // Filter states
  const [filters, setFilters] = useState<InviteListParams>({
    page: 1,
    limit: 10
  });

  const [resendForm] = Form.useForm();

  // Load clinicians for filtering
  useEffect(() => {
    const loadClinicians = async () => {
      try {
        const response = await apiService.getClinicians();
        setClinicians(response);
      } catch (error) {
        console.error('Failed to load clinicians:', error);
        
        // Use mock clinicians when API is not available
        const mockClinicians: Clinician[] = [
          { id: 'provider1', name: 'Dr. Smith', email: 'dr.smith@example.com', role: 'physician' },
          { id: 'provider2', name: 'Dr. Johnson', email: 'dr.johnson@example.com', role: 'physician' },
          { id: 'provider3', name: 'Dr. Williams', email: 'dr.williams@example.com', role: 'clinician' }
        ];
        setClinicians(mockClinicians);
      }
    };
    loadClinicians();
  }, []);

  // Load invites when component mounts or filters change
  useEffect(() => {
    fetchInvites();
  }, [filters]);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInvites(filters);
      setInvites(response.invites);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch invites:', error);
      
      // Notify parent component that API is unavailable
      onApiUnavailable?.();
      
      // Use mock data when API is not available
      const mockInvites: Invite[] = [
        {
          id: '1',
          patient_id: 'patient1',
          patient_name: 'John Doe',
          patient_email: 'john.doe@example.com',
          provider_id: 'provider1',
          provider_name: 'Dr. Smith',
          status: 'pending' as InviteStatus,
          invite_url: 'https://example.com/invite/token123',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          expires_at: '2024-02-15T10:00:00Z',
          email_sent: true,
          custom_message: 'Please complete your genetic test registration.'
        },
        {
          id: '2',
          patient_id: 'patient2',
          patient_name: 'Jane Smith',
          patient_email: 'jane.smith@example.com',
          provider_id: 'provider2',
          provider_name: 'Dr. Johnson',
          status: 'completed' as InviteStatus,
          invite_url: 'https://example.com/invite/token456',
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-12T09:15:00Z',
          expires_at: '2024-02-10T14:30:00Z',
          email_sent: true
        },
        {
          id: '3',
          patient_id: 'patient3',
          patient_name: 'Bob Wilson',
          patient_email: 'bob.wilson@example.com',
          provider_id: 'provider1',
          provider_name: 'Dr. Smith',
          status: 'expired' as InviteStatus,
          invite_url: 'https://example.com/invite/token789',
          created_at: '2023-12-01T08:00:00Z',
          updated_at: '2023-12-01T08:00:00Z',
          expires_at: '2024-01-01T08:00:00Z',
          email_sent: true
        }
      ];
      
      setInvites(mockInvites);
      setTotal(mockInvites.length);
      
      message.warning('Using mock data - backend API not available');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    const newPage = pagination.current;
    const newPageSize = pagination.pageSize;
    
    setCurrentPage(newPage);
    setPageSize(newPageSize);
    setFilters(prev => ({
      ...prev,
      page: newPage,
      limit: newPageSize
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
    setCurrentPage(1);
  };

  const handleCancelInvite = async (invite: Invite) => {
    confirm({
      title: 'Cancel Invite',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to cancel the invite for ${invite.patient_name}?`,
      okText: 'Cancel Invite',
      cancelText: 'Keep Invite',
      okType: 'danger',
      onOk: async () => {
        try {
          await apiService.cancelInvite(invite.id);
          message.success('Invite cancelled successfully');
          fetchInvites();
        } catch (error) {
          console.error('Failed to cancel invite:', error);
          
          // Mock successful cancellation when API is not available
          message.success('Invite cancelled successfully (mock)');
          
          // Update local state to reflect cancellation
          setInvites(prevInvites => 
            prevInvites.map(inv => 
              inv.id === invite.id 
                ? { ...inv, status: 'cancelled' as InviteStatus }
                : inv
            )
          );
        }
      }
    });
  };

  const handleResendInvite = async (values: ResendInviteRequest) => {
    if (!selectedInvite) return;

    try {
      await apiService.resendInvite(selectedInvite.id, values);
      message.success('Invite resent successfully');
      setShowResendModal(false);
      resendForm.resetFields();
      fetchInvites();
    } catch (error) {
      console.error('Failed to resend invite:', error);
      
      // Mock successful resend when API is not available
      message.success('Invite resent successfully (mock)');
      setShowResendModal(false);
      resendForm.resetFields();
      
      // Update local state to reflect resend
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + (values.expiry_days || 30));
      
      setInvites(prevInvites => 
        prevInvites.map(inv => 
          inv.id === selectedInvite.id 
            ? { 
                ...inv, 
                expires_at: newExpiryDate.toISOString(),
                updated_at: new Date().toISOString(),
                custom_message: values.custom_message,
                status: 'pending' as InviteStatus
              }
            : inv
        )
      );
    }
  };

  const columns: ColumnsType<Invite> = [
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name',
      render: (name: string, record: Invite) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-gray-500 text-sm">{record.patient_email}</div>
        </div>
      ),
    },
    {
      title: 'Provider',
      dataIndex: 'provider_name',
      key: 'provider_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: InviteStatus) => (
        <InviteStatusIndicator status={status} />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Expires',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (date: string) => {
        const expiry = new Date(date);
        const now = new Date();
        const isExpired = expiry < now;
        
        return (
          <span className={isExpired ? 'text-red-500' : ''}>
            {expiry.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      title: 'Email Sent',
      dataIndex: 'email_sent',
      key: 'email_sent',
      render: (sent: boolean) => (
        <Tag color={sent ? 'green' : 'orange'}>
          {sent ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Invite) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setSelectedInvite(record);
                setShowDetailsModal(true);
              }}
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <>
              <Tooltip title="Resend Invite">
                <Button
                  icon={<SendOutlined />}
                  size="small"
                  type="primary"
                  onClick={() => {
                    setSelectedInvite(record);
                    setShowResendModal(true);
                  }}
                />
              </Tooltip>
              
              <Tooltip title="Cancel Invite">
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => handleCancelInvite(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <Title level={3}>
            <MailOutlined className="mr-2" />
            Invite Management
          </Title>
          <Text type="secondary">
            Manage and track patient invitations
          </Text>
        </div>

        {/* Filters */}
        <Card className="mb-4" size="small">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FilterOutlined />
              <Text strong>Filters:</Text>
            </div>
            
            <Select
              placeholder="All Statuses"
              allowClear
              style={{ width: 120 }}
              onChange={(value) => handleFilterChange('status', value)}
              value={filters.status}
            >
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="expired">Expired</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>

            <Select
              placeholder="All Providers"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('provider_id', value)}
              value={filters.provider_id}
            >
              {clinicians.map(clinician => (
                <Option key={clinician.id} value={clinician.id}>
                  {clinician.name}
                </Option>
              ))}
            </Select>

            <RangePicker
              placeholder={['Start Date', 'End Date']}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleFilterChange('created_after', dates[0].toISOString());
                  handleFilterChange('created_before', dates[1].toISOString());
                } else {
                  handleFilterChange('created_after', undefined);
                  handleFilterChange('created_before', undefined);
                }
              }}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchInvites}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={invites}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} invites`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Invite Details Modal */}
      <Modal
        title="Invite Details"
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedInvite && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Patient:</Text>
                <div>{selectedInvite.patient_name}</div>
                <div className="text-gray-500">{selectedInvite.patient_email}</div>
              </div>
              <div>
                <Text strong>Provider:</Text>
                <div>{selectedInvite.provider_name}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Status:</Text>
                <div>
                  <InviteStatusIndicator status={selectedInvite.status} />
                </div>
              </div>
              <div>
                <Text strong>Email Sent:</Text>
                <div>
                  <Tag color={selectedInvite.email_sent ? 'green' : 'orange'}>
                    {selectedInvite.email_sent ? 'Yes' : 'No'}
                  </Tag>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Created:</Text>
                <div>{new Date(selectedInvite.created_at).toLocaleString()}</div>
              </div>
              <div>
                <Text strong>Expires:</Text>
                <div>{new Date(selectedInvite.expires_at).toLocaleString()}</div>
              </div>
            </div>

            {selectedInvite.custom_message && (
              <div>
                <Text strong>Custom Message:</Text>
                <div className="mt-1 p-2 bg-gray-50 rounded">
                  {selectedInvite.custom_message}
                </div>
              </div>
            )}

            <div>
              <Text strong>Invite URL:</Text>
              <Input.TextArea
                value={selectedInvite.invite_url}
                autoSize={{ minRows: 2, maxRows: 4 }}
                readOnly
                className="mt-1"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Resend Invite Modal */}
      <Modal
        title="Resend Invite"
        open={showResendModal}
        onCancel={() => {
          setShowResendModal(false);
          resendForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        {selectedInvite && (
          <div>
            <div className="mb-4">
              <Text>
                Resending invite to: <strong>{selectedInvite.patient_name}</strong>
              </Text>
              <br />
              <Text type="secondary">{selectedInvite.patient_email}</Text>
            </div>

            <Form
              form={resendForm}
              layout="vertical"
              onFinish={handleResendInvite}
              initialValues={{
                expiry_days: 14
              }}
            >
              <Form.Item
                name="custom_message"
                label="Custom Message (Optional)"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Add a personalized message to the invite email"
                />
              </Form.Item>

              <Form.Item
                name="expiry_days"
                label="Invite Validity (Days)"
                rules={[{ required: true, message: 'Please specify expiry days' }]}
              >
                <Input
                  type="number"
                  min={1}
                  max={365}
                  placeholder="14"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                  >
                    Resend Invite
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResendModal(false);
                      resendForm.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InviteManager;
