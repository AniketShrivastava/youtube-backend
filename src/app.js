import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express()

// cors..........
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
//decode url encode .................
app.use(express.urlencoded({extended:true, limit:"16kb"}))

// save pdf and image .........
app.use(express.static("public"))
app.use(cookieParser())


//import router
import userRouter from"./routes/user.routes.js"

app.use("/users", userRouter)




export {app}