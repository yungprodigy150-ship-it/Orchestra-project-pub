import React, { useState } from 'react';
import { OrchestraProvider, useOrchestra } from './context/OrchestraContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandCentreView } from './components/views/CommandCentreView';
import { AgentWorkforceView } from './components/views/AgentWorkforceView';
import { OperationsView } from './components/views/OperationsView';
import { IntelligenceView } from './components/views/IntelligenceView';
import { OpportunitiesView } from './components/views/OpportunitiesView';
import { GrowthView } from './components/views/GrowthView';
import { PortfolioView } from './components/views/PortfolioView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { SettingsView } from './components/views/SettingsView';
import { CommandPalette } from './components/common/CommandPalette';
import { TaskDetailDrawer } from './components/common/TaskDetailDrawer';
import { AgentDetailDrawer } from './components/common/AgentDetailDrawer';
import { EditAgentModal } from './components/common/EditAgentModal';
import { WorkflowExecutionModal } from './components/common/WorkflowExecutionModal';
import { ApprovalQueueModal } from './components/common/ApprovalQueueModal';

const AppContent: React.FC = () => {
  const {
    activeSection,
    isEditAgentModalOpen,
    setIsEditAgentModalOpen,
    agentBeingEdited,
    isWorkflowModalOpen,
    setIsWorkflowModalOpen,
    preselectedAgentForWorkflow,
    isApprovalModalOpen,
    setIsApprovalModalOpen
  } = useOrchestra();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeSection) {
      case 'command_centre':
        return <CommandCentreView />;
      case 'agent_workforce':
        return <AgentWorkforceView />;
      case 'operations':
        return <OperationsView />;
      case 'intelligence':
        return <IntelligenceView />;
      case 'opportunities':
        return <OpportunitiesView />;
      case 'growth':
        return <GrowthView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CommandCentreView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Header */}
        <Header onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <CommandPalette />
      <TaskDetailDrawer />
      <AgentDetailDrawer />
      <EditAgentModal
        isOpen={isEditAgentModalOpen}
        onClose={() => setIsEditAgentModalOpen(false)}
        agent={agentBeingEdited}
      />
      <WorkflowExecutionModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        preselectedAgent={preselectedAgentForWorkflow}
      />
      <ApprovalQueueModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <OrchestraProvider>
      <AppContent />
    </OrchestraProvider>
  );
}
