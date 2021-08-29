const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// ! Create a post
router.post("/", async (req, res) => {
    const newPost = await new Post(req.body);

    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        return res.status(500).json(err);
    };
});

// ! Update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            return res.status(200).json("The post has been updated");
        } else {
            return res.status(403).json("You can update only your post");
        };

    } catch (err) {
        return res.status(500).json(err);
    };
});

// ! Delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (post.userId === req.body.userId) {
            await post.deleteOne();
            return res.status(204).json("The post has been deleted");
        } else {
            return res.status(403).json("You can delete only your post");
        };

    } catch (err) {
        return res.status(500).json(err);
    };
});

// ! Like a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } })
            return res.status(200).json("The post has been liked")
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } })
            return res.status(200).json("The post has been disliked")
        };
    } catch (err) {
        return res.status(500).json(err);
    };
});

// ! Get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).json(err);
    };
});

// ! Get timeline posts
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id })
        const friendPosts = await Promise.all(
            currentUser.followins.map(friendId => {
                return Post.find({ userId: friendId })
            })
        )
        return res.status(200).json(userPosts.concat(...friendPosts))
    } catch (err) {
        return res.status(500).json(err);
    };
});

// ! Get user`s all posts
router.get("/profile/:userId", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId });
        const posts = await Post.find({ userId: user._id });
        return res.status(200).json(posts);
    } catch (err) {
        return res.status(500).json(err);
    };
});

module.exports = router;