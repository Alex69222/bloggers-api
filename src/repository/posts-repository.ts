import {PostModelClass, postsCollection} from "./db";
import {PostType} from "../domain/posts-service";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {idMapper} from "../helpers/id-mapper";

@injectable()
export class PostsRepository {
    async getPosts(pageNumber: number, pageSize: number, userId: string | undefined): Promise<{ postsCount: number, posts: (Omit<PostType, '_id'> & { id: string })[] }> {
        const postsCount = await PostModelClass.count({})
        const dbPosts = await PostModelClass.find({}).skip(((pageNumber - 1) * pageSize)).limit(pageSize).lean()
        let posts = idMapper(dbPosts)

        posts.forEach((p: any) => {
            if (userId) {
                const userLikeStatus = p.extendedLikesInfo.totalInfo.find((el: { userId: string; }) => el.userId === userId)
                if (userLikeStatus) {
                    p.extendedLikesInfo.myStatus = userLikeStatus.likeStatus
                }
            }

            delete p.extendedLikesInfo.totalInfo
        })

        return {postsCount, posts}
    }

    async getPostById(id: string, userId: string | undefined): Promise<Omit<PostType, '_id'> & { id: string } | null> {
        if (!ObjectId.isValid(id)) return null
        const dbPost = await PostModelClass.findById(new ObjectId(id)).lean()
        const post = idMapper(dbPost)

        if (userId) {
            const userLikeStatus = post.extendedLikesInfo.totalInfo.find((el: { userId: string; }) => el.userId === userId)
            if (userLikeStatus) {
                post.extendedLikesInfo.myStatus = userLikeStatus.likeStatus
            }
        }
        delete post.extendedLikesInfo.totalInfo
        return post
    }

    async createPost(newPost: PostType): Promise<ObjectId | null> {
        try {
            const postInstance = new PostModelClass(newPost)
            await postInstance.save()
            return postInstance._id
        } catch (e) {
            return null
        }
    }

    async updatePost(title: string, shortDescription: string, content: string, bloggerId: string, id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false
        const postIsUpdated = await PostModelClass.findByIdAndUpdate(new ObjectId(id), {
            title,
            shortDescription,
            bloggerId,
            content
        })
        if (!postIsUpdated) return false
        return true
    }

    async deletePost(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) return false
        const postIsDeleted = await PostModelClass.findByIdAndDelete(new ObjectId(id))
        if (!postIsDeleted) return false
        return true
    }

    async addLike(postId: string, userId: string, login: string, likeStatus: string): Promise<boolean> {
        if (!ObjectId.isValid(postId)) return false
        const post = await PostModelClass.findById(new ObjectId(postId))
        if (!post) return false


        const currentUserLikeStatus = post.extendedLikesInfo.totalInfo.find(s => s.userId === userId)

        if (!currentUserLikeStatus) {
            if (likeStatus === "Like") {
                post.extendedLikesInfo.likesCount++
            } else if (likeStatus === "Dislike") {
                post.extendedLikesInfo.dislikesCount++
            }

        } else {

            if (currentUserLikeStatus.likeStatus === "Like" && likeStatus !== "Like") {
                post.extendedLikesInfo.likesCount--
            } else if (currentUserLikeStatus.likeStatus !== "Like" && likeStatus === "Like") {
                post.extendedLikesInfo.likesCount++
            }

            if (currentUserLikeStatus.likeStatus === "Dislike" && likeStatus !== "Dislike") {
                post.extendedLikesInfo.dislikesCount--
            } else if (currentUserLikeStatus.likeStatus !== "Dislike" && likeStatus === "Dislike") {
                post.extendedLikesInfo.dislikesCount++
            }

            const currentIndex = post.extendedLikesInfo.totalInfo.indexOf(currentUserLikeStatus)
            post.extendedLikesInfo.totalInfo.splice(currentIndex, 1)
        }

        post.extendedLikesInfo.totalInfo.push({
            addedAt: new Date(),
            userId,
            login,
            likeStatus
        })
        const newestLikes = []
        let newestLikesCount = 0

        for (let i = post.extendedLikesInfo.totalInfo.length - 1; i >= 0; i--) {
            if (newestLikesCount === 3) {
                break
            }
            if (post.extendedLikesInfo.totalInfo[i].likeStatus === "Like") {
                const {likeStatus, ...rest} = post.extendedLikesInfo.totalInfo[i]
                newestLikes.unshift(rest)
                newestLikesCount++
            }
        }
        post.extendedLikesInfo.newestLikes = newestLikes
        await post.save()
        return true
    }
}

// export const postsRepository = new PostsRepository()