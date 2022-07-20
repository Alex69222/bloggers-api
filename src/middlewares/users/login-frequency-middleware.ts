import {NextFunction, Request, Response} from "express";
const logins:any = {}
export const loginFrequencyMiddleware =  async  (req: Request<{}, null | string, {login: string, password: string}, {}>, res: Response<null | string>, next: NextFunction) =>{
    if (!logins[req.body.login]) {
        logins[req.body.login] = []
    }

    if (logins[req.body.login].length === 5) {
        const firstReqDate = logins[req.body.login][0]
        if (Number(new Date()) - Number(firstReqDate) < 10000) {
            return res.sendStatus(429)
        }
        logins[req.body.login].shift()
    }
    logins[req.body.login] = [...logins[req.body.login], new Date()]
    next()
}