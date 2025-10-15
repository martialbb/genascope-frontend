import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, TimePicker, Button, message, Spin } from 'antd';
import dayjs from 'dayjs';
import apiService from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

interface Appointment {
  id: string;
  appointment_id?: string;
  patient_id?: string;
  patient_name?: string;
  clinician_id?: string;
  clinician_name?: string;
  date: string;
  time: string;
  appointment_type: string;
  status: string;
  notes?: string;
  confirmation_code?: string;
  created_at?: string;
  updated_at?: string;
}

interface AppointmentDetailModalProps {
  visible: boolean;
  appointmentId: string | null;
  onClose: () => void;
  onUpdate: () => void;
  isClinicianView?: boolean;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  visible,
  appointmentId,
  onClose,
  onUpdate,
  isClinicianView = false
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (visible && appointmentId) {
      fetchAppointmentDetails();
    } else {
      setAppointment(null);
      setIsEditing(false);
      form.resetFields();
    }
  }, [visible, appointmentId]);

  const fetchAppointmentDetails = async () => {
    if (!appointmentId) return;

    setLoading(true);
    try {
      const response = await apiService.getAppointmentById(appointmentId);
      setAppointment(response);

      // Set form values
      form.setFieldsValue({
        date: response.date ? dayjs(response.date) : null,
        time: response.time ? dayjs(`2000-01-01T${response.time}`) : null,
        appointment_type: response.appointment_type,
        status: response.status,
        notes: response.notes || ''
      });
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      message.error('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!appointmentId) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      const updateData = {
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
        time: values.time ? dayjs(values.time).format('HH:mm:ss') : undefined,
        appointment_type: values.appointment_type,
        status: values.status,
        notes: values.notes
      };

      await apiService.updateAppointment(appointmentId, updateData);
      message.success('Appointment updated successfully');
      setIsEditing(false);
      onUpdate();
      fetchAppointmentDetails();
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      if (error.errorFields) {
        message.error('Please fill in all required fields');
      } else {
        message.error('Failed to update appointment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      // Reset form to original values
      if (appointment) {
        form.setFieldsValue({
          date: appointment.date ? dayjs(appointment.date) : null,
          time: appointment.time ? dayjs(`2000-01-01T${appointment.time}`) : null,
          appointment_type: appointment.appointment_type,
          status: appointment.status,
          notes: appointment.notes || ''
        });
      }
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'canceled':
        return 'text-red-600 bg-red-50';
      case 'rescheduled':
        return 'text-yellow-600 bg-yellow-50';
      case 'no-show':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold">Appointment Details</span>
          {appointment && !isEditing && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          )}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {isEditing ? 'Cancel' : 'Close'}
        </Button>,
        isClinicianView && !isEditing && (
          <Button key="edit" type="default" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ),
        isEditing && (
          <Button key="save" type="primary" loading={loading} onClick={handleSave}>
            Save Changes
          </Button>
        )
      ]}
    >
      {loading && !appointment ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" />
        </div>
      ) : appointment ? (
        <div className="space-y-6">
          {/* Patient and Clinician Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isClinicianView ? 'Patient' : 'Clinician'}
              </label>
              <p className="text-base font-semibold text-gray-900">
                {isClinicianView ? appointment.patient_name : appointment.clinician_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Code</label>
              <p className="text-base font-mono font-semibold text-gray-900">{appointment.confirmation_code}</p>
            </div>
          </div>

          {/* Editable Form */}
          <Form form={form} layout="vertical" disabled={!isEditing}>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker className="w-full" format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item
                label="Time"
                name="time"
                rules={[{ required: true, message: 'Please select a time' }]}
              >
                <TimePicker className="w-full" format="HH:mm" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Appointment Type"
                name="appointment_type"
                rules={[{ required: true, message: 'Please select appointment type' }]}
              >
                <Select>
                  <Option value="virtual">Virtual Visit</Option>
                  <Option value="in-person">In-Person Visit</Option>
                  <Option value="home-visit">Home Visit</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="scheduled">Scheduled</Option>
                  <Option value="confirmed">Confirmed</Option>
                  <Option value="completed">Completed</Option>
                  <Option value="canceled">Canceled</Option>
                  <Option value="rescheduled">Rescheduled</Option>
                  <Option value="no-show">No Show</Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item label="Notes" name="notes">
              <TextArea rows={4} placeholder="Add any notes about this appointment..." />
            </Form.Item>
          </Form>

          {/* Metadata */}
          {!isEditing && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                {appointment.created_at && (
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(appointment.created_at).toLocaleString()}
                  </div>
                )}
                {appointment.updated_at && (
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {new Date(appointment.updated_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

export default AppointmentDetailModal;
