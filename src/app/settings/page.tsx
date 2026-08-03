import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "username, bio, profession, industry, linkedin_url, african_identity, country_origin, expertise, interests",
    )
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-lg px-5 py-8">
      <SettingsForm profile={profile} />
    </main>
  );
}
