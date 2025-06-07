import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Modal, 
  Form, 
  message, 
  Select, 
  Upload, 
  Tooltip, 
  Popconfirm,
  Checkbox
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  InboxOutlined,
  UserAddOutlined,
  MailOutlined,
  UsergroupAddOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import BulkInviteModal from './BulkInviteModal';
import apiService from '../services/api';
import { PatientStatus } from '../types/patients';
import type { Patient, PatientCreate, PatientUpdate, Clinician, PatientInviteRequest, BulkInviteRequest, BulkInviteResponse } from '../types/patients';
import type { UploadFile } from 'antd/es/upload/interface';

const { Search } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const PatientManager = () => {
  // State variables
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [form] = Form.useForm<PatientCreate>();
  const [editForm] = Form.useForm<PatientUpdate>();
  const [bulkForm] = Form.useForm();
  const [inviteForm] = Form.useForm<PatientInviteRequest & { send_email: boolean }>();
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // Get user from localStorage for simple auth
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
  }, []);

  // Debug auth context
  console.log("PatientManager: Auth context user:", user);

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
    fetchClinicians();
  }, []);

  // Fetch patient data
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPatients({
        query: searchQuery || undefined
      });
      setPatients(response);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch patients');
      console.error('Error fetching patients:', error);
      setLoading(false);
    }
  };

  // Fetch clinicians for dropdown selection
  const fetchClinicians = async () => {
    try {
      const response = await apiService.getUsers({
        role: 'clinician'
      });
      setClinicians(response.filter((user: any) => user.role === 'clinician'));
    } catch (error) {
      console.error('Error fetching clinicians:', error);
    }
  };

  // Handle creating a new patient
  const handleCreatePatient = async (values: PatientCreate) => {
    try {
      await apiService.createPatient(values);
      message.success('Patient created successfully');
      setShowCreateModal(false);
      form.resetFields();
      fetchPatients();
    } catch (error) {
      message.error('Failed to create patient');
      console.error('Error creating patient:', error);
    }
  };

  // Handle editing a patient
  const handleEditPatient = async (values: PatientUpdate) => {
    if (!selectedPatient) return;
    
    try {
      await apiService.updatePatient(selectedPatient.id, values);
      message.success('Patient updated successfully');
      setShowEditModal(false);
      setSelectedPatient(null);
      editForm.resetFields();
      fetchPatients();
    } catch (error) {
      message.error('Failed to update patient');
      console.error('Error updating patient:', error);
    }
  };

  // Handle deleting a patient
  const handleDeletePatient = async (patient: Patient) => {
    try {
      await apiService.deletePatient(patient.id);
      message.success('Patient deleted successfully');
      fetchPatients();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete patient';
      message.error(errorMessage);
      console.error('Error deleting patient:', error);
    }
  };

  // Handle opening edit modal
  const handleOpenEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    editForm.setFieldsValue({
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email,
      phone: patient.phone,
      date_of_birth: patient.date_of_birth,
      clinician_id: patient.clinician_id,
      notes: patient.notes,
      status: patient.status
    });
    setShowEditModal(true);
  };

  // Handle CSV import
  const handleBulkImport = async () => {
    if (!uploadFile) {
      message.error('Please upload a CSV file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    
    const clinicianId = bulkForm.getFieldValue('clinician_id');
    if (clinicianId) {
      formData.append('clinician_id', clinicianId);
    }

    try {
      const response = await apiService.importPatientsCsv(formData);
      message.success(`Successfully imported ${response.successful_count} patients`);
      
      if (response.failed_count > 0) {
        message.warning(`${response.failed_count} patients failed to import`);
      }
      
      setShowBulkModal(false);
      bulkForm.resetFields();
      setUploadFile(null);
      fetchPatients();
    } catch (error) {
      message.error('Failed to import patients');
      console.error('Error importing patients:', error);
    }
  };

  // Handle sending invite
  const handleSendInvite = async (values: PatientInviteRequest & { send_email: boolean }) => {
    if (!selectedPatient || !user) return;
    
    try {
      const inviteData = {
        ...values,
        patient_id: selectedPatient.id,
        provider_id: values.provider_id || user.id
      };
      
      const response = await apiService.sendPatientInvite(inviteData);
      
      message.success('Invite sent successfully');
      setShowInviteModal(false);
      inviteForm.resetFields();
      fetchPatients(); // Refresh to update invite status
      
      // Show the invite URL in a modal for easy copying
      Modal.info({
        title: 'Invite URL Generated',
        content: (
          <div>
            <p>Send this URL to the patient:</p>
            <Input.TextArea 
              value={response.invite_url} 
              autoSize={{ minRows: 2, maxRows: 4 }}
              readOnly
            />
            <p style={{ marginTop: '10px' }}>
              The invite will expire on {new Date(response.expires_at).toLocaleString()}
            </p>
          </div>
        ),
        okText: 'Close',
        width: 600
      });
      
    } catch (error) {
      message.error('Failed to send invite');
      console.error('Error sending invite:', error);
    }
  };

  // Define table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'first_name',
      key: 'name',
      render: (_: unknown, record: Patient) => `${record.first_name} ${record.last_name}`
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | undefined) => phone || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`status-tag ${status.toLowerCase()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
    {
      title: 'Clinician',
      dataIndex: 'clinician_name',
      key: 'clinician',
      render: (clinician: string | undefined) => clinician || 'Unassigned'
    },
    {
      title: 'Invite Status',
      key: 'invite',
      render: (_: unknown, record: Patient) => (
        <span>
          {record.has_pending_invite ? (
            <span className="status-tag active">Invite Sent</span>
          ) : (
            <span className="status-tag inactive">No Active Invite</span>
          )}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Patient) => (
        <div className="action-buttons">
          <Tooltip title="Edit Patient">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => handleOpenEditModal(record)}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          
          {!record.has_pending_invite && (
            <Tooltip title="Send Invite">
              <Button 
                type="primary" 
                icon={<MailOutlined />} 
                onClick={() => {
                  setSelectedPatient(record);
                  setShowInviteModal(true);
                }}
                style={{ marginRight: 8 }}
              />
            </Tooltip>
          )}
          
          <Popconfirm
            title="Delete Patient"
            description={`Are you sure you want to delete ${record.first_name} ${record.last_name}?`}
            onConfirm={() => handleDeletePatient(record)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Tooltip title="Delete Patient">
              <Button 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Define upload props for CSV import
  const uploadProps = {
    beforeUpload: (file: File) => {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        message.error('You can only upload CSV files!');
        return Upload.LIST_IGNORE;
      }
      setUploadFile(file);
      return false;
    },
    onRemove: () => {
      setUploadFile(null);
    },
    fileList: uploadFile ? [uploadFile as unknown as UploadFile] : []
  };

  // Render component
  return (
    <div className="patient-manager">
      <div className="table-header">
        <h2>Patient Management</h2>
        <div className="table-actions">
          <Search
            placeholder="Search patients..."
            allowClear
            onSearch={(value: string) => {
              setSearchQuery(value);
              fetchPatients();
            }}
            style={{ width: 250, marginRight: '10px' }}
          />
          <Button 
            type="primary" 
            icon={<UserAddOutlined />} 
            onClick={() => setShowCreateModal(true)}
            style={{ marginRight: '10px' }}
          >
            Add Patient
          </Button>
          <Button 
            icon={<UploadOutlined />} 
            onClick={() => setShowBulkModal(true)}
            style={{ marginRight: '10px' }}
          >
            Bulk Import
          </Button>
          <Button
            type="primary"
            icon={<UsergroupAddOutlined />}
            onClick={() => setShowBulkInviteModal(true)}
          >
            Bulk Invite
          </Button>
        </div>
      </div>

      <Table 
        columns={columns} 
        dataSource={patients}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />

      {/* Create Patient Modal */}
      <Modal
        title="Create New Patient"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePatient}
        >
          <Form.Item
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter first name' }]}
          >
            <Input placeholder="First name" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter last name' }]}
          >
            <Input placeholder="Last name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Email address" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input placeholder="Phone number" />
          </Form.Item>

          <Form.Item
            name="external_id"
            label="External ID"
            tooltip="ID in your clinic's system"
          >
            <Input placeholder="External ID" />
          </Form.Item>

          <Form.Item
            name="date_of_birth"
            label="Date of Birth"
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="clinician_id"
            label="Assigned Clinician"
          >
            <Select placeholder="Select clinician">
              {clinicians.map(clinician => (
                <Option key={clinician.id} value={clinician.id}>{clinician.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} placeholder="Additional notes" />
          </Form.Item>

          <div className="form-actions">
            <Button onClick={() => setShowCreateModal(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal
        title="Edit Patient"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedPatient(null);
          editForm.resetFields();
        }}
        footer={null}
      >
        {selectedPatient && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditPatient}
          >
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input placeholder="First name" />
            </Form.Item>

            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input placeholder="Last name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Email address" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
            >
              <Input placeholder="Phone number" />
            </Form.Item>

            <Form.Item
              name="date_of_birth"
              label="Date of Birth"
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
            >
              <Select placeholder="Select status">
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="archived">Archived</Option>
                <Option value="pending">Pending</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="clinician_id"
              label="Assigned Clinician"
            >
              <Select placeholder="Select clinician">
                {clinicians.map(clinician => (
                  <Option key={clinician.id} value={clinician.id}>{clinician.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <Input.TextArea rows={3} placeholder="Additional notes" />
            </Form.Item>

            <div className="form-actions">
              <Button onClick={() => {
                setShowEditModal(false);
                setSelectedPatient(null);
                editForm.resetFields();
              }} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        title="Import Patients from CSV"
        open={showBulkModal}
        onCancel={() => {
          setShowBulkModal(false);
          setUploadFile(null);
        }}
        footer={[
          <Button key="back" onClick={() => {
            setShowBulkModal(false);
            setUploadFile(null);
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleBulkImport}>
            Import
          </Button>
        ]}
      >
        <Form
          form={bulkForm}
          layout="vertical"
        >
          <p>
            Upload a CSV file with patient data. The file should have the following columns:
            <br />
            <code>email,first_name,last_name,phone,external_id,date_of_birth</code>
          </p>
          
          <Form.Item
            name="clinician_id"
            label="Default Clinician (Optional)"
          >
            <Select placeholder="Select default clinician for imported patients">
              {clinicians.map(clinician => (
                <Option key={clinician.id} value={clinician.id}>{clinician.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="file" label="CSV File">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single CSV file upload with patient information.
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* Send Invite Modal */}
      <Modal
        title="Send Patient Invite"
        open={showInviteModal}
        onCancel={() => {
          setShowInviteModal(false);
          setSelectedPatient(null);
        }}
        footer={null}
      >
        {selectedPatient && (
          <Form
            form={inviteForm}
            layout="vertical"
            onFinish={handleSendInvite}
            initialValues={{
              provider_id: user?.role === 'clinician' ? user.id : undefined,
              send_email: true,
              expiry_days: 14
            }}
          >
            <p>
              Sending invite to: <strong>{selectedPatient.first_name} {selectedPatient.last_name}</strong>
              <br />
              Email: <strong>{selectedPatient.email}</strong>
            </p>

            <Form.Item
              name="provider_id"
              label="Provider"
              tooltip="Clinician who will be associated with this invite"
            >
              <Select placeholder="Select provider">
                {clinicians.map(clinician => (
                  <Option key={clinician.id} value={clinician.id}>{clinician.name}</Option>
                ))}
              </Select>
            </Form.Item>

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
              name="send_email"
              valuePropName="checked"
              initialValue={true}
            >
              <Checkbox>Send invite via email</Checkbox>
            </Form.Item>

            <Form.Item
              name="expiry_days"
              label="Invite Validity (Days)"
              initialValue={14}
              rules={[{ required: true }]}
            >
              <Input type="number" min={1} max={90} />
            </Form.Item>

            <div className="form-actions">
              <Button onClick={() => {
                setShowInviteModal(false);
                setSelectedPatient(null);
              }} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Send Invite
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* Bulk Invite Modal */}
      <BulkInviteModal
        visible={showBulkInviteModal}
        onClose={() => setShowBulkInviteModal(false)}
        patients={patients}
        clinicians={clinicians}
        currentUserId={user?.id || ''}
        onSuccess={() => {
          fetchPatients();
          setShowBulkInviteModal(false);
        }}
      />

      <style>{`
        .patient-manager {
          padding: 20px;
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .table-actions {
          display: flex;
          align-items: center;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
        }
        .status-tag {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-tag.active {
          background-color: #e6f7ff;
          color: #1890ff;
        }
        .status-tag.inactive {
          background-color: #f5f5f5;
          color: #999;
        }
        .status-tag.pending {
          background-color: #fff7e6;
          color: #fa8c16;
        }
        .status-tag.archived {
          background-color: #f5f5f5;
          color: #666;
        }
        .action-buttons button {
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

// Export PatientManager directly with simple authentication
export default PatientManager;
