import { fetchCurrentCustomer, fetchSettings, resolveCustomerWhatsApp } from '@/lib/catalog';
import EnquiryClient from './enquiry-client';

export const metadata = { title: 'Send Enquiry — Zoom Mobiles' };
export const dynamic = 'force-dynamic';

export default async function EnquiryPage() {
  const [customer, settings, adminWa] = await Promise.all([
    fetchCurrentCustomer(),
    fetchSettings(),
    resolveCustomerWhatsApp(),
  ]);

  // Route enquiry to the owning admin's WhatsApp when available, else global.
  const whatsappNumber = adminWa?.whatsapp_number ?? settings.whatsapp_number;
  const whatsappDisplay = adminWa?.whatsapp_display ?? settings.whatsapp_display;

  return (
    <EnquiryClient
      customer={customer}
      whatsappNumber={whatsappNumber}
      whatsappDisplay={whatsappDisplay}
      companyName={settings.company_name}
    />
  );
}
