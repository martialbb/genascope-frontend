import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import SidebarLayout from '../components/SidebarLayout';
import AppointmentsList from '../components/AppointmentsList';
import apiService from '../services/api';

interface UserData {
  id: string;
  email: string;
  role: string;
  name?: string;
  account_id?: string;
}

interface DashboardStats {
  totalPatients: number;
  pendingInvites: number;
  completedInvites: number;
  todayAppointments: number;
  activeSessions: number;
}

interface RecentPatient {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  has_pending_invite: boolean;
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrator',
    clinician: 'Clinician',
    physician: 'Physician',
    patient: 'Patient',
  };
  return labels[role] || role;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    pendingInvites: 0,
    completedInvites: 0,
    todayAppointments: 0,
    activeSessions: 0,
  });
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('authUser');

    if (!token || !userData) {
      navigate('/login');
    } else {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        navigate('/login');
      }
    }
  }, [navigate]);

  const isStaff = user && ['admin', 'clinician', 'physician', 'super_admin'].includes(user.role);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setStatsLoading(true);
    try {
      const results = await Promise.allSettled([
        apiService.getInviteStatistics(),
        isStaff ? apiService.getPatients() : Promise.resolve([]),
        isStaff
          ? apiService.getOrganizationAppointments({
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date().toISOString().split('T')[0],
              limit: 100,
            })
          : Promise.resolve({ appointments: [] }),
        apiService.getAIChatSessions(undefined, 'active', 50),
      ]);

      const inviteStats =
        results[0].status === 'fulfilled' ? results[0].value : { pending: 0, completed: 0, total: 0 };
      const patients =
        results[1].status === 'fulfilled' ? results[1].value : [];
      const appts =
        results[2].status === 'fulfilled' ? results[2].value : { appointments: [] };
      const sessions =
        results[3].status === 'fulfilled' ? results[3].value : { sessions: [] };

      setStats({
        totalPatients: Array.isArray(patients) ? patients.length : 0,
        pendingInvites: inviteStats.pending ?? 0,
        completedInvites: inviteStats.completed ?? 0,
        todayAppointments: appts.appointments?.length ?? 0,
        activeSessions: sessions.sessions?.length ?? sessions.length ?? 0,
      });
    } catch {
      // Stats will stay at 0
    } finally {
      setStatsLoading(false);
    }
  }, [user, isStaff]);

  const fetchRecentPatients = useCallback(async () => {
    if (!isStaff) {
      setPatientsLoading(false);
      return;
    }
    setPatientsLoading(true);
    try {
      const patients = await apiService.getPatients({ limit: 8 });
      const list = (Array.isArray(patients) ? patients : [])
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)
        .map((p: any) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          email: p.email,
          status: p.status,
          created_at: p.created_at,
          has_pending_invite: p.has_pending_invite,
        }));
      setRecentPatients(list);
    } catch {
      setRecentPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchRecentPatients();
    }
  }, [user, fetchStats, fetchRecentPatients]);

  if (!user) return null;

  const statCards = [
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'blue',
      bgClass: 'bg-blue-50 text-blue-600',
      link: '/patients',
      show: isStaff,
    },
    {
      label: "Today's Appointments",
      value: stats.todayAppointments,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'emerald',
      bgClass: 'bg-emerald-50 text-emerald-600',
      link: '/appointments-dashboard',
      show: true,
    },
    {
      label: 'Pending Invites',
      value: stats.pendingInvites,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'amber',
      bgClass: 'bg-amber-50 text-amber-600',
      link: '/manage-invites',
      show: isStaff,
    },
    {
      label: 'Active Sessions',
      value: stats.activeSessions,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: 'violet',
      bgClass: 'bg-violet-50 text-violet-600',
      link: '/ai-chat/sessions',
      show: true,
    },
  ];

  const visibleStats = statCards.filter((s) => s.show);

  const quickActions = [
    {
      title: 'Invite Patient',
      description: 'Send a screening invitation to a new or existing patient.',
      link: '/invite',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      bgClass: 'bg-blue-600 hover:bg-blue-700',
      show: isStaff,
    },
    {
      title: 'Manage Availability',
      description: 'Set your scheduling availability for patient appointments.',
      link: '/manage-availability',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgClass: 'bg-emerald-600 hover:bg-emerald-700',
      show: user.role === 'clinician' || user.role === 'physician',
    },
    {
      title: 'Order Lab Test',
      description: 'Submit a new genetic test order for a patient.',
      link: '/lab-order',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bgClass: 'bg-violet-600 hover:bg-violet-700',
      show: isStaff,
    },
    {
      title: 'Chat Configuration',
      description: 'Configure AI chat strategies and screening workflows.',
      link: '/chat-configuration',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bgClass: 'bg-gray-700 hover:bg-gray-800',
      show: isStaff,
    },
    {
      title: 'Schedule Appointment',
      description: 'Book an appointment with your care provider.',
      link: '/schedule-appointment',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgClass: 'bg-blue-600 hover:bg-blue-700',
      show: user.role === 'patient',
    },
  ];

  const visibleActions = quickActions.filter((a) => a.show);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700',
      pending: 'bg-amber-50 text-amber-700',
      inactive: 'bg-gray-100 text-gray-600',
      archived: 'bg-red-50 text-red-600',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user.name || user.email.split('@')[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {getRoleLabel(user.role)} &middot;{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* KPI Cards */}
        <div className={`grid grid-cols-2 lg:grid-cols-${visibleStats.length} gap-4 mb-8`}>
          {visibleStats.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              {statsLoading ? (
                <Spin size="small" />
              ) : (
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              )}
              <div className="text-xs font-medium text-gray-500 mt-1">{card.label}</div>
            </Link>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Appointments - takes 2 cols */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Today's Appointments</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Your scheduled appointments for today</p>
                </div>
                <Link
                  to="/appointments-dashboard"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View all
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="p-2">
                <AppointmentsList
                  clinicianId={user.id}
                  isClinicianView={isStaff === true}
                  showFilters={false}
                  pageSize={5}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2.5">
                {visibleActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.link}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md ${action.bgClass}`}
                  >
                    {action.icon}
                    <div>
                      <div>{action.title}</div>
                      <div className="text-[11px] font-normal opacity-80 leading-tight">{action.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Invite Snapshot */}
            {isStaff && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Invite Overview</h2>
                  <Link to="/manage-invites" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                    View all
                  </Link>
                </div>
                {statsLoading ? (
                  <div className="flex justify-center py-6">
                    <Spin />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="text-sm text-gray-600">Pending</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{stats.pendingInvites}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-sm text-gray-600">Completed</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{stats.completedInvites}</span>
                    </div>
                    <div className="h-px bg-gray-100 my-1" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                      <span className="text-sm font-bold text-blue-600">
                        {stats.pendingInvites + stats.completedInvites > 0
                          ? Math.round(
                              (stats.completedInvites / (stats.pendingInvites + stats.completedInvites)) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    {/* Simple bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            stats.pendingInvites + stats.completedInvites > 0
                              ? (stats.completedInvites / (stats.pendingInvites + stats.completedInvites)) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients Table */}
        {isStaff && (
          <div className="mt-6 bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Recent Patients</h2>
                <p className="text-xs text-gray-500 mt-0.5">Latest patients added to the system</p>
              </div>
              <Link
                to="/patients"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {patientsLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : recentPatients.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gray-500">No patients yet.</p>
                <Link to="/invite" className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-1 inline-block">
                  Invite your first patient
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {patient.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">{patient.name}</div>
                              <div className="text-xs text-gray-400 truncate">{patient.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusBadge(patient.status)}`}
                          >
                            {patient.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-500">{formatDate(patient.created_at)}</td>
                        <td className="px-6 py-3.5 text-right">
                          {patient.has_pending_invite ? (
                            <span className="text-xs text-amber-600 font-medium">Invite Sent</span>
                          ) : (
                            <Link
                              to={`/invite?patientId=${patient.id}`}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                              Send Invite
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};
