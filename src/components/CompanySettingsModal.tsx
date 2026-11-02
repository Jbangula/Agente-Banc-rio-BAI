import React, { useState } from 'react';
import {
  Building2,
  Check,
  Cloud,
  Download,
  FileJson,
  KeyRound,
  Lock,
  RotateCcw,
  Save,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { CompanySettings } from '../types';

interface CompanySettingsModalProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => boolean;
  onClose: () => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  settings,
  onSaveSettings,
  onExportBackup,
  onImportBackup,
  onClose,
}) => {
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [agentNumber, setAgentNumber] = useState(settings.agentNumber);
  const [nif, setNif] = useState(settings.nif);
  const [address, setAddress] = useState(settings.address);
  const [city, setCity] = useState(settings.city);
  const [phone, setPhone] = useState(settings.phone);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [defaultSupervisorEmail, setDefaultSupervisorEmail] = useState(settings.defaultSupervisorEmail);
  const [masterPassword, setMasterPassword] = useState(settings.masterAdminPasswordHash || 'admin@bai2026');
  const [encryptionActive, setEncryptionActive] = useState(settings.encryptionActive);

  // Firebase Config
  const [syncMode, setSyncMode] = useState<'local_broadcast' | 'firebase_cloud'>(settings.syncMode || 'local_broadcast');
  const [firebaseApiKey, setFirebaseApiKey] = useState(settings.firebaseConfig?.apiKey || '');
  const [firebaseProjectId, setFirebaseProjectId] = useState(settings.firebaseConfig?.projectId || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: CompanySettings = {
      ...settings,
      companyName: companyName.trim(),
      agentNumber: agentNumber.trim(),
      nif: nif.trim(),
      address: address.trim(),
      city: city.trim(),
      phone: phone.trim(),
      supportEmail: supportEmail.trim(),
      defaultSupervisorEmail: defaultSupervisorEmail.trim(),
      masterAdminPasswordHash: masterPassword.trim(),
      encryptionActive,
      syncMode,
      firebaseConfig: firebaseApiKey && firebaseProjectId ? {
        apiKey: firebaseApiKey.trim(),
        authDomain: `${firebaseProjectId.trim()}.firebaseapp.com`,
        projectId: firebaseProjectId.trim(),
        storageBucket: `${firebaseProjectId.trim()}.appspot.com`,
        messagingSenderId: '',
        appId: '',
      } : undefined,
    };

    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const ok = onImportBackup(content);
      if (ok) {
        setImportStatus('Backup restaurado com sucesso! Recarregando dados...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus('Falha ao restaurar: Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00A3E0]" />
            <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
              Definições da Empresa Representante & Agente BAI
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Definições gravadas com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* IDENTIFICAÇÃO DA EMPRESA REPRESENTANTE */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-[#002244] tracking-wider flex items-center gap-1.5">
              <span>Empresa Representante do Agente</span>
              <span className="text-[10px] font-bold text-[#00A3E0] lowercase">(campo editável)</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome da Empresa a representar o Agente
              </label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Ex: PANZO SERVIÇOS & COMÉRCIO, LDA"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#00A3E0] outline-none"
                required
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Este nome é impresso no cabeçalho dos recibos oficiais e no topo do sistema.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Código de Agente Bancário BAI
                </label>
                <input
                  type="text"
                  value={agentNumber}
                  onChange={e => setAgentNumber(e.target.value)}
                  placeholder="AG-BAI-4092-AO"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#002244] outline-none focus:ring-2 focus:ring-[#00A3E0]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIF da Empresa
                </label>
                <input
                  type="text"
                  value={nif}
                  onChange={e => setNif(e.target.value)}
                  placeholder="5417082910"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#00A3E0]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Endereço / Localização da Agência
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cidade / Província
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Telefones de Contacto
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Padrão do Supervisor / Receptor
                </label>
                <input
                  type="email"
                  value={defaultSupervisorEmail}
                  onChange={e => setDefaultSupervisorEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                />
              </div>
            </div>
          </div>

          {/* PALAVRA-PASSE MASTER DO ADMINISTRADOR */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
            <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Senha Master do Administrador</span>
            </h4>
            <p className="text-[11px] text-amber-800">
              Esta é a senha mestra para recuperação de emergência e acesso irrestrito do Administrador Geral.
            </p>
            <input
              type="text"
              value={masterPassword}
              onChange={e => setMasterPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-950 outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          {/* CRIPTOGRAFIA DE PONTA A PONTA (E2E) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-[#002244] tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#00A3E0]" />
                <span>Encriptação de Ponta a Ponta (E2E)</span>
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Activa (SHA-256)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Cada relatório diário e reconciliação financeira recebe um selo criptográfico digital inalterável para garantir a autenticidade perante auditorias do Banco BAI.
            </p>
          </div>

          {/* BACKUP E RESTAURO JSON */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-slate-600" />
              <span>Cópia de Segurança & Restauro (JSON)</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Descarregar Backup Completo</span>
              </button>

              <label className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Restaurar Ficheiro JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {importStatus && (
              <p className="text-xs text-sky-700 font-medium">{importStatus}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#002244] hover:bg-[#003366] rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-[#00A3E0]" />
              <span>Guardar Definições</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
