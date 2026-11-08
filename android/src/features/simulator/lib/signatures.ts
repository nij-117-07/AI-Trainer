// src/features/simulator/lib/signatures.ts
/**
 * Ax signatures for the Simulator run and chat. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/simulator/services.py.
 */
import { f } from "@ax-llm/ax";
import { SITUATIONAL_CHAT_DESCRIPTIONS, SITUATION_SIMULATOR_DESCRIPTIONS } from "./signature-descriptions";

const simulator = SITUATION_SIMULATOR_DESCRIPTIONS;
const chat = SITUATIONAL_CHAT_DESCRIPTIONS;

export const situationSimulatorSignature = f()
  .description(simulator.instruction)
  .input("systemPrompt", f.string(simulator.inputs.systemPrompt))
  .input("scenario", f.string(simulator.inputs.scenario))
  .input("userInput", f.string(simulator.inputs.userInput))
  .input("additionalContext", f.string(simulator.inputs.additionalContext).optional())
  .input("seedUuid", f.string(simulator.inputs.seedUuid))
  .output("thoughtProcess", f.string(simulator.outputs.thoughtProcess))
  .output("chosenAction", f.string(simulator.outputs.chosenAction))
  .output("responseDialogue", f.string(simulator.outputs.responseDialogue))
  .output("emotionalState", f.string(simulator.outputs.emotionalState))
  .build();

export const situationalChatSignature = f()
  .description(chat.instruction)
  .input("systemPrompt", f.string(chat.inputs.systemPrompt))
  .input("scenario", f.string(chat.inputs.scenario))
  .input("chatHistory", f.string(chat.inputs.chatHistory))
  .input("userInput", f.string(chat.inputs.userInput))
  .output("thought", f.string(chat.outputs.thought))
  .output("dialogue", f.string(chat.outputs.dialogue))
  .build();
