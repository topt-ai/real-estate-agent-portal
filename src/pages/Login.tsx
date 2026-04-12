import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <div className="w-full max-w-md flex justify-center">
        <SignIn routing="path" path="/login" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
