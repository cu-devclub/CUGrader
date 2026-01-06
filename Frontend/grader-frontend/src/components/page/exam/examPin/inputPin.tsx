'use client'
import { useMemo } from "react";
import { Button } from "@/components/ui/button"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { ScanLine } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';

interface InputPin{
    onClickQr?: () => void;
    onSubmit?: (data: { examCode: string }) => void;
    passLength?: number;
    loading: boolean;
}

interface FormData {
    examCode: string;
}

export function InputPin({ onClickQr, onSubmit, passLength = 6, loading }: InputPin){
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            examCode: ''
        }
    });


    const onFormSubmit = (data: FormData) => {
        if (data.examCode.length === passLength) {
            onSubmit?.(data);
        }
    };

    return(
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col items-center gap-4">
            <div>Enter exam code</div>
            <div>
                <Controller
                    name="examCode"
                    control={control}
                    rules={{ 
                        required: 'Exam code is required',
                        minLength: {
                            value: passLength,
                            message: `Exam code must be ${passLength} characters`
                        }
                    }}
                    render={({ field }) => (
                        <InputOTP 
                            maxLength={passLength} 
                            value={field.value}
                            onChange={field.onChange}
                        >
                            <InputOTPGroup>
                                {Array.from({ length: passLength }).map((_, index) => (
                                    <InputOTPSlot key={index} index={index} />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    )}
                />
                {errors.examCode && (
                    <p className="text-sm text-red-500 mt-2">{errors.examCode.message}</p>
                )}
            </div>
            <div>
                <Button type="submit" disabled={loading} variant="exam">
                    {loading ? "Checking..." : "Check in"}
                </Button>
            </div>
            <div>
                <Button 
                    type="button"
                    className="h-14" 
                    variant="outline"
                    onClick={onClickQr}
                >
                    Or scan QR code
                    <ScanLine className="ml-2" />
                </Button>
            </div>
        </form>
    )
}