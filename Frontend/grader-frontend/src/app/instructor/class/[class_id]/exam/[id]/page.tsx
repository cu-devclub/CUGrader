import ExamContainer from "@/container/page/exam/ExamContainer";

export default async function Page({ params }: { params: Promise<{ id:string }> }){
    const { id } = await params;
    return(
        <ExamContainer examId={id}/>
    )
}