import nodemailer from "nodemailer"

const emailRegistro = async (datos) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    //enviar el email
    await transport.sendMail({
        from: "Bienesraices.com",
        to: email,
        subject: "Confirma tu cuenta en bienesraices.com",
        text: "Confirma tu cuenta en bienesraices.com",
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en bienesraices.com</p>
            <p>Tu cuenta ya está lista, solo debes confirmarla en el siguiente enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confirmar cuenta</a></p>

            <p>Si tú no creaste esta cuenta puedes ignorar este mensaje</p>
        `

    })
}

const emailOlvidePassword = async (datos) => {
    var transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    //enviar el email
    await transport.sendMail({
        from: "Bienesraices.com",
        to: email,
        subject: "Reestablece tu password en bienesraices.com",
        text: "Reestablece tu password en bienesraices.com",
        html: `
            <p>Hola ${nombre}, has solicitado restablecer tu password en bienesraices.com</p>
            <p>Sigue el siguiente enlace para generar un password nuevo:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}">Reestablecer password</a></p>

            <p>Si tú no el cambio de password puedes ignorar este mensaje</p>
        `

    })
}


export {
    emailRegistro,
    emailOlvidePassword
}