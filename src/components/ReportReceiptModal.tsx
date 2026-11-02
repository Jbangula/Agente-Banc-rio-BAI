import React from 'react';
import {
  Building2,
  CheckCircle2,
  Download,
  Mail,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react';
import { CompanySettings, DailyReport } from '../types';
import { formatKz, formatNumber } from '../utils/crypto';
import { BaiLogo } from './BaiLogo';

interface ReportReceiptModalProps {
  report: DailyReport | null;
  settings: CompanySettings;
  onClose: () => void;
}

export const ReportReceiptModal: React.FC<ReportReceiptModalProps> = ({
  report,
  settings,
  onClose,
}) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Barra Superior com Controlo de Fecho e Impressão (Oculta na impressão) */}
        <div className="bg-[#002244] text-white px-6 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Comprovativo Oficial de Fecho Diário
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A3E0] hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Recibo Impresso */}
        <div className="p-8 space-y-6 text-slate-800 bg-white" id="printable-receipt">
          {/* Cabeçalho Oficial Agente BAI */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div>
              <BaiLogo size="md" />
              <div className="mt-3 text-xs space-y-0.5">
                <p className="font-extrabold text-[#002244] text-sm uppercase">
                  {settings.companyName}
                </p>
                <p className="text-slate-600 font-medium">
                  Agente Bancário Autorizado BAI: <strong className="font-mono">{settings.agentNumber}</strong>
                </p>
                <p className="text-slate-500">NIF: {settings.nif} • {settings.city}</p>
                <p className="text-slate-500">{settings.address}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-widest">
                Nº de Registo
              </span>
              <span className="text-lg font-mono font-black text-[#002244] block">
                {report.reportNumber}
              </span>
              <span className="inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {report.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Dados do Turno e Operador */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl text-xs border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Data Operacional</span>
              <span className="font-bold text-slate-900">{report.reportDate}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Turno</span>
              <span className="font-bold text-slate-900">{report.shift}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Operador Agente</span>
              <span className="font-bold text-slate-900 truncate block">{report.userName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Email do Receptor</span>
              <span className="font-bold text-[#00A3E0] truncate block">{report.recipientEmail}</span>
            </div>
          </div>

          {/* Tabela de Movimentos Detalhada */}
          <div>
            <h4 className="text-xs font-black uppercase text-[#002244] tracking-wider mb-2">
              Discriminação de Movimentos Executados
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Código</th>
                    <th className="px-3 py-2">Operação Bancária</th>
                    <th className="px-3 py-2 text-right">Qtd</th>
                    <th className="px-3 py-2 text-right">Constante (Kz)</th>
                    <th className="px-3 py-2 text-right">Total (Kz)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.items.map((it, idx) => (
                    <tr key={idx} className={it.quantity > 0 ? 'bg-white' : 'opacity-40'}>
                      <td className="px-3 py-1.5 font-mono text-[11px] text-slate-500">
                        {it.movementCode}
                      </td>
                      <td className="px-3 py-1.5 font-semibold text-slate-800">
                        {it.movementName}
                      </td>
                      <td className="px-3 py-1.5 text-right font-bold text-slate-900">
                        {formatNumber(it.quantity)}
                      </td>
                      <td className="px-3 py-1.5 text-right text-slate-600">
                        {formatKz(it.unitValue)}
                      </td>
                      <td className="px-3 py-1.5 text-right font-bold text-[#002244]">
                        {formatKz(it.totalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs">
                  <tr>
                    <td colSpan={2} className="px-3 py-2 uppercase text-slate-700">
                      Totais de Comissões / Movimentos
                    </td>
                    <td className="px-3 py-2 text-right font-black text-slate-900">
                      {formatNumber(report.totalMovements)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400">—</td>
                    <td className="px-3 py-2 text-right font-black text-lg text-[#00A3E0]">
                      {formatKz(report.totalAmountKz)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Destaque do Valor Físico em Caixa / Cofre */}
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-900 block tracking-wider">
                Valor Físico em Caixa / Cofre Declarado (Obrigatório)
              </span>
              <p className="text-[11px] text-amber-800">
                Valor registado em numerário físico. Não entra no cálculo das comissões.
              </p>
            </div>
            <div className="text-xl font-black text-amber-950 font-mono">
              {formatKz(report.physicalValue)}
            </div>
          </div>

          {report.observations && (
            <div className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Observações do Turno
              </span>
              <p className="text-slate-700 italic">{report.observations}</p>
            </div>
          )}

          {/* Assinatura Criptográfica E2E & Carimbo */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SELO CRIPTOGRÁFICO SHA-256 E2E:</span>
              </div>
              <span className="text-slate-700 font-bold select-all">
                {report.e2eSignature}
              </span>
            </div>

            {/* Espaço de Assinaturas */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">{report.userName}</p>
                <p className="text-[10px] text-slate-500">Operador Agente BAI</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">Receptor / Supervisor BAI</p>
                <p className="text-[10px] text-slate-500">{report.recipientEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
