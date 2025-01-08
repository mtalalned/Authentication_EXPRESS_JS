import express from 'express'
import connectDB from './src/db/index.js'
import dotenv from 'dotenv'
import UserRouter from './src/routes/user.routes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
dotenv.config()

app.use (express.json())

const allowedOrigins = ['https://shopping-cart-with-custom-back-end.vercel.app'];  // Add frontend URLs here

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);  // Allow the request
        } else {
            callback(new Error('Not allowed by CORS'));  // Reject the request
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow Authorization header
    credentials: true, // Allow sending cookies
}));

// app.use(cors())
app.use(cookieParser())
app.use ('/api/v1' , UserRouter)


connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
  });

