import type { PublicTestcaseResult, SecretTestcaseResult } from "@/lib/api/type";

export type UISavingStatus = "saving" | "unsaved" | "saved";

export type UISubmissionStatus = "submitted" | "outdated" | "not-yet";

export interface UIEditorFile {
  id: string;
  name: string;
  language: string;
}

export interface UICustomTestcase {
  input: string;
  output?: string;
}

export interface UIPublicTestcase {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  status: "pass" | "fail" | "pending" | "not-executed";
  message?: string;
}

export interface UISecretTestcase {
  status: "pass" | "fail" | "pending" | "not-executed";
  message?: string;
}

export interface UIQuestionDetail {
  id: number;
  number: number;
  name: string;
  description: string;
  maxScore: number;
}
