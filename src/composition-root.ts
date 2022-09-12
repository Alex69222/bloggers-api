import 'reflect-metadata'
import {Container} from "inversify";
import {UsersService} from "./domain/users-service";
import {UsersRepository} from "./repository/users-repository";
import {EmailManager} from "./managers/email-manager";
import {JwtService} from "./application/jwt-service";
import {UsersController} from "./controllers/users-controller";
import {AuthController} from "./controllers/auth-controller";
import {BloggersRepository} from "./repository/bloggers-repository";
import {BloggersService} from "./domain/bloggers-service";
import {PostsRepository} from "./repository/posts-repository";
import {PostsService} from "./domain/posts-service";
import {BloggersController} from "./controllers/bloggers-controller";
import {CommentsRepository} from "./repository/comments-repository";
import {CommentsService} from "./domain/comments-service";
import {CommentsController} from "./controllers/comments-controller";
import {PostsController} from "./controllers/posts-controller";
import {EmailAdapter} from "./adapters/email-adapter";
import {EmailController} from "./controllers/email-controller";
import {TestingController} from "./controllers/testing-controller";
import {PostsLikesRepository} from "./repository/posts-likes-repository";
import {postsLikesCollection} from "./repository/db";
import {QuizController} from "./controllers/quiz-controller";
import {QuizService} from "./domain/quiz-service";
import {QuizRepository} from "./repository/quiz-repository";
import {QuestionsRepository} from "./repository/questions-repository";
import {QuestionsService} from "./domain/questions-service";
import {QuestionsController} from "./controllers/questions-controller";


const emailAdapter = new EmailAdapter()
const emailManager = new EmailManager(emailAdapter)

export const jwtService = new JwtService()

const usersRepository = new UsersRepository()
export const usersService = new UsersService(usersRepository,emailManager,jwtService)
export const usersController = new UsersController(usersService)


export const authController = new AuthController(usersService)

const commentsRepository = new CommentsRepository()
const commentsService = new CommentsService(commentsRepository)
export const commentsController = new CommentsController(commentsService)

const postsRepository = new PostsRepository()
const bloggersRepository = new BloggersRepository()
export const bloggersService = new BloggersService(bloggersRepository)
const postsLikesRepository = new PostsLikesRepository()
const postsService = new PostsService(postsRepository, bloggersService, postsLikesRepository)
export const bloggersController = new BloggersController(bloggersService, postsService)

export const postsController = new PostsController(commentsService, postsService)





export const emailController = new EmailController(emailManager)

const questionsRepository = new QuestionsRepository()
const questionsService = new QuestionsService(questionsRepository)
const questionsController = new QuestionsController(questionsService)


const quizRepository = new QuizRepository()
const quizService = new QuizService(quizRepository, questionsService)
const quizController = new QuizController(quizService)

export const container = new Container()

container.bind<TestingController>(TestingController).to(TestingController)

container.bind<EmailAdapter>(EmailAdapter).to(EmailAdapter)
container.bind<EmailManager>(EmailManager).to(EmailManager)
container.bind<EmailController>(EmailController).to(EmailController)

container.bind<JwtService>(JwtService).to(JwtService)

container.bind<UsersRepository>(UsersRepository).to(UsersRepository)
container.bind<UsersService>(UsersService).to(UsersService)
container.bind<UsersController>(UsersController).to(UsersController)

container.bind<AuthController>(AuthController).to(AuthController)

container.bind<CommentsRepository>(CommentsRepository).to(CommentsRepository)
container.bind<CommentsService>(CommentsService).to(CommentsService)
container.bind<CommentsController>(CommentsController).to(CommentsController)

container.bind<PostsRepository>(PostsRepository).to(PostsRepository)
container.bind<PostsService>(PostsService).to(PostsService)
container.bind<PostsController>(PostsController).to(PostsController)

container.bind<BloggersRepository>(BloggersRepository).to(BloggersRepository)
container.bind<BloggersService>(BloggersService).to(BloggersService)
container.bind<BloggersController>(BloggersController).to(BloggersController)

container.bind<PostsLikesRepository>(PostsLikesRepository).to(PostsLikesRepository)

container.bind<QuizRepository>(QuizRepository).to(QuizRepository)
container.bind<QuizService>(QuizService).to(QuizService)
container.bind<QuizController>(QuizController).to(QuizController)

container.bind<QuestionsRepository>(QuestionsRepository).to(QuestionsRepository)
container.bind<QuestionsService>(QuestionsService).to(QuestionsService)
container.bind<QuestionsController>(QuestionsController).to(QuestionsController)