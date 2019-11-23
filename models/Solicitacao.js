const mongoose = require('mongoose');

const SolicitacaoSchema = new mongoose.Schema({
    id_lattes: {
        type: String,
        required: true
    },
    aluno: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    respondido: {
        type: Boolean, 
        default: false,
        required: true
    },
    aceito: {
        type: Boolean,
        default: false,
        required: true,
    },
    tipo: {
        type: String,
        default: "tcc",
        required: true,
    },
    date: {
        type: Date,
        default: Date.now(),
    }
})

const Solicitacao = mongoose.model('Solicitacao', SolicitacaoSchema);

module.exports = Solicitacao