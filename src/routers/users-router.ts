import {Request, Response, Router} from "express";
import {usersService} from "../domain/users-service";
import {adminAuthorizationMiddleware} from "../middlewares/admin-authorization-middleware";
import {userLoginValidationMiddleware} from "../middlewares/users/user-login-validation-middleware";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {userPasswordValidationMiddleware} from "../middlewares/users/user-password-validation-middleware";
import {pagePropsHandler} from "../helpers/pagePropsHandler";
import {uniqueLoginValidation} from "../middlewares/users/unique-login-validation";

export const usersRouter = Router({})

usersRouter.get('/',
    async (req: Request, res: Response) => {
            const users = await  usersService.getUsers( ...pagePropsHandler(req.query.PageNumber, req.query.PageSize))
        res.status(200).send(users)
    }
)

usersRouter.post('/',
    adminAuthorizationMiddleware,
    userLoginValidationMiddleware,
    uniqueLoginValidation,
    userPasswordValidationMiddleware,
    validationResultMiddleware,
    async (req: Request, res: Response) => {
       const newUser = await usersService.createUser(req.body.login, req.body.password)
        res.status(201).send(newUser)
    }
)
usersRouter.delete('/:userId',
    adminAuthorizationMiddleware,
    async (req: Request, res: Response) => {
        const userIsDeleted = await usersService.deleteUser(req.params.userId)
        if(userIsDeleted){
            res.sendStatus(204)
        }else{
            res.sendStatus(404)
        }
    }
)


// getUsers(...pageHelper(req.query))
//
// const pageHelper = (q) => {return[Namber(q.page) || 1, +q.count || 10]
