'use client'

import * as React from "react"
import { ChevronUp, ClockAlert, GalleryVerticalEnd, Loader2, User2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"

import { linkedinAccountSchema } from "@/lib/schema"
import { generateRecaptchaToken } from "@/lib/helper"

import { getLinkedinProfile } from "@/app/actions"
import { Alert, AlertDescription } from "./ui/alert"

const items = [
    {
        title: "Job Analyzer",
        url: "/insider",
        isActive: true,
    },
    {
        title: "Headshot",
        url: "/insider/headshot",
    },
    {
        title: "LinkedIn Analyzer",
        url: "/insider/linkedin",
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const handleConnectClick = () => {
        setDialogOpen(true);
    };

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
                                    <SidebarMenuButton isActive={item.isActive} asChild>
                                        <a href={item.url}>
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem key="connect_to_linkedin">
                                <SidebarMenuButton onClick={handleConnectClick}>
                                    Connect to LinkedIn
                                </SidebarMenuButton>
                            </SidebarMenuItem>
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
                                        <User2 /> Username
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

            <LinkedInConnectDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />
        </>
    )
}

interface LinkedInConnectDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const LinkedInConnectDialog: React.FC<LinkedInConnectDialogProps> = ({ isOpen, onClose }) => {
    const [pending, setPending] = React.useState<boolean>(false);

    const formLinkedin = useForm<z.infer<typeof linkedinAccountSchema>>({
        defaultValues: {
            email: 'kievin.abdrohman@gmail.com',
            password: '@Kyven1298',
        },
    });
    const submitLinkedIn = async (values: z.infer<typeof linkedinAccountSchema>) => {
        setPending(true);

        try {
            const token = await generateRecaptchaToken(values.email.replace(/[^A-Za-z_]/g, ''))

            values.recaptcha_token = token;

            const response = await getLinkedinProfile(values);

            console.log(response);
        } catch (error) {
            //   setCVMessage("Whoops! Something went wrong.");
        } finally {
            setPending(false);
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (pending) {
                return;
            }
            !open && onClose()
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connect to Your LinkedIn Account</DialogTitle>
                    <DialogDescription>
                        Get in-depth LinkedIn profile analysis and recommendations to boost your visibility.
                    </DialogDescription>
                </DialogHeader>
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

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={pending}
                        >
                            {pending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                'Connect'
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};