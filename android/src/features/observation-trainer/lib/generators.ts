// src/features/observation-trainer/lib/generators.ts
/**
 * Observation Trainer pipeline: describe the image, score the user's observations, and optionally
 * reveal missed details. Mirrors run_training in Backend/practice/observation_trainer/services.py.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ImageInput } from "@/lib/image";
import type { HiddenDetailsSummary, ImageCandidate, ObservationFormValues, ObservationTrainResult } from "../types";
import { analysisFromModel, evaluationFromModel, hiddenFromModel, normalizeSearchQuery } from "./normalize";
import { searchCommonsImages } from "./image-search";
import {
  hiddenDetailsRevealerSignature,
  imageDescriberSignature,
  imageSearchQuerySignature,
  observationEvaluatorSignature,
} from "./signatures";
import {
  CONTEXT_MAX,
  FOCUS_MAX,
  IMAGE_REQUIREMENTS_MAX,
  OBSERVATIONS_MAX,
  SCENARIO_MAX,
  optionalText,
  requireImage,
  requireText,
} from "./validate";

const TEMPERATURE = 0.3;
const SEARCH_RESULT_LIMIT = 8;

export interface ImageSearchResult {
  query: string;
  candidates: ImageCandidate[];
}

/** Turns the user's picture description into a search query, then searches for matching photos. */
export async function findObservationImages(
  settings: AiSettings,
  requirements: string,
  signal?: AbortSignal,
): Promise<ImageSearchResult> {
  const imageRequirements = requireText(requirements, "Image description", IMAGE_REQUIREMENTS_MAX);
  throwIfCancelled(signal);
  const llm = createLlm(settings);
  const raw = await ax(imageSearchQuerySignature).forward(
    llm,
    { imageRequirements },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  const query = normalizeSearchQuery(raw);
  throwIfCancelled(signal);
  const candidates = await searchCommonsImages(query, SEARCH_RESULT_LIMIT);
  if (candidates.length === 0) {
    throw new Error(`No photos found for "${query}". Try describing the picture in other words.`);
  }
  return { query, candidates };
}

export interface TrainingRequest {
  form: ObservationFormValues;
  image: ImageInput | null;
}

export async function trainObservation(
  settings: AiSettings,
  request: TrainingRequest,
  signal?: AbortSignal,
): Promise<ObservationTrainResult> {
  const image = requireImage(request.image);
  const { form } = request;
  const trainingScenario = requireText(form.trainingScenario, "Training scenario", SCENARIO_MAX);
  const userObservations = requireText(form.userObservations, "Your observations", OBSERVATIONS_MAX);
  const contextCategory = optionalText(form.contextCategory, "Context category", CONTEXT_MAX);
  const trainingFocus = optionalText(form.trainingFocus, "Training focus", FOCUS_MAX);

  throwIfCancelled(signal);
  const llm = createLlm(settings);
  const sourceImage = { mimeType: image.mimeType, data: image.base64 };
  const options = { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal };

  const description = await ax(imageDescriberSignature).forward(
    llm,
    { sourceImage, scenarioContext: contextCategory },
    options,
  );
  const imageAnalysis = analysisFromModel(description);
  throwIfCancelled(signal);

  const evaluation = await ax(observationEvaluatorSignature).forward(
    llm,
    {
      sourceImage,
      imageDescription: imageAnalysis.groundTruthDescription,
      userObservations,
      trainingScenario,
      contextCategory,
    },
    options,
  );
  throwIfCancelled(signal);

  let hiddenDetails: HiddenDetailsSummary | null = null;
  if (form.revealHidden) {
    const revealed = await ax(hiddenDetailsRevealerSignature).forward(
      llm,
      {
        sourceImage,
        imageDescription: imageAnalysis.groundTruthDescription,
        userObservations,
        trainingScenario,
        trainingFocus,
      },
      options,
    );
    hiddenDetails = hiddenFromModel(revealed);
    throwIfCancelled(signal);
  }

  return {
    trainingScenario,
    imageAnalysis,
    evaluation: evaluationFromModel(evaluation),
    hiddenDetails,
  };
}

function throwIfCancelled(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error("Training cancelled.");
}
