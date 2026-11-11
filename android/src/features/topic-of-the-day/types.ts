// src/features/topic-of-the-day/types.ts

export interface TopicOfTheDayFormValues {
  focus: string;
  level: string;
  context: string;
  customInstructions: string;
}

/** The content the model returns for one topic. */
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

export interface SavedTopic extends TopicOfTheDay {
  id: string;
  broadId: string;
  focus: string;
  createdAt: number;
}

export interface BroadTopic {
  id: string;
  name: string;
}

export interface TopicLibrary {
  broadTopics: BroadTopic[];
  topics: SavedTopic[];
}
