'use client'
import { NavSub } from "@/components/page/submissions/navigate"
import { HeaderSub } from "@/components/page/submissions/header";
import { CodeSection } from "@/components/page/submissions/codeSection";
import { CommentScreenSection } from "@/components/page/submissions/comment/screen";
import { FormInputComment,FeedbackFormData } from "@/components/page/submissions/comment/formInput";
import dayjs from "dayjs";
import { mockComments } from "@/variables/page/submissions/mockComment";
import { useState } from "react";

export default function Page({ params }: { params: Promise<{ submissions_id: string; }>; }) {
    const [code, setCode] = useState("# Write your Python code here\nprint('Hello, World!')");
    function DayFormat(date:number){
        return dayjs.unix(date).format('DD MMMM YYYY HH:mm');
    }
    const formattedComments = mockComments.map(comment => ({
        ...comment,
        date: DayFormat(parseInt(comment.date))
    }));

    const ProfileData = {
        image: 'https://i.pinimg.com/736x/f3/ec/94/f3ec94635f2365e3de3782de0aadbe76.jpg',
        name: "Alex Chen",
        lab:1,
        question: "Question 1: Median of Two Sorted Arrays",
        date: DayFormat(parseInt("1703721600")),
        score:20,
        maxScore: 100
    }
    // mock นะจะ
    const handleFeedbackSubmit = async (data: FeedbackFormData) => {
        console.log('Submitting feedback:', data.comment)
        await fetch('/api/feedback', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }

    return(
        <div className={` px-4 md:px-8 py-8`}>
            <NavSub onClickSV={() => console.log("awdwad")} />
            <div className="divide-y divide-gray-200 divide-solid px-0 md:px-5">
                <div className=" px-2 md:px-10 py-2">
                    <HeaderSub
                        data={ProfileData}
                    />
                </div>
                <div className=" px-2 md:px-14 py-6 gap-10 flex flex-col">
                    <CodeSection code={code} setCode={setCode} language="python"/>
                    <CommentScreenSection data={formattedComments}/>
                    <FormInputComment onSubmit={handleFeedbackSubmit}/>
                </div>
            </div>
        </div>
    )
}
