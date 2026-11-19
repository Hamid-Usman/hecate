import Link from "next/link";
import { AuthAside } from "@/components/auth/auth-aside";
import { Mark } from "@/components/landing/glyphs";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthAside />
      <main className="blueprint flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="flex w-fit items-center gap-2.5 lg:hidden">
          <Mark className="h-7 w-7" animated={false} />
          <span className="font-serif text-2xl tracking-tight">Hecate</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
