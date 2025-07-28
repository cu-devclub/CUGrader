import { SupportedLanguage } from "@/lib/api/type";

// TODO: extract this to seperated file
export function getMonacoLanguageId(languageId: number) {
  // TODO: properly implement this
  return "python";
}

export function getFileExtension(language: SupportedLanguage) {
  // TODO: properly implement this
  return "py";
}