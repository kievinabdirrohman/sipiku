"use client"

import { useState, useEffect } from "react";

import { GraduationCap, Briefcase } from "lucide-react";

import { authenticate } from "./actions";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}`
    document.body.appendChild(script)

    setIsLoaded(true)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const [redirectUrl, setRedirectUrl] = useState<string>('/insider');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect') || '/insider';
    setRedirectUrl(redirect);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-5">
          SK-Fomalhout-001
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
          AI-powered career tools for precise job matching
        </p>
        <div className="glass-card p-8 md:p-10 w-full max-w-4xl mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16">
            <div className="w-full md:w-1/2 md:border-r border-gray-700/50 pr-0 md:pr-8">
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-6 w-6 text-white" />
                  <h2 className="section-title">Job Seeker?</h2>
                </div>
                <p className="section-subtitle text-center md:text-left">
                  Supercharge your job search with AI-powered CV analysis and personalized job recommendations.
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/2 md:pl-8 border-t md:border-t-0 border-gray-700/50 pt-8 md:pt-0">
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-6 w-6 text-white" />
                  <h2 className="section-title">Hiring Manager?</h2>
                </div>
                <p className="section-subtitle text-center md:text-left">
                  Find the best candidates faster with AI-driven CV screening and accurate job matching.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            {isLoaded && <button onClick={() => {
              setIsLoaded(false)
              authenticate(redirectUrl)
            }} className="google-btn mt-2 w-64 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" className="mr-2">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Sign in with Google
            </button>}
          </div>
        </div>
        <div className="mt-8 text-gray-400 text-sm text-center">
          © {new Date().getFullYear()} SiKepin. All rights reserved.
        </div>
      </div>
    </div>
  );
}
