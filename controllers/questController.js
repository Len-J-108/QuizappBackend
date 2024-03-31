import { Quest } from "../models/questModel.js";
import { handleWrongAnswer } from "../middleware/WrongAnswer.js";
import { checkQuestionLevel } from "../middleware/ScoreController.js";

export const getGameQuestion = async (req, res) => {
  //------------------------------------------------------------------------------------
  // ! test for spinner
  // const xx = function () {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       resolve();
  //     }, 3000)
  //   })
  // }
  // await xx();

    //------------------------------------------------------------------------------------
    try {
      const { level } = req.params;
      if (+level < 0 || +level > 9) {
        throw new Error("level zu hoch oder zu tief");
      }
    // get random question with matching level...
    const result = await Quest.aggregate([
      { $match: { level: +level } },
      { $sample: { size: 1 } },
    ]);
    if (!result.length) throw new Error("Keine Frage bekommen");
    const answers = result[0].answers.map((answer) => {
      return {
        answer: answer.answer,
        answer_id: answer._id
      }
    })
    // answers.sort(() => Math.random() - 0.5); // !  mixes answers
    const cleanedResult = { // without true/false indicator
      question: result[0].quest,
      question_id: result[0]._id,
      answers: answers,
    }
    return res.status(200).json(cleanedResult);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

export const joker = async (req, res) => {
  try {
    const {id} = req.params;
    const question = await Quest.findById(id);
    const answers = [
      question.answers[0],
      question.answers[Math.floor(Math.random() * 3 + 1)],
      ]
      .map((answer) => {
        return {
          answer: answer.answer,
          answer_id: answer._id
        }
      })
      .sort(() => Math.random() - 0.5);
    const result = {
      question: question.quest, 
      question_id: question._id,
      answers: answers,
    };
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const allQuestions = await Quest.find();
    console.log("inside getAllQuestions");
    res.status(200).send(allQuestions);
  } catch (err) {
    res.status(500).send("error in getAllQuestions");
  }
};

export const addOneQuestion = async (req, res) => {
  console.log("inside addOneQuestion");
  try {
    console.log("data from frontend", req.body);
    let { quest, level, answers } = req.body;
    console.log({ answers });
    level = +level;
    const question = await new Quest(req.body);
    const response = await question.save();
    console.log("Question saved");
    res.status(200).send("inside addOneQuestion");
  } catch (err) {
    console.error(err);
    res.status(500).send("error from addOneQuestion");
  }
};

export const deleteOne = async (req, res) => {
  try {
    const result = await Quest.findByIdAndDelete(req.params.id);
    if (!result) throw new Error("Kann Frage in Datenbank nicht finden.");
    console.log(`DELETED: ${result.quest}`);
    res.status(200).json(`DELETED: ${result.quest}`);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

export const checkAnswer = async (req, res) => {
  const {id} = req.params;
  const question = await Quest.findById(id);
  res.status(200).json(question.answers[0]._id);
  
}

export const rightAnswer = async (req, res) => {
  try{
    const {id} = req;
    const {questionid} = req.params;
    const question = await Quest.findById(questionid);
    console.log(`level: ${question.level +1}`);
    if (question.level === 9) {
      checkQuestionLevel(questionid, id);
    }
    res.status(200).json('rightAnswer end');
    }catch(err) {
      res.status(400).json(err.message);
      }
}


export const wrongAnswer = async (req, res) => {
  try{
    const {id} = req;
    const {questionid} = req.params;
    const io = req.app.get('socketio'); // socket io connection
    handleWrongAnswer({ status: "Antwort falsch" }, id, io); 
    checkQuestionLevel(questionid, id);
    res.status(200).json('jo');
  }catch(err) {
    res.status(400).json(err.message);
    }
}
