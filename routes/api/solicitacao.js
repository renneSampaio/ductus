const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const Docente = require('../../models/Docente')
const Solicitacao = require('../../models/Solicitacao')

router.notificacoes = (req, res, next) => {
    if (req.isAuthenticated()) {
        let solic_data = [];
        res.locals.solicitacoes = solic_data;
        Solicitacao.find({ aluno: req.user._id, respondido: true }).then(solicitacoes => {
            if (solicitacoes) {

                var solic_data = [];

                if (solicitacoes.length == 0) {
                    res.locals.solicitacoes = solic_data;
                }

                solicitacoes.forEach(solicitacao => {
                    if (solicitacao.lido == true) {
                        return;
                    }

                    
                    Docente.findOne({ id_lattes: solicitacao.id_lattes }).then(docente => {
                        if (!docente) { return; }
                        
                        console.log("teste");
                        solic_data.push(
                            {
                                solicitacao: solicitacao,
                                docente: docente
                            }
                        );

                        res.locals.solicitacoes = solic_data;
                    });
                });
            } else {
                let solic_data = [];
                res.locals.solicitacoes = solic_data;
            }
        })
    }
    next();
}

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: require('../../config/nodemailer_auth').auth,
});

router.post('/solicitacao/:id_lattes', (req, res) => {

    const aluno = req.user._id;
    const id_lattes = req.params.id_lattes;

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
                        <a href='http://localhost:5000/api/solicitacao/aceitar/${solic._id}'>Aceitar</a>
                    </li>
                    <li>
                        <a href='http://localhost:5000/api/solicitacao/recusar/${solic._id}'>Recusar</a>
                    </li>
                </ul>`;

                transporter.sendMail({
                    from: 'rennesampaio97@gmail.com',
                    to: 'rennesampaio97@gmail.com',
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
    Solicitacao.findByIdAndUpdate(req.params.id, { respondido: true, aceito: true }).then(
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
    Solicitacao.findByIdAndUpdate(id, { respondido: true, aceito: false }).then(
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
