'use client'
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

export function CommentScreenSection({data}: {data:CommentType[]}){
    return(
        <div className="flex gap-4 flex-col">
            {data.map(( item, index) => (
                <Comment key={index} data={item} />
            ))}
        </div>
    )
}

interface CommentType{
    teacher: boolean;
    comment: string;
    name: string;
    date: string;
    image: string;
}

function Comment({ data }: { data:CommentType }) {
    return(
        <div className={` flex flex-col gap-4 ${!data.teacher && 'items-end'}`}>
            <div className="flex items-center gap-2">
                <Avatar className={`ring ring-primary p-0.5 w-10 h-10 ${!data.teacher && 'order-2'}`}>
                    <AvatarImage className="rounded-full" src={data.image} alt="Avatar" />
                    <AvatarFallback>{data.teacher ? 'TS': "ST"}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${!data.teacher && 'items-end order-1'} `}>
                    <span className="text-gray-700 ">{data.name}</span>
                    <span className="text-gray-400 text-xs ">{data.date}</span>
                </div>
            </div>
            <div className=" md:max-w-[60%] ring ring-gray-300 p-2  text-sm rounded-md shadow-md">
                {data.comment}
            </div>
        </div>
    )
}