import React from 'react'
import { Layout } from '../components/Layout'
import InviteManager from '../components/InviteManager'
import { Typography } from 'antd'

const { Title } = Typography

export function InvitesPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <Title level={1}>Invites Management</Title>
        <InviteManager />
      </div>
    </Layout>
  )
}
