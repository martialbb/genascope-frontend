import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiService } from '../services/api'

interface User {
  id: string
  email: string
  name: string
  role: string
  account_id: string
}

interface Account {
  id: string
  name: string
  domain: string
  status: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  account: Account | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  const login = async (token: string) => {
    localStorage.setItem('authToken', token)
    await loadUserData()
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setAccount(null)
  }

  const loadUserData = async () => {
    try {
      const authResult = await apiService.verifyAuth()
      
      if (authResult.authenticated && authResult.user) {
        setUser(authResult.user)
        
        // Load account data if user has account_id
        if (authResult.user.account_id) {
          try {
            const accountData = await apiService.getAccountById(authResult.user.account_id)
            setAccount(accountData)
          } catch (error) {
            console.error('Failed to load account data:', error)
          }
        }
      } else {
        logout()
      }
    } catch (error) {
      console.error('Failed to verify authentication:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserData = async () => {
    await loadUserData()
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      loadUserData()
    } else {
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      account,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  )
}
