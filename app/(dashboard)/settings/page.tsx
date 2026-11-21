import type { Metadata } from "next";
import { AccountView } from "@/components/dashboard/account-view";

export const metadata: Metadata = { title: "Account — Hecate" };

export default function AccountPage() {
  return <AccountView />;
}
