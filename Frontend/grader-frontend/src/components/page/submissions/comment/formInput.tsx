'use client'
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface FeedbackFormData {
    comment: string
}

interface FormInputCommentProps {
    onSubmit: (data: FeedbackFormData) => Promise<void> | void
}

export function FormInputComment({ onSubmit }: FormInputCommentProps) {
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting },
        reset 
    } = useForm<FeedbackFormData>()

    const handleFormSubmit = async (data: FeedbackFormData) => {
        try {
            await onSubmit(data)
            reset()
        } catch (error) {
            console.error('Error submitting feedback:', error)
        }
    }

    return(
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 items-start">
            <span className="font-bold">Give feedback to student</span>
            <div className="w-full md:w-100">
                <Textarea 
                    {...register("comment", { 
                        required: "Feedback is required",
                        minLength: {
                            value: 10,
                            message: "Feedback must be at least 10 characters"
                        }
                    })}
                    className="w-full min-h-30" 
                    placeholder="Comment..." 
                />
                {errors.comment && (
                    <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
                )}
            </div>
            <div className="flex w-full justify-end md:justify-start">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send feedback"}
                </Button>
            </div>
        </form>
    )
}

export type { FeedbackFormData }