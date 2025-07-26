import SignUpForm from '@/components/signup-form';

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}
