// 1. Load dependencies at the very top
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = 'mini-crm';

let db;

const corsOptions = {
  origin: 'http://localhost:5173', // Allow only your Vite/React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Fixes your exact error
  credentials: true // Allow cookies/sessions if needed later
};


// 2. Global Middleware
app.use(cors(corsOptions));
app.use(express.json()); // Parses incoming JSON payloads

// 3. Database Connection Logic
async function startServer() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ Connected successfully to MongoDB server');
        
        db = client.db(DB_NAME);
        app.locals.db = db; 

        app.use('/auth', authRouter);
        // app.use('/users', userRouter);

        // Health check endpoint
        app.get('/status', (req, res) => {
            res.json({ status: 'Online', database: 'Connected' });
        });

        // 5. Start HTTP Listener
        app.listen(PORT, () => {
            console.log(`🚀 Server is listening at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Database connection failed framework initialization:', error);
        process.exit(1); // Stop the app if it cannot connect to the database
    }
}

// Execute the bootstrap function
startServer();
