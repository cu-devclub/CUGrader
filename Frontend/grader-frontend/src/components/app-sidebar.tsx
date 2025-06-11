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
        <Sidebar>
            <SidebarHeader className="border-b p-4">
                <h2 className="text-lg font-bold">GraderV.2</h2>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/instructor">
                                        <Home className="h-4 w-4" />
                                        <span>Home</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
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
                    //onClick={handleSignOut}
                    className="w-full justify-center"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </SidebarFooter>
        </Sidebar>
    )
}