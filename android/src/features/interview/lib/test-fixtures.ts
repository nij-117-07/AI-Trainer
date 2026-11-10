// src/features/interview/lib/test-fixtures.ts
/** A complete setup form for tests. The app starts with empty text fields, so tests need filled values. */
import { DEFAULT_SETUP_FORM } from "../options";
import type { InterviewSetupForm } from "../types";

export const SAMPLE_SETUP_FORM: InterviewSetupForm = {
  ...DEFAULT_SETUP_FORM,
  candidateName: "Asha",
  candidateExperience: "3 years building backend services",
  candidateSkills: "Python, FastAPI, PostgreSQL, AWS",
  positionRole: "Senior Backend Engineer",
  positionSkills: "Python, AWS, Distributed systems",
  interviewerRole: "Tech Lead",
  interviewFormat: "60 min live",
};
