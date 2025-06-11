import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


export default function InstructorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarProvider>
    </>

  );
}
