// Enhanced Appointment Management Component
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  TimePicker, 
  Input, 
  message, 
  Tag, 
  Space, 
  Card, 
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  UserOutlined
} from '@ant-design/icons';
import apiService from '../services/api';
import type { AppointmentResponse, AppointmentRequest } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

interface EnhancedAppointmentManagerProps {
  clinicianId?: string;
  patientId?: string;
  userRole?: 'clinician' | 'patient' | 'admin';
}

interface ExtendedAppointment extends AppointmentResponse {
  id?: string;
}

const EnhancedAppointmentManager: React.FC<EnhancedAppointmentManagerProps> = ({
  clinicianId,
  patientId,
  userRole = 'clinician'
}) => {
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ExtendedAppointment | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch appointments based on user role and ID
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let response;
      if (userRole === 'clinician' && clinicianId) {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        response = await apiService.getClinicianAppointments(clinicianId, startDate, endDate);
        setAppointments(response.appointments || []);
      } else if (userRole === 'patient' && patientId) {
        response = await apiService.getPatientAppointments(patientId);
        setAppointments(response.appointments || []);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      message.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [clinicianId, patientId, userRole]);

  // Handle appointment creation
  const handleCreateAppointment = async (values: any) => {
    try {
      const appointmentData: AppointmentRequest = {
        clinician_id: values.clinician_id || clinicianId || '',
        patient_id: values.patient_id || patientId || '',
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        appointment_type: values.appointment_type,
        notes: values.notes
      };

      await apiService.bookAppointment(appointmentData);
      message.success('Appointment created successfully');
      setShowCreateModal(false);
      form.resetFields();
      fetchAppointments();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      message.error('Failed to create appointment');
    }
  };

  // Handle appointment status update
  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await apiService.updateAppointmentStatus(appointmentId, status);
      message.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      message.error('Failed to update appointment status');
    }
  };

  // Handle appointment editing
  const handleEditAppointment = (appointment: ExtendedAppointment) => {
    setSelectedAppointment(appointment);
    editForm.setFieldsValue({
      appointment_type: appointment.appointment_type,
      notes: ''
    });
    setShowEditModal(true);
  };

  // Get status color for tags
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'rescheduled': return 'orange';
      default: return 'default';
    }
  };

  // Format date and time for display
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Table columns configuration
  const columns = [
    {
      title: userRole === 'clinician' ? 'Patient' : 'Clinician',
      dataIndex: userRole === 'clinician' ? 'patient_name' : 'clinician_name',
      key: 'name',
      render: (name: string) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-gray-400" />
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'date_time',
      key: 'date_time',
      render: (dateTime: string) => {
        const { date, time } = formatDateTime(dateTime);
        return (
          <div>
            <div className="flex items-center">
              <CalendarOutlined className="mr-1 text-gray-400" />
              <span>{date}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <ClockCircleOutlined className="mr-1" />
              <span>{time}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'appointment_type',
      key: 'appointment_type',
      render: (type: string) => (
        <div className="flex items-center">
          {type === 'virtual' ? (
            <VideoCameraOutlined className="mr-1 text-blue-500" />
          ) : (
            <UserOutlined className="mr-1 text-green-500" />
          )}
          <span>{type === 'virtual' ? 'Virtual' : 'In-Person'}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ExtendedAppointment) => (
        <Space size="small">
          <Tooltip title="Edit Appointment">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditAppointment(record)}
            />
          </Tooltip>
          
          {record.status === 'scheduled' && (
            <>
              <Popconfirm
                title="Mark as completed?"
                onConfirm={() => handleUpdateStatus(record.appointment_id, 'completed')}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" type="primary">
                  Complete
                </Button>
              </Popconfirm>
              
              <Popconfirm
                title="Cancel this appointment?"
                onConfirm={() => handleUpdateStatus(record.appointment_id, 'cancelled')}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" danger>
                  Cancel
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Appointment Management</h2>
            <p className="text-gray-600">
              {userRole === 'clinician' 
                ? 'Manage your patient appointments' 
                : 'View and manage your appointments'}
            </p>
          </div>
          
          {userRole === 'clinician' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
            >
              New Appointment
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={appointments}
          loading={loading}
          rowKey="appointment_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* Create Appointment Modal */}
      <Modal
        title="Create New Appointment"
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAppointment}
        >
          <Form.Item
            name="patient_id"
            label="Patient ID"
            rules={[{ required: true, message: 'Please enter patient ID' }]}
          >
            <Input placeholder="Enter patient ID" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: 'Please select a time' }]}
          >
            <TimePicker className="w-full" format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="appointment_type"
            label="Appointment Type"
            rules={[{ required: true, message: 'Please select appointment type' }]}
          >
            <Select placeholder="Select appointment type">
              <Option value="virtual">Virtual</Option>
              <Option value="in-person">In-Person</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes (Optional)"
          >
            <TextArea rows={3} placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Appointment
              </Button>
              <Button onClick={() => {
                setShowCreateModal(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        title="Edit Appointment"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedAppointment(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        {selectedAppointment && (
          <div>
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p><strong>Patient:</strong> {selectedAppointment.patient_name}</p>
              <p><strong>Date:</strong> {formatDateTime(selectedAppointment.date_time).date}</p>
              <p><strong>Time:</strong> {formatDateTime(selectedAppointment.date_time).time}</p>
            </div>
            
            <Form
              form={editForm}
              layout="vertical"
              onFinish={(values) => {
                // Handle appointment update logic here
                message.info('Edit functionality to be implemented');
                setShowEditModal(false);
              }}
            >
              <Form.Item
                name="appointment_type"
                label="Appointment Type"
              >
                <Select>
                  <Option value="virtual">Virtual</Option>
                  <Option value="in-person">In-Person</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="notes"
                label="Notes"
              >
                <TextArea rows={3} placeholder="Additional notes..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Update Appointment
                  </Button>
                  <Button onClick={() => {
                    setShowEditModal(false);
                    setSelectedAppointment(null);
                    editForm.resetFields();
                  }}>
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

export default EnhancedAppointmentManager;
