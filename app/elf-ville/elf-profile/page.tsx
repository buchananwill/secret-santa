import EditElfProfile from "@/components/forms/elf-profiles/edit-elf-profile";
import { fetchProfileAction } from "@/app/elf-ville/elf-profile/fetch-profile-action";

export default async function Page() {
  let profile = await fetchProfileAction();
  return profile && <EditElfProfile profile={profile} />;
}
