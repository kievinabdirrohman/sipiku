'use client'

import {
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'

import { AppSidebar } from "@/components/app-sidebar"

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

const queryClient = new QueryClient()

export default function InsiderLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                        <div className="flex items-center gap-2 px-3">
                            <SidebarTrigger />
                        </div>
                    </header>
                    <main className="p-5 w-full">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </QueryClientProvider>
    )
}