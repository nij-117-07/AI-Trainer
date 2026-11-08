// src/features/charts/types.ts

export interface ChartFormValues {
  dataInput: string;
  customInstructions: string;
  previousCode: string;
}

export interface ChartResult {
  answerMessage: string;
  chartDivCode: string;
}

export interface ChartVersion {
  code: string;
  savedAt: string;
}
