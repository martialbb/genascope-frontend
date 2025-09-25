import React from 'react';
import { Card, Typography } from 'antd';
import { Pie } from '@ant-design/charts';

const { Title } = Typography;

interface AppointmentStats {
  scheduled: number;
  completed: number;
  cancelled: number;
  rescheduled: number;
}

interface AppointmentStatsChartProps {
  stats: AppointmentStats;
  loading?: boolean;
  title?: string;
}

const AppointmentStatsChart: React.FC<AppointmentStatsChartProps> = ({ 
  stats, 
  loading = false, 
  title = "Appointment Status Distribution" 
}) => {
  const data = [
    {
      type: 'Scheduled',
      value: stats.scheduled,
      color: '#1890ff'
    },
    {
      type: 'Completed',
      value: stats.completed,
      color: '#52c41a'
    },
    {
      type: 'Cancelled',
      value: stats.cancelled,
      color: '#ff4d4f'
    },
    {
      type: 'Rescheduled',
      value: stats.rescheduled,
      color: '#faad14'
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
        'Scheduled': '#1890ff',
        'Completed': '#52c41a',
        'Cancelled': '#ff4d4f',
        'Rescheduled': '#faad14'
      };
      return colorMap[type];
    },
  };

  const total = Object.values(stats).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <Card title={title} loading={loading}>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          No appointment data available
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
        <div style={{ color: '#666', fontSize: '14px' }}>Total Appointments</div>
      </div>
      <Pie {...config} height={300} />
    </Card>
  );
};

export default AppointmentStatsChart;
