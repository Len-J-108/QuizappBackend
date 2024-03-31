import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { issueJwt, verifyJwt } from "../helpers/jwt.js";
import { updateScoreIfUserStopped } from "../middleware/ScoreController.js";
import { handleWrongAnswer } from "../middleware/WrongAnswer.js";

export const getUser = async (req, res) => {
  res.status(200).send("inside getUser");
};

export const getAllUsers = async (req, res) => {
  try {
    const response = await User.find({ role: "player" }).select(
      "username record"
    );
    res.status(200).json(response);
  } catch (err) {
    res.status(500).json("Something went wrong");
  }
};

export const register = async (req, res) => {
  const { username, email, pw } = req.body;
  try {
    const existingAccount = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (!existingAccount) {
      const salt = await bcrypt.genSalt();
      const hashedPw = await bcrypt.hash(pw, salt);

      const newUser = new User({
        username,
        email,
        pw: hashedPw,
      });
      await newUser.save();
      res.status(201).json({ message: "Registration successfull!" });
    } else if (existingUsername) {
      res.status(400).json({ message: "Username already in use!" });
    } else {
      res.status(400).json({ message: "Email already in use!" });
    }
  } catch (error) {
    res.status(501).json({ message: "Something went wrong", error });
  }
};

export const login = async (req, res) => {
 try {
   const { username, pw } = req.body;
   if (!username || !pw) throw new Error("Missing input"); // check req.body
   const user = await User.findOne({ username }); // find user in DB
   const checkPassword = await bcrypt.compare(pw, user.pw); // vergleiche Passwörter
   if (!user || !checkPassword)
   throw new Error("Username or passwort is wrong");
  // token erstellen
  const token = issueJwt({
    username: user.username,
    id: user._id,
    role: user.role,
  });
  console.log(`${user.username} logged in.`)

  //set livepoints with socketio
  const io = req.app.get('socketio');
  const points = 3 - user.wrongAnswers.length;
  io.emit('points', points); 

  return res
  .cookie("jwt", token, {
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
        httpOnly: true,
      })
      .json({ login: "Logged in,", username }); // Ende response
  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt").status(200).json({ logout: true });
  } catch (error) {
    res.status(500).send(error);
  }
};

export const updateScore = async (req, res) => {
  const { username, score } = req.body;
  const user = await User.findOne({ username });
  try {
    if (!user) {
      return res.status(400).json({ message: "Account does not exist" });
    } else if (score === 0) {
      return res.status(406).json({ message: "No points added!" });
    }
    user.score += +score;
    await user.save();
    return res.status(200).json({ message: "Points updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: `${error}` });
  }
};

export const getUserData = async (req, res) => {
  const { username } = req;
  const user = await User.findOne({ username });
  const io = req.app.get('socketio'); // socket io connection
  try {
    if (!user) {
      return res.status(404).json({ message: "Account does not exist" });
    }
    const data = {
      username: req.username,
      id: req.id,
      role: req.role,
      score: user.score,
      highscore: user.record,
      locked: user.locked, 
      lockExpires: user.lockExpires, 
    };
    const lifepointsCurrent = 3 - user.wrongAnswers.length
    io.emit('userdata', data); // send userData with socketIO
    io.emit('points', lifepointsCurrent);  // send lifepoints with socketIO
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json("Something went wrong");
  }
};

export const userStopped = async (req, res) => { 
  const io = req.app.get('socketio'); // socket io connection
  const token = req.cookies.jwt;
  const decodedToken = verifyJwt(token); // Entschlüsseln Sie das JWT-Token mit der verifyJwt-Funktion
  const user_id = decodedToken.id;
  const question_id = req.body.question_id;
  const score = await updateScoreIfUserStopped(question_id, user_id);
  if (decodedToken.role === "player") {
    handleWrongAnswer({ status: "Round ended" }, user_id, io);
  }
  res.json({ setPoints: true, points: score });
};

export const timeOver = async (req, res) => { 
  const io = req.app.get('socketio'); // socket io connection
  const { id, role } = req;
  if (role === "player") {
    handleWrongAnswer({ status: "Time is up" }, id, io);
  }
  res.json({ message: "Time is up" });
};

// Middleware for unlocking the user
export const lockManager = async (req, res, next) => {
  try {
    const { username } = req;
    const user = await User.findOne({ username });
    if (!user) throw new Error("something went wrong");
    if (user.locked) {
      const timeNow = Date.now();
      if (timeNow >= user.lockExpires) {
        user.locked = false;
        console.log(`${user.username} unlocked`);
        user.wrongAnswers = [];
        await user.save();
      }
    }
    next();
  } catch (err) {
    res.status(400).send(err.message);
  }
};
