'use client'

import * as React from "react"
import { ChevronUp, GalleryVerticalEnd, User2 } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

import { Alert, AlertDescription } from "./ui/alert"

const items = [
    {
        title: "Job Analyzer",
        url: "/insider",
        isActive: false,
    },
    // {
    //     title: "Headshot",
    //     url: "/insider/headshot",
    //     isActive: false,
    // },
    {
        title: "LinkedIn Analyzer",
        url: "/insider/linkedin",
        isActive: false,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <>
            <Sidebar {...props}>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <a href="#">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <GalleryVerticalEnd className="size-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 leading-none">
                                        <span className="font-semibold">SK-Fomalhout-001</span>
                                        <span className="">v0.0.1-alpha</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <Alert variant="warning">
                                <AlertDescription className="text-xs tomorrow-normal">
                                    This App is experimental (alpha) and All features can only be used once.
                                </AlertDescription>
                            </Alert>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton>
                                        <User2 /> Account
                                        <ChevronUp className="ml-auto" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-[--radix-popper-anchor-width]"
                                >
                                    <DropdownMenuItem>
                                        <form action="/auth/signout" method="post" className="w-full">
                                            <button className="button block w-full" type="submit">
                                                Sign out
                                            </button>
                                        </form>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </>
    )
}