'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function authenticate(redirectUrl: string) {
    // const supabase = await createClient()

    // const { data, error } = await supabase.auth.signInWithOAuth({
    //     provider: 'google',
    //     options: {
    //         redirectTo: 'http://localhost:3000/auth/callback?next=' + redirectUrl,
    //         queryParams: {
    //             access_type: 'offline',
    //             prompt: 'consent',
    //         },
    //     },
    // })

    // if (data.url) {
    //     redirect(data.url)
    // }

    // if (error) {
    //     redirect('/error')
    // }
}