import ResetPasswordForm from './ResetPasswordForm';

export const instant = false;

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;
  return <ResetPasswordForm token={token} />;
}
