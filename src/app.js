import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/User.routes.js'
import VideoRouter from './routes/Video.routes.js'
import ImageRouter from './routes/image.routes.js'

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", VideoRouter);
app.use('/api/v1/images', ImageRouter)


export default app 