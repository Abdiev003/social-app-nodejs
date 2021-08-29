const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ! REGISTER
router.post("/register", async (req, res) => {
    try {
        // Generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword
        });

        // user save and response
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    };
});

// ! LOGIN
router.post("/login", async (req, res) => {
    try {
        // find user in database
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(404).json("User not found");

        // password validate user
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).json("Wrong password");

        res.status(200).json(user);

    } catch (err) {
        res.status(500).json(err);
    };
});

module.exports = router;