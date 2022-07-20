import {Request, Response, Router} from "express";
import {usersService, UserType} from "../domain/users-service";
import {adminAuthorizationMiddleware} from "../middlewares/admin-authorization-middleware";
import {userLoginValidationMiddleware} from "../middlewares/users/user-login-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {userPasswordValidationMiddleware} from "../middlewares/users/user-password-validation-middleware";
import {pagePropsHandler} from "../helpers/pagePropsHandler";
import {uniqueLoginValidation} from "../middlewares/users/unique-login-validation";
import {PaginationType} from "../helpers/transformToPaginationView";
import {PaginationQueryType} from "../types/types";

export const usersRouter = Router({})

usersRouter.get('/',
    async (req: Request<{}, PaginationType<Omit<UserType, "password" | "_id"> & { id: string }>, {}, PaginationQueryType>, res: Response<PaginationType<Omit<UserType, "password" | "_id"> & { id: string }>>) => {
        const users = await usersService.getUsers(...pagePropsHandler(req.query.PageNumber, req.query.PageSize))
        res.status(200).send(users)
    }
)

usersRouter.post('/',
    adminAuthorizationMiddleware,
    userLoginValidationMiddleware,
    uniqueLoginValidation,
    userPasswordValidationMiddleware,
    validationResultMiddleware,
    async (req: Request<{}, { id: string, login: string } | string, { login: string, email: string, password: string }, {}>, res: Response<{ id: string, login: string } | string>) => {
        const newUser = await usersService.createUser(req.body.login, req.body.email, req.body.password)
        if(!newUser) return res.status(400).send('Something went wrong. Please try again later.')
        return res.status(201).send(newUser)
    }
)
usersRouter.delete('/:userId',
    adminAuthorizationMiddleware,
    async (req: Request<{ userId: string }, null, {}, {}>, res: Response<null>) => {
        const userIsDeleted = await usersService.deleteUser(req.params.userId)
        if (!userIsDeleted) return res.sendStatus(404)
        res.sendStatus(204)
    }
)
