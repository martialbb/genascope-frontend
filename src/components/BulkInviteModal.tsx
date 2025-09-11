import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, Table, message, Checkbox } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import type { Patient, PatientInviteRequest, ChatStrategy } from '../types/patients';
import apiService from '../services/api';

const { Option } = Select;

interface BulkInviteModalProps {
  visible: boolean;
  onClose: () => void;
  patients: Patient[];
  clinicians: { id: string; name: string }[];
  chatStrategies: ChatStrategy[];
  currentUserId: string;
  onSuccess: () => void;
}

interface BulkInviteFormData {
  provider_id: string;
  chat_strategy: string;
  custom_message?: string;
  expiry_days: number;
  send_emails: boolean;
}

const BulkInviteModal: React.FC<BulkInviteModalProps> = ({
  visible,
  onClose,
  patients,
  clinicians,
  chatStrategies,
  currentUserId,
  onSuccess,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm<BulkInviteFormData>();

  // Reset state when modal is closed
  const handleCancel = () => {
    setSelectedRowKeys([]);
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    if (selectedRowKeys.length === 0) {
      message.error('Please select at least one patient to invite');
      return;
    }

    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Prepare the bulk invite data
      const patientInvites = selectedRowKeys.map(patientId => ({
        patient_id: patientId as string,
        provider_id: values.provider_id,
        chat_strategy_id: values.chat_strategy, // Map form field to API field
        custom_message: values.custom_message,
        expiry_days: values.expiry_days
      }));

      // Call the bulk invite API
      const response = await apiService.sendBulkInvites({
        patients: patientInvites,
        chat_strategy_id: values.chat_strategy, // Map form field to API field
        send_emails: values.send_emails,
        custom_message: values.custom_message
      });

      message.success(`Successfully sent ${response.total_sent} invites`);
      
      if (response.total_failed > 0) {
        message.warning(`${response.total_failed} invites failed to send`);
      }

      // Reset and close modal
      handleCancel();
      
      // Refresh patient list to update invite statuses
      onSuccess();
    } catch (error) {
      console.error('Failed to send bulk invites:', error);
      message.error('Failed to send invites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_: unknown, record: Patient) => `${record.first_name} ${record.last_name}`
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => (
        <span className={`status-tag ${status.toLowerCase()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )
    },
  ];

  return (
    <Modal
      title={<><MailOutlined /> Bulk Send Patient Invites</>}
      open={visible}
      width={800}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="mb-4">
        <p>
          Send invites to multiple patients at once. You can send multiple invites with different chat strategies to the same patient.
        </p>
      </div>

      <Table
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={patients}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        className="mb-4"
        locale={{ emptyText: 'No patients available for invites' }}
      />
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          provider_id: currentUserId,
          expiry_days: 14,
          send_emails: true
        }}
      >
        <Form.Item
          name="provider_id"
          label="Provider"
          tooltip="Clinician who will be associated with these invites"
          rules={[{ required: true, message: 'Please select a provider' }]}
        >
          <Select placeholder="Select provider">
            {clinicians.map(clinician => (
              <Option key={clinician.id} value={clinician.id}>{clinician.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="chat_strategy"
          label="Chat Strategy"
          tooltip="Select the AI chat strategy for these patients"
          rules={[{ required: true, message: 'Please select a chat strategy' }]}
        >
          <Select placeholder="Select chat strategy">
            {chatStrategies.map(strategy => (
              <Option key={strategy.id} value={strategy.id}>
                {strategy.name} {strategy.specialty && `(${strategy.specialty})`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="custom_message"
          label="Custom Message (Optional)"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Add a personalized message to include in all invite emails" 
          />
        </Form.Item>

        <Form.Item
          name="send_emails"
          valuePropName="checked"
        >
          <Checkbox>Send invite via email</Checkbox>
        </Form.Item>

        <Form.Item
          name="expiry_days"
          label="Invite Validity (Days)"
          rules={[{ required: true, message: 'Please specify invite validity' }]}
        >
          <Input type="number" min={1} max={90} />
        </Form.Item>

        <div className="flex justify-end">
          <Button onClick={handleCancel} style={{ marginRight: 8 }} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            loading={loading}
            disabled={selectedRowKeys.length === 0}
          >
            {loading ? 'Sending...' : `Send Invites (${selectedRowKeys.length} selected)`}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default BulkInviteModal;
