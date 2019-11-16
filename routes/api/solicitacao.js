const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const Docente = require('../../models/Docente')
const Solicitacao = require('../../models/Solicitacao')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: require('../../config/nodemailer_auth').auth,
});

router.post('/solicitacao/:id_lattes', (req, res) => {

    const { aluno } = req.body.aluno_id;

    Solicitacao
        .findOne(
            {
                id_lattes: req.params.id_lattes,
                aluno: aluno
            }
        ).then(solicitacao => {
            if (solicitacao) {
                console.log('solicitacao já realizada');
                res.send(204);
                return;
            }

            const solic = new Solicitacao({
                id_lattes,
                aluno,
            })

            solic.save().then(solic => {
                const email_mockup = `
                <ul>
                    <li>
                        <a href='http://localhost:5000/solicitacao/aceitar/${solic._id}'>Aceitar</a>
                    </li>
                    <li>
                        <a href='http://localhost:5000/solicitacao/recusar/${solic._id}'>Recusar</a>
                    </li>
                </ul>`;

                transporter.sendMail({
                    from: 'rennesampaio97@gmail.com',
                    to: req.body.email,
                    subject: "teste",
                    html: email_mockup
                }, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.send("Falha ao enviar pedido. Tente novamente");
                    }
                })

                console.log(`Solicitado ${req.params.id_lattes}`);
                res.sendStatus(204);
            });
        });
});

router.get('/solicitacao/aceitar/:id', (req, res) => {
    Solicitacao.findByIdAndUpdate(id, {respondido: true, aceito: true}).then(
        solic => {
            if (!solic) {
                res.send("Solicitação não encontrada");
                return;
            }
            console.log(`Solicitacao aceita ${req.params.id_lattes}`);
            res.send(`Solicitacao aceita ${req.params.id_lattes}`);
        }
    )
});

router.get('/solicitacao/recusar/:id', (req, res) => {
    Solicitacao.findByIdAndUpdate(id, {respondido: true, aceito: false}).then(
        solic => {
            if (!solic) {
                res.send("Solicitação não encontrada");
                return;
            }
            console.log(`Solicitacao recusada ${req.params.id_lattes}`);
            res.send(`Solicitacao recusada ${req.params.id_lattes}`);
        }
    )
});

module.exports = router;
