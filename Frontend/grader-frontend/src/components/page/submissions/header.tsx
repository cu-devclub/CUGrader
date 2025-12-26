'use client'
import { PenLine } from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

interface HeaderType{
    image:string;
    name:string;
    lab:number;
    question:string;
    date:string;
    score:number;
    maxScore: number;
}

export function HeaderSub({data}:{data:HeaderType}) {
    return(
        <div className="w-full flex flex-col gap-2 pb-6">
            <div className="flex items-center gap-2">
                <Avatar className="ring ring-primary p-0.5 w-10 h-10">
                    <AvatarImage className="rounded-full" src={data.image} alt="Student_Avatar" />
                    <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <span className="text-gray-700">{data.name}</span>
            </div>
            <div className="flex flex-col">
                <span>Lab {data.lab} / {data.question}</span>
                <span className="text-xs text-gray-400">Submited {data.date}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className=" Chip">
                    <span className="text-sm">{data.score}/{data.maxScore}</span>
                </div>
                <div className=" cursor-pointer">
                    <PenLine size={14} className="text-chart-5" />
                </div>
            </div>
        </div>
    )
}
