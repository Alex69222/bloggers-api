import {Router} from "express";
import {container} from "../composition-root";
import {TestingController} from "../controllers/testing-controller";

export const testingRouter = Router({})

const testingController = container.resolve(TestingController)
testingRouter.delete('/all-data', testingController.dropDB)