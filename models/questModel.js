import mongoose from 'mongoose';

//Antworten Modell
const answerModel = mongoose.Schema({
    answer: String,
    isTrue: Boolean
})

// Fragen Modell
const questModel = mongoose.Schema({
    quest: {
        type: String,
        trim: true,
        required: true,
    }, 
    level: {
        type: Number,
        required: true,
        min: 0,
        max: 9, 
    },
    answers: [answerModel]
}, {timestamps: true})

export const Quest = mongoose.model("Quest", questModel);