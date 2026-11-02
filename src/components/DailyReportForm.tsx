import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Lock,
  Mail,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CompanySettings, DailyReport, MovementType, ReportMovementItem, User } from '../types';
import { formatKz, formatNumber } from '../utils/crypto';

interface DailyReportFormProps {
  currentUser: User;
  users: User[];
  movements: MovementType[];
  settings: CompanySettings;
  editingReport?: DailyReport | null;
  onSubmitReport: (reportData: {
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
  }) => Promise<DailyReport>;
  onCancelEdit?: () => void;
  onViewReceipt: (report: DailyReport) => void;
}

export const DailyReportForm: React.FC<DailyReportFormProps> = ({
  currentUser,
  users,
  movements,
  settings,
  editingReport,
  onSubmitReport,
  onCancelEdit,
  onViewReceipt,
}) => {
  const [reportDate, setReportDate] = useState<string>(
    editingReport?.reportDate || new Date().toISOString().slice(0, 10)
  );
  const [shift, setShift] = useState<'Manhã' | 'Tarde' | 'Integral'>(
    editingReport?.shift || 'Manhã'
  );
  const [recipientEmail, setRecipientEmail] = useState<string>(
    editingReport?.recipientEmail || settings.defaultSupervisorEmail || ''
  );
  const [physicalValueStr, setPhysicalValueStr] = useState<string>(
    editingReport?.physicalValue !== undefined ? String(editingReport.physicalValue) : ''
  );
  const [observations, setObservations] = useState<string>(
    editingReport?.observations || ''
  );

  // Mapeamento de quantidades { [movementId]: number }
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carrega quantidades se estiver a editar
  useEffect(() => {
    if (editingReport) {
      const qMap: Record<string, number> = {};
      editingReport.items.forEach(item => {
        qMap[item.movementTypeId] = item.quantity;
      });
      setQuantities(qMap);
      setReportDate(editingReport.reportDate);
      setShift(editingReport.shift);
      setRecipientEmail(editingReport.recipientEmail);
      setPhysicalValueStr(String(editingReport.physicalValue));
      setObservations(editingReport.observations || '');
    } else {
      setQuantities({});
      setPhysicalValueStr('');
      setObservations('');
    }
  }, [editingReport]);

  const activeMovements = movements.filter(m => m.active);

  const handleQuantityChange = (movementId: string, value: number) => {
    const safeVal = Math.max(0, Math.floor(value || 0));
    setQuantities(prev => ({
      ...prev,
      [movementId]: safeVal,
    }));
  };

  const handleIncrement = (movementId: string, step = 1) => {
    setQuantities(prev => ({
      ...prev,
      [movementId]: (prev[movementId] || 0) + step,
    }));
  };

  const handleDecrement = (movementId: string, step = 1) => {
    setQuantities(prev => ({
      ...prev,
      [movementId]: Math.max(0, (prev[movementId] || 0) - step),
    }));
  };

  const handleReset = () => {
    if (confirm('Deseja limpar todos os campos do relatório diário?')) {
      setQuantities({});
      setPhysicalValueStr('');
      setObservations('');
      setErrorMessage(null);
    }
  };

  // Cálculo dos itens preenchidos
  const movementItems: ReportMovementItem[] = activeMovements.map(mov => {
    const qty = quantities[mov.id] || 0;
    const unitVal = mov.defaultValue || 200.0;
    return {
      movementTypeId: mov.id,
      movementCode: mov.code,
      movementName: mov.name,
      category: mov.category,
      unitValue: unitVal,
      quantity: qty,
      totalValue: qty * unitVal,
    };
  });

  const totalMovementsCount = movementItems.reduce((acc, it) => acc + it.quantity, 0);
  const totalAmountKz = movementItems.reduce((acc, it) => acc + it.totalValue, 0);

  // Lista de supervisores e admins para preenchimento rápido do email receptor
  const supervisorEmails = Array.from(
    new Set(
      users
        .filter(u => (u.role === 'supervisor' || u.role === 'admin') && u.email)
        .map(u => u.email)
    )
  );

  // Filtragem dos movimentos exibidos na grelha
  const filteredMovements = activeMovements.filter(mov => {
    const matchesSearch =
      mov.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mov.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'TODOS' ||
      mov.category === selectedCategory ||
      (selectedCategory === 'MULTICAIXA' && mov.name.toLowerCase().includes('multicaixa'));
    return matchesSearch && matchesCat;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validação obrigatória do Email do Receptor
    if (!recipientEmail || !recipientEmail.trim() || !recipientEmail.includes('@')) {
      setErrorMessage('O Email do Receptor é obrigatório para envio do relatório bancário.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Validação obrigatória do Valor Físico
    if (physicalValueStr.trim() === '' || isNaN(Number(physicalValueStr))) {
      setErrorMessage(
        'O preenchimento do campo "Valor Físico" é obrigatório antes do envio do relatório.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const physicalValue = Math.max(0, parseFloat(physicalValueStr));

    // 3. Pelo menos um movimento ou confirmação de turno vazio
    if (totalMovementsCount === 0) {
      if (!confirm('Atenção: Nenhum movimento registado com quantidade superior a zero. Deseja submeter o relatório mesmo assim?')) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const itemsToSubmit = movementItems.filter(it => it.quantity > 0);

      const saved = await onSubmitReport({
        id: editingReport?.id,
        userId: editingReport?.userId || currentUser.id,
        userName: editingReport?.userName || currentUser.fullName,
        userEmail: editingReport?.userEmail || currentUser.email,
        recipientEmail: recipientEmail.trim(),
        agencyName: settings.companyName,
        reportDate,
        shift,
        physicalValue,
        items: itemsToSubmit.length > 0 ? itemsToSubmit : movementItems.slice(0, 1),
        totalMovements: totalMovementsCount,
        totalAmountKz,
        observations: observations.trim(),
        updatedByRole: currentUser.role,
      });

      // Confete festivo de sucesso
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00A3E0', '#002244', '#E5A823', '#10B981'],
      });

      // Abre recibo
      onViewReceipt(saved);

      if (!editingReport) {
        setQuantities({});
        setPhysicalValueStr('');
        setObservations('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao submeter relatório';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alerta de Edição ou Erro */}
      {editingReport && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl flex items-center justify-between text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">
                A Editar Relatório: {editingReport.reportNumber}
              </p>
              <p className="text-xs text-amber-700">
                Submetido originalmente por {editingReport.userName} em{' '}
                {new Date(editingReport.submittedAt).toLocaleDateString('pt-AO')}
              </p>
            </div>
          </div>
          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-100 transition"
            >
              Cancelar Edição
            </button>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Atenção aos requisitos: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Cartão de Cabeçalho Operacional e Campos Obrigatórios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#002244] flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-[#00A3E0]" />
              {editingReport ? 'Edição de Registo Diário' : 'Novo Registo Diário de Movimentos'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multiplicação automática do valor constante (200,00 Kz) pelo número de movimentos executados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Formulário</span>
            </button>
          </div>
        </div>

        {/* Linha 1: Metadados do Turno & Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Operador em Turno
            </label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-between">
              <span>{currentUser.fullName}</span>
              <span className="text-[10px] text-slate-400">@{currentUser.username}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Data do Movimento
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={e => setReportDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Turno Operacional
            </label>
            <select
              value={shift}
              onChange={e => setShift(e.target.value as 'Manhã' | 'Tarde' | 'Integral')}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent outline-none"
            >
              <option value="Manhã">Manhã (08h00 - 13h00)</option>
              <option value="Tarde">Tarde (13h00 - 18h00)</option>
              <option value="Integral">Integral (08h00 - 18h00)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Código da Agência
            </label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#002244]">
              {settings.agentNumber}
            </div>
          </div>
        </div>

        {/* Linha 2: Campos Obrigatórios em Destaque Especial: Email do Receptor e Valor Físico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* CAMPO OBRIGATÓRIO 1: EMAIL DO RECEPTOR */}
          <div className="bg-sky-50/70 border-2 border-sky-300 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#002244] uppercase tracking-wide flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#00A3E0]" />
                <span>Email do Receptor (Obrigatório)</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[10px] font-bold uppercase bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded-full">
                Destinatário
              </span>
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="ex: supervisor@agente-bai.ao"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Sugestões rápidas de emails de supervisores */}
            {supervisorEmails.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-medium">Sugestões rápidas:</span>
                {supervisorEmails.map(email => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => setRecipientEmail(email)}
                    className="text-[10px] font-medium bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded transition"
                  >
                    {email}
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-slate-500 leading-tight">
              O relatório será encaminhado digitalmente para este responsável para validação e auditoria.
            </p>
          </div>

          {/* CAMPO OBRIGATÓRIO 2: VALOR FÍSICO */}
          <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-amber-600" />
                <span>Valor Físico em Cofre / Caixa (Kz)</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                Obrigatório
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={physicalValueStr}
                onChange={e => setPhysicalValueStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold text-amber-950 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-amber-700">
                Kz
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-[11px] text-amber-900/80 font-medium leading-tight">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Regra Contábil BAI:</strong> Este campo é obrigatório antes de enviar. 
                <span className="underline decoration-amber-400 font-semibold ml-1">
                  Este valor não calcula com nada
                </span>
                ; serve como valor físico registado em espécie para conferência e reconciliação.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca de Movimentos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {['TODOS', 'BAI', 'AB', 'BAI / AB', 'MULTICAIXA'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[#002244] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar movimento (ex: Abertura, STC...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00A3E0] outline-none"
          />
        </div>
      </div>

      {/* Grelha de Movimentos Bancários BAI com Multiplicador Constante de 200 Kz */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Catálogo Oficial de Movimentos ({filteredMovements.length})
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Constante Padrão: <span className="font-bold text-[#00A3E0]">200,00 Kz / movimento</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredMovements.map(mov => {
            const qty = quantities[mov.id] || 0;
            const unitVal = mov.defaultValue || 200.0;
            const subtotal = qty * unitVal;
            const isSelected = qty > 0;

            return (
              <div
                key={mov.id}
                className={`p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected ? 'bg-sky-50/30' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Descrição do Movimento */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {mov.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        mov.category === 'BAI'
                          ? 'bg-[#002244] text-white'
                          : mov.category === 'AB'
                          ? 'bg-[#00A3E0] text-white'
                          : 'bg-purple-700 text-white'
                      }`}
                    >
                      {mov.category}
                    </span>
                    {mov.isCustom && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                        Personalizado
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {mov.name}
                  </h3>
                  {mov.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {mov.description}
                    </p>
                  )}
                </div>

                {/* Bloco de Quantidade e Multiplicação */}
                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                  {/* Preço Unitário Constante */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Constante
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {formatKz(unitVal)}
                    </span>
                  </div>

                  {/* Incrementadores / Contador */}
                  <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleDecrement(mov.id, 1)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition border border-slate-200"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={qty === 0 ? '' : qty}
                      placeholder="0"
                      onChange={e => handleQuantityChange(mov.id, parseInt(e.target.value) || 0)}
                      className="w-16 text-center text-sm font-extrabold text-slate-900 bg-transparent outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleIncrement(mov.id, 1)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition border border-slate-200"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal Calculado (Multiplicação do valor constante) */}
                  <div className="text-right min-w-[110px]">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Subtotal
                    </span>
                    <span
                      className={`text-sm font-black ${
                        isSelected ? 'text-[#00A3E0]' : 'text-slate-400'
                      }`}
                    >
                      {formatKz(subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Observações Operacionais */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Observações / Incidentes do Turno (Opcional)
        </label>
        <textarea
          rows={2}
          value={observations}
          onChange={e => setObservations(e.target.value)}
          placeholder="Registe qualquer ocorrência de quebra de sistema, afluência de clientes, falta de bobinas de papel Multicaixa ou notas especiais..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#00A3E0] outline-none"
        />
      </div>

      {/* Resumo Final & Envio Seguro com E2E Seal */}
      <div className="bg-gradient-to-br from-[#002244] to-[#001730] text-white rounded-2xl p-6 shadow-lg border border-slate-700 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
              Total de Movimentos
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {formatNumber(totalMovementsCount)}
            </div>
            <span className="text-[11px] text-sky-300 mt-0.5 block">
              Operações contabilizadas
            </span>
          </div>

          <div className="sm:pl-6">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
              Rendimento em Comissões (200 Kz)
            </span>
            <div className="text-3xl font-black text-[#00A3E0] mt-1">
              {formatKz(totalAmountKz)}
            </div>
            <span className="text-[11px] text-slate-300 mt-0.5 block">
              Total facturado pelo Agente
            </span>
          </div>

          <div className="sm:pl-6">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
              Valor Físico Declarado
            </span>
            <div className="text-2xl font-black text-amber-400 mt-1 truncate">
              {physicalValueStr.trim() !== ''
                ? formatKz(parseFloat(physicalValueStr))
                : 'Não preenchido'}
            </div>
            <span className="text-[11px] text-amber-200/80 mt-0.5 block">
              (Independente dos cálculos)
            </span>
          </div>
        </div>

        {/* Garantia de Encriptação de Ponta a Ponta */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>
              <strong>Encriptação E2E Activa:</strong> Os dados são validados criptograficamente com selo SHA-256 antes da transmissão ao receptor.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#00A3E0] to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>Processando Envio Seguro...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{editingReport ? 'Actualizar Relatório' : 'Enviar Relatório ao Receptor'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
