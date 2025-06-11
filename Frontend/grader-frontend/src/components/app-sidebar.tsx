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
import { Home, Bell, LogOut, BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"

export function AppSidebar() {
    const handleSignOut = () => {
        // TODO : When the backend is ready, make an API call to sign out + handle middleware for auth
        // For now, just clear local storage and redirect to login page

        // Clear auth token and user data
        //localStorage.removeItem('auth_token')
        //localStorage.removeItem('user_data')

        // Redirect to login page
        window.location.href = '/login'
    }

    // Fetch semester list and classes data
    const { data: semesterList } = useSuspenseQuery({
        queryKey: ["semester"],
        queryFn: () => api.semesters.list(),
    });

    const [selectedSemester] = useState(semesterList[0]);

    const { data: classes } = useSuspenseQuery({
        queryKey: ["class", selectedSemester],
        queryFn: () => api.classes.listParticipatingBySemester(selectedSemester),
    });

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b p-4">
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                    <h2 className="text-lg font-bold group-data-[collapsible=icon]:hidden">GraderV.2</h2>
                    <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
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

                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Classes</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {classes.assisting.map((classItem) => (
                                <SidebarMenuItem key={classItem.classId}>
                                    <SidebarMenuButton asChild tooltip={classItem.courseName}>
                                        <Link href={`/instructor/class/${classItem.classId}/people`}>
                                            <BookOpen className="h-4 w-4" />
                                            <span className="truncate">{classItem.courseName}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
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