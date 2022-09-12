import {inject, injectable} from "inversify";
import {QuestionsRepository} from "../repository/questions-repository";
import {ObjectId} from "mongodb";
import {PaginationType, transformToPaginationView} from "../helpers/transformToPaginationView";

export interface IQuestion {
    _id: ObjectId
    body: string
    answer: string
}

@injectable()
export class QuestionsService {
    constructor(
        @inject(QuestionsRepository) protected questionsRepository: QuestionsRepository
    ) {
    }

    async getQuestions(PageNumber: number, PageSize: number): Promise<PaginationType<IQuestion>> {
        const count = await this.questionsRepository.countQuestions()
        const questions = await this.questionsRepository.getQuestions(PageNumber, PageSize)
        return transformToPaginationView<IQuestion>(count, PageSize, PageNumber, questions)
    }

    async createQuestion(body: string, answer: string): Promise<boolean> {

        const newQuestion: IQuestion = {
            _id: new ObjectId(),
            body,
            answer
        }
        return this.questionsRepository.createQuestion(newQuestion)
    }

    async getQuestionById(id: ObjectId): Promise<IQuestion | null> {
        return this.questionsRepository.getQuestionById(id)
    }

    async deleteQuestionById(id: ObjectId): Promise<IQuestion | null> {
        return this.questionsRepository.deleteQuestionById(id)
    }
    async getRandomQuestions(count: number): Promise<Array<IQuestion> | null>{
        return this.questionsRepository.getRandomQuestions(count)
    }
}