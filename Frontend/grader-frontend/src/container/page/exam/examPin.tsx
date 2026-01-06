'use client'
import { useState } from "react";
import HeaderExam from "@/components/page/exam/examPin/header";
import { InputPin } from "@/components/page/exam/examPin/inputPin";
import { NavSub } from "@/components/page/exam/examPin/navigate";
import { ButtonState } from "@/types/exam";
import { api } from "@/lib/api";

export function ExamPin({ examId }: { examId: string }){
    const [loading, setLoading] = useState<boolean>(false)
    const data = {
        name: "Exam 1 : Array",
        publicDate: "12 May 2025 to 12 May 2025",
        examTime: "09:00 - 12.00 hr",
        examDuration: "180 minutes",
        score: 0,
        maxScore: 30,
    }
    
    const onSubmit = async (formData: { examCode: string }) => {
        if (loading) return;

        try {
            setLoading(true);
            api.exam.checkin(examId, formData.examCode)
            console.log("✅ submit success");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    
    const handleQrClick = () => {
        console.log("Opening QR scanner for exam:", examId)
    }
    
    return(
        <div className="px-4 md:px-8 py-8">
            <NavSub/>
            <div className="px-0 md:px-5 py-4 mt-2 flex items-center flex-col gap-10">
                <div className="w-full lg:w-5/6">
                    <HeaderExam 
                        dataExam={data} 
                        state={ButtonState.START} 
                        onClick={() => console.log("awddw")}
                    />
                </div>
                <div className="w-full flex justify-center">
                    <InputPin 
                        onSubmit={onSubmit}
                        onClickQr={handleQrClick}
                        passLength={6}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    )
}