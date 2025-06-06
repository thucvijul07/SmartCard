import { submitQuizAttemptService } from "../services/quizAttemptService.js";
import { getQuizResultBySetService } from "../services/quizAttemptService.js";

const submitQuizAttempt = async (req, res) => {
  try {
    const user_id = req.user._id || req.user.id;
    const { quiz_set_id, answers } = req.body;

    const result = await submitQuizAttemptService(
      user_id,
      quiz_set_id,
      answers
    );

    res.status(201).json({
      isSuccess: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({ isSuccess: false, message: error.message });
  }
};

const getQuizResultBySet = async (req, res) => {
  try {
    const user_id = req.user._id || req.user.id;
    const { quiz_set_id } = req.params;
    const result = await getQuizResultBySetService(user_id, quiz_set_id);
    res.status(200).json({ isSuccess: true, ...result });
  } catch (error) {
    res.status(400).json({ isSuccess: false, message: error.message });
  }
};

export { submitQuizAttempt, getQuizResultBySet };
