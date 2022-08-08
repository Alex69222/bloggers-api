import {UsersService, UserType} from "../domain/users-service";
import {Request, Response} from "express";
import {PaginationType} from "../helpers/transformToPaginationView";
import {PaginationQueryType} from "../types/types";
import {pagePropsHandler} from "../helpers/pagePropsHandler";
import {inject, injectable} from "inversify";

@injectable()
export class UsersController {
    constructor(@inject(UsersService) protected usersService: UsersService) {
    }

    async getUsers(req: Request<{}, PaginationType<Omit<UserType, "password" | "_id"> & { id: string }>, {}, PaginationQueryType>, res: Response<PaginationType<Omit<UserType, "password" | "_id"> & { id: string }>>) {
        const users = await this.usersService.getUsers(...pagePropsHandler(req.query.PageNumber, req.query.PageSize))
        res.status(200).send(users)
    }

    async createUser(req: Request<{}, { id: string, login: string } | string, { login: string, email: string, password: string }, {}>, res: Response<{ id: string, login: string } | string>) {
        const newUser = await this.usersService.createUser(req.body.login, req.body.email, req.body.password)
        if (!newUser) return res.status(400).send('Something went wrong. Please try again later.')
        return res.status(201).send(newUser)
    }

    async deleteUser(req: Request<{ userId: string }, null, {}, {}>, res: Response<null>) {
        const userIsDeleted = await this.usersService.deleteUser(req.params.userId)
        if (!userIsDeleted) return res.sendStatus(404)
        res.sendStatus(204)
    }
}