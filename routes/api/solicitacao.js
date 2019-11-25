const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const {ensureAuthenticated} = require('../../config/auth');

const Aluno = require('../../models/Aluno')
const Docente = require('../../models/Docente')
const Solicitacao = require('../../models/Solicitacao')
const Notificacao = require('../../models/Notificacao')

router.notificacoes = async (req, res, next) => {
    if (req.isAuthenticated()) {
        // res.locals.solicitacoes = []
        // const solicitacoes = await Solicitacao.find({ aluno: req.user._id, respondido: true });

        // if (!solicitacoes) {
        //     return;
        // }

        // for (let i = 0; i < solicitacoes.length; i++) {
        //     const solicitacao = solicitacoes[i];
        //     const docente = await Docente.findOne({ id_lattes: solicitacao.id_lattes });

        //     if (docente) {
        //         res.locals.solicitacoes.push(
        //             {
        //                 solicitacao: solicitacao,
        //                 docente: docente,
        //             }
        //         );
        //     }
        // }

        const notif_query = Notificacao.find({});
        const notificacoes = await notif_query.exec();
        res.locals.notificacoes = notificacoes

        next();
    } else {
        next();
    }
}

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: require('../../config/nodemailer_auth').auth,
});

router.get('/solicitacao/:id_lattes', ensureAuthenticated, async (req, res) => {

    const docente_query = Docente.findOne({ id_lattes: req.params.id_lattes });
    const docente = await docente_query.exec();

    res.render('enviar_mensagem', {user: req.user, docente: docente})
});

router.post('/solicitacao/:id_lattes', (req, res) => {

    const aluno = req.user._id;
    const id_lattes = req.params.id_lattes;
    const {tipo, mensagem} = req.body;

    const solic = new Solicitacao({
        id_lattes,
        aluno,
        mensagem,
        tipo
    })

    solic.save().then(solic => {
        const email_mockup = `
            <p>${solic.mensagem}</p>
            <a href='http://localhost:5000/api/solicitacao/resposta/${solic._id}'>Responder</a>
        `;

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

router.get('/solicitacao/resposta/:id', async (req, res) => {

    const solicitacao_query = Solicitacao.findOne({ _id: req.params.id });
    const solicitacao = await solicitacao_query.exec();

    const docente_query = Docente.findOne({ id_lattes: solicitacao.id_lattes });
    const docente = await docente_query.exec();

    const aluno_query = Aluno.findOne({ _id: solicitacao.aluno });
    const aluno = await aluno_query.exec();

    res.render('enviar_resposta', {aluno:aluno, docente, solicitacao});
});

router.post('/solicitacao/resposta/:id', async (req, res) => {

    const {resposta} = req.body;

    const solic_query = Solicitacao.findOne({_id:req.params.id});
    const solic = await solic_query.exec();


    solic.resposta = resposta;

    solic.save();

    res.send(solic);
});

router.get('/solicitacao/aceitar/:id', (req, res) => {
    Solicitacao.findByIdAndUpdate(req.params.id, { respondido: true, aceito: true }).then(
        async (solic) => {
            if (!solic) {
                res.send("Solicitação não encontrada");
                return;
            }

            const docente_query = Docente.findOne({ id_lattes: solic });
            const docente = await docente_query.exec();

            const texto = `${docente.nome} respondeu sua solicitação.`

            const notificacao = new Notificacao(
                {
                    aluno: solic.aluno,
                    texto: texto,
                    lido: false
                }
            );

            notificacao.save().then( notificacao => {
                console.log(notificacao.texto);
                res.send(notificacao.texto);
            });
        }
    )
});

router.get('/solicitacao/recusar/:id', (req, res) => {
    Solicitacao.findByIdAndUpdate(req.params.id, { respondido: true, aceito: false }).then(
        async (solic) => {
            if (!solic) {
                res.send("Solicitação não encontrada");
                return;
            }

            const docente_query = Docente.findOne({ id_lattes: solic });
            const docente = await docente_query.exec();

            const texto = `${docente.nome} respondeu sua solicitação.`
            

            const notificacao = new Notificacao(
                {
                    aluno: solic.aluno,
                    texto: texto,
                    lido: false
                }
            );

            notificacao.save().then( notificacao => {
                console.log(notificacao.texto);
                res.send(notificacao.texto);
            });
        }
    )
});

module.exports = router;
