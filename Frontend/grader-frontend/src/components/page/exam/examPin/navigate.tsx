'use client'
import { Button } from "@/components/ui/button"
import { CircleArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavSub() {
    const router = useRouter()
    return(
        <div className="w-full flex justify-between items-center">
            <Button variant="ghost" className=" cursor-pointer *:text-(--exam-color)" onClick={() => router.back()}>
                <CircleArrowLeft />
                <span className="underline">Back to assignment</span>
            </Button>
        </div>
    )
}