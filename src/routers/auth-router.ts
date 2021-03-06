import {Request, Response, Router} from "express";
import {userLoginValidationMiddleware} from "../middlewares/users/user-login-validation-middleware";
import {userPasswordValidationMiddleware} from "../middlewares/users/user-password-validation-middleware";
import {usersService} from "../domain/users-service";
import {jwtService} from "../application/jwt-service";
import {validationResultMiddleware} from "../middlewares/validation-result-middleware";
import {uniqueLoginValidation} from "../middlewares/users/unique-login-validation";
import {emailValidationMiddleware} from "../middlewares/users/email-validation-middleware";
import {requestFrequencyMiddleware} from "../middlewares/users/request-frequency-middleware";
import {emailManager} from "../managers/email-manager";
import {loginFrequencyMiddleware} from "../middlewares/users/login-frequency-middleware";
import {uniqueEmailValidation} from "../middlewares/users/unique-email-validation";
import {confirmationCodeMiddleware} from "../middlewares/users/confirmation-code-middleware";
import {emailIsConfirmedMiddleware} from "../middlewares/users/email-is-confirmed-middleware";
import {refreshTokenMiddleware} from "../middlewares/users/refresh-token-middleware";
import {ObjectId} from "mongodb";
import {revokeRefreshTokenMiddleware} from "../middlewares/users/revoke-refresh-token-middleware";
import {authMiddleware} from "../middlewares/users/auth-middleware";

export const authRouter = Router({})

authRouter.post('/login',
    // userLoginValidationMiddleware,
    // userPasswordValidationMiddleware,
    // validationResultMiddleware,
    loginFrequencyMiddleware,
    requestFrequencyMiddleware,
    async (req: Request<{}, { accessToken: string } | string, { login: string, password: string }, {}>, res: Response<{ accessToken: string } | string>) => {
        const user = await usersService.checkCredentials(req.body.login, req.body.password)
        if (!user) return res.status(401).send('login or password is incorrect')
        const accessToken = await jwtService.createJWT(user._id)
        const refreshToken = await jwtService.createRefreshJWT(user._id)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true
        })
        res.status(200).send({accessToken})
    }
)
authRouter.post('/registration',
    requestFrequencyMiddleware,
    uniqueLoginValidation,
    uniqueEmailValidation,
    userLoginValidationMiddleware,
    userPasswordValidationMiddleware,
    emailValidationMiddleware,
    validationResultMiddleware,
    async (req: Request<{}, string, { login: string, email: string, password: string }>, res: Response<string>) => {
        const user = await usersService.createUser(req.body.login, req.body.email, req.body.password)
        if (!user) return res.status(400).send('Something went wrong, please try again later')
        res.sendStatus(204)
    })
authRouter.post('/registration-confirmation',
    requestFrequencyMiddleware,
    confirmationCodeMiddleware,
    validationResultMiddleware,
    async (
        req: Request<{}, null, { code: string }, {}>,
        res: Response<null>) => {
        const result = await usersService.confirmEmail(req.body.code)
        if (!result) return res.sendStatus(400)
        res.sendStatus(204)
    })
authRouter.post('/registration-email-resending',
    requestFrequencyMiddleware,
    emailValidationMiddleware,
    emailIsConfirmedMiddleware,
    validationResultMiddleware,
    async (req: Request<{}, null | string, { email: string }, {}>, res: Response<null | string>) => {
        let emailResended = await usersService.resendConfirmationEmail(req.body.email)
        if (!emailResended) return res.status(400).send('Something went wrong. Please, try again later')
        res.sendStatus(204)
    }
)
authRouter.post('/refresh-token',
    refreshTokenMiddleware,
    async (req: Request<{}, { accessToken: string } | null, {}, {}>, res: Response<{ accessToken: string } | null>) => {
        const accessToken = await jwtService.createJWT(new ObjectId(req.user!.id))
        const refreshToken = await jwtService.createRefreshJWT(new ObjectId(req.user!.id))
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true
        })
        res.send({accessToken})
    }
)
authRouter.post('/logout',
    revokeRefreshTokenMiddleware
)
authRouter.get('/me',
    authMiddleware,
    async (req: Request, res: Response) => {
        res.send({
            'email': req.user!.accountData.email,
            'login': req.user!.accountData.userName,
            'userId': req.user!.id.toString()
        })
    }
)