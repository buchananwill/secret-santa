import { createClient } from "@/utils/supabase/server";
import ElfMailTabs from "@/app/elf-ville/elf-mail/ElfMailTabs";
import { notFound } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();

  const user = await supabase.auth.getUser();

  const userId = user.data.user?.id;

  if (!userId) notFound();

  return <ElfMailTabs userId={userId} asSanta={""} asElf={""} />;
}
