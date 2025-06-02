import openaiService from "../services/openaiService.js";

export const generateText = async (req, res) => {
  try {
    const { topic, textLength, gradeLevel, language } = req.body;
    if (!topic || !textLength || !gradeLevel || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const text = await openaiService.generateText({
      topic,
      textLength,
      gradeLevel,
      language,
    });
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to generate text" });
  }
};
