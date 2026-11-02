import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  KeyRound,
  Trash2,
  UserCheck,
  UserCog,
  X,
} from 'lucide-react';
import { User } from '../types';

interface UserAccountModalProps {
  currentUser: User | null;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onResetPassword: (userId: string, newPass: string) => void;
  onDeleteAccount: (userId: string) => void;
  onClose: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  currentUser,
  onUpdateUser,
  onResetPassword,
  onDeleteAccount,
  onClose,
}) => {
  if (!currentUser) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'delete'>('profile');

  // Perfil
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Palavra-passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Eliminar conta
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(currentUser.id, {
      fullName: fullName.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 4) {
      setPasswordError('A nova palavra-passe deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As palavras-passes não coincidem.');
      return;
    }

    onResetPassword(currentUser.id, newPassword);
    setPasswordSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 2500);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() !== 'eliminar') {
      alert('Digite "ELIMINAR" para confirmar a exclusão da sua conta.');
      return;
    }
    try {
      onDeleteAccount(currentUser.id);
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao eliminar conta');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#00A3E0]" />
            <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
              Gestão da Minha Conta
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-[#00A3E0] text-[#00A3E0]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Alterar Nome & Dados
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'password'
                ? 'border-[#00A3E0] text-[#00A3E0]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Restaurar Palavra-passe
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'delete'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-rose-600'
            }`}
          >
            Eliminar Conta
          </button>
        </div>

        {/* Conteúdo Aba: Perfil / Alterar Nome */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {profileSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Dados actualizados com sucesso!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nome de Utilizador (@username)
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#00A3E0]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#002244] hover:bg-[#003366] rounded-xl transition"
              >
                Gravar Nome e Perfil
              </button>
            </div>
          </form>
        )}

        {/* Conteúdo Aba: Restaurar Palavra-passe */}
        {activeTab === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Palavra-passe restaurada com sucesso!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nova Palavra-passe
              </label>
              <input
                type="password"
                placeholder="Insira a nova palavra-passe"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#00A3E0]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Confirmar Nova Palavra-passe
              </label>
              <input
                type="password"
                placeholder="Repita a nova palavra-passe"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#00A3E0]"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition"
              >
                Restaurar Minha Senha
              </button>
            </div>
          </form>
        )}

        {/* Conteúdo Aba: Eliminar Conta */}
        {activeTab === 'delete' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Zona Perigosa: Eliminação de Conta</span>
              </div>
              <p>
                Ao eliminar a sua conta, os seus dados de acesso serão removidos. Os relatórios financeiros submetidos anteriormente serão mantidos no histórico para integridade contábil.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Digite a palavra "ELIMINAR" para confirmar:
              </label>
              <input
                type="text"
                placeholder="ELIMINAR"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-rose-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 font-bold text-rose-600"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText.toLowerCase() !== 'eliminar'}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Minha Conta</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
