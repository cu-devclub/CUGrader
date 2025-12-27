import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { SupportedLanguage } from "@/lib/api/type";
import { SelectTrigger } from "@radix-ui/react-select";
import { useCodeSpaceStore } from "./data";
import { observer } from "mobx-react-lite";
import { cn } from "@/lib/utils";

type PageState = "done" | "active" | "none";

interface PageItemProps {
  page: number;
  state: PageState;
  onClick: () => void;
}

function PageItem({ page, state, onClick }: PageItemProps) {
  const getStateClasses = (state: PageState) => {
    switch (state) {
      case "done":
        return "p-1 bg-primary/15 hover:bg-primary/25";
      case "active":
        return "p-1 bg-primary hover:bg-primary/90 hover:text-white text-white";
      case "none":
        return "p-1 bg-gray-100 hover:bg-gray-200";
      default:
        return "p-1 bg-gray-100 hover:bg-gray-200";
    }
  };

  return (
    <PaginationItem className="">
      <PaginationLink href="#" onClick={onClick} isActive={state === "active"} className={getStateClasses(state)}>
        {page}
      </PaginationLink>
    </PaginationItem>
  );
}

export const QuestionPagination = observer(() => {
  const store = useCodeSpaceStore();
  const { lab, currentQuestionState, selectQuestion, nextQuestion, previousQuestion } = store;
  const { questions } = lab;

  const pageStates: { page: number; state: PageState; id: number; }[] = questions.map((q, i) => {
    // TODO: Implement "done" state tracking
    const state: PageState = q.id === currentQuestionState.question.id ? "active" : "none";
    return { page: i + 1, state, id: q.id };
  });

  return (
    <Pagination className="">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#" onClick={previousQuestion} className="hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>

        {pageStates.map(({ page, state, id }) => (
          <PageItem key={page} page={page} state={state} onClick={() => selectQuestion(id)} />
        ))}

        <PaginationItem>
          <PaginationLink href="#" onClick={nextQuestion} className="hover:bg-gray-100">
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
});

export interface QuestionPaginationSmallProps {
  isAtEnd: boolean,
  onNext: () => unknown;
  onPrevious: () => unknown;
}

export function QuestionPaginationSmall({ isAtEnd, onNext, onPrevious }: QuestionPaginationSmallProps) {
  return (
    <div className="flex gap-2">
      <Button size="icon" onClick={onPrevious}>
        <ChevronLeft />
      </Button>
      {isAtEnd
        ? <Button>
          Done
        </Button>
        : <Button size="icon" onClick={onNext}>
          <ChevronRight />
        </Button>
      }
    </div>
  );
}

export interface LanguageSelectorProps {
  supportedLanguages: SupportedLanguage[];
  selectedLanguageId: number;
  onLanguageChange: (languageId: number) => void;
}

export function LanguageSelector({ supportedLanguages, selectedLanguageId, onLanguageChange }: LanguageSelectorProps) {
  const selectedLanguage = supportedLanguages.find(l => l.id === selectedLanguageId);

  return (
    <Select
      value={selectedLanguageId.toString()}
      onValueChange={(value) => onLanguageChange(parseInt(value, 10))}
    >
      <SelectTrigger asChild>
        <button className="group flex items-center rounded px-1.5 hover:bg-accent/50 border gap-1 transition-colors">
          <SelectValue placeholder="Language">
            {selectedLanguage ? `${selectedLanguage.name}` : "Select Language"}
          </SelectValue>
          <ChevronDown className="size-3" />
        </button>
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang.id} value={lang.id.toString()}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


export function SubmissionStatusIndicator() {
  const store = useCodeSpaceStore();
  if (store.currentQuestionState.submissionStatus !== "submitted") {
    return null;
  }
  return (
    <span className="border border-green-500 text-green-600 bg-green-100 rounded h-fit p-0.5 px-1">
      🎉Submitted
    </span>
  );
}