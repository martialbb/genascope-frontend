import React from 'react'
import { Layout } from '../components/Layout'
import { AppointmentsList } from '../components/AppointmentsList'
import { Typography } from 'antd'

const { Title } = Typography

export function AppointmentsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <Title level={1}>Appointments Management</Title>
        <AppointmentsList isOrganizationView={true} />
      </div>
    </Layout>
  )
}
