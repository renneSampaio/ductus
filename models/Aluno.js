const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const AlunoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    curso: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
})

AlunoSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}

AlunoSchema.methods.isValidPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

const Aluno = mongoose.model('Aluno', AlunoSchema);

module.exports = Aluno