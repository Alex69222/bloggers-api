import {MongoClient, ObjectId} from "mongodb";
import {settings} from "../settings";
import {EmailConfirmationData, LikesInfo, UserType} from "../domain/users-service";
import {CommentType} from "../domain/comments-service";
import {BloggerType} from "../domain/bloggers-service";
import {NewestLikes, PostType} from "../domain/posts-service";
import mongoose from "mongoose";
import {LIKES} from "../types/types";
import {AnswerType, PlayerType, QuizGameType} from "../domain/quiz-service";
import { IQuestion } from "../domain/questions-service";

export const client = new MongoClient(settings.MONGO_URI)
export const db = client.db('bloggers-posts')

export const bloggersCollection = db.collection<BloggerType>('bloggers')
export const postsCollection = db.collection<PostType>('posts')
export const usersCollection = db.collection<UserType>('users')
export const commentsCollection = db.collection<CommentType>('comments')

export const commentsLikesCollection = db.collection<CommentType>('comments-likes')
export const postsLikesCollection = db.collection<PostType>('posts-likes')

const TotalLikesInfoSchema = new mongoose.Schema({
    addedAt: Date,
    userId: String,
    login: String,
    likeStatus: String
}, {_id: false})
const NewestLikesSchema = new mongoose.Schema({
    addedAt: Date,
    userId: String,
    login: String
}, {_id: false})
const AnswerSchema = new mongoose.Schema<AnswerType>({
    questionId: String,
    answerStatus: String,
    addedAt: Date
}, {_id: false})
const PlayerSchema = new mongoose.Schema<PlayerType>({

    answers: [AnswerSchema],
    user: {
        id: String,
        login: String
    },
    score: Number

}, {_id: false})
const BloggerSchema = new mongoose.Schema<BloggerType>({
    _id: ObjectId,
    name: {type: String, required: true},
    youtubeUrl: {type: String, required: true}
}, {versionKey: false})
const UserSchema = new mongoose.Schema<UserType>({
    _id: ObjectId,
    accountData: {
        userName: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        createdAt: Date,
        refreshTokens: Array<string>
    },
    emailConfirmation: {
        confirmationCode: {type: String, required: true},
        expirationDate: Date,
        isConfirmed: Boolean
    },
    postsLikes: {
        type: Map,
        of: String
    },
    commentsLikes: {
        type: Map,
        of: String
    }
}, {versionKey: false})
const PostsSchema = new mongoose.Schema<PostType>({
    _id: ObjectId,
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    addedAt: Date,
    content: {type: String, required: true},
    bloggerId: {type: String, required: true},
    bloggerName: {type: String, required: true},
    extendedLikesInfo: {
        likesCount: Number,
        dislikesCount: Number,
        newestLikes: [NewestLikesSchema],
        myStatus: String
    },
    totalInfo: [TotalLikesInfoSchema],
}, {versionKey: false})
const CommentsSchema = new mongoose.Schema<CommentType>({
    _id: ObjectId,
    postId: {type: String, required: true},
    content: {type: String, required: true},
    userId: {type: String, required: true},
    userLogin: {type: String, required: true},
    addedAt: Date,
    likesInfo: {
        likesCount: Number,
        dislikesCount: Number,
        myStatus: String
    },
    totalInfo: [TotalLikesInfoSchema]
}, {versionKey: false})

const QuizGameSchema = new mongoose.Schema<QuizGameType>({
    _id: ObjectId,
    firstPlayer: PlayerSchema,
    secondPlayer: {type: PlayerSchema, default: null},
    questions: [{id: String, body: String, answer: String, _id: false}],
    status: String,
    pairCreatedDate: Date,
    startGameDate: {type: Date, default: null},
    finishGameDate: {type: Date, default: null},
}, {versionKey: false})

const QuestionSchema = new mongoose.Schema<IQuestion>({
    _id: ObjectId,
    body: String,
    answer: String
}, {versionKey: false})

export const BloggersModelClass = mongoose.model('bloggers', BloggerSchema,)
export const UserModelClass = mongoose.model('users', UserSchema)
export const PostModelClass = mongoose.model('posts', PostsSchema)
export const CommentModelClass = mongoose.model('comments', CommentsSchema)
export const QuizModelClass = mongoose.model('quiz', QuizGameSchema)

export const QuestionModelClass = mongoose.model('questions', QuestionSchema)

export async function runDb() {
    try {
        await client.connect()
        await client.db('bloggers-posts').command({ping: 1})
        await mongoose.connect(settings.MONGOOSE_URI, {dbName: 'bloggers-posts'})
        console.log('Successfully connected to mongo atlas')
    } catch (e) {
        console.log('Connection to mongo atlas failed')
        await client.close()
    }
}
