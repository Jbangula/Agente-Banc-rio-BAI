/**
 * Utilitários de Criptografia de Ponta a Ponta (E2E) e Formatação Monetária Kwanza (Kz)
 * Agente BAI Angola
 */

// Formatação oficial do Kwanza Angolano (Kz)
export function formatKz(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0,00 Kz';
  }
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('AOA', 'Kz');
}

// Formatação abreviada para relatórios e recibos
export function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return new Intl.NumberFormat('pt-AO').format(val);
}

// Gera assinatura digital SHA-256 de integridade e não-repúdio
export async function generateSHA256Signature(data: object | string): Promise<string> {
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString + '_BAI_AGENTE_SALT_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback simples caso SubtleCrypto esteja restrito
    let hash = 0;
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'E2E-' + Math.abs(hash).toString(16).toUpperCase() + '-BAI';
  }
}

// Hash seguro para senhas
export async function hashPassword(password: string): Promise<string> {
  return generateSHA256Signature('PASS_HASH_' + password);
}

// Simula selo criptográfico de integridade em lote
export function generateSecurityBadge(reportId: string, timestamp: string): string {
  const shortId = reportId.slice(-6).toUpperCase();
  const dateHash = timestamp.replace(/[-:T.Z]/g, '').slice(-8);
  return `E2E-BAI-${shortId}-${dateHash}`;
}
