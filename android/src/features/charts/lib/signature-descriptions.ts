// src/features/charts/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Chart.js Generator Ax signature. The text is copied
 * from ChartJSGenerator in Backend/tools/charts/services.py, so both stacks give the model the same
 * guidance. The DSPy field name is noted beside each key.
 */

export const CHART_DESCRIPTIONS = {
  instruction: `You are an expert Data Visualizer. Your task is to generate clean, responsive
Chart.js code embedded within a <div> container. Chart.js is already installed
via npm.

Rules:
- Use the provided data to populate the chart.
- If 'previous_code' is provided, refactor or update it based on 'custom_instructions'.
- Ensure the output includes the <canvas> element and the <script> block.`,
  inputs: {
    // custom_instructions
    customInstructions: "User preferences for chart type, colors, or labels.",
    // data_input
    dataInput: "The raw data (JSON, CSV, or text) to be visualized.",
    // previous_code
    previousCode: "Existing Chart.js code to modify.",
  },
  outputs: {
    // answer_message
    answerMessage: "A brief explanation of the chart created and how to use it.",
    // chart_div_code
    chartDivCode: "The full HTML/JS code block containing the <div>, <canvas>, and Chart.js logic.",
  },
};
