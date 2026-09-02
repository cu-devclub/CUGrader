import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import githubIcon from "@/../public/github-icon.svg";
import igIcon from "@/../public/ig-icon.svg";
import webIcon from "@/../public/web-icon.svg";
import Link from "next/link";
import externalLink from "./externalLink.json";
import { InfoIcon } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">GraderV.2</h1>
                <p className="text-muted-foreground text-balance">
                  Grading & Class management system
                </p>
              </div>
              {process.env.NEXT_PUBLIC_AUTH_API_URL ? (
                <Link href={`${process.env.NEXT_PUBLIC_AUTH_API_URL}/login`}>
                  <Button className="w-full">
                    Login
                  </Button>
                </Link>
              ) : <Button className="w-full">
                Error loading auth API URL
              </Button>}

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Made with ❤️ by CU Devclub
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Link target="_blank" href={externalLink.Instagram || "#"}>
                  <Button variant="outline" type="button" className="w-full">
                    <Image src={igIcon} alt="Logo" width={24} height={24} />
                    <span className="sr-only">Instagram</span>
                  </Button>
                </Link>
                <Link target="_blank" href={externalLink.Github || "#"}>
                  <Button variant="outline" type="button" className="w-full">
                    <Image src={githubIcon} alt="Logo" width={24} height={24} />
                    <span className="sr-only">Github</span>
                  </Button>
                </Link>
                <Link target="_blank" href={externalLink.CudevclubWebsite || "#"}>
                  <Button variant="outline" type="button" className="w-full">
                    <Image src={webIcon} alt="Logo" width={24} height={24} />
                    <span className="sr-only">Web</span>
                  </Button>
                </Link>



              </div>
              <div className="text-center text-sm">
                Encounter problem with system?{" "}
                <a href="#" className="underline underline-offset-4">
                  Report
                </a>
              </div>
            </div>
          </div>
          <div className="bg-muted relative hidden md:flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Image"
              className="object-contain h-1/2 w-1/2 dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By signing in, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>

      {process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true" && (
        <div className="flex flex-col items-center">
          <div className="border shadow-lg bg-background p-6 w-96 rounded-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <InfoIcon />
              <h1 className="text-xl">ไม่ต้องล็อกอิน (dev)</h1>
            </div>
            <p className="mb-3">กดลิงก์ไปตรงๆ ได้เลย ไม่มีการเช็คสิทธิ์ ถ้าจะปิดก็แก้ env</p>
            <Link href="/student" className="text-primary hover:underline underline-offset-2">หน้าหลักนักเรียน</Link>
            <Link href="/instructor" className="text-primary hover:underline underline-offset-2">หน้าหลักผู้สอน</Link>
          </div>
        </div>
      )}
    </div>
  );
}
