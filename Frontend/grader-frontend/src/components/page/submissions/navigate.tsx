'use client'
import { Button } from "@/components/ui/button"
import { CircleArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavSub({ onClickSV } : {onClickSV:() => void}) {
    const router = useRouter()
    return(
        <div className="w-full flex justify-between items-center">
            <Button variant="ghost" className=" cursor-pointer *:text-primary" onClick={() => router.back()}>
                <CircleArrowLeft />
                <span className="underline">Back to lab</span>
            </Button>
            <Button variant="outline" className=" cursor-pointer *:text-primary border border-primary" onClick={onClickSV}>
                <span>Student View</span>
            </Button>
        </div>
    )
}
