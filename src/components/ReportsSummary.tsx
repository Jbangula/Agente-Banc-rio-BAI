import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Lock,
  Mail,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Unlock,
  User as UserIcon,
} from 'lucide-react';
import { storage } from '../services/storage';
import { DailyReport, User } from '../types';
import { formatKz, formatNumber } from '../utils/crypto';

interface ReportsSummaryProps {
  reports: DailyReport[];
  currentUser: User | null;
  onEditReport: (report: DailyReport) => void;
  onDeleteReport: (reportId: string) => void;
  onViewReceipt: (report: DailyReport) => void;
  onReconcileReport?: (report: DailyReport) => void;
}

export const ReportsSummary: React.FC<ReportsSummaryProps> = ({
  reports,
  currentUser,
  onEditReport,
  onDeleteReport,
  onViewReceipt,
  onReconcileReport,
}) => {
  const [search, setSearch] = useState('');
  const [filterOperator, setFilterOperator] = useState('ALL');
  const [filterShift, setFilterShift] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Lista única de operadores nos relatórios
  const operatorsList = useMemo(() => {
    const map = new Map<string, string>();
    reports.forEach(r => {
      map.set(r.userId, r.userName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [reports]);

  // Filtragem dos relatórios
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchSearch =
        r.reportNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.userName.toLowerCase().includes(search.toLowerCase()) ||
        r.recipientEmail.toLowerCase().includes(search.toLowerCase());

      const matchOperator = filterOperator === 'ALL' || r.userId === filterOperator;
      const matchShift = filterShift === 'ALL' || r.shift === filterShift;
      const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;

      let matchDate = true;
      if (startDate && r.reportDate < startDate) matchDate = false;
      if (endDate && r.reportDate > endDate) matchDate = false;

      return matchSearch && matchOperator && matchShift && matchStatus && matchDate;
    });
  }, [reports, search, filterOperator, filterShift, filterStatus, startDate, endDate]);

  // Totais agregados
  const totalReportsCount = filteredReports.length;
  const totalMovementsCount = filteredReports.reduce((acc, r) => acc + r.totalMovements, 0);
  const totalAmountKz = filteredReports.reduce((acc, r) => acc + r.totalAmountKz, 0);
  const totalPhysicalValueKz = filteredReports.reduce((acc, r) => acc + (r.physicalValue || 0), 0);

  // Exportação para CSV / Excel
  const handleExportCSV = () => {
    if (filteredReports.length === 0) return;
    const headers = [
      'Nº Relatório',
      'Data',
      'Turno',
      'Operador',
      'Email Operador',
      'Email Receptor',
      'Total Movimentos',
      'Rendimento Comissões (Kz)',
      'Valor Físico Declarado (Kz)',
      'Status',
      'Data Submissão',
      'Assinatura E2E',
    ];

    const rows = filteredReports.map(r => [
      `"${r.reportNumber}"`,
      `"${r.reportDate}"`,
      `"${r.shift}"`,
      `"${r.userName.replace(/"/g, '""')}"`,
      `"${r.userEmail}"`,
      `"${r.recipientEmail}"`,
      r.totalMovements,
      r.totalAmountKz,
      r.physicalValue,
      `"${r.status}"`,
      `"${new Date(r.submittedAt).toLocaleString('pt-AO')}"`,
      `"${r.e2eSignature}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorios_agente_bai_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper de cálculo de 24h para exibição
  const getEditStatus = (report: DailyReport) => {
    if (!currentUser) return { canEdit: false, label: 'Sem sessão', isExpired: true };
    if (currentUser.role === 'admin') {
      return { canEdit: true, label: 'Edição Admin (Sem limite)', isExpired: false, isAdmin: true };
    }
    const submittedTime = new Date(report.submittedAt).getTime();
    const now = Date.now();
    const diffHours = (now - submittedTime) / (1000 * 60 * 60);

    if (report.userId !== currentUser.id) {
      return { canEdit: false, label: 'Outro operador', isExpired: true };
    }

    if (diffHours <= 24) {
      const remainingHours = Math.max(0, 24 - diffHours);
      return {
        canEdit: true,
        label: `Editar (restam ${remainingHours.toFixed(1)}h)`,
        isExpired: false,
        remainingHours,
      };
    } else {
      return {
        canEdit: false,
        label: 'Bloqueado (> 24h)',
        isExpired: true,
        hoursElapsed: diffHours,
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Totais / Métricas Globais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Relatórios Registados
          </span>
          <div className="text-2xl font-black text-[#002244] mt-1">
            {formatNumber(totalReportsCount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            No período filtrado
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total de Movimentos
          </span>
          <div className="text-2xl font-black text-[#00A3E0] mt-1">
            {formatNumber(totalMovementsCount)}
          </div>
          <span className="text-[11px] text-sky-600 mt-0.5 block">
            Operações executadas
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Facturação / Comissões
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {formatKz(totalAmountKz)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Multiplicação dos 200 Kz
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Valor Físico Declarado
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {formatKz(totalPhysicalValueKz)}
          </div>
          <span className="text-[11px] text-amber-700/80 mt-0.5 block font-medium">
            Numerário físico registado
          </span>
        </div>
      </div>

      {/* Filtros e Barra de Ações */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#00A3E0]" />
            <h3 className="text-sm font-extrabold text-[#002244] uppercase tracking-wider">
              Filtros do Quadro de Resumo
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredReports.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar Excel / CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Busca por texto */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar relatório, operador ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A3E0] outline-none"
            />
          </div>

          {/* Filtro de Operador */}
          <div>
            <select
              value={filterOperator}
              onChange={e => setFilterOperator(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">Todos os Operadores</option>
              {operatorsList.map(op => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Turno */}
          <div>
            <select
              value={filterShift}
              onChange={e => setFilterShift(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">Todos os Turnos</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Integral">Integral</option>
            </select>
          </div>

          {/* Filtro de Status */}
          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">Todos os Estados</option>
              <option value="reconciliado">Reconciliado</option>
              <option value="pendente">Pendente</option>
              <option value="divergente">Divergente</option>
            </select>
          </div>

          {/* Limpar filtros */}
          <div>
            <button
              onClick={() => {
                setSearch('');
                setFilterOperator('ALL');
                setFilterShift('ALL');
                setFilterStatus('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela do Quadro de Resumo de Relatórios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Relatórios Diários ({filteredReports.length})
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Regra: Operador pode editar até 24h após envio | Administrador edita livremente
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">Nenhum relatório encontrado para os critérios selecionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Nº Relatório</th>
                  <th className="px-4 py-3">Data / Turno</th>
                  <th className="px-4 py-3">Operador</th>
                  <th className="px-4 py-3">Email Receptor</th>
                  <th className="px-4 py-3 text-right">Movimentos</th>
                  <th className="px-4 py-3 text-right">Comissões (Kz)</th>
                  <th className="px-4 py-3 text-right">Valor Físico (Kz)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Janela de Edição</th>
                  <th className="px-4 py-3 text-center">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map(report => {
                  const editStatus = getEditStatus(report);

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition">
                      {/* Número do Relatório & E2E */}
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#002244]">
                          {report.reportNumber}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono mt-0.5" title={`Assinatura E2E: ${report.e2eSignature}`}>
                          <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          <span>E2E Validado</span>
                        </div>
                      </td>

                      {/* Data & Turno */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">
                          {report.reportDate}
                        </div>
                        <span className="inline-block text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded mt-0.5">
                          {report.shift}
                        </span>
                      </td>

                      {/* Operador */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">
                          {report.userName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {report.userEmail}
                        </div>
                      </td>

                      {/* Email Receptor Obrigatório */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Mail className="w-3 h-3 text-[#00A3E0] shrink-0" />
                          <span className="truncate max-w-[150px]">{report.recipientEmail}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Submetido: {new Date(report.submittedAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Quantidade Movimentos */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-800 bg-sky-50 px-2 py-0.5 rounded-full text-xs">
                          {formatNumber(report.totalMovements)}
                        </span>
                      </td>

                      {/* Facturação Total Kz */}
                      <td className="px-4 py-3 text-right font-black text-[#00A3E0]">
                        {formatKz(report.totalAmountKz)}
                      </td>

                      {/* Valor Físico (Independente) */}
                      <td className="px-4 py-3 text-right font-black text-amber-700 bg-amber-50/50">
                        {formatKz(report.physicalValue)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            report.status === 'reconciliado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : report.status === 'divergente'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>

                      {/* Janela de Edição (24h vs Admin) */}
                      <td className="px-4 py-3 text-center">
                        {editStatus.isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            <Unlock className="w-3 h-3 text-amber-600" />
                            Admin Ilimitado
                          </span>
                        ) : editStatus.canEdit ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {editStatus.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full" title="Mais de 24h decorridas. Solicite ao Administrador.">
                            <Lock className="w-3 h-3 text-slate-400" />
                            {editStatus.label}
                          </span>
                        )}
                      </td>

                      {/* Acções */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Visualizar / Imprimir Recibo Oficial */}
                          <button
                            onClick={() => onViewReceipt(report)}
                            title="Ver Comprovativo / Recibo Oficial"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#00A3E0] hover:bg-sky-50 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Editar Relatório (Sujeito à regra 24h ou Admin) */}
                          <button
                            onClick={() => onEditReport(report)}
                            disabled={!editStatus.canEdit}
                            title={
                              editStatus.canEdit
                                ? 'Editar Relatório'
                                : 'Prazo de edição de 24h expirou para operadores'
                            }
                            className={`p-1.5 rounded-lg transition ${
                              editStatus.canEdit
                                ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer'
                                : 'text-slate-300 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Eliminar (Apenas Administrador) */}
                          {currentUser?.role === 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Tem a certeza que deseja eliminar o relatório ${report.reportNumber}?`)) {
                                  onDeleteReport(report.id);
                                }
                              }}
                              title="Eliminar Relatório (Privilégio Admin)"
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
