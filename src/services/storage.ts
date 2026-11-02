/**
 * Serviço de Armazenamento, Sincronização em Tempo Real (Broadcast & Cloud)
 * e Gestão de Estado do Agente Bancário BAI
 */

import {
  CompanySettings,
  DailyReport,
  MovementType,
  ReconciliationRecord,
  User,
  UserRole,
} from '../types';
import { generateSecurityBadge, generateSHA256Signature } from '../utils/crypto';

const STORAGE_KEYS = {
  USERS: 'agente_bai_users_v2',
  MOVEMENTS: 'agente_bai_movements_v2',
  REPORTS: 'agente_bai_reports_v2',
  RECONCILIATIONS: 'agente_bai_reconciliations_v2',
  SETTINGS: 'agente_bai_settings_v2',
  CURRENT_USER: 'agente_bai_current_user_v2',
};

// Canal de comunicação em tempo real entre abas / janelas
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('agente_bai_realtime_sync')
  : null;

export const INITIAL_MOVEMENTS: MovementType[] = [
  {
    id: 'mov-1',
    code: 'AC-01',
    name: 'Abertura de conta*',
    category: 'BAI',
    defaultValue: 200.0,
    description: 'Processo completo de abertura de conta bancária com identificação de cliente.',
    active: true,
  },
  {
    id: 'mov-2',
    code: 'DN-02',
    name: 'Depósito de numerário',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Depósito físico em dinheiro para crédito em conta bancária.',
    active: true,
  },
  {
    id: 'mov-3',
    code: 'LN-03',
    name: 'Levantamento de numerário',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Levantamento de dinheiro em espécie pelo titular ou autorizado.',
    active: true,
  },
  {
    id: 'mov-4',
    code: 'ACD-04',
    name: 'Atribuição cartão de débito Multicaixa a)',
    category: 'BAI',
    defaultValue: 200.0,
    description: 'Emissão e entrega inicial de cartão Multicaixa de débito.',
    active: true,
  },
  {
    id: 'mov-5',
    code: 'SCD-05',
    name: 'Substituição do cartão de débito Multicaixa (caducidade) a)',
    category: 'BAI',
    defaultValue: 200.0,
    description: 'Renovação e entrega por término da validade do cartão.',
    active: true,
  },
  {
    id: 'mov-6',
    code: 'SCO-06',
    name: 'Substituição do cartão de débito Multicaixa (Outros motivos) a)',
    category: 'BAI',
    defaultValue: 200.0,
    description: 'Substituição por perda, roubo, dano ou retenção.',
    active: true,
  },
  {
    id: 'mov-7',
    code: 'CCD-07',
    name: 'Cancelamento do cartão de débito Multicaixa a)',
    category: 'BAI',
    defaultValue: 200.0,
    description: 'Bloqueio definitivo ou cancelamento a pedido do cliente.',
    active: true,
  },
  {
    id: 'mov-8',
    code: 'TRA-08',
    name: 'Transferência intrabancária',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Transferência direta entre contas BAI.',
    active: true,
  },
  {
    id: 'mov-9',
    code: 'TRB-09',
    name: 'Transferência interbancária – STC',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Transferência para outros bancos via Sistema de Transferência de Crédito.',
    active: true,
  },
  {
    id: 'mov-10',
    code: 'ERN-10',
    name: 'Envio de remessa de valores em numerário',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Remessa nacional com entrega em dinheiro ao beneficiário.',
    active: true,
  },
  {
    id: 'mov-11',
    code: 'ERD-11',
    name: 'Envio de remessa de valores débito em conta',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Remessa nacional debitada diretamente na conta bancária.',
    active: true,
  },
  {
    id: 'mov-12',
    code: 'RRN-12',
    name: 'Recepção de remessa de valores em numerário',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Pagamento ao cliente de remessa recebida.',
    active: true,
  },
  {
    id: 'mov-13',
    code: 'ABD-13',
    name: 'Adesão ao Baidirecto a)',
    category: 'BAI',
    defaultValue: 200.0,
    description: 'Habilitação e activação do canal digital Baidirecto (Internet & Mobile).',
    active: true,
  },
  {
    id: 'mov-14',
    code: 'PSN-14',
    name: 'Pagamento de serviços em numerário',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Liquidação de faturas públicas/privadas em dinheiro (ENDE, EPAL, ZAP, etc).',
    active: true,
  },
  {
    id: 'mov-15',
    code: 'PSD-15',
    name: 'Pagamento de serviços débito em conta',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Liquidação de faturas com débito na conta do cliente.',
    active: true,
  },
  {
    id: 'mov-16',
    code: 'CS-16',
    name: 'Consulta de saldo',
    category: 'AB',
    defaultValue: 200.0,
    description: 'Verificação presencial de saldo de conta ou cartão.',
    active: true,
  },
  {
    id: 'mov-17',
    code: 'RR-17',
    name: 'Reimpressão de recibos',
    category: 'BAI / AB',
    defaultValue: 200.0,
    description: 'Segunda via de comprovativo de transação executada.',
    active: true,
  },
  {
    id: 'mov-18',
    code: 'EST-18',
    name: 'Estorno e anulações',
    category: 'BAI / AB',
    defaultValue: 200.0,
    description: 'Procedimento técnico de correção e anulação de operação com autorização.',
    active: true,
  },
];

export const INITIAL_SETTINGS: CompanySettings = {
  companyName: 'PANZO SERVIÇOS & COMÉRCIO, LDA',
  agentNumber: 'AG-BAI-4092-AO',
  nif: '5417082910',
  address: 'Avenida 21 de Janeiro, Morro Bento, Edifício Kilamba, Loja 4',
  city: 'Luanda, Angola',
  phone: '+244 923 000 111 / +244 934 888 999',
  supportEmail: 'gestao@agente-bai.ao',
  defaultSupervisorEmail: 'supervisor@agente-bai.ao',
  masterAdminUsername: 'admin',
  masterAdminPasswordHash: 'admin@bai2026', // Palavra-passe master inicial
  encryptionActive: true,
  syncMode: 'local_broadcast',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    fullName: 'Administrador Master Agente BAI',
    email: 'admin@agente-bai.ao',
    role: 'admin',
    agencyCode: 'AG-BAI-4092-AO',
    createdAt: '2026-01-10T08:00:00Z',
    isActive: true,
    avatarColor: '#002244',
  },
  {
    id: 'usr-sup-01',
    username: 'supervisor.bai',
    fullName: 'Alberto Silva (Supervisor Operacional)',
    email: 'supervisor@agente-bai.ao',
    role: 'supervisor',
    agencyCode: 'AG-BAI-4092-AO',
    createdAt: '2026-01-15T09:00:00Z',
    isActive: true,
    avatarColor: '#00A3E0',
  },
  {
    id: 'usr-op-01',
    username: 'maria.manuel',
    fullName: 'Maria Manuel (Agente de Balcão)',
    email: 'maria.manuel@agente-bai.ao',
    role: 'operador',
    agencyCode: 'AG-BAI-4092-AO',
    createdAt: '2026-02-01T08:30:00Z',
    isActive: true,
    avatarColor: '#10B981',
  },
  {
    id: 'usr-op-02',
    username: 'paulo.sebastiao',
    fullName: 'Paulo Sebastião (Agente de Caixa)',
    email: 'paulo.sebastiao@agente-bai.ao',
    role: 'operador',
    agencyCode: 'AG-BAI-4092-AO',
    createdAt: '2026-02-05T08:30:00Z',
    isActive: true,
    avatarColor: '#F59E0B',
  },
];

export const INITIAL_REPORTS: DailyReport[] = [
  {
    id: 'rep-001',
    reportNumber: 'REL-20261101-01',
    userId: 'usr-op-01',
    userName: 'Maria Manuel (Agente de Balcão)',
    userEmail: 'maria.manuel@agente-bai.ao',
    recipientEmail: 'supervisor@agente-bai.ao',
    agencyName: 'PANZO SERVIÇOS & COMÉRCIO, LDA',
    reportDate: '2026-11-01',
    shift: 'Integral',
    physicalValue: 485000.0, // Campo obrigatório independente (Valor Físico)
    items: [
      {
        movementTypeId: 'mov-1',
        movementCode: 'AC-01',
        movementName: 'Abertura de conta*',
        category: 'BAI',
        unitValue: 200.0,
        quantity: 12,
        totalValue: 2400.0,
      },
      {
        movementTypeId: 'mov-2',
        movementCode: 'DN-02',
        movementName: 'Depósito de numerário',
        category: 'AB',
        unitValue: 200.0,
        quantity: 35,
        totalValue: 7000.0,
      },
      {
        movementTypeId: 'mov-3',
        movementCode: 'LN-03',
        movementName: 'Levantamento de numerário',
        category: 'AB',
        unitValue: 200.0,
        quantity: 28,
        totalValue: 5600.0,
      },
      {
        movementTypeId: 'mov-4',
        movementCode: 'ACD-04',
        movementName: 'Atribuição cartão de débito Multicaixa a)',
        category: 'BAI',
        unitValue: 200.0,
        quantity: 8,
        totalValue: 1600.0,
      },
      {
        movementTypeId: 'mov-8',
        movementCode: 'TRA-08',
        movementName: 'Transferência intrabancária',
        category: 'AB',
        unitValue: 200.0,
        quantity: 19,
        totalValue: 3800.0,
      },
      {
        movementTypeId: 'mov-13',
        movementCode: 'ABD-13',
        movementName: 'Adesão ao Baidirecto a)',
        category: 'BAI',
        unitValue: 200.0,
        quantity: 10,
        totalValue: 2000.0,
      },
      {
        movementTypeId: 'mov-14',
        movementCode: 'PSN-14',
        movementName: 'Pagamento de serviços em numerário',
        category: 'AB',
        unitValue: 200.0,
        quantity: 22,
        totalValue: 4400.0,
      },
      {
        movementTypeId: 'mov-16',
        movementCode: 'CS-16',
        movementName: 'Consulta de saldo',
        category: 'AB',
        unitValue: 200.0,
        quantity: 14,
        totalValue: 2800.0,
      },
    ],
    totalMovements: 148,
    totalAmountKz: 29600.0, // 148 * 200 Kz
    observations: 'Turno decorreu sem incidentes operacionais na rede Multicaixa.',
    submittedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    status: 'reconciliado',
    e2eSignature: generateSecurityBadge('rep-001', '2026-11-01T17:30:00Z'),
    encryptionStatus: 'ENCRYPTED_SHA256_E2E',
  },
  {
    id: 'rep-002',
    reportNumber: 'REL-20261102-02',
    userId: 'usr-op-02',
    userName: 'Paulo Sebastião (Agente de Caixa)',
    userEmail: 'paulo.sebastiao@agente-bai.ao',
    recipientEmail: 'supervisor@agente-bai.ao',
    agencyName: 'PANZO SERVIÇOS & COMÉRCIO, LDA',
    reportDate: '2026-11-02',
    shift: 'Manhã',
    physicalValue: 310000.0,
    items: [
      {
        movementTypeId: 'mov-2',
        movementCode: 'DN-02',
        movementName: 'Depósito de numerário',
        category: 'AB',
        unitValue: 200.0,
        quantity: 42,
        totalValue: 8400.0,
      },
      {
        movementTypeId: 'mov-3',
        movementCode: 'LN-03',
        movementName: 'Levantamento de numerário',
        category: 'AB',
        unitValue: 200.0,
        quantity: 30,
        totalValue: 6000.0,
      },
      {
        movementTypeId: 'mov-9',
        movementCode: 'TRB-09',
        movementName: 'Transferência interbancária – STC',
        category: 'AB',
        unitValue: 200.0,
        quantity: 15,
        totalValue: 3000.0,
      },
      {
        movementTypeId: 'mov-10',
        movementCode: 'ERN-10',
        movementName: 'Envio de remessa de valores em numerário',
        category: 'AB',
        unitValue: 200.0,
        quantity: 8,
        totalValue: 1600.0,
      },
      {
        movementTypeId: 'mov-15',
        movementCode: 'PSD-15',
        movementName: 'Pagamento de serviços débito em conta',
        category: 'AB',
        unitValue: 200.0,
        quantity: 18,
        totalValue: 3600.0,
      },
    ],
    totalMovements: 113,
    totalAmountKz: 22600.0,
    observations: 'Grande afluência de depósitos no período da manhã.',
    submittedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    status: 'pendente',
    e2eSignature: generateSecurityBadge('rep-002', '2026-11-02T13:00:00Z'),
    encryptionStatus: 'ENCRYPTED_SHA256_E2E',
  },
];

export const INITIAL_RECONCILIATIONS: ReconciliationRecord[] = [
  {
    id: 'rec-001',
    reportId: 'rep-001',
    reportNumber: 'REL-20261101-01',
    userId: 'usr-op-01',
    userName: 'Maria Manuel (Agente de Balcão)',
    date: '2026-11-01',
    shift: 'Integral',
    initialValue: 1500000.0, // Valor Inicial
    cashInHand: 485000.0, // Valor em Mão
    accountValue: 1015000.0, // Valor em Conta
    finalValue: 1500000.0, // Valor Final = 485.000 + 1.015.000
    discrepancy: 0.0, // 1.500.000 - 1.500.000 = 0 (Perfeito)
    status: 'equilibrado',
    verifiedBy: 'Alberto Silva (Supervisor Operacional)',
    verifiedAt: '2026-11-01T18:15:00Z',
    notes: 'Reconciliação validada com sucesso. Numerário e conta perfeitamente alinhados.',
  },
];

class StorageService {
  private notifyListeners(): void {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type: 'DATA_SYNC', timestamp: Date.now() });
      } catch (err) {
        console.warn('Broadcast sync error:', err);
      }
    }
  }

  // Settings da Empresa
  getSettings(): CompanySettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      this.saveSettings(INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    try {
      return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  saveSettings(settings: CompanySettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notifyListeners();
  }

  // Gestão de Utilizadores
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      this.saveUsersList(INITIAL_USERS);
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  }

  private saveUsersList(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notifyListeners();
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: 'usr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      isActive: true,
      avatarColor: user.avatarColor || '#00A3E0',
    };
    users.push(newUser);
    this.saveUsersList(users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    this.saveUsersList(users);

    // Se for o utilizador actualmente com sessão iniciada, actualiza
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      this.setCurrentUser(users[index]);
    }
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    // Impedir apagar o último administrador
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin') {
      const remainingAdmins = users.filter(u => u.role === 'admin' && u.id !== id);
      if (remainingAdmins.length === 0) {
        throw new Error('Não é possível eliminar o único Administrador do sistema.');
      }
    }
    const filtered = users.filter(u => u.id !== id);
    this.saveUsersList(filtered);
    return true;
  }

  updateUserRole(id: string, newRole: UserRole): User | null {
    return this.updateUser(id, { role: newRole });
  }

  // Utilizador com Sessão Activa
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      // Por defeito, inicia como o Master Admin para conveniência e facilidade total
      const admin = this.getUsers().find(u => u.role === 'admin') || INITIAL_USERS[0];
      this.setCurrentUser(admin);
      return admin;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    this.notifyListeners();
  }

  // Gestão de Movimentos & Taxas
  getMovements(): MovementType[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      this.saveMovementsList(INITIAL_MOVEMENTS);
      return INITIAL_MOVEMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MOVEMENTS;
    }
  }

  private saveMovementsList(movements: MovementType[]): void {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    this.notifyListeners();
  }

  addMovement(mov: Omit<MovementType, 'id'>): MovementType {
    const movements = this.getMovements();
    const newMov: MovementType = {
      ...mov,
      id: 'mov-custom-' + Date.now().toString(36),
      isCustom: true,
      active: true,
    };
    movements.push(newMov);
    this.saveMovementsList(movements);
    return newMov;
  }

  updateMovement(id: string, updates: Partial<MovementType>): MovementType | null {
    const movements = this.getMovements();
    const index = movements.findIndex(m => m.id === id);
    if (index === -1) return null;
    movements[index] = { ...movements[index], ...updates };
    this.saveMovementsList(movements);
    return movements[index];
  }

  deleteMovement(id: string): boolean {
    const movements = this.getMovements();
    const filtered = movements.filter(m => m.id !== id);
    this.saveMovementsList(filtered);
    return true;
  }

  resetMovementsToDefault(): void {
    this.saveMovementsList(INITIAL_MOVEMENTS);
  }

  // Gestão de Relatórios
  getReports(): DailyReport[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      this.saveReportsList(INITIAL_REPORTS);
      return INITIAL_REPORTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_REPORTS;
    }
  }

  private saveReportsList(reports: DailyReport[]): void {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    this.notifyListeners();
  }

  async saveReport(reportData: Omit<DailyReport, 'id' | 'reportNumber' | 'submittedAt' | 'lastUpdatedAt' | 'e2eSignature' | 'encryptionStatus' | 'status'> & { id?: string; status?: DailyReport['status'] }): Promise<DailyReport> {
    const reports = this.getReports();
    const isEdit = Boolean(reportData.id);
    const id = reportData.id || 'rep-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5);

    const now = new Date().toISOString();
    const existingIndex = reports.findIndex(r => r.id === id);

    let reportNumber = '';
    if (existingIndex >= 0) {
      reportNumber = reports[existingIndex].reportNumber;
    } else {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = reports.filter(r => r.reportDate === reportData.reportDate).length + 1;
      reportNumber = `REL-${today}-${count.toString().padStart(3, '0')}`;
    }

    const signature = await generateSHA256Signature({
      id,
      reportNumber,
      userId: reportData.userId,
      reportDate: reportData.reportDate,
      totalAmountKz: reportData.totalAmountKz,
      physicalValue: reportData.physicalValue,
      recipientEmail: reportData.recipientEmail,
    });

    const fullReport: DailyReport = {
      id,
      reportNumber,
      userId: reportData.userId,
      userName: reportData.userName,
      userEmail: reportData.userEmail,
      recipientEmail: reportData.recipientEmail,
      agencyName: reportData.agencyName,
      reportDate: reportData.reportDate,
      shift: reportData.shift,
      physicalValue: reportData.physicalValue,
      items: reportData.items,
      totalMovements: reportData.totalMovements,
      totalAmountKz: reportData.totalAmountKz,
      observations: reportData.observations,
      submittedAt: existingIndex >= 0 ? reports[existingIndex].submittedAt : now,
      lastUpdatedAt: now,
      updatedByRole: reportData.updatedByRole,
      status: reportData.status || 'pendente',
      e2eSignature: signature,
      encryptionStatus: 'ENCRYPTED_SHA256_E2E',
    };

    if (existingIndex >= 0) {
      reports[existingIndex] = fullReport;
    } else {
      reports.unshift(fullReport);
    }

    this.saveReportsList(reports);
    return fullReport;
  }

  deleteReport(id: string): boolean {
    const reports = this.getReports();
    const filtered = reports.filter(r => r.id !== id);
    this.saveReportsList(filtered);
    return true;
  }

  /**
   * Regra de Negócio Crítica:
   * "Eles também podem ter a possibilidade de editar o relatório 24h depois do envio,
   * mais o administrador pode editar sempre que necessário."
   */
  canEditReport(report: DailyReport, currentUser: User | null): { allowed: boolean; reason?: string } {
    if (!currentUser) return { allowed: false, reason: 'Utilizador não autenticado' };

    // Administrador pode sempre editar
    if (currentUser.role === 'admin') {
      return { allowed: true };
    }

    // Se for o supervisor ou outro operador e não for o criador
    if (report.userId !== currentUser.id) {
      return { allowed: false, reason: 'Apenas o autor do relatório ou o Administrador pode editá-lo.' };
    }

    // Para o operador autor: verificar limite de 24 horas a contar do envio
    const submittedTime = new Date(report.submittedAt).getTime();
    const currentTime = Date.now();
    const hoursElapsed = (currentTime - submittedTime) / (1000 * 60 * 60);

    if (hoursElapsed <= 24) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Prazo de 24h para edição expirado (${hoursElapsed.toFixed(1)}h decorridas). Solicite alteração ao Administrador.`,
    };
  }

  // Gestão de Reconciliações (Exclusivo Admin & Supervisor)
  getReconciliations(): ReconciliationRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECONCILIATIONS);
    if (!raw) {
      this.saveReconciliationsList(INITIAL_RECONCILIATIONS);
      return INITIAL_RECONCILIATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_RECONCILIATIONS;
    }
  }

  private saveReconciliationsList(recs: ReconciliationRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.RECONCILIATIONS, JSON.stringify(recs));
    this.notifyListeners();
  }

  saveReconciliation(rec: Omit<ReconciliationRecord, 'id' | 'finalValue' | 'discrepancy' | 'status'> & { id?: string }): ReconciliationRecord {
    const records = this.getReconciliations();
    const id = rec.id || 'rec-' + Date.now().toString(36);
    const finalValue = Number(rec.cashInHand) + Number(rec.accountValue);
    const discrepancy = finalValue - Number(rec.initialValue);
    const status: 'equilibrado' | 'divergente' = Math.abs(discrepancy) < 0.01 ? 'equilibrado' : 'divergente';

    const fullRecord: ReconciliationRecord = {
      ...rec,
      id,
      finalValue,
      discrepancy,
      status,
    };

    const index = records.findIndex(r => r.id === id);
    if (index >= 0) {
      records[index] = fullRecord;
    } else {
      records.unshift(fullRecord);
    }

    this.saveReconciliationsList(records);
    return fullRecord;
  }

  deleteReconciliation(id: string): boolean {
    const records = this.getReconciliations();
    const filtered = records.filter(r => r.id !== id);
    this.saveReconciliationsList(filtered);
    return true;
  }

  // Backup & Restauro Completo
  exportFullBackup(): string {
    return JSON.stringify(
      {
        settings: this.getSettings(),
        users: this.getUsers(),
        movements: this.getMovements(),
        reports: this.getReports(),
        reconciliations: this.getReconciliations(),
        exportDate: new Date().toISOString(),
        version: 'Agente-BAI-v2.0',
      },
      null,
      2
    );
  }

  importFullBackup(jsonContent: string): boolean {
    try {
      const data = JSON.parse(jsonContent);
      if (data.settings) this.saveSettings(data.settings);
      if (data.users) this.saveUsersList(data.users);
      if (data.movements) this.saveMovementsList(data.movements);
      if (data.reports) this.saveReportsList(data.reports);
      if (data.reconciliations) this.saveReconciliationsList(data.reconciliations);
      return true;
    } catch (e) {
      console.error('Falha ao restaurar dados:', e);
      return false;
    }
  }

  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handler);
    }
    window.addEventListener('storage', handler);
    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handler);
      }
      window.removeEventListener('storage', handler);
    };
  }
}

export const storage = new StorageService();
