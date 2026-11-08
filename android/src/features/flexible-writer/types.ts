// src/features/flexible-writer/types.ts
/** Form values and result shape for the Flexible Writer tool. */

export interface FlexibleWriterFormValues {
  systemPrompt: string;
  inputData: string;
  additionalUserInput: string;
}

export interface FlexibleWriterResult {
  answerMessage: string;
  updatedData: string;
}
