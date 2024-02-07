import { Router } from "express";
import {authJWT} from "../helpers/auth.js";

// import controllers
import * as UC from "../controllers/userController.js";

const userRouter = Router();

userRouter
  .get("/", UC.getUser)
  .get("/all-users", UC.getAllUsers)
  .post("/register", UC.register)
  .post("/login", UC.login)
  .get ("/get-user-data", authJWT, UC.lockManager, UC.getUserData) 
  .get("/logout", UC.logout)
  .patch("/score", UC.updateScore)
  .post("/user-stopped", UC.userStopped)
  .post("/timeOver",authJWT, UC.timeOver)

  //------------------------------------------------------------------------------------
// ! EDIT this out
import User from "../models/userModel.js";
userRouter
  .get("/reset-points/:name", async (req, res) => {
    const user = await User.findOne({username: req.params.name});
    user.locked = false;
    user.lockExpires = new Date(null);
    user.wrongAnswers = [];
    await user.save();
    console.log(`lifepoints resetted from: ${req.params.name}`)
    res.send(`lifepoints resetted from: ${req.params.name}`);
  })
//------------------------------------------------------------------------------------

export default userRouter;  
