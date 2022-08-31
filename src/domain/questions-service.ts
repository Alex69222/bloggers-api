import {inject, injectable} from "inversify";
import {QuestionsRepository} from "../repository/questions-repository";
import {ObjectId} from "mongodb";
import {transformToPaginationView} from "../helpers/transformToPaginationView";

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

    async getQuestions(PageNumber: number, PageSize: number) {
        const count = await this.questionsRepository.countQuestions()
        const questions = await this.questionsRepository.getQuestions(PageNumber, PageSize)
        return transformToPaginationView<IQuestion>(count, PageSize, PageNumber, questions)
    }

    async createQuestion(body: string, answer: string) {

        const newQuestion: IQuestion = {
            _id: new ObjectId(),
            body,
            answer
        }
        return this.questionsRepository.createQuestion(newQuestion)
    }

    async getQuestionById() {

    }

    async deleteQuestionById() {

    }
}