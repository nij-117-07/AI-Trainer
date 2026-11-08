// src/features/riddle/types.ts

export interface RiddleFormValues {
  fieldOfInterest: string;
  targetDomain: string;
  difficultyLevel: string;
}

export interface RiddleContent {
  riddleText: string;
  solution: string;
  cognitiveTrigger: string;
}

export interface RiddleEvaluation {
  isCorrect: boolean;
  feedback: string;
  thoughtRedirection: string;
}

export interface RiddleAttempt {
  answer: string;
  evaluation: RiddleEvaluation;
}

/** The guess-until-correct round kept on the device between visits. */
export interface RiddleRound {
  riddle: RiddleContent;
  attempts: RiddleAttempt[];
  userAnswer: string;
}
