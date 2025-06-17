"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { ChartNoAxesColumn } from "lucide-react";
import { FileText } from "lucide-react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <div className="w-1/6 border-gray-300 flex flex-col items-center bg-primary">
        <div className="min-w-full flex px-2 py-4 items-center">
          <Button variant="ghost" className="mb-4 text-white">
            ☰
          </Button>
        </div>

        <div className="min-w-full flex px-2 pb-7 gap-y-3 items-start flex-col">
          <Button
            className="flex w-full h-1/2 text-white justify-start"
            variant="ghost"
          >
            Notification
          </Button>
          <Button
            className="flex w-full h-1/2 text-white justify-start"
            variant="ghost"
          >
            Profile
          </Button>
        </div>
      </div>

      <div className="w-5/6 border-gray-300 flex flex-col items-center">
        <div className="w-full h-full p-4">
          <div className="flex border-b mb-4 px-20">
            <Tabs>
              <TabsList className="w-full grid-cols-4 space-x-10">
                <TabsTrigger value="Assignment" asChild>
                  <Link
                    href={`./assignment`}
                    className={clsx(
                      "pb-2 px-4 font-semibold border-b-2",
                      pathname.includes("assignment")
                        ? "border-b-2 border-pink-500 text-pink-600"
                        : "text-gray-500 hover:text-pink-500"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    Assignment
                  </Link>
                </TabsTrigger>

                <TabsTrigger value="Profile" asChild>
                  <Link
                    href={`./profile`}
                    className={clsx(
                      "pb-2 px-4 font-semibold border-b-2",
                      pathname.includes("profile")
                        ? "border-b-2 border-pink-500 text-pink-600"
                        : "text-gray-500 hover:text-pink-500"
                    )}
                  >
                    <ChartNoAxesColumn className="w-4 h-4" />
                    Profile
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
