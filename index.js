console.log("Holas mundo.")

//const express = require("express") //Common JS
import express from "express"
import csrf from "csurf"
import cookieParser from "cookie-parser"
import usuarioRoutes from "./routes/usuarioRoutes.js"
import propiedadesRoutes from "./routes/propiedadesRoutes.js"
import appRoutes from "./routes/appRoutes.js"
import apiRoutes from "./routes/apiRoutes.js"
import db from "./config/db.js"

//crear la app
const app = express()

//habilitar lectura de datos de formularios
app.use(express.urlencoded({ extended: true }))

//habilitar cookie parser
app.use(cookieParser())

//hablilitar CSRF
app.use(csrf({ cookie: true }))

//conexión a la db
try {
    await db.authenticate()
    db.sync()
    console.log("Conexión correcta")
} catch (error) {
    console.log(error)
}

//hablitar pug
app.set("view engine", "pug")
app.set("views", "./views")

//carpeta pública
app.use(express.static('public'))

//routing
app.use("/",appRoutes)
app.use("/auth", usuarioRoutes)
app.use("/", propiedadesRoutes)
app.use("/api",apiRoutes)


//definir un puerto y arrancar the project
const port = 3000
app.listen(port, () => {
    console.log(`El servidor está funcionando en el puerto ${port}`)
})