import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Globe2,
  KeyRound,
  MessageCircle,
  QrCode,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { CompanySettings } from '../types';

interface ShareAccessModalProps {
  settings: CompanySettings;
  onClose: () => void;
}

export const ShareAccessModal: React.FC<ShareAccessModalProps> = ({
  settings,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const accessUrl = window.location.href.split('?')[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(accessUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = encodeURIComponent(
    `Portal de Gestão e Registo de Movimentos - Agente BAI (${settings.companyName})\nAcesse ao sistema através do link: ${accessUrl}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#00A3E0] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                Partilhar Link de Acesso ao Sistema
              </h3>
              <p className="text-[11px] text-slate-500">
                Convide operadores e supervisores autorizados da agência
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link de Acesso com Cópia Direta */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase">
            Link Directo de Acesso
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={accessUrl}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-700 select-all outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-[#00A3E0] hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Botão de Partilha WhatsApp */}
        <div>
          <a
            href={`https://api.whatsapp.com/send?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar Acesso via WhatsApp</span>
          </a>
        </div>

        {/* QR Code Simulado para Acesso Rápido por Celular no Balcão */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1 shrink-0">
            {/* SVG estilizado representando QR Code */}
            <svg viewBox="0 0 32 32" className="w-full h-full text-slate-900 fill-current">
              <rect x="2" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="5" y="5" width="4" height="4" />
              <rect x="20" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="23" y="5" width="4" height="4" />
              <rect x="2" y="20" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="5" y="23" width="4" height="4" />
              <rect x="15" y="6" width="2" height="6" />
              <rect x="18" y="15" width="6" height="2" />
              <rect x="15" y="18" width="6" height="6" />
              <rect x="24" y="24" width="4" height="4" />
            </svg>
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-slate-900">Acesso Móvel via Smartphone / Tablet</h4>
            <p className="text-[11px] text-slate-500">
              Os operadores podem aceder ao sistema directamente pelo telemóvel ou tablet do balcão para lançar os movimentos em tempo real.
            </p>
          </div>
        </div>

        {/* Aviso de Segurança e Contas */}
        <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs border border-amber-200 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px]">
            <strong>Nota de Auditoria:</strong> Apenas os utilizadores pré-cadastrados pelo Administrador têm acesso operacional às contas. O link dá acesso direto ao terminal da agência.
          </p>
        </div>

        <div className="text-right pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
