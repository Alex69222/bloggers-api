import {inject, injectable} from "inversify";
import {QuizRepository} from "../repository/quiz-repository";
import {ObjectId} from "mongodb";

enum QuizGameStatusType {
     PendingSecondPlayer = "PendingSecondPlayer",
     Active = "Active",
     Finished = "Finished"

}
enum AnswerStatusType {
    Correct = "Correct",
    Incorrect = "Incorrect"
}

export type QuestionType = {
    _id: ObjectId
    body: string
    answer: string
}
export  type AnswerType = {
    questionId: string
    answerStatus: AnswerStatusType
    addedAt: Date
}
export type PlayerType = {
    answers: Array<AnswerType>
    user: {
        id: string
        login: string
    }
    score: number
}
export type QuizGameType = {
    _id: ObjectId
    firstPlayer: PlayerType
    secondPlayer: PlayerType | null
    questions: Array<Omit<QuestionType, "answer">>
    status: QuizGameStatusType
    pairCreatedDate: Date
    startGameDate: Date | null
    finishGameDate: Date | null
}
@injectable()
export class QuizService{
    constructor(@inject(QuizRepository) protected quizRepository: QuizRepository) {
    }
    async createOrConnect(){
        return 'create or connect - service'
    }
    async sendAnswer(){
        return 'answer is sent - service'
    }
    async getMyCurrentGame(){
        return 'current game - service'
    }
    async getGameById(){
        return 'game by id - service'
    }
    async getMyGames(){
        return 'my games - service'
    }
    async getTopUsers(){
        return 'top users - service'
    }
}