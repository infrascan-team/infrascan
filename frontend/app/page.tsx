'use client'

import React, { useState, useEffect } from 'react'
import { Shell, NavItemKey } from '@/components/layout/Shell'
import { LoginView } from '@/components/auth/LoginView'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { InfrastructureMapView } from '@/components/maps/InfrastructureMapView'
import { InspectionsView } from '@/components/inspections/InspectionsView'
import { NewInspectionWizard } from '@/components/inspections/NewInspectionWizard'
import { PreprocessingStatusModal } from '@/components/inspections/PreprocessingStatusModal'
import { AnalysisView } from '@/components/analysis/AnalysisView'
import { ComparisonView } from '@/components/comparison/ComparisonView'
import { AssetsView } from '@/components/assets/AssetsView'
import { MaintenanceView } from '@/components/maintenance/MaintenanceView'
import { AnalyticsView } from '@/components/analytics/AnalyticsView'
import { ReportsView } from '@/components/reports/ReportsView'
import { ModelPerformanceView } from '@/components/models/ModelPerformanceView'
import { UsersView } from '@/components/users/UsersView'
import { SettingsView } from '@/components/settings/SettingsView'
import { InfrastructureAsset, Inspection, User, UserRole } from '@/types'
import { DEMO_USERS } from '@/lib/api/mock-data'

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true)
  const [currentTab, setCurrentTab] = useState<NavItemKey>('Dashboard')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardInitialAsset, setWizardInitialAsset] = useState<InfrastructureAsset | null>(null)
  const [showPreprocessing, setShowPreprocessing] = useState(false)
  const [activeInspectionId, setActiveInspectionId] = useState<string>('INSP-2024-0248')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('infrascan_auth_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setCurrentUser(parsed)
          setIsAuthenticated(true)
        } catch (e) {
          // ignore
        }
      }
    }
  }, [])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('infrascan_auth_user', JSON.stringify(user))
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('infrascan_auth_user')
    }
  }

  const handleSwitchRole = (role: UserRole) => {
    const updated = { ...currentUser, role }
    setCurrentUser(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('infrascan_auth_user', JSON.stringify(updated))
    }
  }

  const handleNavigate = (tab: NavItemKey, params?: { inspectionId?: string; assetId?: string }) => {
    if (params?.inspectionId) {
      setActiveInspectionId(params.inspectionId)
    }
    setCurrentTab(tab)
  }

  const handleOpenNewInspection = (asset?: InfrastructureAsset) => {
    setWizardInitialAsset(asset || null)
    setShowWizard(true)
  }

  const handleSubmitInspection = (inspectionData: Partial<Inspection>) => {
    setShowWizard(false)
    setShowPreprocessing(true)
  }

  const handlePreprocessingComplete = () => {
    setShowPreprocessing(false)
    setCurrentTab('Analysis Results')
  }

  // Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />
  }

  return (
    <Shell
      currentTab={currentTab}
      onSelectTab={(tab) => setCurrentTab(tab)}
      onOpenNewInspection={() => handleOpenNewInspection()}
      currentUser={currentUser}
      onLogout={handleLogout}
      onSwitchRole={handleSwitchRole}
    >
      {/* Dynamic View Router */}
      {currentTab === 'Dashboard' && (
        <DashboardView
          onNavigate={handleNavigate}
          onOpenNewInspection={() => handleOpenNewInspection()}
        />
      )}

      {currentTab === 'Infrastructure Map' && (
        <InfrastructureMapView onNavigate={handleNavigate} />
      )}

      {currentTab === 'All Inspections' && (
        <InspectionsView
          onNavigate={handleNavigate}
          onOpenNewInspection={() => handleOpenNewInspection()}
        />
      )}

      {currentTab === 'Analysis Results' && (
        <AnalysisView
          inspectionId={activeInspectionId}
          onNavigate={handleNavigate}
        />
      )}

      {currentTab === 'Historical Comparison' && <ComparisonView />}

      {currentTab === 'Assets' && (
        <AssetsView
          onNavigate={handleNavigate}
          onOpenNewInspectionForAsset={(asset) => handleOpenNewInspection(asset)}
        />
      )}

      {currentTab === 'Maintenance & Work Orders' && <MaintenanceView />}

      {currentTab === 'Damage Analytics' && <AnalyticsView />}

      {currentTab === 'Model Performance' && <ModelPerformanceView />}

      {currentTab === 'Reports' && <ReportsView />}

      {currentTab === 'User Management' && <UsersView />}

      {currentTab === 'Settings' && <SettingsView />}

      {/* 5-Step New Inspection Wizard Modal */}
      {showWizard && (
        <NewInspectionWizard
          initialAsset={wizardInitialAsset}
          onClose={() => setShowWizard(false)}
          onSubmitInspection={handleSubmitInspection}
        />
      )}

      {/* Live Preprocessing Pipeline Status Modal */}
      {showPreprocessing && (
        <PreprocessingStatusModal onComplete={handlePreprocessingComplete} />
      )}
    </Shell>
  )
}
