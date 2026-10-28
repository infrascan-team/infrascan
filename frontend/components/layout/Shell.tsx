'use client'

import React, { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  Compass,
  Download,
  FileBarChart,
  Gauge,
  LayoutDashboard,
  Map,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
  X,
  Menu,
  CircleHelp,
  CheckCircle2,
  Clock3,
  LogOut,
} from 'lucide-react'
import { DEMO_NOTIFICATIONS, DEMO_USERS } from '@/lib/api/mock-data'
import { User, UserRole } from '@/types'

export type NavItemKey =
  | 'Dashboard'
  | 'Infrastructure Map'
  | 'All Inspections'
  | 'New Inspection'
  | 'Analysis Results'
  | 'Historical Comparison'
  | 'Assets'
  | 'Maintenance & Work Orders'
  | 'Damage Analytics'
  | 'Model Performance'
  | 'Reports'
  | 'User Management'
  | 'Settings'

interface ShellProps {
  currentTab: NavItemKey
  onSelectTab: (tab: NavItemKey) => void
  onOpenNewInspection: () => void
  currentUser?: User
  onLogout?: () => void
  onSwitchRole?: (role: UserRole) => void
  children: React.ReactNode
}

export function Shell({
  currentTab,
  onSelectTab,
  onOpenNewInspection,
  currentUser = DEMO_USERS[0],
  onLogout,
  onSwitchRole,
  children,
}: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role || 'Infrastructure Manager')
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const navGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { label: 'Dashboard' as NavItemKey, icon: LayoutDashboard },
        { label: 'Infrastructure Map' as NavItemKey, icon: Map },
      ],
    },
    {
      label: 'INSPECTIONS',
      items: [
        { label: 'All Inspections' as NavItemKey, icon: ClipboardCheck },
        { label: 'New Inspection' as NavItemKey, icon: Plus, isAction: true },
        { label: 'Analysis Results' as NavItemKey, icon: Activity },
        { label: 'Historical Comparison' as NavItemKey, icon: Compass },
      ],
    },
    {
      label: 'INFRASTRUCTURE',
      items: [
        { label: 'Assets' as NavItemKey, icon: Building2 },
        { label: 'Maintenance & Work Orders' as NavItemKey, icon: Wrench },
      ],
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { label: 'Damage Analytics' as NavItemKey, icon: Gauge },
        { label: 'Model Performance' as NavItemKey, icon: ShieldCheck },
        { label: 'Reports' as NavItemKey, icon: FileBarChart },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { label: 'User Management' as NavItemKey, icon: Users },
        { label: 'Settings' as NavItemKey, icon: Settings },
      ],
    },
  ]

  const handleNavClick = (item: { label: NavItemKey; isAction?: boolean }) => {
    if (item.isAction) {
      onOpenNewInspection()
    } else {
      onSelectTab(item.label)
    }
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="logo-mark">
            <span />
            <span />
            <span />
          </div>
          <div>
            <b>InfraScan</b>
            <small>Infrastructure Intelligence</small>
          </div>
          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        <nav>
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = currentTab === item.label
                return (
                  <button
                    key={item.label}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item)}
                  >
                    <Icon />
                    <span>{item.label}</span>
                    {item.label === 'New Inspection' && <kbd>+</kbd>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="status-card">
            <span className="pulse" />
            <div>
              <b>AI Pipeline Online</b>
              <small>Demo dataset active</small>
            </div>
          </div>

          {/* User & Role Switcher */}
          <div className="relative">
            <div
              className="profile cursor-pointer hover:bg-slate-50 rounded-lg p-1"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            >
              <div className="avatar">{currentUser.avatar || 'IS'}</div>
              <div>
                <b>{currentUser.name}</b>
                <small>{selectedRole}</small>
              </div>
              <ChevronDown />
            </div>

            {roleMenuOpen && (
              <div className="absolute bottom-12 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-30">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                </div>

                <p className="text-[9px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Simulate Role
                </p>
                {(
                  [
                    'Infrastructure Manager',
                    'Civil Engineer',
                    'Infrastructure Inspector',
                    'Maintenance Engineer',
                    'Administrator',
                  ] as UserRole[]
                ).map((role) => (
                  <button
                    key={role}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-blue-50 hover:text-blue-600 transition ${
                      selectedRole === role ? 'font-bold text-blue-600 bg-blue-50/60' : 'text-slate-700'
                    }`}
                    onClick={() => {
                      setSelectedRole(role)
                      if (onSwitchRole) onSwitchRole(role)
                      setRoleMenuOpen(false)
                    }}
                  >
                    {role}
                  </button>
                ))}

                {onLogout && (
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setRoleMenuOpen(false)
                        onLogout()
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs rounded text-red-600 hover:bg-red-50 flex items-center gap-1.5 font-medium transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="scrim"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <div className="breadcrumbs">
            <span>InfraScan Workspace</span>
            <b>/</b>
            <strong>{currentTab}</strong>
          </div>

          <div className="top-actions">
            <button
              className="button primary text-xs py-1.5 px-3"
              onClick={onOpenNewInspection}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Inspection</span>
            </button>

            <button
              className="icon-button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notifications"
            >
              <Bell />
              {unreadCount > 0 && <em>{unreadCount}</em>}
            </button>

            <button className="help">
              <CircleHelp /> Help
            </button>

            <div 
              className="top-avatar cursor-pointer" 
              title={`${currentUser.name} (${selectedRole})`}
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            >
              {currentUser.avatar || 'IS'}
            </div>

            {onLogout && (
              <button
                className="icon-button text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="notification-pop">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <b>Notifications</b>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  className={`cursor-pointer ${notif.isRead ? 'opacity-70' : ''}`}
                  onClick={() => {
                    if (notif.linkTo) onSelectTab(notif.linkTo as NavItemKey)
                    setNotificationsOpen(false)
                  }}
                >
                  <AlertTriangle
                    className={
                      notif.severity === 'Critical'
                        ? 'text-red-500'
                        : notif.severity === 'Warning'
                        ? 'text-amber-500'
                        : 'text-blue-500'
                    }
                  />
                  <div>
                    <strong>{notif.title}</strong>
                    <small>
                      {notif.description.slice(0, 50)}... · {notif.timestamp}
                    </small>
                  </div>
                </div>
              ))}
              <button
                className="w-full text-center text-xs text-blue-600 pt-2 block"
                onClick={() => {
                  onSelectTab('All Inspections')
                  setNotificationsOpen(false)
                }}
              >
                View all notifications in Activity
              </button>
            </div>
          )}
        </header>

        {children}
      </main>
    </div>
  )
}
