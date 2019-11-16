const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const CursoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
})

const Curso = mongoose.model('Curso', CursoSchema);

module.exports = Curso