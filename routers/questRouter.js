import {Router} from 'express';
import * as QC from '../controllers/questController.js';
import {authJWT} from "../helpers/auth.js";

const questRouter = Router();

questRouter
  .post("/add-one",authJWT, QC.addOneQuestion) // only admin
  .get("/get-all-questions", QC.getAllQuestions)
  .get("/get-game-question/:level",authJWT, QC.getGameQuestion)
  .get("/joker/:id",authJWT, QC.joker)
  .get("/check-answer/:id", authJWT, QC.checkAnswer)
  .get("/answer-right/:questionid", authJWT, QC.rightAnswer)
  .get("/answer-wrong/:questionid", authJWT, QC.wrongAnswer)
  .delete("/:id", QC.deleteOne) // only admin

export default questRouter;