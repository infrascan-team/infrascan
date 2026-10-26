'use client'

import React, { useState } from 'react'
import { Shell, NavItemKey } from '@/components/layout/Shell'
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
import { InfrastructureAsset, Inspection } from '@/types'

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavItemKey>('Dashboard')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardInitialAsset, setWizardInitialAsset] = useState<InfrastructureAsset | null>(null)
  const [showPreprocessing, setShowPreprocessing] = useState(false)
  const [activeInspectionId, setActiveInspectionId] = useState<string>('INSP-2024-0248')

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

  return (
    <Shell
      currentTab={currentTab}
      onSelectTab={(tab) => setCurrentTab(tab)}
      onOpenNewInspection={() => handleOpenNewInspection()}
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
