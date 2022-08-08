import {
    EmailAdapter,
} from "../adapters/email-adapter";
import {UserType} from "../domain/users-service";
import {inject, injectable} from "inversify";

@injectable()
export class EmailManager{
    constructor(@inject(EmailAdapter) protected emailAdapter: EmailAdapter ) {
    }
    async sendEmail(to: string, subject: string, html: string) {
        await this.emailAdapter.sendEmail(to, subject, html)
    }
    async sendEmailConfirmationMessage(newUser: UserType) {
        const html = `
            <h1>Hello!</h1> 
            <p>Your email was used for registration at our Bloggers Service.</p>
            <p>Please, confirm the registration by following the link to confirmation page below, or just ignore this email, if it wasn't you.</p>
            <a href="https://somesite.com/confirm-email?code=${newUser.emailConfirmation.confirmationCode}">Confirm registration</a>
        `
        const to = newUser.accountData.email
        const subject = 'Registration at Bloggers Service'
        await this.emailAdapter.sendEmail(to, subject, html)

    }
}