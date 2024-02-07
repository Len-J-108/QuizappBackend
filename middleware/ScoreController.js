import User from "../models/userModel.js";
import { Quest } from "../models/questModel.js";

export const checkQuestionLevel = async (quest_id, user_id) => {
  const findAndUpdateUser = async(points) => {
    const user = await User.findById(user_id);
    if (!user) {
      return console.log("Benutzer nicht gefunden");
    } else {
      user.score += +points;
      await user.save();
      console.log(`${points} Punkte dem Acoount ${user.username} hinzugefügt`);
    }
  }
  const question = await Quest.findById(quest_id);
  if (question.level >= 4 && question.level <=6) {
    findAndUpdateUser(4)
  } else if (question.level >= 7 && question.level <= 8) {
    findAndUpdateUser(8)
  } else if (question.level === 9) {
    findAndUpdateUser(10)
  }
};

export const updateScoreIfUserStopped = async (quest_id, user_id) => {
  const question = await Quest.findById(quest_id);
  const score = question.level + 1;
  const user = await User.findById(user_id);
  if (!user) {
    return console.log("Benutzer nicht gefunden");
  } else {
    user.score += +score;
    await user.save();
    return score;
  }
};
