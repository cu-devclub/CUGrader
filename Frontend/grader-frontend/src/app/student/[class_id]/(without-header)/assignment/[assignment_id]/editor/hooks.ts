import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { CodeFile } from "./editor";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseSubmitCodeOptions {
  questionId: number;
  languageId: number;
  getCodes: () => CodeFile[];
  autosave?: boolean;
}

export function useSubmitCode(options: UseSubmitCodeOptions) {
  const [lastEdited, setLastEdited] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const startSavingTimestamp = useRef(0);
  const autosaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSaved = lastEdited === null || (lastSaved !== null && lastSaved >= lastEdited);

  const mutation = useMutation({
    mutationFn: async () => {
      const codes = options.getCodes();
      await api.questions.submit(options.questionId, options.languageId, codes.map(it => ({
        content: it.content,
        pageName: it.name
      })));
    },
    onError(error, variables, context) {
      // TODO: 
    },
    onMutate(variables) {
      startSavingTimestamp.current = Date.now();
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    },
    onSuccess(data, variables, context) {
      setLastSaved(startSavingTimestamp.current);
    },
  });

  const notifyChange = useCallback(() => {
    setLastEdited(Date.now());
  }, []);

  useEffect(() => {
    if (!options.autosave || isSaved) {
      return;
    }

    autosaveTimeout.current = setTimeout(() => {
      mutation.mutate();
    }, 10000);

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [lastEdited, isSaved, options.autosave, mutation]);


  return { mutation, notifyChange, isSaved, isSaving: mutation.isPending, save: mutation.mutate };
}

interface UseRequestGradeOptions {

}

export function useRequestGrade(options: UseRequestGradeOptions) {
  
}