'use client'
import Link from "next/link";
import {Button, Input, PasswordInput, TextInput} from "@mantine/core";
import {FormMessage, Message} from "@/components/form-message";
import {SubmitHandler, useForm} from "react-hook-form";
import {useCallback} from "react";
import {signUpAction} from "@/app/actions";

export type BasicSignUp = {
    email: string;
    password: string
}

export default function SignUpForm({searchParams}:{searchParams:Message}) {
    const {register, handleSubmit, watch, formState} = useForm<BasicSignUp>();
    const onSubmit: SubmitHandler<BasicSignUp> = useCallback((formData: BasicSignUp) => {
        signUpAction(formData)
    }, []);

   return  <form className="flex flex-col min-w-64 max-w-64 mx-auto" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-2xl font-medium">Become a Secret Santa!</h1>
        <p className="text-sm text text-foreground">
            Already have an account?{" "}
            <Link className="text-primary font-medium underline" href="/sign-in">
                Sign in
            </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
            <TextInput {...register('email')} placeholder="you@example.com" type={'email'} label={'Email'} required/>

            <PasswordInput
                {...register('password')}
                type="password"
                placeholder="Your password"
                minLength={10}
                required
                label={'Password'}
            />
            <Button type={'submit'}>
                Sign up
            </Button>
            <FormMessage message={searchParams}/>
        </div>
    </form>
}