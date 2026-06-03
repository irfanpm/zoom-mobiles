import type { EnquiryItem } from '@/types';
import { siteConfig } from './config';

interface BuildMessageOptions {
  items: EnquiryItem[];
  customerName?: string;
  customerPhone?: string;
  customerCity?: string;
  notes?: string;
}

export function buildWhatsAppMessage(opts: BuildMessageOptions) {
  const { items, customerName, customerPhone, customerCity, notes } = opts;

  const lines: string[] = [];
  lines.push(`Hello ${siteConfig.name},`);
  lines.push('');
  lines.push('I would like to enquire about the following products:');
  lines.push('');

  items.forEach((item, idx) => {
    const unit = item.unit === 'box' ? 'Box' : item.unit === 'inner' ? 'Inner' : 'Pcs';
    lines.push(`${idx + 1}. ${item.name} (${item.code}) — ${item.quantity} ${unit}`);
  });

  lines.push('');
  lines.push('Please share wholesale pricing and availability.');

  if (notes?.trim()) {
    lines.push('');
    lines.push(`Notes: ${notes.trim()}`);
  }

  if (customerName || customerPhone || customerCity) {
    lines.push('');
    lines.push('— Customer Details —');
    if (customerName) lines.push(`Name: ${customerName}`);
    if (customerPhone) lines.push(`Phone: ${customerPhone}`);
    if (customerCity) lines.push(`City: ${customerCity}`);
  }

  lines.push('');
  lines.push('Thank You.');

  return lines.join('\n');
}

export function buildWhatsAppUrl(message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encoded}`;
}

export function quickEnquiryUrl(productName: string, code: string) {
  const msg = `Hello ${siteConfig.name}, I'm interested in *${productName}* (${code}). Please share wholesale price and availability. Thanks.`;
  return buildWhatsAppUrl(msg);
}
