import Usuario from "../models/Usuario.js"
import { check, validationResult } from "express-validator"
import { generarId,generarJWT } from "../helpers/tokens.js"
import { emailRegistro, emailOlvidePassword } from "../helpers/emails.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        //autenticado: false
        pagina: "Iniciar sesión",
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {

    console.log("estoy dentro de la funcion autenticar")
    await check('email').isEmail().withMessage('Eso no parece un email.').run(req)
    await check('password').notEmpty().withMessage('El password es obligatorio.').run(req)

    let resultado = validationResult(req)

    //verificar que el resultado de errores esté vacío
    if (!resultado.isEmpty()) {
        console.log(req.body)
        return res.render('auth/login', {
            pagina: "Iniciar sesión",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),

        })
    }

    const { email, password } = req.body

    //comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render("auth/login", {
            pagina: "Iniciar sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El usuario no existe" }]

        })
    }

    //comprobar si el usuario está confirmado
    if (!usuario.confirmado) {
        return res.render("auth/login", {
            pagina: "Iniciar sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El usuario no está confirmado" }]

        })
    }

    //comprobar el password

    if(!usuario.verificarPassword(password)){
         return res.render("auth/login", {
            pagina: "Iniciar sesión",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El password es incorrecto" }]

        })
    }

    //autenticar al usuario

    const token= generarJWT({id:usuario.id, nombre:usuario.nombre})

    console.log(token)

    //almacenar en un cookie

    return res.cookie("_token",token,{
        httpOnly: true
    }).redirect("/mis-propiedades")
}

const cerrarSesion=(req,res)=>{
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro = (req, res) => {

    console.log(req.csrfToken())
    res.render('auth/registro', {
        pagina: "Crear cuenta",
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {

    console.log(req.body)
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacío.').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email.').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password debe tener al menos 6 caracteres.').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los passwords no son iguales.').run(req)

    let resultado = validationResult(req)

    //verificar que el resultado de errores esté vacío
    if (!resultado.isEmpty()) {
        console.log(req.body)
        return res.render('auth/registro', {
            pagina: "crear pagina",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
    //res.json(resultado.array())

    //extraer los datos
    const { nombre, email, password } = req.body

    //verificar que el usuario no esté duplicado
    const existeUsuario = await Usuario.findOne({ where: { email } })
    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: "crear cuenta",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El usuario ya está registrado" }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })
    //res.json(usuario)

    //enviar email de confirmación
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    //mostrar mensaje de confirmación
    res.render('templates/mensaje', {
        pagina: "Cuenta creada correctamente",
        mensaje: "Hemos enviado un email de confirmación, presiona en el enlace."
    })
}

//funcion que comprueba una cuenta
const confirmar = async (req, res) => {

    const { token } = req.params

    const usuario = await Usuario.findOne({ where: { token } })
    console.log(usuario)

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: "Error al confirmar tu cuenta",
            mensaje: "Hubo un error al confirmar tu cuenta, intenta de nuevo",
            error: true
        })
    }

    usuario.token = null
    usuario.confirmado = true

    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        pagina: "Cuenta confirmada",
        mensaje: "La cuenta se confirmó correctamente",

    })

}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: "Recupera tu acceso a Bienes Raíces",
        csrfToken: req.csrfToken(),
    })
}

const resetPassword = async (req, res) => {
    await check('email').isEmail().withMessage('Eso no parece un email.').run(req)

    let resultado = validationResult(req)

    //verificar que el resultado de errores esté vacío
    if (!resultado.isEmpty()) {
        console.log(req.body)
        return res.render('auth/olvide-password', {
            pagina: "crear cuenta",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),

        })
    }

    //buscar el usuario
    const { email } = req.body
    const usuario = await Usuario.findOne({ where: { email } })
    console.log(usuario)
    if (!usuario) {
        return res.render('auth/olvide-password', {
            pagina: "Recupera tu acceso a Bienes Raices",
            csrfToken: req.csrfToken(),
            errores: [{ msg: "El email no pertenece a ningun usuario" }]

        })
    }

    //generar un token y enviar un email
    usuario.token = generarId()
    await usuario.save()
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    res.render('templates/mensaje', {
        pagina: "Reestablece tu password",
        mensaje: "Hemos enviado un email con las instrucciones"
    })



}

const comprobarToken = async (req, res) => {

    const { token } = req.params
    const usuario = await Usuario.findOne({ where: { token } })

    console.log(usuario)

    if (!usuario) {
        return res.render("auth/confirmar-cuenta", {
            pagina: "Reestablece tu password",
            mensaje: "Hubo un error al validar tun información, intenta de nuevo",
            error: true
        })
    }

    //mostrar formulario para modificar el password
    res.render("auth/reset-password", {
        pagina: "Reestablece tu password",
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req, res) => {
    await check('password').isLength({ min: 6 }).withMessage('El password debe tener al menos 6 caracteres.').run(req)

    let resultado = validationResult(req)

    //verificar que el resultado de errores esté vacío
    if (!resultado.isEmpty()) {
        console.log(req.body)
        return res.render('auth/reset-password', {
            pagina: "Restablece el password",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),

        })
    }

    const { token } = req.params
    const { password } = req.body

    const usuario = await Usuario.findOne({ where: { token } })
    console.log(usuario)
    //hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null
    await usuario.save()

    res.render("auth/confirmar-cuenta", {
        pagina: "Password restablecido",
        mensaje: "el password se guardó correctamente"
    })
}



export {
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
}