
import LoginForm from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
