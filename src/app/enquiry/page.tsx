import { fetchCurrentCustomer, fetchSettings } from '@/lib/catalog';
import EnquiryClient from './enquiry-client';

export const metadata = { title: 'Send Enquiry — Zoom Mobiles' };
export const dynamic = 'force-dynamic';

export default async function EnquiryPage() {
  const [customer, settings] = await Promise.all([
    fetchCurrentCustomer(),
    fetchSettings(),
  ]);

  return (
    <EnquiryClient
      customer={customer}
      whatsappNumber={settings.whatsapp_number}
      whatsappDisplay={settings.whatsapp_display}
      companyName={settings.company_name}
    />
  );
}
