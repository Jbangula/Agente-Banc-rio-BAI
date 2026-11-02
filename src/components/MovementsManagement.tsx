import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Edit2,
  Layers,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { MovementCategory, MovementType, User } from '../types';
import { formatKz } from '../utils/crypto';

interface MovementsManagementProps {
  currentUser: User | null;
  movements: MovementType[];
  onAddMovement: (mov: Omit<MovementType, 'id'>) => void;
  onUpdateMovement: (id: string, updates: Partial<MovementType>) => void;
  onDeleteMovement: (id: string) => void;
  onResetDefaults: () => void;
}

export const MovementsManagement: React.FC<MovementsManagementProps> = ({
  currentUser,
  movements,
  onAddMovement,
  onUpdateMovement,
  onDeleteMovement,
  onResetDefaults,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(200);
  const [editName, setEditName] = useState<string>('');
  const [editCategory, setEditCategory] = useState<MovementCategory>('BAI');

  // Modal Novo Movimento
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<MovementCategory>('AB');
  const [newValue, setNewValue] = useState<number>(200.0);
  const [newDescription, setNewDescription] = useState<string>('');

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto shadow-xs space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">
          Acesso Exclusivo para Administradores
        </h3>
        <p className="text-xs text-slate-500">
          Apenas administradores podem configurar o catálogo e alterar o valor constante de movimentos bancários.
        </p>
      </div>
    );
  }

  const startEdit = (mov: MovementType) => {
    setEditingId(mov.id);
    setEditPrice(mov.defaultValue);
    setEditName(mov.name);
    setEditCategory(mov.category);
  };

  const saveEdit = (id: string) => {
    onUpdateMovement(id, {
      defaultValue: Number(editPrice) || 200.0,
      name: editName.trim(),
      category: editCategory,
    });
    setEditingId(null);
  };

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddMovement({
      code: newCode.trim().toUpperCase() || 'MOV-' + (movements.length + 1),
      name: newName.trim(),
      category: newCategory,
      defaultValue: Number(newValue) || 200.0,
      description: newDescription.trim() || undefined,
      active: true,
      isCustom: true,
    });

    setShowAddModal(false);
    setNewCode('');
    setNewName('');
    setNewValue(200.0);
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Gestão */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#002244] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00A3E0]" />
            <span>Configuração de Movimentos e Valores Constantes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Defina o valor constante padrão (200,00 Kz) ou adicione novas operações autorizadas pelo BAI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Restaurar o catálogo oficial padrão de 18 movimentos BAI com taxa de 200 Kz?')) {
                onResetDefaults();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Restaurar lista padrão"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Catálogo BAI</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#00A3E0] hover:bg-sky-500 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Movimento</span>
          </button>
        </div>
      </div>

      {/* Tabela de Movimentos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Lista de Movimentos Registados ({movements.length})
          </span>
          <span className="text-xs text-slate-400">
            Alterações refletem-se imediatamente em todos os novos relatórios
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nome da Operação</th>
                <th className="px-4 py-3">Entidade</th>
                <th className="px-4 py-3 text-right">Valor Constante (Kz)</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map(mov => {
                const isEditing = editingId === mov.id;

                return (
                  <tr key={mov.id} className="hover:bg-slate-50/60 transition">
                    {/* Código */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {mov.code}
                    </td>

                    {/* Nome do Movimento */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full px-2 py-1 border border-[#00A3E0] rounded text-xs"
                        />
                      ) : (
                        <div>
                          <div className="font-bold text-slate-900">{mov.name}</div>
                          {mov.description && (
                            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {mov.description}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value as MovementCategory)}
                          className="px-2 py-1 border border-slate-300 rounded text-xs"
                        >
                          <option value="BAI">BAI</option>
                          <option value="AB">AB</option>
                          <option value="BAI / AB">BAI / AB</option>
                        </select>
                      ) : (
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
                      )}
                    </td>

                    {/* Valor Constante */}
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            value={editPrice}
                            onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                            className="w-24 text-right px-2 py-1 border border-[#00A3E0] rounded text-xs font-bold"
                          />
                          <span className="text-xs font-bold text-slate-500">Kz</span>
                        </div>
                      ) : (
                        <span className="font-extrabold text-[#00A3E0] text-sm">
                          {formatKz(mov.defaultValue)}
                        </span>
                      )}
                    </td>

                    {/* Ativo / Inativo */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onUpdateMovement(mov.id, { active: !mov.active })}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer ${
                          mov.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {mov.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>

                    {/* Acções */}
                    <td className="px-4 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => saveEdit(mov.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Gravar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(mov)}
                            className="p-1.5 text-slate-500 hover:text-[#00A3E0] hover:bg-sky-50 rounded-lg transition"
                            title="Editar Valor Constante"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {mov.isCustom && (
                            <button
                              onClick={() => {
                                if (confirm(`Eliminar movimento ${mov.name}?`)) {
                                  onDeleteMovement(mov.id);
                                }
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Eliminar Movimento Personalizado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Novo Movimento */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wider">
                Adicionar Nova Operação Bancária
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome do Movimento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Emissão de Declaração de Titularidade"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código Interno
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: EDT-19"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-[#00A3E0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Classificação
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as MovementCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                  >
                    <option value="BAI">BAI (Directo)</option>
                    <option value="AB">AB (Agente Bancário)</option>
                    <option value="BAI / AB">BAI / AB (Misto)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Valor Constante por Movimento (Kz)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={newValue}
                  onChange={e => setNewValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-[#00A3E0] outline-none focus:ring-2 focus:ring-[#00A3E0]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descrição Operacional (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções ou requisitos para a execução da operação..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#00A3E0]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#002244] hover:bg-[#003366] rounded-xl shadow-xs transition"
                >
                  Guardar Movimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
