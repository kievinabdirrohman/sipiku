'use client';

import { useState, useEffect } from 'react';
import { login, signup } from './actions'

export default function LoginPage() {
    const [redirectUrl, setRedirectUrl] = useState<string>('/');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || '/';
        setRedirectUrl(redirect);
    }, []);

    return (
        <form>
            <button onClick={() => signup(redirectUrl)}>Sign up</button>
        </form>
    )
}