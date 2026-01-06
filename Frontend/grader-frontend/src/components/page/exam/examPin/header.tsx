'use client'
import React from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { ButtonState, HearderExam } from "@/types/exam";

function HeaderExam({dataExam, state, onClick}:HearderExam) {
    return (
        <Card className='relative overflow-hidden'>
            <div className=' absolute left-0 top-0 h-full w-2 bg-(--exam-color)'></div>
            <CardContent className=' flex  md:divide-gray-300 gap-2 md:divide-x-2 pl-10'>
                <div className='flex flex-col grow'>
                    <div>
                        <span className='text-xl sm:text-3xl font-bold'>{dataExam.name}</span>
                    </div>
                    <div className=' *:text-gray-600 *:text-xs *:sm:text-sm py-2'>
                        <p>
                            Publishing date: {dataExam.publicDate}
                        </p>
                        <p>
                            Exam time: {dataExam.examTime}
                        </p>
                        <p>
                            Duration: {dataExam.examDuration}
                        </p>
                    </div>
                    <div className='flex gap-2 items-center'>
                        <Button disabled={state === ButtonState.START} variant={`exam`} >{state}</Button>
                        <span className=' md:hidden'>{dataExam.score}/{dataExam.maxScore}</span>
                    </div>
                </div>
                <div className='w-50 hidden md:flex items-center gap-2 flex-col justify-center'>
                    <div className='relative'>
                        <span className=' absolute -top-7 left-1/2 -translate-x-1/2'>score:</span>
                        <span className='text-3xl font-bold'>{dataExam.score}/{dataExam.maxScore}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default HeaderExam