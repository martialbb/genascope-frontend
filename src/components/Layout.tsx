import React, { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout as AntLayout, Menu, Dropdown, Avatar, Space, Typography } from 'antd'
import { UserOutlined, LogoutOutlined, DashboardOutlined, TeamOutlined, UserAddOutlined, CalendarOutlined, SettingOutlined, MessageOutlined, BankOutlined } from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const { Header, Sider, Content } = AntLayout
const { Text } = Typography

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, account, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/patients',
      icon: <TeamOutlined />,
      label: <Link to="/patients">Patients</Link>,
    },
    {
      key: '/invites',
      icon: <UserAddOutlined />,
      label: <Link to="/invites">Invites</Link>,
    },
    {
      key: '/appointments',
      icon: <CalendarOutlined />,
      label: <Link to="/appointments">Appointments</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">Users</Link>,
    },
    {
      key: '/accounts',
      icon: <BankOutlined />,
      label: <Link to="/accounts">Accounts</Link>,
    },
    {
      key: '/chat-configuration',
      icon: <MessageOutlined />,
      label: <Link to="/chat-configuration">Chat Configuration</Link>,
    },
  ]

  const userMenu = (
    <Menu
      items={[
        {
          key: 'user-info',
          label: (
            <div className="px-3 py-2">
              <Text strong>{user?.name || user?.email}</Text>
              <br />
              <Text type="secondary" className="text-xs">
                {account?.name}
              </Text>
            </div>
          ),
          disabled: true,
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: handleLogout,
        },
      ]}
    />
  )

  return (
    <AntLayout className="min-h-screen">
      <Sider width={250} className="shadow-md">
        <div className="h-16 flex items-center justify-center bg-blue-600 text-white">
          <Text className="text-lg font-bold text-white">Genascope</Text>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>
      
      <AntLayout>
        <Header className="bg-white shadow-sm px-6 flex justify-between items-center">
          <div></div>
          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <Space className="cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <Text>{user?.name || user?.email}</Text>
            </Space>
          </Dropdown>
        </Header>
        
        <Content className="m-6">
          <div className="bg-white rounded-lg shadow-sm p-6 min-h-full">
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
