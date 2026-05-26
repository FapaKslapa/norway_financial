import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "../../components/dashboard-layout";
import { auth } from "../../lib/auth";
import FriendsView from "./friends-view";

export default async function FriendsPage() {
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
      <FriendsView />
    </DashboardLayout>
  );
}
