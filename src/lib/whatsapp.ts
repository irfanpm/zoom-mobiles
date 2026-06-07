import type { EnquiryItem } from '@/types';

/**
 * Settings shape that whatsapp helpers need.
 * Pass live settings from `useSettings()` (client) or `fetchSettings()` (server).
 */
export interface WaSettings {
  whatsapp_number: string;
  company_name: string;
}

interface BuildMessageOptions {
  items: EnquiryItem[];
  customerName?: string;
  customerCompany?: string;
  customerId?: string;
  customerPhone?: string;
  customerCity?: string;
  notes?: string;
  /** Live settings (whatsapp_number, company_name). */
  settings: WaSettings;
}

// ── helpers ──────────────────────────────────────────────────────
const DIVIDER = '━━━━━━━━━━━━━━━━━━━━';

function unitLabel(unit: EnquiryItem['unit']): string {
  if (unit === 'box') return 'Box';
  if (unit === 'inner') return 'Inner';
  return 'Pcs';
}

function unitEmoji(unit: EnquiryItem['unit']): string {
  if (unit === 'box') return '📦';
  if (unit === 'inner') return '🎁';
  return '🔹';
}

function pad(n: number, w = 2): string {
  return String(n).padStart(w, ' ');
}

// ── main message builder ─────────────────────────────────────────
export function buildWhatsAppMessage(opts: BuildMessageOptions) {
  const {
    items,
    customerName,
    customerCompany,
    customerId,
    customerPhone,
    customerCity,
    notes,
    settings,
  } = opts;

  const totalLines = items.length;
  const totalUnits = items.reduce((sum, i) => sum + i.quantity, 0);
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [];

  // ── HEADER ────────────────────────────────────────────────────
  lines.push(`🛒 *NEW WHOLESALE ENQUIRY*`);
  lines.push(`📱 *${settings.company_name}*`);
  lines.push(DIVIDER);
  lines.push('');

  // ── GREETING ──────────────────────────────────────────────────
  if (customerName || customerCompany) {
    const parts = [];
    if (customerName) parts.push(`*${customerName}*`);
    if (customerCompany) parts.push(`from *${customerCompany}*`);
    lines.push(`👋 Hello — this is ${parts.join(' ')}`);
  } else {
    lines.push(`👋 Hello ${settings.company_name} team,`);
  }
  lines.push('');
  lines.push(`I would like to enquire about the following products:`);
  lines.push('');

  // ── ITEMS ─────────────────────────────────────────────────────
  lines.push(`🛍️ *PRODUCT LIST* (${totalLines} ${totalLines === 1 ? 'item' : 'items'})`);
  lines.push(DIVIDER);

  items.forEach((item, idx) => {
    const n = pad(idx + 1);
    lines.push(`${n}. *${item.name}*`);
    lines.push(`     🏷️ Code: \`${item.code}\``);
    lines.push(`     ${unitEmoji(item.unit)} Qty: *${item.quantity} ${unitLabel(item.unit)}*`);
    if (idx < items.length - 1) lines.push('');
  });

  lines.push(DIVIDER);
  lines.push(`📊 *Total:* ${totalLines} products · ${totalUnits} units`);
  lines.push('');

  // ── NOTES ─────────────────────────────────────────────────────
  if (notes?.trim()) {
    lines.push(`📝 *Special Notes*`);
    lines.push(`_${notes.trim()}_`);
    lines.push('');
  }

  // ── CUSTOMER DETAILS ──────────────────────────────────────────
  if (customerName || customerCompany || customerPhone || customerCity || customerId) {
    lines.push(`👤 *CUSTOMER DETAILS*`);
    lines.push(DIVIDER);
    if (customerName) lines.push(`👨‍💼 Name: ${customerName}`);
    if (customerCompany) lines.push(`🏢 Company: ${customerCompany}`);
    if (customerPhone) lines.push(`📞 Phone: ${customerPhone}`);
    if (customerCity) lines.push(`📍 City: ${customerCity}`);
    if (customerId) lines.push(`🆔 ID: \`${customerId.slice(0, 8).toUpperCase()}\``);
    lines.push('');
  }

  // ── ASK ───────────────────────────────────────────────────────
  lines.push(`✅ *Please share:*`);
  lines.push(`   • Wholesale pricing`);
  lines.push(`   • Stock availability`);
  lines.push(`   • Estimated dispatch time`);
  lines.push('');

  // ── FOOTER ────────────────────────────────────────────────────
  lines.push(DIVIDER);
  lines.push(`🕒 ${now} IST`);
  lines.push(`🙏 Thank you!`);

  return lines.join('\n');
}

export function buildWhatsAppUrl(message: string, settings: WaSettings) {
  const encoded = encodeURIComponent(message);
  const number = String(settings.whatsapp_number).replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encoded}`;
}

export function quickEnquiryUrl(productName: string, code: string, settings: WaSettings) {
  const lines = [
    `🛒 *Product Enquiry*`,
    `📱 *${settings.company_name}*`,
    DIVIDER,
    '',
    `👋 Hello — I'm interested in this product:`,
    '',
    `📦 *${productName}*`,
    `🏷️ Code: \`${code}\``,
    '',
    `✅ Please share:`,
    `   • Wholesale price`,
    `   • Stock availability`,
    `   • Minimum order qty (MOQ)`,
    '',
    `🙏 Thanks!`,
  ];
  return buildWhatsAppUrl(lines.join('\n'), settings);
}
