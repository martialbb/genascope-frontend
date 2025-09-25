import React from 'react';
import { Card, Typography } from 'antd';
import { Pie } from '@ant-design/charts';

const { Title } = Typography;

interface InviteStats {
  pending: number;
  completed: number;
  expired: number;
  cancelled: number;
}

interface InviteStatsChartProps {
  stats: InviteStats;
  loading?: boolean;
  title?: string;
}

const InviteStatsChart: React.FC<InviteStatsChartProps> = ({ 
  stats, 
  loading = false, 
  title = "Invite Status Distribution" 
}) => {
  const data = [
    {
      type: 'Pending',
      value: stats.pending,
      color: '#faad14'
    },
    {
      type: 'Completed',
      value: stats.completed,
      color: '#52c41a'
    },
    {
      type: 'Expired',
      value: stats.expired,
      color: '#ff4d4f'
    },
    {
      type: 'Cancelled',
      value: stats.cancelled,
      color: '#8c8c8c'
    }
  ].filter(item => item.value > 0); // Only show non-zero values

  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.4,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }: any) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center' as const,
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    legend: {
      position: 'bottom' as const,
    },
    color: ({ type }: any) => {
      const colorMap: Record<string, string> = {
        'Pending': '#faad14',
        'Completed': '#52c41a',
        'Expired': '#ff4d4f',
        'Cancelled': '#8c8c8c'
      };
      return colorMap[type];
    },
  };

  const total = Object.values(stats).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <Card title={title} loading={loading}>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          No invite data available
        </div>
      </Card>
    );
  }

  return (
    <Card title={title} loading={loading}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          {total}
        </Title>
        <div style={{ color: '#666', fontSize: '14px' }}>Total Invites</div>
      </div>
      <Pie {...config} height={300} />
    </Card>
  );
};

export default InviteStatsChart;
