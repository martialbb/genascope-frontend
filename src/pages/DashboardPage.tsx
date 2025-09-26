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
            <Title level={2} className="text-gray-800">Today's Appointments</Title>
            <Link to="/appointments">
              <Button type="primary" className="modern-button">View All Appointments</Button>
            </Link>
          </div>
          <div className="gradient-card overflow-hidden hover-lift">
            <AppointmentsList isOrganizationView={true} />
          </div>
        </div>

        {/* Patient Management Section */}
        <div>
          <Title level={2} className="mb-6 text-gray-800">Patient Management</Title>
          <div className="gradient-card p-6 hover-lift">
            <DashboardTable />
          </div>
        </div>

        {/* Analytics Overview */}
        <div>
          <Title level={2} className="mb-6 text-gray-800">Analytics Overview</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12} xl={8}>
              <div className="gradient-card p-4 hover-lift">
                <EnhancedAppointmentStatsWidget />
              </div>
            </Col>
            <Col xs={24} md={12} xl={8}>
              <div className="gradient-card p-4 hover-lift">
                <EnhancedInviteStatsWidget />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Layout>
  )
}
