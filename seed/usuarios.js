import bcrypt from "bcrypt"

const usuarios = [
    {
        nombre: "Juan",
        email: "juan@mail.com",
        confirmado: 1,
        password: bcrypt.hashSync("password", 10)
    }

]

export default usuarios