import ResetPasswordForm from './reset-form';

export const metadata = { title: 'Set New Password — Zoom Mobiles' };

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-mesh-primary px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-grid-slate [background-size:32px_32px] opacity-50" />
      <ResetPasswordForm />
    </div>
  );
}
