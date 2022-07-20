import {body} from "express-validator";
import {usersService} from "../../domain/users-service";

export const emailIsConfirmedMiddleware = body('email')
    .custom(async value => {
        const user = await usersService.findUserByEmail(value)
        if (!user) {
            return Promise.reject('User with this email doesn\'t exsist')
        } else if (user.emailConfirmation.isConfirmed) {
            return Promise.reject('User with this email is already confirmed')
        } else {
            return true
        }
    })