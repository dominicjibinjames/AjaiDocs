import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-surface px-4 py-16">
      <Suspense fallback={<div className="mx-auto h-80 max-w-md animate-pulse rounded-2xl bg-canvas" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
