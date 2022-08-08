import {Router} from "express";
import {container} from "../composition-root";
import {EmailController} from "../controllers/email-controller";

const emailController = container.resolve(EmailController)
export const emailRouter = Router({})

emailRouter.post('/', emailController.sendEmail.bind(emailController))