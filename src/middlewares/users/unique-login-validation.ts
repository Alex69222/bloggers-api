import {body} from "express-validator";
import {usersService} from "../../domain/users-service";

export const uniqueLoginValidation = body('login')
    .custom(async value => {
        const loginAlreadyExists = await usersService.findByLogin(value)
        if (loginAlreadyExists) {
            return Promise.reject('This login is already taken')
        } else {
            return true
        }
    })