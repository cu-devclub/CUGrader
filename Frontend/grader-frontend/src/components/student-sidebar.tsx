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
    useSidebar,
} from "@/components/ui/sidebar"
import { Home, Bell, LogOut, BookOpen, BookMarked } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { api } from "@/lib/api"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"

export function StudentSidebar() {
    const { open, setOpen } = useSidebar()

    const handleSignOut = () => {
        // TODO : When the backend is ready, make an API call to sign out + handle middleware for auth
        // For now, just clear local storage and redirect to login page

        // Clear auth token and user data
        //localStorage.removeItem('auth_token')
        //localStorage.removeItem('user_data')

        // Redirect to login page -> Don't directly redirect to login page, Change this to a proper API call when ready
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
                {/* Navigation Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Home">
                                    <Link href="/student">
                                        <Home className="h-4 w-4" />
                                        <span>Home</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Notification">
                                    <Link href="/student/notification">
                                        <Bell className="h-4 w-4" />
                                        <span>Notification</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* TA Classes Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Teacher Assistant
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {open ? (
                                classes.assisting.map((classItem) => (
                                    <SidebarMenuItem key={classItem.classId}>
                                        <SidebarMenuButton asChild tooltip={classItem.courseName}>
                                            <Link href={`/student/ta/${classItem.courseId}/${selectedSemester.replace("/", "-")}/people`}>
                                                <BookMarked className="h-4 w-4" />
                                                <span className="truncate">{classItem.courseName}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            ) : (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Teacher Assistant"
                                        onClick={() => setOpen(true)}
                                    >
                                        <BookMarked className="h-4 w-4" />
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Student Classes Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Student</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {open ? (
                                classes.studying.map((classItem) => (
                                    <SidebarMenuItem key={classItem.classId}>
                                        <SidebarMenuButton asChild tooltip={classItem.courseName}>
                                            <Link href={`/student/${classItem.courseId}/${selectedSemester.replace("/", "-")}/1/assignment`}>
                                                <BookOpen className="h-4 w-4" />
                                                <span className="truncate">{classItem.courseName}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            ) : (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Student Classes"
                                        onClick={() => setOpen(true)}
                                    >
                                        <BookOpen className="h-4 w-4" />
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t p-4 space-y-2">
                <LocaleSwitcher variant="sidebar" />
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
