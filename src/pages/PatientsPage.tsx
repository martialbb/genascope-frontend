import React from 'react'
import { Layout } from '../components/Layout'
import { DashboardTable } from '../components/DashboardTable'
import { Typography } from 'antd'

const { Title } = Typography

export function PatientsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <Title level={1}>Patients Management</Title>
        <DashboardTable />
      </div>
    </Layout>
  )
}
