import React from 'react'
import { Layout } from '../components/Layout'
import { Typography } from 'antd'

const { Title } = Typography

export function AccountsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <Title level={1}>Accounts Management</Title>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Accounts management functionality will be implemented here.</p>
        </div>
      </div>
    </Layout>
  )
}
