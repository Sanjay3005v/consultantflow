import AdminLoginForm from '@/components/admin-login-form';

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="w-full max-w-md">
        <AdminLoginForm />
      </div>
    </div>
  );
}
