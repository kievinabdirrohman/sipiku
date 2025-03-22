'use client';

import { useState, useEffect } from 'react';
import { authenticate } from './actions'

export default function LoginPage() {
    const [redirectUrl, setRedirectUrl] = useState<string>('/');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || '/';
        setRedirectUrl(redirect);
    }, []);

    return (
        <form>
            <button onClick={() => authenticate(redirectUrl)}>Sign up</button>
        </form>
    )
}