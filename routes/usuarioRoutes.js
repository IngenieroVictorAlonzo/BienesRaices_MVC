import express from "express"
import {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar,
    cerrarSesion
} from "../controllers/usuarioController.js"

//crear la app
const router = express.Router()

//routing
/* router.get('/', (req, res) => {
    res.send("Holas mundo en express.")
}) */

/* router.get('/login', (req, res) => {
    //res.render("Holas mundo en express.")
    res.render('auth/login',{
        autenticado:false
    })
}) */

router.get("/login", formularioLogin)
router.post("/login",autenticar)
router.post("/cerrar-sesion",cerrarSesion)
router.get("/registro", formularioRegistro)
router.post("/registro", registrar)
router.get("/confirmar/:token", confirmar)
router.get("/olvide-password", formularioOlvidePassword)
router.post("/olvide-password", resetPassword)

router.get("/olvide-password/:token", comprobarToken)
router.post("/olvide-password/:token", nuevoPassword)

router.get('/pila', (req, res) => {
    res.send("pila todo bien")
})

export default router