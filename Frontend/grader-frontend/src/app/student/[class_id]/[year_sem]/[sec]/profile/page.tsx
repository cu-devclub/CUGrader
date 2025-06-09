"use client";

import React from "react";
import ProflieTab from "./ProfleTab";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();

  const toAssignmentPage = () => {
    router.push("./assignment");
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/6 border-gray-300 flex flex-col items-center bg-gray-300">
        <div className="min-w-full flex px-4 py-4 items-center">
          <button className="mb-4">☰</button>
        </div>

        <div className="min-w-full flex px-6 pb-7 gap-y-3 items-start flex-col">
          <button>Notification</button>
          <button>Profile</button>
        </div>

        <div className="min-w-full flex px-6 pb-7 gap-y-3 items-start flex-col bg-white"></div>
      </div>

      <div className="w-5/6 border-gray-300 flex flex-col items-center">
        <div className="flex flex-row min-w-full h-20 space-x-5 px-24">
          <Button
            variant="ghost"
            className="flex self-end h-13 w-30 justify-start items-center px-2"
            onClick={() => toAssignmentPage()}
          >
            Assignment
          </Button>
          <Button
            className="self-end h-13 w-30  bg-pink-500"
            // onClick={() => setActiveTab("profile")}
          >
            profile
          </Button>
        </div>
        <ProflieTab />
      </div>
    </div>
  );
}
