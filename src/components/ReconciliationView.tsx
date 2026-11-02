import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BadgeAlert,
  Calculator,
  CheckCircle2,
  DollarSign,
  History,
  Lock,
  PlusCircle,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { DailyReport, ReconciliationRecord, User } from '../types';
import { formatKz } from '../utils/crypto';

interface ReconciliationViewProps {
  currentUser: User | null;
  users: User[];
  reports: DailyReport[];
  reconciliations: ReconciliationRecord[];
  onSaveReconciliation: (rec: Omit<ReconciliationRecord, 'id' | 'finalValue' | 'discrepancy' | 'status'> & { id?: string }) => void;
  onDeleteReconciliation: (id: string) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  currentUser,
  users,
  reports,
  reconciliations,
  onSaveReconciliation,
  onDeleteReconciliation,
}) => {
  // Controle de Acesso Restrito: "Apenas o administrador e o supervisor devem ter acesso a estes dados"
  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [shift, setShift] = useState<string>('Integral');
  const [initialValueStr, setInitialValueStr] = useState<string>('');
  const [cashInHandStr, setCashInHandStr] = useState<string>('');
  const [accountValueStr, setAccountValueStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-xl mx-auto shadow-sm space-y-4 my-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-rose-900">
          Acesso Restrito à Reconciliação
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Por normas bancárias e diretrizes de auditoria interna do Agente BAI, apenas{' '}
          <strong>Administradores</strong> e <strong>Supervisores</strong> têm permissão para aceder à
          área de reconciliação financeira de valores.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          Seu perfil atual: <span className="font-bold uppercase text-slate-700">{currentUser?.role}</span> ({currentUser?.fullName})
        </div>
      </div>
    );
  }

  // Preenchimento automático ao selecionar um relatório existente
  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    if (!reportId) return;
    const rep = reports.find(r => r.id === reportId);
    if (rep) {
      setSelectedUserId(rep.userId);
      setDate(rep.reportDate);
      setShift(rep.shift);
      // O Valor Físico do relatório pode sugerir o Valor em Mão
      if (rep.physicalValue) {
        setCashInHandStr(String(rep.physicalValue));
      }
    }
  };

  // Cálculos matemáticos da regra de reconciliação:
  // "valor inicial dever ser igual ao valor final, onde o valor final é igua a valor em mão mais valor em conta"
  const initialValue = parseFloat(initialValueStr) || 0;
  const cashInHand = parseFloat(cashInHandStr) || 0;
  const accountValue = parseFloat(accountValueStr) || 0;
  const finalValue = cashInHand + accountValue;
  const discrepancy = finalValue - initialValue;
  const isBalanced = Math.abs(discrepancy) < 0.01 && initialValue > 0;
  const hasDiscrepancy = Math.abs(discrepancy) >= 0.01 && (initialValue > 0 || finalValue > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find(u => u.id === selectedUserId);
    if (!targetUser) return;

    if (initialValueStr.trim() === '' || isNaN(initialValue)) {
      alert('Por favor informe o Valor Inicial.');
      return;
    }

    onSaveReconciliation({
      reportId: selectedReportId || undefined,
      reportNumber: reports.find(r => r.id === selectedReportId)?.reportNumber,
      userId: targetUser.id,
      userName: targetUser.fullName,
      date,
      shift,
      initialValue,
      cashInHand,
      accountValue,
      verifiedBy: `${currentUser?.fullName} (${currentUser?.role === 'admin' ? 'Administrador' : 'Supervisor'})`,
      verifiedAt: new Date().toISOString(),
      notes: notes.trim(),
    });

    setFeedbackMessage('Reconciliação registada com sucesso no livro de auditoria bancária!');
    setTimeout(() => setFeedbackMessage(null), 3500);

    // Reset campos numéricos
    setInitialValueStr('');
    setCashInHandStr('');
    setAccountValueStr('');
    setNotes('');
    setSelectedReportId('');
  };

  return (
    <div className="space-y-6">
      {/* Banner de Segurança & Fórmula Contábil */}
      <div className="bg-gradient-to-r from-[#002244] to-[#0b3b60] text-white rounded-2xl p-6 shadow-md border border-slate-700 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00A3E0]/20 border border-[#00A3E0]/40 flex items-center justify-center text-[#00A3E0]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Reconciliação Bancária de Valores</span>
                <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                  Exclusivo Admin & Supervisor
                </span>
              </h2>
              <p className="text-xs text-sky-200">
                Auditoria de fecho de caixa sem limite de utilizadores.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">
              Regra Oficial BAI
            </span>
            <span className="text-xs font-mono font-bold text-[#00A3E0] bg-white/10 px-2.5 py-1 rounded-md">
              Valor Final = Valor em Mão + Valor em Conta
            </span>
          </div>
        </div>

        {/* Visualizador da Equação de Balanço */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">1. Valor Inicial</span>
            <span className="text-sm font-bold text-white mt-1 block">
              {formatKz(initialValue)}
            </span>
          </div>

          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">2. Valor em Mão (Espécie)</span>
            <span className="text-sm font-bold text-amber-300 mt-1 block">
              {formatKz(cashInHand)}
            </span>
          </div>

          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">3. Valor em Conta (Digital)</span>
            <span className="text-sm font-bold text-sky-300 mt-1 block">
              {formatKz(accountValue)}
            </span>
          </div>

          <div
            className={`p-3 rounded-xl border font-bold ${
              isBalanced
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : hasDiscrepancy
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                : 'bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <span className="block text-[10px] uppercase">
              4. Valor Final & Balanço
            </span>
            <span className="text-sm font-black mt-1 block">
              {formatKz(finalValue)}
            </span>
            <span className="text-[10px] block mt-0.5">
              {isBalanced ? '✓ Equilibrado (Diferença = 0)' : hasDiscrepancy ? `Diferença: ${formatKz(discrepancy)}` : 'Aguardando valores'}
            </span>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Formulário de Execução de Reconciliação */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-[#002244] uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#00A3E0]" />
            Nova Sessão de Reconciliação
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Auditor Responsável: <strong>{currentUser?.fullName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Vincular a Relatório Diário Opcional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Vincular a Relatório (Opcional)
            </label>
            <select
              value={selectedReportId}
              onChange={e => handleSelectReport(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#00A3E0]"
            >
              <option value="">Nenhum (Reconciliação Manual)</option>
              {reports.map(r => (
                <option key={r.id} value={r.id}>
                  {r.reportNumber} - {r.userName} ({r.reportDate})
                </option>
              ))}
            </select>
          </div>

          {/* Selecionar Utilizador (Sem Limites de Utilizadores) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Utilizador a Reconciliar
            </label>
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#00A3E0]"
              required
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} (@{u.username}) - {u.role.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Data de Fecho
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#00A3E0]"
              required
            />
          </div>

          {/* Turno */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Turno Auditado
            </label>
            <select
              value={shift}
              onChange={e => setShift(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#00A3E0]"
            >
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Integral">Integral</option>
            </select>
          </div>
        </div>

        {/* Inputs Financeiros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Valor Inicial (Kz)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="ex: 1500000.00"
                value={initialValueStr}
                onChange={e => setInitialValueStr(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#00A3E0] outline-none"
                required
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                Kz
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Saldo inicial entregue ao operador no início do turno
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Valor em Mão (Espécie / Gaveta)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="ex: 485000.00"
                value={cashInHandStr}
                onChange={e => setCashInHandStr(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-amber-700 focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-amber-600">
                Kz
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Dinheiro físico contado no cofre/caixa no final do turno
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              3. Valor em Conta (Digital)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="ex: 1015000.00"
                value={accountValueStr}
                onChange={e => setAccountValueStr(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-sky-600">
                Kz
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Saldo digital remanescente na conta de liquidação do agente
            </span>
          </div>
        </div>

        {/* Parecer do Auditor */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Parecer de Auditoria / Notas do Fecho
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Reconciliação conferida. Valores batem com o extracto e fecho do TPA..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#00A3E0]"
          />
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-[#00A3E0]" />
            <span>Gravar Reconciliação de Valores</span>
          </button>
        </div>
      </form>

      {/* Histórico de Reconciliações */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#00A3E0]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Histórico de Reconciliações Registadas ({reconciliations.length})
            </span>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Sem limites de utilizadores
          </span>
        </div>

        {reconciliations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            Nenhuma reconciliação registada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Data / Turno</th>
                  <th className="px-4 py-3">Utilizador Auditado</th>
                  <th className="px-4 py-3 text-right">Valor Inicial (Kz)</th>
                  <th className="px-4 py-3 text-right">Valor em Mão (Kz)</th>
                  <th className="px-4 py-3 text-right">Valor em Conta (Kz)</th>
                  <th className="px-4 py-3 text-right">Valor Final (Kz)</th>
                  <th className="px-4 py-3 text-right">Diferença</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Verificado Por</th>
                  {currentUser?.role === 'admin' && (
                    <th className="px-4 py-3 text-center">Acções</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reconciliations.map(rec => {
                  const isZero = Math.abs(rec.discrepancy) < 0.01;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <div>{rec.date}</div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">
                          {rec.shift}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{rec.userName}</div>
                        {rec.reportNumber && (
                          <div className="text-[10px] font-mono text-sky-600">
                            {rec.reportNumber}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {formatKz(rec.initialValue)}
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-amber-700">
                        {formatKz(rec.cashInHand)}
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-sky-700">
                        {formatKz(rec.accountValue)}
                      </td>

                      <td className="px-4 py-3 text-right font-black text-slate-900">
                        {formatKz(rec.finalValue)}
                      </td>

                      <td className="px-4 py-3 text-right font-bold">
                        {isZero ? (
                          <span className="text-emerald-600 font-mono">0,00 Kz</span>
                        ) : rec.discrepancy > 0 ? (
                          <span className="text-amber-600 font-mono">
                            +{formatKz(rec.discrepancy)} (Sobra)
                          </span>
                        ) : (
                          <span className="text-rose-600 font-mono">
                            {formatKz(rec.discrepancy)} (Quebra)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            rec.status === 'equilibrado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rec.status === 'equilibrado' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Equilibrado
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Divergente
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-[11px] text-slate-500">
                        <div>{rec.verifiedBy}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(rec.verifiedAt).toLocaleDateString('pt-AO')}
                        </div>
                      </td>

                      {currentUser?.role === 'admin' && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              if (confirm('Eliminar registo de reconciliação?')) {
                                onDeleteReconciliation(rec.id);
                              }
                            }}
                            className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
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
