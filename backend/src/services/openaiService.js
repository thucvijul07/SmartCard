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

---

${text}

---

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

export default {
  generateFlashcardsWithOpenAI,
  generateQuizzesWithOpenAI,
};
