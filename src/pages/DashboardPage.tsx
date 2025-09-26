import React from 'react'
import { Layout } from '../components/Layout'
import { Typography, Row, Col, Button } from 'antd'
import { Link } from 'react-router-dom'
import { DashboardTable } from '../components/DashboardTable'
import { AppointmentsList } from '../components/AppointmentsList'
import { EnhancedInviteStatsWidget } from '../components/EnhancedInviteStatsWidget'
import { EnhancedAppointmentStatsWidget } from '../components/EnhancedAppointmentStatsWidget'

const { Title } = Typography

export function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-8">
        <Title level={1} className="text-center">Dashboard</Title>
        
        {/* Today's Appointments Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <Title level={2}>Today's Appointments</Title>
            <Link to="/appointments">
              <Button type="primary">View All Appointments</Button>
            </Link>
          </div>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <AppointmentsList isOrganizationView={true} />
          </div>
        </div>

        {/* Patient Management Section */}
        <div>
          <Title level={2} className="mb-6">Patient Management</Title>
          <DashboardTable />
        </div>

        {/* Analytics Overview */}
        <div>
          <Title level={2} className="mb-6">Analytics Overview</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12} xl={8}>
              <EnhancedAppointmentStatsWidget />
            </Col>
            <Col xs={24} md={12} xl={8}>
              <EnhancedInviteStatsWidget />
            </Col>
          </Row>
        </div>
      </div>
    </Layout>
  )
}
