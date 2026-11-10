import { Dropzone } from "dropzone"

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

Dropzone.options.imagen = {
    dictDefaultMessage: "Sube tus imágenes aquí",
    acceptedFiles: ".png,.jpg,.jpeg,.avif",
    maxFilesize: 5,
    maxFiles: 1,
    parallelUploads: 1,
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: "Eliminar archivo",
    dictMaxFilesExceeded: "El límite es un archivo",
    headers: {
        'CSRF-Token': token
    },
    paramName: "imagen",
    init: function () {
        const dropzone = this
        const botonPublicar = document.querySelector("#publicar")

        botonPublicar.addEventListener('click', function () {
            dropzone.processQueue()
        })

        dropzone.on('queuecomplete', function(){
            if(dropzone.getActiveFiles().length===0){
                window.location.href='/mis-propiedades'
            }
        })
    }

}