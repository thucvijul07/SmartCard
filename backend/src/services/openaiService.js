import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateFlashcardsWithOpenAI = async (text, numCards, difficulty) => {
  const prompt = `
    As an educator developing a learning application focused on memorization, 
    your task is to generate ${numCards} flashcards based on the content provided below. 
    The difficulty level is ${difficulty}. These flashcards are intended to help learners 
    remember key facts, concepts, or ideas from the material.

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

export default { generateFlashcardsWithOpenAI };
