'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
    const handleSignOut = () => {
        // Clear auth token and user data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')

        // Redirect to login page
        window.location.href = '/'
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b p-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold group-data-[collapsible=icon]:hidden">GraderV.2</h2>
                    <SidebarTrigger className="ml-auto" />
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Home">
                                    <Link href="/instructor">
                                        <Home className="h-4 w-4" />
                                        <span>Home</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Notification">
                                    <Link href="/instructor/notification">
                                        <Bell className="h-4 w-4" />
                                        <span>Notification</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t p-4 flex ">
                <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="w-full justify-center"
                    title="Sign Out"
                >
                    <LogOut className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
                    <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}