import {injectable} from "inversify";
import {QuizModelClass} from "./db";
import {AnswerStatusType, AnswerType, QuizGameStatusType, QuizGameType} from "../domain/quiz-service";
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
            console.log(e)
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


    async getMyCurrentGame(userId: string): Promise<QuizGameType | null> {
        return QuizModelClass.findOne({
            $and: [
                {$or: [{status: QuizGameStatusType.Active}, {status: QuizGameStatusType.PendingSecondPlayer}]},
                {
                    $or: [{'firstPlayer.user.id': userId}, {'secondPlayer.user.id': userId}]
                }]

        }).lean()
    }

    async getMyActiveGame(userId: string): Promise<QuizGameType | null> {
        return QuizModelClass.findOne({
            $and: [
                {status: QuizGameStatusType.Active},
                {
                    $or: [{'firstPlayer.user.id': userId}, {'secondPlayer.user.id': userId}]
                }]

        }).lean()
    }

    async addAnswer(gameId: ObjectId, currentPlayerQueryString: "firstPlayer" | "secondPlayer", answer: AnswerType): Promise<QuizGameType | null> {
        // const updated = await QuizModelClass.findOneAndUpdate({gameId}, {$push: {[currentPlayerQueryString + ".answers"]: answer}}, {new: true})
        // console.log(updated)
        return QuizModelClass.findOneAndUpdate({gameId}, {$push: {[currentPlayerQueryString + ".answers"]: answer}}, {new: true})
    }

    async updateInGameUserScores(gameId: ObjectId, currentPlayerQueryString: "firstPlayer" | "secondPlayer", scores: number): Promise<QuizGameType | null> {
        return QuizModelClass.findOneAndUpdate({_id: gameId}, {$inc: {[currentPlayerQueryString + ".score"]: scores}}, {new: true})
    }

    async finishGame(gameId: ObjectId): Promise<QuizGameType | null> {
        return QuizModelClass.findByIdAndUpdate(gameId, {status: QuizGameStatusType.Finished, finishGameDate: new Date()})
    }

    async getGameById(gameId: ObjectId): Promise<QuizGameType | null> {
        return QuizModelClass.findById(gameId).lean()
    }

    async countGamesByFilter(filter: object){
        return QuizModelClass.estimatedDocumentCount(filter)
    }
    async getMyFinishedGames(userId: string, PageNumber: number, PageSize: number) {
       return  QuizModelClass.find({
           $and:[
               {status: QuizGameStatusType.Finished},
               {$or: [{'firstPlayer.user.id': userId}, {'secondPlayer.user.id': userId}]}
           ]
       }).skip((PageNumber - 1) * PageSize).limit(PageSize).lean()
    }

    async getTopUsers() {
        return 'top users - repo'
    }
}