export type UserRole = 'admin' | 'supervisor' | 'operador';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  agencyCode?: string;
  createdAt: string;
  isActive: boolean;
  avatarColor?: string;
}

export type MovementCategory = 'BAI' | 'AB' | 'BAI / AB';

export interface MovementType {
  id: string;
  code: string;
  name: string;
  category: MovementCategory;
  defaultValue: number; // usually 200 Kz
  description?: string;
  isCustom?: boolean;
  active: boolean;
}

export interface ReportMovementItem {
  movementTypeId: string;
  movementCode: string;
  movementName: string;
  category: MovementCategory;
  unitValue: number;
  quantity: number;
  totalValue: number; // quantity * unitValue
  notes?: string;
}

export interface DailyReport {
  id: string;
  reportNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  recipientEmail: string; // Mandatory recipient email
  agencyName: string;
  reportDate: string; // YYYY-MM-DD
  shift: 'Manhã' | 'Tarde' | 'Integral';
  physicalValue: number; // Mandatory "Valor Físico" - independent, does not calculate into totals
  items: ReportMovementItem[];
  totalMovements: number;
  totalAmountKz: number; // sum of totalValue of all items
  observations?: string;
  submittedAt: string; // ISO
  lastUpdatedAt: string; // ISO
  updatedByRole?: UserRole;
  status: 'pendente' | 'reconciliado' | 'divergente';
  e2eSignature: string; // Cryptographic SHA-256 seal
  encryptionStatus: 'ENCRYPTED_SHA256_E2E';
}

export interface ReconciliationRecord {
  id: string;
  reportId?: string;
  reportNumber?: string;
  userId: string;
  userName: string;
  date: string;
  shift: string;
  initialValue: number; // Valor Inicial
  cashInHand: number; // Valor em Mão
  accountValue: number; // Valor em Conta
  finalValue: number; // Valor Final = Valor em Mão + Valor em Conta
  discrepancy: number; // finalValue - initialValue
  status: 'equilibrado' | 'divergente' | 'pendente';
  verifiedBy: string; // Admin or Supervisor
  verifiedAt: string;
  notes?: string;
}

export interface CompanySettings {
  companyName: string; // Nome da empresa a representar o agente
  agentNumber: string; // Código do Agente BAI
  nif: string;
  address: string;
  city: string;
  phone: string;
  supportEmail: string;
  defaultSupervisorEmail: string;
  masterAdminUsername: string;
  masterAdminPasswordHash: string; // hashed or stored
  encryptionActive: boolean;
  syncMode: 'local_broadcast' | 'firebase_cloud';
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
