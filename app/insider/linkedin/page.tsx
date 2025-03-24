"use client"

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Loader2, OctagonX } from "lucide-react";

import { generateRecaptchaToken, getUser } from "@/lib/helper";
import { createClient } from "@/utils/supabase/client";
import { linkedinAccountSchema } from "@/lib/schema";
import { getLinkedinProfile } from "./actions";
import { pusherClient } from "@/lib/pusher";

import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadingPage from "@/components/LoadingPage";

import Analysis from "./subs/Analysis";

export default function LinkedInAnalyzer() {
    const [profile, setProfile] = useState<any>();
    const [pending, setPending] = useState<boolean>(false);
    const [progressMessage, setProgressMessage] = useState<string | null>("Connecting...");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const script = document.createElement('script')
        script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}`
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    useEffect(() => {
        const channel = pusherClient.subscribe('result')

        channel.bind('get-result', (message: string) => {
            setProgressMessage(message)
        })

        return () => {
            channel.unbind_all()
            channel.unsubscribe()
        }
    }, [])

    const formLinkedin = useForm<z.infer<typeof linkedinAccountSchema>>({
        defaultValues: {
            email: 'kievin.abdrohman@gmail.com',
            password: '@Kyven1298',
            recaptcha_token: "",
        },
    });

    const submitLinkedIn = async (values: z.infer<typeof linkedinAccountSchema>) => {
        setErrorMessage(null);
        setPending(true);

        try {
            const token = await generateRecaptchaToken(values.email.replace(/[^A-Za-z_]/g, ''))

            values.recaptcha_token = token;

            const result = await getLinkedinProfile(values);

            if (result.errors === false) {
                location.reload()
            } else {
                setErrorMessage("Whoops! Something went wrong.");
            }
        } catch (error) {
            setProgressMessage("Whoops! Something went wrong.");
        } finally {
            setPending(false);
        }
    };

    const supabase = createClient();

    const { data } = useQuery({
        queryKey: ['linkedinProfile'],
        queryFn: async () => {
            const user = await getUser();
            const { data } = await supabase
                .from('linkedin_analysis')
                .select('profile, result')
                .eq('email', user);

            return data
        }
    });

    useEffect(() => {
        if (data && data.length > 0) {
            setProfile(true);
        }
        setIsLoading(false);
    }, [data])

    const handleLoadingComplete = useCallback(() => {
        setIsLoading(false);
    }, []);

    return (
        <>
            <LoadingPage
                isDoneLoading={!isLoading}
                message="Please Wait"
                onLoadingComplete={handleLoadingComplete}
            />
            {!profile && <div className="flex justify-center">
                <div className="w-full md:w-1/3" >
                    {errorMessage && <Alert variant="destructive" className="!mb-6">
                        <OctagonX className="h-4 w-4" />
                        <AlertDescription className="text-sm tomorrow-medium">
                            {errorMessage}
                        </AlertDescription>
                    </Alert>}
                    <Form {...formLinkedin}>
                        <form onSubmit={formLinkedin.handleSubmit(submitLinkedIn)} className="space-y-4">
                            <FormField
                                control={formLinkedin.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email LinkedIn</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="your.email@example.com"
                                                type="email"
                                                autoComplete="email"
                                                disabled={pending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formLinkedin.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password LinkedIn</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="••••••••"
                                                type="password"
                                                autoComplete="current-password"
                                                disabled={pending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button disabled={pending || isLoading} type="submit" className="w-full text-base py-6">
                                {pending && (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {progressMessage}
                                    </>
                                )}
                                {!pending && "Connect Now!"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>}
            {profile &&
                <Analysis />
            }
        </>
    );
}