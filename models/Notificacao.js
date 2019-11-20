const mongoose = require('mongoose');

const NotificacaoSchema = new mongoose.Schema({
    aluno: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    texto: {
        type: String,
        required: true
    },
    lido: {
        type: Boolean,
        default: false,
        required: true
    }
})

const Notificacao = mongoose.model('Notificacao', NotificacaoSchema);

module.exports = Notificacao