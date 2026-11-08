// src/features/guess-game/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Guess Game Ax signatures. The text is copied from
 * the DSPy signatures in Backend/practice/guess_game/services.py, so both stacks give the model
 * the same guidance. The DSPy field name is noted beside each key.
 */

export const GAME_SETUP_DESCRIPTIONS = {
  instruction:
    "You are a Game Master for a guessing game. Generate a mystery item (word, phrase, movie, book, etc.) based on category and difficulty. Keep the actual answer hidden — only return it internally for tracking.",
  inputs: {
    // category
    category: "What type of thing the user will guess.",
    // difficulty
    difficulty: "Difficulty level affecting obscurity and hint quality.",
    // vocabulary_theme
    vocabularyTheme:
      "Optional theme constraint (e.g., 'sci-fi movies', 'animals', '90s slang').",
  },
  outputs: {
    // mystery_item
    mysteryItem: "The hidden answer (word/movie/sentence).",
    // hint_1
    firstHint: "First vague hint (e.g., number of letters, genre, era).",
    // fun_fact
    funFact: "A fun trivia fact about the mystery item to share after reveal.",
  },
};

export const HINT_PROVIDER_DESCRIPTIONS = {
  instruction:
    "You are a helpful hint generator for a guessing game. Provide escalating hints WITHOUT giving away the answer. Each hint should be more revealing than the last.",
  inputs: {
    // mystery_item
    mysteryItem: "The actual answer (hidden from user).",
    // category
    category: "What type of thing is being guessed.",
    // previous_hints
    previousHints: "Hints already given to avoid repetition.",
    // hint_number
    hintNumber: "Which hint we're generating (1=first, 2=second, etc.).",
  },
  outputs: {
    // new_hint
    newHint: "A fresh, increasingly revealing hint.",
    // hint_encouragement
    hintEncouragement: "An encouraging message to keep the user engaged.",
  },
};

export const GUESS_EVALUATOR_DESCRIPTIONS = {
  instruction:
    "You are the judge of a guessing game. Evaluate the user's guess against the mystery item. Provide helpful feedback that guides without confirming/revealing too much.",
  inputs: {
    // mystery_item
    mysteryItem: "The actual hidden answer.",
    // category
    category: "Type of thing being guessed.",
    // user_guess
    userGuess: "The user's attempted guess.",
    // difficulty
    difficulty: "Current difficulty level.",
  },
  outputs: {
    // is_correct
    isCorrect: "True if the guess matches (allowing minor variations).",
    // feedback
    feedback: "Feedback message — encouraging if close, guiding if wrong.",
    // closeness_score
    closenessScore: "How close the guess was (0.0 to 1.0).",
    // suggestion
    suggestion: "A subtle nudge or suggestion for the next guess (not the answer).",
  },
};

export const FAIL_GUIDE_DESCRIPTIONS = {
  instruction:
    "You are a compassionate game coach. The user is struggling. Provide guidance that helps them think differently WITHOUT spoiling the answer. Use hints, category reminders, or mental frameworks.",
  inputs: {
    // mystery_item
    mysteryItem: "The actual answer.",
    // category
    category: "What's being guessed.",
    // failed_guesses
    failedGuesses: "Previous incorrect guesses.",
    // hint_number
    hintNumber: "Current hint stage.",
  },
  outputs: {
    // coaching_message
    coachingMessage: "Encouraging guidance with fresh angle.",
    // thinking_framework
    thinkingFramework: "A mental model or approach to help them guess better.",
    // partial_reveal
    partialReveal:
      "Optional partial reveal (e.g., first letter, one word from phrase) for hard stages.",
    // ask_for_hint
    askForHint: "True if we should suggest they ask for a hint.",
  },
};
