export { QuestionState, type CustomTestcase, type EditorFile, type UiCustomTestcase } from './store-2';
import type { StudentAssignmentDetails } from '@/lib/api/type';
import { makeAutoObservable } from 'mobx';
import { MonacoWrapper } from './monaco';
import { QuestionState } from './store-2';

export class CodeSpaceStore {
  lab: StudentAssignmentDetails;
  // TODO: make lab replacable
  cachedQuestionStates = new Map<number, QuestionState>();
  currentQuestionState!: QuestionState;

  public monaco = new MonacoWrapper();

  constructor(lab: StudentAssignmentDetails) {
    this.lab = lab;
    if (lab.questions.length > 0) {
      this.selectQuestion(lab.questions[0].id);
    } else {
      console.error("No questions found for this assignment");
    }

    makeAutoObservable(this);
  }


  // TODO: wait until saved or show a dialog
  selectQuestion = (questionId: number) => {
    // TODO: this is not working in prod for some fucking reason
    console.log(`Select question ${questionId}`);
    // this.currentQuestionState.dispose();

    const existing = this.cachedQuestionStates.get(questionId);
    if (existing) {
      this.currentQuestionState = existing;
      existing.focus();
      return;
    }

    const question = this.lab.questions.find((q: any) => q.id === questionId);
    if (question) {
      this.currentQuestionState = new QuestionState(question, this.lab, this.monaco);
      this.cachedQuestionStates.set(questionId, this.currentQuestionState);
    }
  };

  get currentQuestionIndex() {
    return this.lab.questions.findIndex((q: any) => q.id === this.currentQuestionState.question.id);
  }

  nextQuestion = () => {
    const currentIndex = this.currentQuestionIndex;
    if (currentIndex < this.lab.questions.length - 1) {
      this.selectQuestion(this.lab.questions[currentIndex + 1].id);
    }
  };

  previousQuestion = () => {
    const currentIndex = this.currentQuestionIndex;
    if (currentIndex > 0) {
      this.selectQuestion(this.lab.questions[currentIndex - 1].id);
    }
  };

}
