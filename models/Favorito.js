const mongoose = require('mongoose');

const FavoritoSchema = new mongoose.Schema({
    aluno: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    id_lattes: {
        type: String,
        required: true
    },
})

const Favorito = mongoose.model('Favorito', FavoritoSchema);

module.exports = Favorito