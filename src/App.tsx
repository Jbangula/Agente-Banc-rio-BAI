/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  FileSpreadsheet,
  FileText,
  Globe2,
  Layers,
  Lock,
  PlusCircle,
  Scale,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AuthScreen } from './components/AuthScreen';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { DailyReportForm } from './components/DailyReportForm';
import { Header } from './components/Header';
import { HostingGuideModal } from './components/HostingGuideModal';
import { MovementsManagement } from './components/MovementsManagement';
import { ReconciliationView } from './components/ReconciliationView';
import { ReportReceiptModal } from './components/ReportReceiptModal';
import { ReportsSummary } from './components/ReportsSummary';
import { ShareAccessModal } from './components/ShareAccessModal';
import { UserAccountModal } from './components/UserAccountModal';
import { UsersManagement } from './components/UsersManagement';
import { storage } from './services/storage';
import {
  CompanySettings,
  DailyReport,
  MovementType,
  ReconciliationRecord,
  ReportMovementItem,
  User,
} from './types';

type MainTab =
  | 'novo_relatorio'
  | 'quadro_resumo'
  | 'reconciliacao'
  | 'dashboards'
  | 'gestao_movimentos'
  | 'gestao_utilizadores';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [movements, setMovements] = useState<MovementType[]>(() => storage.getMovements());
  const [reports, setReports] = useState<DailyReport[]>(() => storage.getReports());
  const [reconciliations, setReconciliations] = useState<ReconciliationRecord[]>(() =>
    storage.getReconciliations()
  );
  const [settings, setSettings] = useState<CompanySettings>(() => storage.getSettings());

  // Navegação
  const [activeTab, setActiveTab] = useState<MainTab>('novo_relatorio');

  // Estado de Edição de Relatório
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);

  // Modais
  const [viewingReceipt, setViewingReceipt] = useState<DailyReport | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showCompanySettings, setShowCompanySettings] = useState<boolean>(false);
  const [showHostingGuide, setShowHostingGuide] = useState<boolean>(false);

  // Sincronização em Tempo Real (BroadcastChannel entre abas)
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setUsers(storage.getUsers());
      setMovements(storage.getMovements());
      setReports(storage.getReports());
      setReconciliations(storage.getReconciliations());
      setSettings(storage.getSettings());
      setCurrentUser(storage.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  // Handlers de Utilizador e Sessão
  const handleSwitchUser = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    setEditingReport(null);
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleLogin = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
  };

  // Handlers de Relatórios
  const handleSubmitReport = async (reportData: {
    id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    recipientEmail: string;
    agencyName: string;
    reportDate: string;
    shift: 'Manhã' | 'Tarde' | 'Integral';
    physicalValue: number;
    items: ReportMovementItem[];
    totalMovements: number;
    totalAmountKz: number;
    observations?: string;
    updatedByRole?: User['role'];
  }) => {
    const saved = await storage.saveReport(reportData);
    setReports(storage.getReports());
    setEditingReport(null);
    return saved;
  };

  const handleEditReport = (report: DailyReport) => {
    const check = storage.canEditReport(report, currentUser);
    if (!check.allowed) {
      alert(check.reason || 'Edição não permitida.');
      return;
    }
    setEditingReport(report);
    setActiveTab('novo_relatorio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReport = (reportId: string) => {
    storage.deleteReport(reportId);
    setReports(storage.getReports());
  };

  // Handlers de Reconciliação
  const handleSaveReconciliation = (
    rec: Omit<ReconciliationRecord, 'id' | 'finalValue' | 'discrepancy' | 'status'> & { id?: string }
  ) => {
    storage.saveReconciliation(rec);
    setReconciliations(storage.getReconciliations());
  };

  const handleDeleteReconciliation = (id: string) => {
    storage.deleteReconciliation(id);
    setReconciliations(storage.getReconciliations());
  };

  // Handlers de Movimentos (Admin)
  const handleAddMovement = (mov: Omit<MovementType, 'id'>) => {
    storage.addMovement(mov);
    setMovements(storage.getMovements());
  };

  const handleUpdateMovement = (id: string, updates: Partial<MovementType>) => {
    storage.updateMovement(id, updates);
    setMovements(storage.getMovements());
  };

  const handleDeleteMovement = (id: string) => {
    storage.deleteMovement(id);
    setMovements(storage.getMovements());
  };

  const handleResetMovementsDefaults = () => {
    storage.resetMovementsToDefault();
    setMovements(storage.getMovements());
  };

  // Handlers de Gestão de Utilizadores (Admin)
  const handleAddUser = (user: Omit<User, 'id' | 'createdAt'>) => {
    storage.addUser(user);
    setUsers(storage.getUsers());
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    storage.updateUser(id, updates);
    setUsers(storage.getUsers());
    const curr = storage.getCurrentUser();
    if (curr && curr.id === id) setCurrentUser(curr);
  };

  const handleDeleteUser = (id: string) => {
    storage.deleteUser(id);
    setUsers(storage.getUsers());
  };

  const handleResetPassword = (userId: string, newPass: string) => {
    // Actualiza utilizador
    const target = users.find(u => u.id === userId);
    if (target) {
      storage.updateUser(userId, {});
    }
  };

  // Handlers de Definições
  const handleSaveSettings = (newSettings: CompanySettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleExportBackup = () => {
    const json = storage.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_agente_bai_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (json: string): boolean => {
    return storage.importFullBackup(json);
  };

  // Se não houver utilizador autenticado, exibe ecrã de login oficial
  if (!currentUser) {
    return (
      <AuthScreen
        users={users}
        settings={settings}
        onLogin={handleLogin}
        onResetMasterPassword={newPass => {
          storage.saveSettings({ ...settings, masterAdminPasswordHash: newPass });
          setSettings(storage.getSettings());
        }}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const isSupervisorOrAdmin = currentUser.role === 'admin' || currentUser.role === 'supervisor';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#00A3E0] selection:text-white">
      {/* Cabeçalho Oficial BAI & Barra de Operador */}
      <Header
        currentUser={currentUser}
        users={users}
        settings={settings}
        onSwitchUser={handleSwitchUser}
        onOpenSettings={() => setShowCompanySettings(true)}
        onOpenAccountModal={() => setShowAccountModal(true)}
        onOpenHostingGuide={() => setShowHostingGuide(true)}
        onOpenShareModal={() => setShowShareModal(true)}
        onLogout={handleLogout}
      />

      {/* Navegação por Abas Principais */}
      <div className="bg-white border-b border-slate-200 sticky top-[77px] z-20 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none text-xs font-bold">
            {/* Aba 1: Novo Relatório Diário */}
            <button
              onClick={() => setActiveTab('novo_relatorio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === 'novo_relatorio'
                  ? 'bg-[#002244] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className={`w-4 h-4 ${activeTab === 'novo_relatorio' ? 'text-[#00A3E0]' : 'text-slate-400'}`} />
              <span>Registo Diário {editingReport ? '(Em Edição)' : ''}</span>
            </button>

            {/* Aba 2: Quadro de Resumo de Relatórios */}
            <button
              onClick={() => setActiveTab('quadro_resumo')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === 'quadro_resumo'
                  ? 'bg-[#002244] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'quadro_resumo' ? 'text-[#00A3E0]' : 'text-slate-400'}`} />
              <span>Quadro de Resumo</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'quadro_resumo' ? 'bg-[#00A3E0] text-white' : 'bg-slate-200 text-slate-700'}`}>
                {reports.length}
              </span>
            </button>

            {/* Aba 3: Reconciliação Bancária (Admin & Supervisor) */}
            {isSupervisorOrAdmin && (
              <button
                onClick={() => setActiveTab('reconciliacao')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                  activeTab === 'reconciliacao'
                    ? 'bg-[#002244] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Scale className={`w-4 h-4 ${activeTab === 'reconciliacao' ? 'text-[#00A3E0]' : 'text-amber-500'}`} />
                <span>Reconciliação de Valores</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                  Auditoria
                </span>
              </button>
            )}

            {/* Aba 4: Dashboards & Rendimentos */}
            <button
              onClick={() => setActiveTab('dashboards')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                activeTab === 'dashboards'
                  ? 'bg-[#002244] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${activeTab === 'dashboards' ? 'text-[#00A3E0]' : 'text-slate-400'}`} />
              <span>Dashboards & Rendimentos</span>
            </button>

            {/* Aba 5: Gestão de Movimentos & Taxas (Exclusivo Administrador) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('gestao_movimentos')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                  activeTab === 'gestao_movimentos'
                    ? 'bg-[#002244] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className={`w-4 h-4 ${activeTab === 'gestao_movimentos' ? 'text-[#00A3E0]' : 'text-slate-400'}`} />
                <span>Gestão de Movimentos (200 Kz)</span>
              </button>
            )}

            {/* Aba 6: Gestão de Utilizadores (Exclusivo Administrador) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('gestao_utilizadores')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                  activeTab === 'gestao_utilizadores'
                    ? 'bg-[#002244] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className={`w-4 h-4 ${activeTab === 'gestao_utilizadores' ? 'text-[#00A3E0]' : 'text-slate-400'}`} />
                <span>Utilizadores & Permissões</span>
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'novo_relatorio' && (
          <DailyReportForm
            currentUser={currentUser}
            users={users}
            movements={movements}
            settings={settings}
            editingReport={editingReport}
            onSubmitReport={handleSubmitReport}
            onCancelEdit={() => setEditingReport(null)}
            onViewReceipt={report => setViewingReceipt(report)}
          />
        )}

        {activeTab === 'quadro_resumo' && (
          <ReportsSummary
            reports={reports}
            currentUser={currentUser}
            onEditReport={handleEditReport}
            onDeleteReport={handleDeleteReport}
            onViewReceipt={report => setViewingReceipt(report)}
          />
        )}

        {activeTab === 'reconciliacao' && (
          <ReconciliationView
            currentUser={currentUser}
            users={users}
            reports={reports}
            reconciliations={reconciliations}
            onSaveReconciliation={handleSaveReconciliation}
            onDeleteReconciliation={handleDeleteReconciliation}
          />
        )}

        {activeTab === 'dashboards' && (
          <AnalyticsDashboard
            reports={reports}
            users={users}
          />
        )}

        {activeTab === 'gestao_movimentos' && (
          <MovementsManagement
            currentUser={currentUser}
            movements={movements}
            onAddMovement={handleAddMovement}
            onUpdateMovement={handleUpdateMovement}
            onDeleteMovement={handleDeleteMovement}
            onResetDefaults={handleResetMovementsDefaults}
          />
        )}

        {activeTab === 'gestao_utilizadores' && (
          <UsersManagement
            currentUser={currentUser}
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onResetPassword={handleResetPassword}
            onOpenShareModal={() => setShowShareModal(true)}
          />
        )}
      </main>

      {/* Rodapé Corporativo BAI */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 space-y-2 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#002244]">AGENTE BAI</span>
            <span>•</span>
            <span>{settings.companyName}</span>
            <span>({settings.agentNumber})</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowHostingGuide(true)}
              className="text-[#00A3E0] hover:underline font-semibold flex items-center gap-1"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Instruções de Hospedagem GitHub & Firebase</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Encriptação E2E Activa</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modais Globais */}
      {viewingReceipt && (
        <ReportReceiptModal
          report={viewingReceipt}
          settings={settings}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {showShareModal && (
        <ShareAccessModal
          settings={settings}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showAccountModal && (
        <UserAccountModal
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onResetPassword={handleResetPassword}
          onDeleteAccount={handleDeleteUser}
          onClose={() => setShowAccountModal(false)}
        />
      )}

      {showCompanySettings && (
        <CompanySettingsModal
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onClose={() => setShowCompanySettings(false)}
        />
      )}

      {showHostingGuide && (
        <HostingGuideModal onClose={() => setShowHostingGuide(false)} />
      )}
    </div>
  );
}
