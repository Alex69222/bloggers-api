import {injectable} from "inversify";
import {IQuestion} from "../domain/questions-service";
import {QuestionModelClass} from "./db";
import {ObjectId} from "mongodb";

@injectable()
export class QuestionsRepository {
    async getQuestions(PageNumber: number, PageSize: number): Promise<IQuestion[]> {
        return QuestionModelClass.find({}).skip((PageNumber - 1) * PageSize).limit(PageSize)
    }

    async countQuestions(): Promise<number> {
        return QuestionModelClass.countDocuments({})
    }

    async createQuestion(newQuestion: IQuestion): Promise<boolean> {
        try {
            const questionInstance = new QuestionModelClass(newQuestion)
            await questionInstance.save()
            return true
        } catch (e) {
            return false
        }
    }

    async getQuestionById(id: ObjectId): Promise<IQuestion | null> {
        return QuestionModelClass.findById(id).lean()
    }

    async deleteQuestionById(id: ObjectId): Promise<IQuestion | null> {
        return QuestionModelClass.findByIdAndDelete(id).lean()
    }

    async getRandomQuestions(count: number): Promise<Array<IQuestion> | null> {
        try {
            const randomQuestions = await QuestionModelClass.aggregate([{$sample: {size: count}}])
            return randomQuestions
        } catch (e) {
            return null
        }
    }
}