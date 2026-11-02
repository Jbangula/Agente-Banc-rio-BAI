import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Edit,
  ExternalLink,
  KeyRound,
  Lock,
  Plus,
  QrCode,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UsersManagementProps {
  currentUser: User | null;
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onResetPassword: (userId: string, newPass: string) => void;
  onOpenShareModal: () => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  currentUser,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onResetPassword,
  onOpenShareModal,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  // Modal Novo Utilizador (Apenas Administrador)
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('operador');
  const [newPassword, setNewPassword] = useState<string>('bai@1234');
  const [newPhone, setNewPhone] = useState<string>('');

  // Modal Alterar Nome do Utilizador
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editUsername, setEditUsername] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');

  // Modal Restaurar Palavra-passe
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newSecretPassword, setNewSecretPassword] = useState<string>('');
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto shadow-xs space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">
          Acesso Exclusivo para o Administrador
        </h3>
        <p className="text-xs text-slate-500">
          Apenas o Administrador Master tem permissão para criar novos utilizadores e gerir permissões avançadas na plataforma.
        </p>
      </div>
    );
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim()) return;

    // Verificar se username já existe
    if (users.some(u => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert('Este nome de utilizador já está registado. Escolha outro.');
      return;
    }

    onAddUser({
      username: newUsername.trim().toLowerCase(),
      fullName: newFullName.trim(),
      email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@agente-bai.ao`,
      role: newRole,
      phone: newPhone.trim() || undefined,
      isActive: true,
      avatarColor: newRole === 'admin' ? '#002244' : newRole === 'supervisor' ? '#00A3E0' : '#10B981',
    });

    setShowAddModal(false);
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
    setNewRole('operador');
    setNewPhone('');
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser.id, {
      fullName: editFullName.trim(),
      username: editUsername.trim().toLowerCase(),
      email: editEmail.trim(),
    });

    setEditingUser(null);
  };

  const handleExecuteResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newSecretPassword) return;

    onResetPassword(resettingUser.id, newSecretPassword);
    setResetSuccessNotice(`Palavra-passe de @${resettingUser.username} restaurada com sucesso!`);
    setTimeout(() => {
      setResetSuccessNotice(null);
      setResettingUser(null);
      setNewSecretPassword('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Gestão de Contas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00A3E0]" />
            <span>Gestão de Utilizadores e Permissões Avançadas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Crie operadores e supervisores sem limites, atribua cargos de liderança e partilhe links de acesso.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Partilhar Link */}
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#00A3E0] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition"
            title="Partilhar link com a equipa"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Partilhar Link de Acesso</span>
          </button>

          {/* Botão Novo Utilizador */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#002244] hover:bg-[#003366] rounded-xl shadow-xs transition"
          >
            <UserPlus className="w-4 h-4 text-[#00A3E0]" />
            <span>Criar Novo Utilizador</span>
          </button>
        </div>
      </div>

      {resetSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{resetSuccessNotice}</span>
        </div>
      )}

      {/* Lista de Utilizadores */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Utilizadores Registados ({users.length})
          </span>
          <span className="text-xs text-slate-400">
            Sem limites de utilizadores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Utilizador / Nome</th>
                <th className="px-4 py-3">Nome de Utilizador</th>
                <th className="px-4 py-3">Email & Contacto</th>
                <th className="px-4 py-3">Nível de Permissão</th>
                <th className="px-4 py-3 text-center">Permissão Rápida</th>
                <th className="px-4 py-3 text-center">Acções de Segurança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const isCurrent = currentUser?.id === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    {/* Nome & Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: u.avatarColor || '#00A3E0' }}
                        >
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                                Você
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Desde: {new Date(u.createdAt).toLocaleDateString('pt-AO')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">
                      @{u.username}
                    </td>

                    {/* Email / Telefone */}
                    <td className="px-4 py-3 text-slate-600">
                      <div>{u.email}</div>
                      {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : u.role === 'supervisor'
                            ? 'bg-sky-100 text-sky-900 border border-sky-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {u.role === 'admin' ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            ADMINISTRADOR
                          </>
                        ) : u.role === 'supervisor' ? (
                          <>
                            <Shield className="w-3 h-3 text-sky-600" />
                            SUPERVISOR
                          </>
                        ) : (
                          'OPERADOR AGENTE'
                        )}
                      </span>
                    </td>

                    {/* Atribuir Permissões Avançadas (Promover a Supervisor) */}
                    <td className="px-4 py-3 text-center">
                      <select
                        value={u.role}
                        onChange={e => onUpdateUser(u.id, { role: e.target.value as UserRole })}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-white hover:border-slate-300 outline-none"
                      >
                        <option value="operador">Operador Agente</option>
                        <option value="supervisor">Promover a Supervisor</option>
                        <option value="admin">Promover a Administrador</option>
                      </select>
                    </td>

                    {/* Acções: Alterar Nome, Restaurar Senha, Eliminar */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Alterar Nome */}
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setEditFullName(u.fullName);
                            setEditUsername(u.username);
                            setEditEmail(u.email);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Alterar Nome do Utilizador"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Restaurar Palavra-passe */}
                        <button
                          onClick={() => {
                            setResettingUser(u);
                            setNewSecretPassword('');
                          }}
                          className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition"
                          title="Restaurar Palavra-passe"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Eliminar Conta */}
                        <button
                          onClick={() => {
                            if (confirm(`Tem a certeza que deseja eliminar a conta de ${u.fullName} (@${u.username})?`)) {
                              try {
                                onDeleteUser(u.id);
                              } catch (err: unknown) {
                                alert(err instanceof Error ? err.message : 'Erro ao eliminar utilizador');
                              }
                            }
                          }}
                          disabled={users.filter(usr => usr.role === 'admin').length === 1 && u.role === 'admin'}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Eliminar Conta de Utilizador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Utilizador */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#00A3E0]" />
                Criar Novo Utilizador (Apenas Administrador)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Baptista Silva"
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nome de Utilizador (Login)
                  </label>
                  <input
                    type="text"
                    placeholder="joao.silva"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#00A3E0]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Permissão Inicial
                  </label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                  >
                    <option value="operador">Operador Agente</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Institucional / Pessoal
                </label>
                <input
                  type="email"
                  placeholder="joao.silva@agente-bai.ao"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Telefone de Contacto (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="+244 923 000 000"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#002244] hover:bg-[#003366] rounded-xl shadow-xs"
                >
                  Criar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar Nome do Utilizador */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                Alterar Nome e Dados do Utilizador
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={e => setEditFullName(e.target.value)}
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
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
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
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#00A3E0] hover:bg-sky-500 rounded-xl shadow-xs"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Restaurar Palavra-passe */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Restaurar Palavra-passe
              </h3>
              <button onClick={() => setResettingUser(null)} className="text-slate-400">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              A definir uma nova palavra-passe para o utilizador{' '}
              <strong>{resettingUser.fullName}</strong> (@{resettingUser.username}).
            </p>

            <form onSubmit={handleExecuteResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nova Palavra-passe
                </label>
                <input
                  type="text"
                  placeholder="Insira a nova palavra-passe (ex: NovaSenha@2026)"
                  value={newSecretPassword}
                  onChange={e => setNewSecretPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  Actualizar Palavra-passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
