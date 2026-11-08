import { DEFAULT_SETUP_FORM } from "../options";
import { validateSetup } from "./validate";

describe("validateSetup", () => {
  it("accepts the default setup and converts the duration to a number", () => {
    const setup = validateSetup(DEFAULT_SETUP_FORM);
    expect(setup.candidateName).toBe("Asha");
    expect(setup.durationMinutes).toBe(60);
    expect(setup.maxQuestions).toBe(8);
    expect(setup.positionCompany).toBe("");
  });

  it("trims text fields", () => {
    const setup = validateSetup({ ...DEFAULT_SETUP_FORM, candidateName: "  Ravi  " });
    expect(setup.candidateName).toBe("Ravi");
  });

  it("requires the candidate name and target role", () => {
    expect(() => validateSetup({ ...DEFAULT_SETUP_FORM, candidateName: " " })).toThrow("Enter the candidate's name");
    expect(() => validateSetup({ ...DEFAULT_SETUP_FORM, positionRole: "" })).toThrow("Enter the target role");
  });

  it("rejects text over the webui limits", () => {
    expect(() => validateSetup({ ...DEFAULT_SETUP_FORM, candidateExperience: "x".repeat(1001) })).toThrow(
      "Keep this under 1000 characters.",
    );
  });

  it("keeps the question count from 1 to 50", () => {
    expect(() => validateSetup({ ...DEFAULT_SETUP_FORM, maxQuestions: 0 })).toThrow("Max questions");
    expect(() => validateSetup({ ...DEFAULT_SETUP_FORM, maxQuestions: 51 })).toThrow("Max questions");
    expect(validateSetup({ ...DEFAULT_SETUP_FORM, maxQuestions: 50 }).maxQuestions).toBe(50);
  });

  it("keeps the duration from 5 to 480 whole minutes", () => {
    expect(() => validateSetup({ ...DEFAULT_SETUP_FORM, durationMinutes: "4" })).toThrow("Duration");
    expect(() => validateSetup({ ...DEFAULT_SETUP_FORM, durationMinutes: "" })).toThrow("Duration");
    expect(() => validateSetup({ ...DEFAULT_SETUP_FORM, durationMinutes: "30.5" })).toThrow("Duration");
    expect(validateSetup({ ...DEFAULT_SETUP_FORM, durationMinutes: " 480 " }).durationMinutes).toBe(480);
  });

  it("rejects an unknown seniority level", () => {
    expect(() => validateSetup({ ...DEFAULT_SETUP_FORM, positionLevel: "wizard" })).toThrow("seniority level");
  });
});
