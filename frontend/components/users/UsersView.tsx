'use client'

import React, { useState } from 'react'
import {
  Download,
  Plus,
  Search,
  Shield,
  UserCheck,
  Users,
  X,
  FileCheck,
  Info,
} from 'lucide-react'
import { DEMO_USERS } from '@/lib/api/mock-data'
import { User, UserRole } from '@/types'

const ROLES: UserRole[] = [
  'Infrastructure Manager',
  'Civil Engineer',
  'Infrastructure Inspector',
  'Maintenance Engineer',
  'Administrator',
]

export function UsersView() {
  const [users, setUsers] = useState<User[]>(DEMO_USERS)
  const [search, setSearch] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Infrastructure Inspector' as UserRole,
    department: 'Civil Infrastructure Division',
  })

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.role} ${u.department}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleRoleChange = (id: string, newRole: UserRole) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
  }

  const handleToggleStatus = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
      )
    )
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) {
      alert('Please enter name and email')
      return
    }
    const created: User = {
      ...newUser,
      id: `USR-00${users.length + 1}`,
      avatar: newUser.name.slice(0, 2).toUpperCase(),
      status: 'Active',
      lastActive: 'Just now',
    }
    setUsers([...users, created])
    setShowInviteModal(false)
  }

  return (
    <div className="page-wrap">
      {/* Header */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">ACCESS CONTROL & AUDIT ROSTER</p>
          <h1>User & Role Administration</h1>
          <p>
            Manage role-based privileges for licensed civil engineers, inspectors, and maintenance coordinators.
          </p>
        </div>
        <div className="heading-actions">
          <button className="button primary" onClick={() => setShowInviteModal(true)}>
            <Plus /> Invite Team Member
          </button>
        </div>
      </section>

      {/* Security Disclaimer (§ 16) */}
      <div className="mt-4 bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-2 text-xs text-slate-600">
        <Info className="w-4 h-4 text-blue-600 flex-none mt-0.5" />
        <div>
          <strong>Enterprise RBAC Architecture Notice:</strong> UI role toggles simulate user roles
          in the local frontend. Full OAuth2/JWT token signing, session revoking, and row-level
          database permission constraints are enforced by the FastAPI backend layer.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="context-bar">
        <div className="table-search w-64 bg-white">
          <Search />
          <input
            placeholder="Search name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* User Roster Table */}
      <div className="panel table-panel mt-4">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Account Status</th>
                <th>Last Active</th>
                <th>Role Assignment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        {user.avatar}
                      </div>
                      <div>
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-blue">{user.role}</span>
                  </td>
                  <td>{user.department}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.status === 'Active' ? 'badge-teal' : 'badge-gray'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>{user.lastActive}</td>
                  <td>
                    <select
                      className="form-select text-[11px] py-1 px-2"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="text-xs text-slate-500 hover:text-red-600"
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-layer">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-[480px] max-w-full">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Invite Engineering Member</h2>
              <button onClick={() => setShowInviteModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-4 text-xs">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Dr. Rajesh Patel, PE"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Corporate / Official Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@infrastructure.gov"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Assigned Operational Role</label>
                <select
                  className="form-select"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Department / Engineering Directorate</label>
                <input
                  className="form-input"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button primary">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
