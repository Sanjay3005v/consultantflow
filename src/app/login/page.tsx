
import LoginForm from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-57px)] w-full flex items-center justify-center overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 h-full w-full bg-background" />
            <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,122,255,.15),rgba(255,255,255,0))]" />
            <div className="absolute bottom-[-20%] right-0 top-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,122,255,.15),rgba(255,255,255,0))]" />
        </div>

        {/* Login Form */}
        <div className="z-10 w-full max-w-md">
            <LoginForm />
        </div>
    </div>
  );
}
