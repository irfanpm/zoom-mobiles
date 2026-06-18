import { redirect } from 'next/navigation';

// The Enquiries section has been removed from the admin.
// Any direct visit to /admin/enquiries is sent back to the dashboard.
export default function RemovedEnquiriesPage() {
  redirect('/admin');
}
