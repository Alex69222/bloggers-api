import {inject, injectable} from "inversify";
import {QuizRepository} from "../repository/quiz-repository";
import {ObjectId} from "mongodb";
import {QuestionsService} from "./questions-service";

export enum QuizGameStatusType {
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
    questions: Array<QuestionType>
    status: QuizGameStatusType
    pairCreatedDate: Date
    startGameDate: Date | null
    finishGameDate: Date | null
}

@injectable()
export class QuizService {
    constructor(@inject(QuizRepository) protected quizRepository: QuizRepository,
                @inject(QuestionsService) protected questionService: QuestionsService) {
    }

    async createOrConnect(userId: string, userLogin: string): Promise<QuizGameType | null>  {
        const pendingSecondPlayerGame = await this.quizRepository.findPendingSecondPlayerGame()
        if (!pendingSecondPlayerGame) {
            const questions = await this.questionService.getRandomQuestions(5)
            if(!questions) return null
            const newQuizGame: QuizGameType = {
                _id: new ObjectId(),
                firstPlayer: {
                    answers: [],
                    user: {
                        id: userId,
                        login: userLogin
                    },
                    score: 0
                },
                secondPlayer: null,
                questions,
                status: QuizGameStatusType.PendingSecondPlayer,
                pairCreatedDate: new Date(),
                startGameDate: null,
                finishGameDate: null

            }
            return this.quizRepository.createNewQuizGame(newQuizGame)
        }
        return this.quizRepository.connectToExistingGame(pendingSecondPlayerGame._id, userId, userLogin)
    }

    async sendAnswer(userId: string) {
        return this.quizRepository.getMyCurrentGame(userId)
    }

    async getMyCurrentGame() {
        return 'current game - service'
    }

    async getGameById() {
        return 'game by id - service'
    }

    async getMyGames() {
        return 'my games - service'
    }

    async getTopUsers() {
        return 'top users - service'
    }
}