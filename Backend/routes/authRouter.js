// routes/users.js
const express = require('express');
const authRouter = express.Router(); // Create a new router instance

// This matches the base path "/" relative to where it is mounted
authRouter.post('/register', (req, res) => {
    const { FullName, EmailAddress, PhoneNumber, Password } = req.body;
    const user = {
        FullName,
        EmailAddress,
        PhoneNumber,
        Password
    }
    res.status(201).send({
        status: 201,
        message: "User Created Successfully",
        user: user
    });
});

// This matches "/profile" relative to the base path
// authRouter.get('/profile', (req, res) => {
//     res.send('User profile data');
// });

module.exports = authRouter;
