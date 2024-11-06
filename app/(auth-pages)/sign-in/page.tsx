import {Message} from "@/components/form-message";
import GoogleSignIn from "@/components/auth/GoogleSignIn";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <GoogleSignIn></GoogleSignIn></>
  );
}
