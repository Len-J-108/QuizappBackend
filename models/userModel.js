import mongoose from "mongoose";

// Funktion für Email validierung
var validateEmail = function (email) {
  var regexPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regexPattern.test(email);
};
// Funktion für Livepointsarray länge

const wrongAnswersSchema = mongoose.Schema(
    {
      status:String
    },
);
// User Modell
const userModel = mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      minLength: [3, "Username muss mindestens 3 Zeichen lang sein"],
      required: true,
    },
    email: {
      type: String,
      required: [true, "Eine Email muss angegeben werden"],
      lowercase: true,
      unique: true,
      validate: [validateEmail, "Bitte gebe eine gültige Email ein"],
    },
    pw: {
      type: String,
      required: [true, "Ein Passwort muss angegeben werden"],
      minLength: [8, "Das Passwort muss mindestens 8 Zeichen lang sein"],
      maxLength: [120, "Das Passwort kann höchstens 120 Zeichen lang sein"],
    },
    role: {
      type: String,
      required: true,
      enum: { values: ["player", "admin"] },
      default: "player",
    },
    score: {
      type: Number,
      min: 0,
      default: 0,
    },
    record: {
      type: Number,
      min: 0,
      default: 0,
    },
    wrongAnswers: [wrongAnswersSchema],
    locked: {
      type: Boolean,
      default: false,
    },
    lockExpires: {
      type: Date,
      default: new Date
    }
  },
  { timestamps: true }
);

// HighScore
userModel.pre('save', async function(next) {
  const user = this;
  if (user.score > user.record) {
    user.record = user.score;
    }
  next();
})
// Lock when Wrongsanswers is full
userModel.pre('save', async function(next) {
  const user = this;
  if (!user.locked){
    if (user.wrongAnswers.length >= 3) {
  
      // const lockedUntil = new Date().getTime() + 2 * 60 * 60 * 1000; // 2 Hours
      const lockedUntil = Date.now() + 60 * 20 * 1000; // 20 minutes
      // const lockedUntil = new Date().getTime() + 5 * 1000; // 5 seconds test
      // const lockedUntil = new Date().getTime() + 20 * 1000; // 20 seconds test
      // const lockedUntil = new Date().getTime() + 60 * 1000; // 1 minute
      console.log(`locked until ${new Date(lockedUntil)}`);
      user.locked = true;
      user.lockExpires = lockedUntil;
    }

  }
  next();
})

const User = mongoose.model("User", userModel);
export default User;
