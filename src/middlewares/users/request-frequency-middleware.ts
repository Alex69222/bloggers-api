import {NextFunction, Request, Response} from "express";
import {log} from "util";

const requests: any = {}
export const requestFrequencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!requests[req.ip]) {
        requests[req.ip] = {}
    }
    if(!requests[req.ip][req.originalUrl]){
        requests[req.ip][req.originalUrl] = []
    }
    if (requests[req.ip][req.originalUrl].length === 5) {
        const firstReqDate = requests[req.ip][req.originalUrl][0]
        if (Number(new Date()) - Number(firstReqDate) < 10000) {
            return res.sendStatus(429)
        }
        requests[req.ip][req.originalUrl].shift()
    }
    requests[req.ip][req.originalUrl] = [...requests[req.ip][req.originalUrl], new Date()]
    next()
}
