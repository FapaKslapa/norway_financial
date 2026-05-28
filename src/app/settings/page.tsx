import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { auth } from "@/lib/auth";
import { SettingsPageClient } from "./settings-page-client";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <DashboardLayout user={user}>
      <Suspense>
        <SettingsPageClient />
      </Suspense>
    </DashboardLayout>
  );
}
