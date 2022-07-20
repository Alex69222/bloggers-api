import {body} from "express-validator";
import {usersRepository} from "../../repository/users-repository";

export const confirmationCodeMiddleware = body('code')

    .custom(async value => {
        const user = await usersRepository.findUserByConfirmationCode(value)
        if (!user) {
            return Promise.reject('The code doesn\'t exist')
        } else if (user.emailConfirmation.isConfirmed) {
            return Promise.reject('The code has been used already')
        } else {
            return true
        }
    })