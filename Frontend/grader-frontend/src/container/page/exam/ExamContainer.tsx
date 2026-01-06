import { ExamPin } from "./examPin";

export default function ExamContainer({ examId }: {examId:string}){
    return(
        <div>
            <ExamPin examId={examId}/>
        </div>
    )
}