const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// ! Update user
router.put("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                console.log(err);
                return res.status(500).json(err);
            };
        };
        try {
            const user = await User.findByIdAndUpdate(req.params.id, { $set: req.body });
            res.status(200).json("Account has been updated");
        } catch (err) {
            res.status(500).json(err);
        };
    } else {
        return res.status(403).json("You can update only your account!");
    };
});

// ! Delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(204).json("Account has been deleted");
        } catch (err) {
            res.status(500).json(err);
        };
    } else {
        return res.status(403).json("You can delete only your account!");
    };
});

// ! Get a user
router.get("/", async (req, res) => {
    const userId = req.query.userId;

    try {
        const user = userId && await User.findById(userId);
        const { password, updatedAt, ...other } = user._doc;
        return res.status(200).json(other);
    } catch (err) {
        return res.status(500).json(err);
    };
});

// ! Get all users
router.get("/all", async (req, res) => {
    try {
        User.find({}, function (err, users) {
            res.json(users)
        });
    } catch (err) {
        return res.status(500).json(err);
    };
});

// ! Get friends
router.get("/friends/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followins.map(friendId => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map(friend => {
            const { _id, firstName, lastName, profilPicture } = friend
            friendList.push({ _id, firstName, lastName, profilPicture });
        });
        res.status(200).json(friendList);
    } catch (err) {
        return res.status(500).json(err);
    };
});

// ! Follow a user
router.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followins: req.params.id } });
                return res.status(200).json("User has been followed");
            } else {
                return res.status(403).json("You already follow this user")
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can't follow yourself");
    };
});

// ! Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followins: req.params.id } });
                return res.status(200).json("User has been unfollowed");
            } else {
                return res.status(403).json("You don't follow this user")
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can't unfollow yourself");
    };
});

module.exports = router;