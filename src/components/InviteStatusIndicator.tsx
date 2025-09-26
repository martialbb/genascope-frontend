import React from 'react';
import { Tag, Tooltip } from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  StopOutlined 
} from '@ant-design/icons';
import type { InviteStatus } from '../types/patients';

interface InviteStatusIndicatorProps {
  status: InviteStatus;
  showIcon?: boolean;
  size?: 'small' | 'default';
}

const InviteStatusIndicator: React.FC<InviteStatusIndicatorProps> = ({ 
  status, 
  showIcon = true, 
  size = 'default' 
}) => {
  const getStatusConfig = (status: InviteStatus) => {
    switch (status) {
      case 'pending':
        return {
          color: 'orange',
          icon: <ClockCircleOutlined />,
          text: 'Pending',
          tooltip: 'Invite sent, waiting for patient response'
        };
      case 'completed' as any:
        return {
          color: 'green',
          icon: <CheckCircleOutlined />,
          text: 'Completed',
          tooltip: 'Patient has successfully registered'
        };
      case 'expired':
        return {
          color: 'red',
          icon: <ExclamationCircleOutlined />,
          text: 'Expired',
          tooltip: 'Invite has expired and needs to be resent'
        };
      case 'cancelled' as any:
        return {
          color: 'default',
          icon: <StopOutlined />,
          text: 'Cancelled',
          tooltip: 'Invite was cancelled and is no longer valid'
        };
      default:
        return {
          color: 'default',
          icon: null,
          text: status,
          tooltip: ''
        };
    }
  };

  const config = getStatusConfig(status);

  const tag = (
    <Tag 
      color={config.color} 
      icon={showIcon ? config.icon : undefined}
      className={size === 'small' ? 'text-xs' : ''}
    >
      {config.text}
    </Tag>
  );

  if (config.tooltip) {
    return (
      <Tooltip title={config.tooltip}>
        {tag}
      </Tooltip>
    );
  }

  return tag;
};

export default InviteStatusIndicator;
