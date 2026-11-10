// src/features/topic-of-the-day/types.ts

export interface TopicOfTheDayFormValues {
  subject: string;
  level: string;
  context: string;
  customInstructions: string;
}

export interface TopicOfTheDay {
  date: string;
  title: string;
  whyItMatters: string;
  keyIdeas: string[];
  explanation: string;
  workedExample: string;
  starterQuestion: string;
  tryToday: string;
}
