import {body} from "express-validator";
import {UsersService} from "../../domain/users-service";
import {usersService} from "../../composition-root";
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