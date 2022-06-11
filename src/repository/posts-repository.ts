import {findBlogger} from "./bloggers-repository";

const posts = [
    {
        "id": 0,
        "title": "My first post",
        "shortDescription": "About me",
        "content": "Hello, it's me!",
        "bloggerId": 0,
        "bloggerName": "SW blogger"
    }, {
        "id": 1,
        "title": "My second post",
        "shortDescription": "About me. part 2",
        "content": "I'm SW blogger. I'll tell you everithing about Star Wars!",
        "bloggerId": 0,
        "bloggerName": "SW blogger"
    }, {
        "id": 2,
        "title": "My third post",
        "shortDescription": "About me. part 3",
        "content": "Guess what! I'm star wars fan!",
        "bloggerId": 0,
        "bloggerName": "SW blogger"
    },
]
const findPost = (id: number) => {
    return posts.find(p => p.id === id)
}
export const postsRepository = {
    getPosts(id?: number) {
        if (id) {
            return findPost(id)
        } else {
            return posts
        }

    },
    createPost(title: string, shortDescription: string, content: string, bloggerId: number) {
        const blogger = findBlogger(bloggerId);
        if (blogger) {
            const newPost = {
                id: (+new Date()),
                title,
                shortDescription,
                content,
                bloggerId,
                bloggerName: blogger.name
            }
            posts.push(newPost)
            return newPost
        } else {
            return false
        }
    },
    updatePost(title: string, shortDescription: string, content: string, bloggerId: number, id: number) {
        const post = findPost(id)
        if (post) {
            post.title = title
            post.shortDescription = shortDescription
            post.content = content
            post.bloggerId = bloggerId

            return true
        } else {
            return false
        }
    },
    deletePost(id: number) {
        const postIndex = posts.findIndex(p => p.id === id)
        if (postIndex !== -1) {
            posts.splice(postIndex, 1)
            return true
        } else {
            return false
        }
    }
}