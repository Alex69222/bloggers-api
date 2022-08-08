import {UsersService} from "../domain/users-service";
import {Request, Response} from "express";
import {ObjectId} from "mongodb";
import {inject, injectable} from "inversify";

@injectable()
export class AuthController {

    constructor(@inject(UsersService) protected usersService: UsersService) {
    }

    async login(req: Request<{}, { accessToken: string } | string, { login: string, password: string }, {}>, res: Response<{ accessToken: string } | string>) {
        const user = await this.usersService.checkCredentials(req.body.login, req.body.password)
        if (!user) return res.status(401).send('login or password is incorrect')
        const {accessToken, refreshToken} = await this.usersService.createAccessAndRefreshTokens(user._id)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true
        })
        res.status(200).send({accessToken})
    }

    async register(req: Request<{}, string, { login: string, email: string, password: string }>, res: Response<string>) {
        const user = await this.usersService.createUser(req.body.login, req.body.email, req.body.password)
        if (!user) return res.status(400).send('Something went wrong, please try again later')
        res.sendStatus(204)
    }

    async confirmRegistration(req: Request<{}, null, { code: string }, {}>, res: Response<null>) {
        const result = await this.usersService.confirmEmail(req.body.code)
        if (!result) return res.sendStatus(400)
        res.sendStatus(204)
    }

    async resendRegistrationEmail(req: Request<{}, null | string, { email: string }, {}>, res: Response<null | string>) {
        let emailResended = await this.usersService.resendConfirmationEmail(req.body.email)
        if (!emailResended) return res.status(400).send('Something went wrong. Please, try again later')
        res.sendStatus(204)
    }

    async me(req: Request, res: Response) {
        res.send({
            'email': req.user!.accountData.email,
            'login': req.user!.accountData.userName,
            'userId': req.user!.id.toString()
        })
    }

    async refreshToken(req: Request<{}, { accessToken: string } | null, {}, {}>, res: Response<{ accessToken: string } | null>) {
        const {
            accessToken,
            refreshToken
        } = await this.usersService.createAccessAndRefreshTokens(new ObjectId(req.user!.id))
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true
        })
        res.send({accessToken})
    }
}