import User from "../models/userModel.js";

export const handleWrongAnswer = async (status, user_id, io) => {
  const user = await User.findById({_id: user_id});
  user.wrongAnswers.push(status);
  await user.save();
  const lifepointsCurrent = 3 - user.wrongAnswers.length
  const data = {
    username: user.username,
    id: user.id,
    role: user.role,
    score: user.score,
    highscore: user.record,
    locked: user.locked, 
    lockExpires: user.lockExpires, 
  };
  io.emit('points', lifepointsCurrent); 
  io.emit('userdata', data);
  }
