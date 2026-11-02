import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Award,
  BarChart2,
  Calendar,
  CreditCard,
  DollarSign,
  Filter,
  PieChart,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { DailyReport, User } from '../types';
import { formatKz, formatNumber } from '../utils/crypto';

interface AnalyticsDashboardProps {
  reports: DailyReport[];
  users: User[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  reports,
  users,
}) => {
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | 'ALL'>('30');

  // Filtragem dos relatórios
  const filteredReports = useMemo(() => {
    let result = reports;

    if (selectedOperatorId !== 'ALL') {
      result = result.filter(r => r.userId === selectedOperatorId);
    }

    if (selectedPeriod !== 'ALL') {
      const days = parseInt(selectedPeriod);
      const cutoff = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);
      result = result.filter(r => r.reportDate >= cutoff);
    }

    return result;
  }, [reports, selectedOperatorId, selectedPeriod]);

  // Totais
  const totalReports = filteredReports.length;
  const totalMovements = filteredReports.reduce((acc, r) => acc + r.totalMovements, 0);
  const totalAmountKz = filteredReports.reduce((acc, r) => acc + r.totalAmountKz, 0);
  const totalPhysicalValue = filteredReports.reduce((acc, r) => acc + (r.physicalValue || 0), 0);
  const avgMovementsPerReport = totalReports > 0 ? Math.round(totalMovements / totalReports) : 0;
  const avgRevenuePerReport = totalReports > 0 ? totalAmountKz / totalReports : 0;

  // Rendimento por Operador (Leaderboard)
  const operatorBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; movements: number; amountKz: number; reportsCount: number }>();
    reports.forEach(r => {
      const existing = map.get(r.userId) || {
        name: r.userName,
        movements: 0,
        amountKz: 0,
        reportsCount: 0,
      };
      existing.movements += r.totalMovements;
      existing.amountKz += r.totalAmountKz;
      existing.reportsCount += 1;
      map.set(r.userId, existing);
    });
    return Array.from(map.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.amountKz - a.amountKz);
  }, [reports]);

  // Ranking dos Movimentos Mais Executados
  const topMovements = useMemo(() => {
    const map = new Map<string, { code: string; name: string; qty: number; totalKz: number }>();
    filteredReports.forEach(r => {
      r.items.forEach(it => {
        const cur = map.get(it.movementName) || {
          code: it.movementCode,
          name: it.movementName,
          qty: 0,
          totalKz: 0,
        };
        cur.qty += it.quantity;
        cur.totalKz += it.totalValue;
        map.set(it.movementName, cur);
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 7);
  }, [filteredReports]);

  // Rendimento por Categoria (BAI vs AB vs Multicaixa)
  const categoryBreakdown = useMemo(() => {
    let bai = 0;
    let ab = 0;
    let mixed = 0;
    filteredReports.forEach(r => {
      r.items.forEach(it => {
        if (it.category === 'BAI') bai += it.totalValue;
        else if (it.category === 'AB') ab += it.totalValue;
        else mixed += it.totalValue;
      });
    });
    const total = (bai + ab + mixed) || 1;
    return {
      bai: { val: bai, pct: Math.round((bai / total) * 100) },
      ab: { val: ab, pct: Math.round((ab / total) * 100) },
      mixed: { val: mixed, pct: Math.round((mixed / total) * 100) },
    };
  }, [filteredReports]);

  // Dados diários para gráfico de barras
  const dailyChartData = useMemo(() => {
    const map = new Map<string, { date: string; amountKz: number; movements: number }>();
    // Preencher últimos 7 dias
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000).toISOString().slice(0, 10);
      map.set(d, { date: d, amountKz: 0, movements: 0 });
    }
    filteredReports.forEach(r => {
      if (map.has(r.reportDate)) {
        const cur = map.get(r.reportDate)!;
        cur.amountKz += r.totalAmountKz;
        cur.movements += r.totalMovements;
      } else {
        // Se for anterior aos 7 dias mas dentro do período
        map.set(r.reportDate, {
          date: r.reportDate,
          amountKz: r.totalAmountKz,
          movements: r.totalMovements,
        });
      }
    });
    return Array.from(map.values()).slice(-7);
  }, [filteredReports]);

  const maxDailyAmount = Math.max(...dailyChartData.map(d => d.amountKz), 50000);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros: Individual vs Todos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244] flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#00A3E0]" />
            <span>Dashboards & Rendimento de Movimentos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Análise consolidada de todos os operadores e visão de rendimento individual.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro Operador Individual */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <select
              value={selectedOperatorId}
              onChange={e => setSelectedOperatorId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#002244] outline-none focus:ring-2 focus:ring-[#00A3E0]"
            >
              <option value="ALL">★ Todos os Operadores (Geral)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} (@{u.username})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Período */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['7', '30', 'ALL'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  selectedPeriod === p
                    ? 'bg-white text-[#002244] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === '7' ? '7 Dias' : p === '30' ? '30 Dias' : 'Todo Período'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cartões de Indicadores Chave de Desempenho (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#002244] to-[#001730] text-white rounded-2xl p-5 shadow-sm border border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Rendimento Total Facturado
          </span>
          <div className="text-3xl font-black text-[#00A3E0] mt-1">
            {formatKz(totalAmountKz)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Multiplicação de 200,00 Kz/mov</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Volume Total de Movimentos
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {formatNumber(totalMovements)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Média de <strong>{formatNumber(avgMovementsPerReport)}</strong> movs / turno
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Valor Físico Declarado
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1 truncate">
            {formatKz(totalPhysicalValue)}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-2 font-medium">
            Dinheiro registado em caixa/cofre
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Média de Rendimento / Relatório
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {formatKz(avgRevenuePerReport)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Baseado em {totalReports} relatórios submetidos
          </div>
        </div>
      </div>

      {/* Gráfico 1: Rendimento Diário em Kwanzas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#002244] uppercase tracking-wider">
                Evolução Diária de Rendimento (Últimos Dias)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Valores gerados por comissões de movimentos no agente
              </p>
            </div>
          </div>

          {/* Gráfico SVG Responsivo */}
          <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
            {dailyChartData.map((d, idx) => {
              const heightPct = Math.min(100, Math.max(8, (d.amountKz / maxDailyAmount) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-slate-800 text-white px-1.5 py-0.5 rounded shadow-xs">
                    {formatKz(d.amountKz)} ({d.movements} movs)
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[42px] bg-gradient-to-t from-[#002244] to-[#00A3E0] group-hover:to-sky-400 rounded-t-lg transition-all duration-300 shadow-2xs"
                  />
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>0,00 Kz</span>
            <span className="font-semibold text-slate-600">
              Pico Máximo Registado: {formatKz(maxDailyAmount)}
            </span>
          </div>
        </div>

        {/* Gráfico 2: Distribuição por Tipo de Movimento (BAI vs AB) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#002244] uppercase tracking-wider">
              Distribuição por Categoria
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              BAI, Agente Bancário (AB) e Cartões
            </p>
          </div>

          <div className="space-y-4 my-auto">
            {/* Categoria AB */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[#00A3E0] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A3E0]"></span>
                  Operações AB (Agente Bancário)
                </span>
                <span className="text-slate-800">{categoryBreakdown.ab.pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${categoryBreakdown.ab.pct}%` }}
                  className="h-full bg-[#00A3E0] rounded-full transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block text-right font-medium">
                {formatKz(categoryBreakdown.ab.val)}
              </span>
            </div>

            {/* Categoria BAI */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[#002244] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#002244]"></span>
                  Operações Oficiais BAI
                </span>
                <span className="text-slate-800">{categoryBreakdown.bai.pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${categoryBreakdown.bai.pct}%` }}
                  className="h-full bg-[#002244] rounded-full transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block text-right font-medium">
                {formatKz(categoryBreakdown.bai.val)}
              </span>
            </div>

            {/* Categoria Mista / Multicaixa */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-purple-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  Outros / BAI + AB
                </span>
                <span className="text-slate-800">{categoryBreakdown.mixed.pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${categoryBreakdown.mixed.pct}%` }}
                  className="h-full bg-purple-600 rounded-full transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block text-right font-medium">
                {formatKz(categoryBreakdown.mixed.val)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-sky-50 rounded-xl text-[11px] text-[#002244] font-medium border border-sky-100">
            💡 As operações de depósito, levantamento e adesão ao Baidirecto representam o maior volume diário de fluxo.
          </div>
        </div>
      </div>

      {/* Tabela de Top Movimentos Mais Executados & Ranking dos Operadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movimentos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Top Movimentos Mais Executados
            </h3>
            <span className="text-[11px] text-slate-400">Classificação por quantidade</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topMovements.map((m, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{m.code}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">
                    {formatNumber(m.qty)} movs
                  </span>
                  <span className="text-[10px] font-bold text-[#00A3E0]">
                    {formatKz(m.totalKz)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking de Rendimento por Operador (Leaderboard) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Desempenho por Operador Agente</span>
            </h3>
            <span className="text-[11px] text-slate-400">Filtro Individual Activo</span>
          </div>

          <div className="divide-y divide-slate-100">
            {operatorBreakdown.map((op, idx) => (
              <div
                key={op.id}
                onClick={() => setSelectedOperatorId(op.id)}
                className={`p-3.5 flex items-center justify-between gap-3 hover:bg-sky-50/50 cursor-pointer transition ${
                  selectedOperatorId === op.id ? 'bg-sky-50 font-semibold border-l-4 border-l-[#00A3E0]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#002244] text-[#00A3E0] font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}º
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{op.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      {op.reportsCount} turnos registados • {formatNumber(op.movements)} movs
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 block">
                    {formatKz(op.amountKz)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Comissão acumulada
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
