'use client'
import React from 'react'
import Editor, { useMonaco } from '@monaco-editor/react';
import { useCodeSpaceStore } from '@/app/student/[class_id]/(without-header)/assignment/[assignment_id]/editor/data';

interface EditorInterFace{
    fontSize?: number;
    autoComplete?: boolean;
    minimap?: boolean;
}

export function CoverEditor({fontSize = 14, autoComplete = true, minimap = false}: EditorInterFace) {
    const store = useCodeSpaceStore();
    const { savingStatus, activeFile, save, replaceEditorContentWithFile, copy, reset, download, run } = store.currentQuestionState;
    return (
        <Editor
          // key={`${store.lab.id}/${store.currentQuestionState.question.id}`}
            path={activeFile.id}
            options={{
                automaticLayout: true,
                cursorBlinking: 'expand',
                minimap: { enabled: false },
                fontSize: 14,
                // suggest: { 
                //   showIcons: false,
                //   showWords: false, 
                // },
                quickSuggestions: false,
                suggestOnTriggerCharacters: false,
                wordBasedSuggestions: "off", // Can be "off", "currentDocument", or "allDocuments"
                suggest: {
                snippetsPreventQuickSuggestions: false, // From your linked doc
                filterGraceful: false,
                showWords: false,
                showSnippets: false,
                },
                codeLens: false,
                smoothScrolling: true,
            }}
            defaultLanguage={activeFile.language}
            defaultValue={activeFile.content}
        />
    )
}