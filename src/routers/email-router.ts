import {Request, Response, Router} from "express";
import {emailManager} from "../managers/email-manager";

export const emailRouter = Router({})
emailRouter.post('/',
    async (req: Request<{}, {}, { to: string, subject: string, html: string }, {}>, res: Response<{}>) => {


        await emailManager.sendEmail(req.body.to, req.body.subject, req.body.html)
        res.send({
            'email': req.body.to,
            'message': req.body.html,
            'subject': req.body.subject
        })
    })