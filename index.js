import express from 'express'
import connectDB from './src/db/index.js'
import dotenv from 'dotenv'
import UserRouter from './src/routes/user.routes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

dotenv.config()
const app = express()

app.use(cookieParser())
app.use(cors())
app.use (express.json())
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

