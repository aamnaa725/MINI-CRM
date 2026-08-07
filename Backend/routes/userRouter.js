// routes/users.js
const express = require('express');
const userRouter = express.Router(); // Create a new router instance

// This matches the base path "/" relative to where it is mounted
userRouter.get('/', (req, res) => {
    res.send('Fetch all users');
});

// This matches "/profile" relative to the base path
userRouter.get('/profile', (req, res) => {
    res.send('User profile data');
});

module.exports = userRouter;
