import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateFlashcardsWithOpenAI = async (text, numCards, difficulty) => {
  const prompt = `
As an educator developing a learning application focused on memorization, 
***if the text is meaningless, please return an empty array.***
Your task is to generate ${numCards} flashcards based on the content provided below. 
The difficulty level is ${difficulty}. These flashcards are intended to help learners 
remember key facts, concepts, or ideas from the material.
If the text is too long, please summarize it to fit the flashcards.
---

${text}
---

Output format (in JSON):
[
    {
        "question": "Question 1",
        "answer": "Answer 1"
    },
    {
        "question": "Question 2",
        "answer": "Answer 2"
    }
]
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in creating flashcards",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    const flashcards = JSON.parse(content);
    return flashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards. Please try again.");
  }
};

const generateQuizzesWithOpenAI = async (text, numQA, difficulty) => {
  const prompt = `
As an educator developing a learning application focused on memorization, 
***If the text is meaningless or lacks context for meaningful questions, please return an empty array.***

Your task is to generate ${numQA} multiple-choice quizzes based on the content provided below. 
The difficulty level is "${difficulty}". These quizzes are designed to help learners remember key facts, 
concepts, or ideas from the material. If the text is too long, please summarize it to fit the quizzes.

Each quiz should include:
- a "question"
- four "options" (A, B, C, D)
- the correct option letter as "correctAnswer"
- an "explanation" that briefly explains why the correct answer is right
- Use the same language as text (e.g., if text are in Vietnamese, generate questions in Vietnamese).
Please return ONLY a valid JSON array of quiz objects, no explanation, no markdown, no extra text.
---

${text}

---
Make sure **every question includes all 4 fields**.
Output format (in JSON):
[
  {
    "question": "Which of the following is true about ...?",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "correctAnswer": "B"
    "explanation": "Option B is correct because ..."
  },
  {
    "question": "What is the function of ...?",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "correctAnswer": "C"
    "explanation": "Option B is correct because ..."
  }
]
  Strictly output valid JSON. Do not omit any commas or quotes.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in creating quizzes",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    const quizzes = JSON.parse(content);
    return quizzes;
  } catch (error) {
    console.error("Error generating quizzes:", error);
    throw new Error("Failed to generate quizzes. Please try again.");
  }
};

const generateText = async ({ topic, textLength, gradeLevel, language }) => {
  const prompt = `
Generate a ${textLength} word text for a ${gradeLevel} grade level student in ${language} about the topic: ${topic}.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that writes educational texts.",
        },
        { role: "user", content: prompt },
      ],
    });

    const generatedText = response.choices[0].message.content;
    return generatedText;
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate text. Please try again.");
  }
};

const generateQuizzesFromCards = async (flashcards) => {
  if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0)
    return [];
  const text = flashcards
    .map((c, i) => `${i + 1}. Q: ${c.question}\nA: ${c.answer}`)
    .join("\n");
  const prompt = `Below is a set of flashcards, each consisting of a question and an answer .
Your task is to generate multiple-choice quiz questions based on these flashcards. Requirements:
- Generate 1 to 2 questions per flashcard.
Each quiz should include:
- a "question"
- four "options" (A, B, C, D)
- the correct option letter as "correctAnswer"
- an "explanation" that briefly explains why the correct answer is right
- Use the same language as the flashcards (e.g., if flashcards are in Vietnamese, generate questions in Vietnamese).
Please return ONLY a valid JSON array of quiz objects, no explanation, no markdown, no extra text.

Flashcards:
${text}

---
Make sure **every question includes all 4 fields**.
Output format (in JSON):
[
  {
    "question": "Which of the following is true about ...?",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "correctAnswer": "B"
    "explanation": "Option B is correct because ..."
  },
  {
    "question": "What is the function of ...?",
    "options": {
      "A": "Option A",
      "B": "Option B",
      "C": "Option C",
      "D": "Option D"
    },
    "correctAnswer": "C"
    "explanation": "Option B is correct because ..."
  }
]
  Strictly output valid JSON. Do not omit any commas or quotes.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "Bạn là AI chuyên tạo câu hỏi trắc nghiệm từ flashcard.",
        },
        { role: "user", content: prompt },
      ],
    });
    const content = response.choices[0].message.content;
    const quizzes = JSON.parse(content);
    return quizzes;
  } catch (error) {
    console.error("Error generating quizzes from cards:", error);
    throw new Error("Failed to generate quizzes from cards. Please try again.");
  }
};

export default {
  generateFlashcardsWithOpenAI,
  generateQuizzesWithOpenAI,
  generateText,
  generateQuizzesFromCards,
};
