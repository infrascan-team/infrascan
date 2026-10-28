'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  Cpu,
  CheckCircle2,
  AlertCircle,
  HardHat,
  Compass,
  Wrench,
  Users,
} from 'lucide-react'
import { DEMO_USERS } from '@/lib/api/mock-data'
import { User, UserRole } from '@/types'

interface LoginViewProps {
  onLogin: (user: User) => void
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'credentials' | 'demo'>('credentials')
  const [email, setEmail] = useState('jordan.smith@infrastructure.gov')
  const [password, setPassword] = useState('••••••••••••')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('Infrastructure Manager')
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      // Match existing demo user or create session user
      const matchedUser = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      )

      if (matchedUser) {
        onLogin(matchedUser)
      } else {
        // Fallback user based on entered info
        onLogin({
          id: `USR-${Date.now().toString().slice(-3)}`,
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: email,
          role: selectedRole,
          avatar: email.slice(0, 2).toUpperCase(),
          department: 'Civil Infrastructure Operations',
          status: 'Active',
          lastActive: 'Just now',
        })
      }
    }, 600)
  }

  const handleQuickLogin = (user: User) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin(user)
    }, 300)
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Infrastructure Manager':
        return Building2
      case 'Civil Engineer':
        return Compass
      case 'Infrastructure Inspector':
        return HardHat
      case 'Maintenance Engineer':
        return Wrench
      case 'Administrator':
        return ShieldCheck
      default:
        return Users
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-950 text-slate-100 relative overflow-hidden px-4 py-8">
      {/* Background Ambient Glow & Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]" />
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm backdrop-blur-sm">
            <Cpu className="w-3.5 h-3.5" />
            <span>Infrastructure Intelligence v2.4</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-extrabold text-lg">
              IS
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">InfraScan</h1>
          </div>

          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            AI-Powered Crack & Damage Assessment for Civil Infrastructure
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl p-6 md:p-8">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950/70 p-1 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              className={`py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'credentials'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setActiveTab('credentials')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => setActiveTab('demo')}
            >
              <span>Demo Personas</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Credentials Tab */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="engineer@infrastructure.gov"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('In demonstration mode, you can sign in directly or select any demo persona.')
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security token"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Civil Engineering Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                >
                  <option value="Infrastructure Manager">Infrastructure Manager</option>
                  <option value="Civil Engineer">Civil Engineer (PE / SE)</option>
                  <option value="Infrastructure Inspector">Infrastructure Inspector</option>
                  <option value="Maintenance Engineer">Maintenance Engineer</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span>Keep session active</span>
                </label>
                <span className="text-[11px] text-slate-500">256-bit AES</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Enter Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Access Tab */}
          {activeTab === 'demo' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-3">
                Select a pre-configured engineering persona to test role-based access:
              </p>

              {DEMO_USERS.map((user) => {
                const RoleIcon = getRoleIcon(user.role)
                return (
                  <button
                    key={user.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleQuickLogin(user)}
                    className="w-full text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <RoleIcon className="w-3 h-3 text-slate-400" />
                          <span>{user.role}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Security & Audit Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex flex-col gap-1 items-center">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authorized Engineering Personnel Only</span>
          </div>
          <span className="text-[10px] text-slate-600">
            Civil Infrastructure Safety Protocol · Audit Logging Active
          </span>
        </div>
      </div>
    </div>
  )
}
