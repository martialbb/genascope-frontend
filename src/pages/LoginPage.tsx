import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { API_CONFIG } from '../services/apiConfig'
import axios from 'axios'

const { Title, Text } = Typography

interface LoginResponse {
  access_token: string
  token_type: string
  user_id?: string
}

export function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  // Handle logout cleanup if coming from logout
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const isLogout = urlParams.get('logout') === 'true'
    
    if (isLogout) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      console.log('Login page: Cleaned up auth data after logout')
    }
  }, [location])

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    
    try {
      console.log('Starting login process...')
      
      // Prepare login request
      const loginData = new URLSearchParams()
      loginData.append('username', values.email)
      loginData.append('password', values.password)
      loginData.append('grant_type', 'password')

      const response = await axios.post(`${API_CONFIG.baseUrl}/auth/login`, loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const data: LoginResponse = response.data
      console.log('Login successful:', data)

      if (data.access_token) {
        await login(data.access_token)
        message.success('Login successful!')
        navigate(from, { replace: true })
      } else {
        throw new Error('No access token received')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password'
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }
      
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="login-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Title level={2} className="text-gray-900">Sign in to Genascope</Title>
          <Text type="secondary" className="text-gray-600">Enter your credentials to access the dashboard</Text>
        </div>
        
        <Card className="glass-card shadow-2xl">
          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}
