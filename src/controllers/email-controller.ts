import {EmailManager} from "../managers/email-manager";
import {Request, Response} from "express";
import {inject, injectable} from "inversify";

@injectable()
export class EmailController {
    constructor(@inject(EmailManager) protected emailManager: EmailManager) {
    }

    async sendEmail(req: Request<{}, {}, { to: string, subject: string, html: string }, {}>, res: Response<{}>) {


        await this.emailManager.sendEmail(req.body.to, req.body.subject, req.body.html)
        res.send({
            'email': req.body.to,
            'message': req.body.html,
            'subject': req.body.subject
        })
    }
}