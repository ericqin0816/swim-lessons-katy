import { redirect } from "next/navigation";
import { LoginIntro } from "@/components/login-intro";
import { LoginPanel } from "@/components/login-panel";
import { PageSection } from "@/components/section";
import { getCurrentUser } from "@/lib/data";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/account");
  }

  return (
    <PageSection>
      <LoginIntro />
      <LoginPanel />
    </PageSection>
  );
}
