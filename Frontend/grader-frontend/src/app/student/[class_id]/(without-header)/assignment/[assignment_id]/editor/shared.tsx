import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PageState = "done" | "active" | "none";

interface PageItemProps {
  page: number;
  state: PageState;
  href?: string;
}

function PageItem({ page, state, href = "#" }: PageItemProps) {
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
      <PaginationLink href={href} isActive={state === "active"} className={getStateClasses(state)}>
        {page}
      </PaginationLink>
    </PaginationItem>
  );
}

// TODO: props
export function QuestionPagination() {
  const pageStates: { page: number; state: PageState; }[] = [
    { page: 1, state: "done" },
    { page: 2, state: "done" },
    { page: 3, state: "active" },
    { page: 4, state: "none" },
    { page: 5, state: "none" },
  ];

  return (
    <Pagination className="">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#" className="hover:bg-gray-100">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </PaginationLink>
        </PaginationItem>

        {pageStates.map(({ page, state }) => (
          <PageItem key={page} page={page} state={state} />
        ))}

        <PaginationItem>
          <PaginationLink href="#" className="hover:bg-gray-100">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

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