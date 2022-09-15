import {inject, injectable} from "inversify";
import {QuizRepository} from "../repository/quiz-repository";
import {ObjectId} from "mongodb";
import {QuestionsService} from "./questions-service";
import {QuizModelClass} from "../repository/db";

export enum QuizGameStatusType {
    PendingSecondPlayer = "PendingSecondPlayer",
    Active = "Active",
    Finished = "Finished"

}

export enum AnswerStatusType {
    Correct = "Correct",
    Incorrect = "Incorrect"
}

export type QuestionType = {
    id: string
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

    async createOrConnect(userId: string, userLogin: string): Promise<QuizGameType | null> {
        const pendingSecondPlayerGame = await this.quizRepository.findPendingSecondPlayerGame()
        if (!pendingSecondPlayerGame) {
            const questions = await this.questionService.getRandomQuestions(5)
            if (!questions) return null
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

    async sendAnswer(userId: string, answer: string): Promise<AnswerType | null> {

        const activeGame = await this.quizRepository.getMyActiveGame(userId)
        if (!activeGame) return null

        const {firstPlayer, secondPlayer} = activeGame

        const currentPlayerQueryString = firstPlayer.user.id === userId ? "firstPlayer" : "secondPlayer"
        const currentPlayer = firstPlayer.user.id === userId ? firstPlayer : secondPlayer
        const anotherPlayer = secondPlayer!.user.id === userId ? firstPlayer : secondPlayer

        const currentQuestionIndex = currentPlayer!.answers.length
        if (currentQuestionIndex === activeGame.questions.length) return null

        const answerResult = {
            questionId: activeGame.questions[currentQuestionIndex].id,
            answerStatus: activeGame.questions[currentQuestionIndex].answer === answer ? AnswerStatusType.Correct : AnswerStatusType.Incorrect,
            addedAt: new Date()
        }

        await this.quizRepository.addAnswer(activeGame._id, currentPlayerQueryString, answerResult)

        let scores = 0
        if (answerResult.answerStatus === AnswerStatusType.Correct) scores++
        if (
            currentQuestionIndex === activeGame.questions.length - 1 &&
            anotherPlayer!.answers.length !== activeGame.questions.length &&
            (answerResult.answerStatus === AnswerStatusType.Correct || currentPlayer!.answers.find(el => el.answerStatus === AnswerStatusType.Correct))
        ) {
            scores++
        }

        if (scores > 0) await this.quizRepository.updateInGameUserScores(activeGame._id, currentPlayerQueryString, scores)

        if (
            currentQuestionIndex === activeGame.questions.length - 1 &&
            anotherPlayer!.answers.length === activeGame.questions.length) await this.quizRepository.finishGame(activeGame._id)

        return answerResult

    }

    async getMyCurrentGame(userId: string): Promise<QuizGameType | null> {
        return this.quizRepository.getMyCurrentGame(userId)
    }

    async getGameById(gameId: ObjectId): Promise<QuizGameType | null> {
        return this.quizRepository.getGameById(gameId)
    }

    async getMyGames() {
        return 'my games - service'
    }

    async getTopUsers() {
        return 'top users - service'
    }
}