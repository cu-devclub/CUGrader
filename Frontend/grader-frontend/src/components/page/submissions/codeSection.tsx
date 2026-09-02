'use client'
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";

export function CodeSection({code, setCode, language}:{code:string, setCode:(data:string) => void, language:string}) {
    return (
        <div className="space-y-2 w-full">
            <div className="flex justify-end">
                <Button size={"sm"} variant={"outline"}>
                    {language}
                </Button>
            </div>
            <div className="border rounded-lg overflow-hidden w-auto">
                <Editor
                    height="400px"
                    defaultLanguage={language}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="light"
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: "on",
                    }}
                />
            </div>
        </div>
    );
}