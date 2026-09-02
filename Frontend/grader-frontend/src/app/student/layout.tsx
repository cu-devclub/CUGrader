import { SidebarProvider } from "@/components/ui/sidebar"
import { StudentSidebar } from "@/components/student-sidebar"


export default function StudentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <SidebarProvider defaultOpen={false}>
                <StudentSidebar />
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </SidebarProvider>
        </>

    );
}