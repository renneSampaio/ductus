const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const DocenteSchema = new mongoose.Schema({
    id_lattes: {
        type: String,
        required: true
    },
    nome: {
        type: String,
        required: true,
    },
    curso: {
        type: String,
        required: true,
    },
    trilhas: {
        type: [],
        default: '',
    },
    email: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    }
})

const Docente = mongoose.model('Docente', DocenteSchema);

module.exports = Docente