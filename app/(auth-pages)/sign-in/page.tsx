import {Message} from "@/components/form-message";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import {BasicLogin} from "@/app/(auth-pages)/sign-in/BasicLogin";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <>
        {process.env.NEXT_PUBLIC_ROOT_URL?.includes('localhost') && <BasicLogin searchParams={searchParams}/>}
      <GoogleSignIn></GoogleSignIn></>
  );
}
