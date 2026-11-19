import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in — Hecate" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  return (
    <Suspense fallback={<AuthForm mode="login" />}>
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return <AuthForm mode="login" notice={expired !== undefined ? "Your session ended. Please sign in again." : undefined} />;
}
