import {inject, injectable} from "inversify";
import {QuizRepository} from "../repository/quiz-repository";
import {ObjectId} from "mongodb";
import {QuestionsService} from "./questions-service";
import {PaginationType, transformToPaginationView} from "../helpers/transformToPaginationView";
import {idMapper} from "../helpers/id-mapper";
import {FORBIDDEN} from "../helpers/constants";

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
    answer?: string
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
export type UserPlayer = {
    user: {
        id: string
        login: string
    }
    sumScore: number
    avgScores: number
    gamesCount: number
    winsCount: number
    lossesCount: number
}
const hideAnswers = (game: QuizGameType, userId: string): QuizGameType => {
    const currentPlayer = game.firstPlayer.user.id === userId ? game.firstPlayer : game.secondPlayer
    const currentPlayerAnswersLength = currentPlayer!.answers.length

    if (game.status === QuizGameStatusType.PendingSecondPlayer) {
        game.questions.splice(0)
    } else if (currentPlayerAnswersLength !== game.questions.length) {

        game.questions.splice(currentPlayerAnswersLength + 1)
    }
    game.questions = game.questions.map(el => {
        const {answer, ...rest} = el
        return rest
    })
    return game
}

@injectable()
export class QuizService {
    constructor(@inject(QuizRepository) protected quizRepository: QuizRepository,
                @inject(QuestionsService) protected questionService: QuestionsService) {
    }

    async createOrConnect(userId: string, userLogin: string): Promise<QuizGameType | null> {
        const myCurrentGame = await this.quizRepository.getMyCurrentGame(userId)
        if (myCurrentGame) return null
        const pendingSecondPlayerGame = await this.quizRepository.findPendingSecondPlayerGame()
        if (!pendingSecondPlayerGame) {
            const questions = await this.questionService.getRandomQuestions(5)
            // console.log(questions)
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


        const player = await this.quizRepository.getPlayer(userId)
        if (!player) {
            const player: UserPlayer = {
                user: {
                    id: currentPlayer!.user.id,
                    login: currentPlayer!.user.login,
                },
                sumScore: 0,
                avgScores: 0,
                gamesCount: 0,
                winsCount: 0,
                lossesCount: 0
            }
            await this.quizRepository.createPlayer(player)
        }

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
            anotherPlayer!.answers.length === activeGame.questions.length) {
            await this.quizRepository.finishGame(activeGame._id)

            const myScores = currentPlayer!.score + scores
            const opponentScores = anotherPlayer!.score

// NEED TESTS--------------------------------------------------------

            await this.quizRepository.updatePlayerGamesCount(currentPlayer!.user.id)
            await this.quizRepository.updatePlayerGamesCount(anotherPlayer!.user.id)
            if (myScores > opponentScores) {

                await this.quizRepository.updatePlayerWinsCount(currentPlayer!.user.id)
                await this.quizRepository.updatePlayerSumScore(currentPlayer!.user.id, myScores)
                await this.quizRepository.updatePlayerLossesCount(anotherPlayer!.user.id)
            } else if (myScores === opponentScores) {
                await this.quizRepository.updatePlayerWinsCount(currentPlayer!.user.id)
                await this.quizRepository.updatePlayerSumScore(currentPlayer!.user.id, myScores)
                await this.quizRepository.updatePlayerWinsCount(anotherPlayer!.user.id)
                await this.quizRepository.updatePlayerSumScore(anotherPlayer!.user.id, opponentScores)
            } else {
                // console.log(currentPlayer!.user.id)
                // console.log(anotherPlayer!.user.id)
                await this.quizRepository.updatePlayerLossesCount(currentPlayer!.user.id)
                await this.quizRepository.updatePlayerWinsCount(anotherPlayer!.user.id)
                await this.quizRepository.updatePlayerSumScore(anotherPlayer!.user.id, opponentScores)
            }
            await this.quizRepository.updatePlayerAvgScore(currentPlayer!.user.id)
            await this.quizRepository.updatePlayerAvgScore(anotherPlayer!.user.id)
        }

        return answerResult

    }

    async getPlayerById(userId: string): Promise<UserPlayer | null> {
        return this.quizRepository.getPlayer(userId)
    }

    //
    // async calculatePlayerAvgScore(userId: string) {
    //     const myGamesCount = await this.quizRepository.countGamesByFilter({$or: [{'firstPlayer.user.id': userId}, {'secondPlayer.user.id': userId}]})
    //
    // }

// NEED TESTS--------------------------------------------------------END
    async getMyCurrentGame(userId: string): Promise<QuizGameType | null> {
        const currentGame = await this.quizRepository.getMyCurrentGame(userId)
        if (!currentGame) return null
        return hideAnswers(currentGame, userId)
    }

    async getGameById(gameId: ObjectId, userId: string): Promise<QuizGameType | null | typeof FORBIDDEN> {
        const game = await this.quizRepository.getGameById(gameId)
        if (!game) return null
        if (game.firstPlayer.user.id !== userId && game.secondPlayer?.user?.id !== userId) return FORBIDDEN
        return hideAnswers(game, userId)
    }

    async getMyGames(userId: string, PageNumber: number, PageSize: number): Promise<PaginationType<(Omit<QuizGameType, '_id'> & { id: string })>> {
        const currentGame = await this.getMyCurrentGame(userId)
        const myGamesCount = await this.quizRepository.countGamesByFilter({$or: [{'firstPlayer.user.id': userId}, {'secondPlayer.user.id': userId}]})
        const finishedGames = await this.quizRepository.getMyFinishedGames(userId, PageNumber, PageSize)
        if (currentGame) finishedGames.push(currentGame)
        const myGames = idMapper(finishedGames)
        return transformToPaginationView<(Omit<QuizGameType, '_id'> & { id: string })>(myGamesCount, PageSize, PageNumber, myGames)
    }

    async getTopUsers() {
        return 'top users - service'
    }
}