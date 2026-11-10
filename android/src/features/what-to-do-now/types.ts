// src/features/what-to-do-now/types.ts

export interface WhatToDoNowFormValues {
  goals: string;
  dateTime: string;
  situation: string;
  extraInfo: string;
}

export interface NextAction {
  action: string;
  goal: string;
  reason: string;
  minutes: number | null;
}

export interface WhatToDoNowResult {
  timeContext: string;
  doNow: NextAction[];
  avoid: string[];
  nextCheckpoint: string;
}

export interface WhatToDoNowDraft {
  form: WhatToDoNowFormValues;
  result: WhatToDoNowResult | null;
}
