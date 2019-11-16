const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const CurriculoSchema = new mongoose.Schema({
    id_lattes: {
        type: String,
        required: true
    },
    apresentacao: {
        type: String,
        required: true,
    },
    formacao: {
        type: {},
        required: true
    },
    profissional: {
        type: [],
        required: true,
    },
    publicacoes: {
        type: [],
        required: true,
    },
    extensao: {
        type: [],
        required: true,
    },
    updateDate: {
        type: Date,
        default: Date.now,
    }
})

const Curriculo = mongoose.model('Curriculo', CurriculoSchema);

module.exports = Curriculo;