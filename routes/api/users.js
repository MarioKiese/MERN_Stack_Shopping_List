const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

// Item Model
const User = require("../../models/User");

// @route   POST api/users
// @desc    Register new user
// @acces   Public
router.post("/", (req, res) => {
  const { name, email, password } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  // Check for existing user
  User.findOne({ email }).then((user) => {
    if (user) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({
      name,
      email,
      password,
    });

    // Create salt & hash
    bcrypt.genSalt(10, (error, salt) => {
      bcrypt.hash(newUser.password, salt, (error, hash) => {
        if (error) throw error;
        newUser.password = hash;
        newUser.save().then((user) => {
          jwt.sign(
            { id: user.id },
            config.get("jwtSecret"),
            { expiresIn: 3600 },
            (error, token) => {
              if (error) throw error;
              res.json({
                token,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                },
              });
            }
          );
        });
      });
    });
  });
});

module.exports = router;
