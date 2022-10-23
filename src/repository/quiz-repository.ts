import {injectable} from "inversify";
import {QuizModelClass, UserPlayerModelClass} from "./db";
import {AnswerStatusType, AnswerType, QuizGameStatusType, QuizGameType, UserPlayer} from "../domain/quiz-service";
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
                {$or: [{'firstPlayer.user.id': userId}, {'secondPlayer.user.id': userId}]}
            ]

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
        return QuizModelClass.findOneAndUpdate({gameId}, {$push: {[currentPlayerQueryString + ".answers"]: answer}}, {new: true})
    }

    async updateInGameUserScores(gameId: ObjectId, currentPlayerQueryString: "firstPlayer" | "secondPlayer", scores: number): Promise<QuizGameType | null> {
        return QuizModelClass.findOneAndUpdate({_id: gameId}, {$inc: {[currentPlayerQueryString + ".score"]: scores}}, {new: true})
    }

    async finishGame(gameId: ObjectId): Promise<QuizGameType | null> {
        return QuizModelClass.findByIdAndUpdate(gameId, {$set:{status: QuizGameStatusType.Finished, finishGameDate: new Date()}})
    }

    async getGameById(gameId: ObjectId): Promise<QuizGameType | null> {
        return QuizModelClass.findById(gameId).lean()
    }

    async countGamesByFilter(filter: object):Promise<number>{
        return QuizModelClass.estimatedDocumentCount(filter)
    }
    async getMyFinishedGames(userId: string, PageNumber: number, PageSize: number): Promise<Array<QuizGameType>> {
       return  QuizModelClass.find({
           $and:[
               {status: QuizGameStatusType.Finished},
               {$or: [{'firstPlayer.user.id': userId}, {'secondPlayer.user.id': userId}]}
           ]
       }).skip((PageNumber - 1) * PageSize).limit(PageSize).lean()
    }

    // async getMyGamesScoresArray(userId: string){
    //     return QuizModelClass.aggregate([{}])
    // }
    async countPlayers():Promise<number>{
        return UserPlayerModelClass.estimatedDocumentCount({})
    }
    async getTopPlayers(PageNumber: number, PageSize: number): Promise<Array<UserPlayer>> {
        return UserPlayerModelClass.aggregate([{$project:{_id: 0}}, {$skip: ((PageNumber - 1) * PageSize)}, {$limit: PageSize}])
    }
    async getPlayer(id: string): Promise<UserPlayer | null>{
        let player = await UserPlayerModelClass.findOne({'user.id': id}, {'_id': 0}).lean()
        return player
    }
    async createPlayer(player: UserPlayer){
        try {
            const playerInstance = new UserPlayerModelClass(player)
            await playerInstance.save()
            return playerInstance
        } catch (e) {
            console.log(e)
            return null
        }
    }
    async updatePlayerSumScore(id: string, score: number):Promise<UserPlayer | null>{
        return UserPlayerModelClass.findOneAndUpdate({"user.id": id}, {$inc: {"sumScore": score}}, {new: true})
    }
    async updatePlayerAvgScore(id: string):Promise<UserPlayer | null>{
        return UserPlayerModelClass.findOneAndUpdate({"user.id": id}, [{$set: {"avgScores": {$divide: ["$sumScore", "$gamesCount"]}}}], {new: true})
    }
    async updatePlayerGamesCount(id: string):Promise<UserPlayer | null>{
        console.log(id)
        return UserPlayerModelClass.findOneAndUpdate({"user.id": id}, {$inc: {"gamesCount": 1}}, {new: true})
    }
    async updatePlayerWinsCount(id: string):Promise<UserPlayer | null>{
        return UserPlayerModelClass.findOneAndUpdate({"user.id": id}, {$inc: {"winsCount": 1}}, {new: true})
    }
    async updatePlayerLossesCount(id: string):Promise<UserPlayer | null>{
        return UserPlayerModelClass.findOneAndUpdate({"user.id": id}, {$inc: {"lossesCount": 1}}, {new: true})
    }
    // async getPlayerById(id: string): Promise<UserPlayer | null>{
    //     return UserPlayerModelClass.find({id}).lean()
    // }
}