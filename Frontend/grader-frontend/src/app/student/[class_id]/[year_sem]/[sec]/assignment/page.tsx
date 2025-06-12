"use client";

import React from "react";
import AssignmentTab from "./AssignmentTab";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();

  const toProfilePage = () => {
    router.push("./profile");
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-full border-gray-300 flex flex-col items-center">
        <div className="flex flex-row min-w-full h-20 space-x-5 px-24">
          <Button
            className="flex self-end h-13 w-30 bg-primary justify-start items-center px-2"
          // onClick={() => setActiveTab("assignment")}
          >
            Assignment
          </Button>
          <Button
            variant="ghost"
            className="self-end h-13 w-30"
            onClick={() => toProfilePage()}
          >
            profile
          </Button>
        </div>
        <AssignmentTab />
      </div>
    </div>
  );
}
