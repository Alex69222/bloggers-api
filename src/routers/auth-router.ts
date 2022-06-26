import {Request, Response, Router} from "express";
import {userLoginValidationMiddleware} from "../middlewares/users/user-login-validation-middleware";
import {userPasswordValidationMiddleware} from "../middlewares/users/user-password-validation-middleware";
import {usersService} from "../domain/users-service";
import {jwtService} from "../application/jwt-service";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";

export const authRouter = Router({})

authRouter.post('/login',
    // userLoginValidationMiddleware,
    // userPasswordValidationMiddleware,
    // validationResultMiddleware,
    async (req: Request, res: Response) => {
        const user = await usersService.checkCredentials(req.body.login, req.body.password)
        if (!user) return res.status(401).send('login or email is incorrect')
        const token = await jwtService.createJWT(user)
        res.status(200).send({token})
    }
)