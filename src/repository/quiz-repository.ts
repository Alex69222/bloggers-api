import {injectable} from "inversify";
import {QuizModelClass} from "./db";
import {QuizGameStatusType, QuizGameType} from "../domain/quiz-service";
import {ObjectId} from "mongodb";

@injectable()
export class QuizRepository {
    async findPendingSecondPlayerGame(): Promise<QuizGameType | null> {
        return QuizModelClass.findOne({status: QuizGameStatusType.PendingSecondPlayer}).lean()
    }

    async createNewQuizGame(game: QuizGameType): Promise<QuizGameType | null> {
        try {
            const quizGameInstance = new QuizModelClass(game)
            await quizGameInstance.save()
            return quizGameInstance
        } catch (e) {
            return null
        }
    }

    async connectToExistingGame(gameId: ObjectId, userId: string, login: string): Promise<QuizGameType | null> {
        return QuizModelClass.findByIdAndUpdate(gameId, {
            secondPlayer: {
                user: {
                    id: userId, login
                },
                answers: [],
                score: 0
            },
            status: QuizGameStatusType.Active,
            startGameDate: new Date()
        }, {new: true})
    }

    async createOrConnect() {
        return 'create or connect - repo'
    }

    async sendAnswer() {
        return 'answer is sent - repo'
    }

    async getMyCurrentGame(userId: string): Promise<QuizGameType | null> {
        return QuizModelClass.findOne({
            $and: [
                {$or: [{status: QuizGameStatusType.Active}, {status: QuizGameStatusType.PendingSecondPlayer}]},
                {$or: [{'firstPlayer.user.id': userId}, {'secondPlayer.user.id': userId}]
            }]

        })
    }

    async getGameById() {
        return 'game by id - repo'
    }

    async getMyGames() {
        return 'my games - repo'
    }

    async getTopUsers() {
        return 'top users - repo'
    }
}