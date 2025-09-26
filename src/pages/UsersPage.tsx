import React from 'react'
import { Layout } from '../components/Layout'
import UsersList from '../components/UsersList'
import { Typography } from 'antd'

const { Title } = Typography

export function UsersPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <Title level={1}>Users Management</Title>
        <UsersList />
      </div>
    </Layout>
  )
}
