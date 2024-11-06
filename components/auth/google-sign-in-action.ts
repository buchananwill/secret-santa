'use server'

import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";


const rootUrl = process.env.ROOT_URL;

export async function googleSignInAction() {
    const supabaseClient = await createClient();

    let {data, error} = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${rootUrl}/auth/callback`,
        },
    });


    if (data?.url) {
        redirect(data.url) // use the redirect API for your server framework
    }


}