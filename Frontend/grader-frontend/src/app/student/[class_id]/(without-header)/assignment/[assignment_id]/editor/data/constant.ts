import { SupportedLanguage } from "@/lib/api/type";

// TODO: extract this to seperated file
export function getMonacoLanguageId(language: SupportedLanguage) {
  // TODO: properly implement this
  return "typescript";
}

export function getFileExtension(language: SupportedLanguage) {
  // TODO: properly implement this
  return "ts";
}