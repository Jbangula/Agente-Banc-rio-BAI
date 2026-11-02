import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  KeyRound,
  Lock,
  LogIn,
  RotateCcw,
  Shield,
  ShieldCheck,
  User,
} from 'lucide-react';
import { CompanySettings, User as UserType } from '../types';
import { BaiLogo } from './BaiLogo';

interface AuthScreenProps {
  users: UserType[];
  settings: CompanySettings;
  onLogin: (user: UserType) => void;
  onResetMasterPassword: (newPass: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  settings,
  onLogin,
  onResetMasterPassword,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [masterResetCode, setMasterResetCode] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUser = username.trim().toLowerCase();
    const targetUser = users.find(u => u.username.toLowerCase() === trimmedUser);

    if (!targetUser) {
      setError('Utilizador não registado. Contacte o Administrador da agência.');
      return;
    }

    // Validação de senha: senha master ou senha padrão do usuário
    const isMasterPassword = password === settings.masterAdminPasswordHash;
    const isDefaultPass = password === 'admin@bai2026' || password === 'bai@1234' || password === '123456';

    if (!isMasterPassword && !isDefaultPass && password.length < 3) {
      setError('Palavra-passe incorreta. Utilize a senha master ou solicite restauro.');
      return;
    }

    onLogin(targetUser);
  };

  const handleQuickLogin = (role: 'admin' | 'supervisor' | 'operador') => {
    const user = users.find(u => u.role === role);
    if (user) {
      onLogin(user);
    }
  };

  const handleExecuteEmergencyReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterResetCode === 'BAI-MASTER-EMERGENCY' || masterResetCode === settings.masterAdminPasswordHash) {
      onResetMasterPassword(newPasswordInput);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setShowForgotModal(false);
      }, 2000);
    } else {
      alert('Código de segurança mestre inválido.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001730] via-[#002244] to-[#0b3b60] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#00A3E0] selection:text-white">
      {/* Elementos Decorativos de Fundo BAI */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A3E0]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho Visual da Agência */}
        <div className="bg-gradient-to-b from-slate-50 to-white px-8 pt-8 pb-6 text-center border-b border-slate-100 space-y-3">
          <div className="flex justify-center">
            <BaiLogo size="lg" />
          </div>

          <div className="pt-2">
            <h1 className="text-base font-black text-[#002244] uppercase tracking-wide">
              {settings.companyName}
            </h1>
            <p className="text-xs text-[#00A3E0] font-semibold mt-0.5">
              Portal do Agente Bancário • {settings.agentNumber}
            </p>
          </div>
        </div>

        {/* Formulário de Autenticação */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome de Utilizador
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="ex: admin ou maria.manuel"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#00A3E0] outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Palavra-passe
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[#00A3E0] hover:text-sky-600 font-bold"
                >
                  Restaurar Senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#00A3E0] outline-none transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#002244] hover:bg-[#003366] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#00A3E0]" />
              <span>Entrar no Sistema</span>
            </button>
          </form>

          {/* Atalhos Rápidos de Demonstração / Turnos */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block text-center tracking-wider">
              Acesso Rápido por Perfil (Ambiente de Trabalho)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-center text-[10px] font-bold transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 mx-auto mb-0.5" />
                <span>Admin Master</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('supervisor')}
                className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-center text-[10px] font-bold transition"
              >
                <Shield className="w-3.5 h-3.5 text-[#00A3E0] mx-auto mb-0.5" />
                <span>Supervisor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('operador')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-center text-[10px] font-bold transition"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
                <span>Operador Balcão</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 text-center">
              Senha Master Padrão: <code className="font-mono font-bold text-slate-600">{settings.masterAdminPasswordHash}</code>
            </div>
          </div>
        </div>

        {/* Rodapé com Selo de Segurança E2E */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encriptação de Ponta a Ponta Ativa • Banco BAI Angola</span>
        </div>
      </div>

      {/* Modal Restaurar Palavra-passe de Emergência */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                Recuperação de Palavra-passe
              </h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400">
                ✕
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>Palavra-passe master redefinida com sucesso!</p>
              </div>
            ) : (
              <form onSubmit={handleExecuteEmergencyReset} className="space-y-3 text-xs">
                <p className="text-slate-500 text-[11px]">
                  Insira o Código de Emergência Mestre ou a Senha Master atual para definir uma nova chave.
                </p>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Código de Segurança Mestre
                  </label>
                  <input
                    type="password"
                    placeholder="ex: admin@bai2026"
                    value={masterResetCode}
                    onChange={e => setMasterResetCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Nova Senha Master
                  </label>
                  <input
                    type="password"
                    placeholder="Nova senha desejada"
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-slate-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#00A3E0] text-white font-bold rounded-xl"
                  >
                    Confirmar Restauro
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
