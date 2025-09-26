import React from 'react'
import { Layout } from '../components/Layout'
import { Typography } from 'antd'

const { Title } = Typography

export function ChatConfigurationPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <Title level={1}>Chat Configuration</Title>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>Chat configuration functionality will be available once component issues are resolved.</p>
        </div>
      </div>
    </Layout>
  )
}
