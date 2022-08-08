export const settings = {
    MONGO_URI: process.env.mongoURI || 'mongodb+srv://it-inc-db:6hAd5Ck2v3nrsVVm@it-inc-db.asa7p.mongodb.net/?retryWrites=true&w=majority',
    MONGOOSE_URI: process.env.mongoURI || 'mongodb+srv://it-inc-db:6hAd5Ck2v3nrsVVm@it-inc-db.asa7p.mongodb.net/?retryWrites=true&w=majority',
    JWT_SECRET: process.env.JWT_SECRET || '123'
}