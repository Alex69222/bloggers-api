import nodemailer from 'nodemailer'
import {injectable} from "inversify";


let transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noreply.notifycations@gmail.com',
        pass: 'gtsdasurflxfcelq',
    }
})

@injectable()
export class EmailAdapter{
    async sendEmail(to: string, subject: string, html: string){
       let info = await transport.sendMail({
           from: 'BLOGGERS <noreply.notifications@gmail.com>',
           to,
           subject,
           html
       })
        return info
    }
}