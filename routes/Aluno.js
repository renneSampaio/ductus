const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth');

const Aluno = require('../models/Aluno')
const Solicitacao = require('../models/Solicitacao')
const Docente = require('../models/Docente')
const Curso = require('../models/Curso')
const Favorito = require('../models/Favorito')
const Notificacao = require('../models/Notificacao')

router.get('/perfil/:pag', ensureAuthenticated, async (req, res) => {

    const solicitacoes_query = Solicitacao.find({aluno: req.user._id})
    const solicitacoes = await solicitacoes_query.exec();

    const solicitacoes_data = []
    for(let i = 0; i < solicitacoes.length; i++) {
        const docente_query = Docente.findOne({id_lattes: solicitacoes[i].id_lattes});
        const docente = await docente_query.exec();

        solicitacoes_data.push({solicitacao: solicitacoes[i], docente: docente});
    }

    const favoritos_query = Favorito.find({aluno: req.user._id});
    const favoritos = await favoritos_query.exec();

    const docentes = []
    for(let i = 0; i < favoritos.length; i++) {
        const docente_query = Docente.findOne({id_lattes: favoritos[i].id_lattes});
        const docente = await docente_query.exec();

        docentes.push(docente);
    }
    console.log('Favoritos:')
    console.log(favoritos)

    res.render('perfil', {
        user: req.user,
        solicitacoes: solicitacoes_data,
        favoritos: docentes,
        pag: "Perfil",
        pag_favoritos: (req.params.pag == 'favoritos')
    });
});

// Login Page
router.get('/login', (req, res) => { 
    if (req.isAuthenticated()) {
            res.redirect('/');
    } else {
        res.render('login', {user: req.user, login: true, pag: "Entrar", cadastro_sucesso: false})
    }
});

//Register page
router.get('/register', (req, res) => { 
    Curso.find({}).then( cursos => {
        if (cursos) {
            res.render('login', { user: req.user, cursos: cursos, login:false, cadastro_sucesso: false, pag: "Entrar"});
        }
    });
});

// Register handle
router.post('/register', (req, res) => {
    const { name, email, curso, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !curso || !password || !password2) {
        errors.push({msg: 'Preencha todos os campos'});
    }

    if (password != password2) {
        errors.push({msg: 'As senhas não estão iguais'});
    }

    if (errors.length > 0) {
        res.render('login', { errors, email, name, curso, user: req.user, login:false, pag: "Entrar", cadastro_sucesso: false});
        // res.render('register', {
        //     errors,
        //     name,
        //     email,
        //     curso,
        //     user: req.user
        // });
    } else {
        Aluno.findOne({email: email})
            .then(aluno => {
                if (aluno) {
                    errors.push({msg: 'Email já cadastrado'});
                    res.render('login', { errors, name, user: req.user, login:false, pag: "Entrar", cadastro_sucesso: false});
                } else {
                    const newaluno = new Aluno({
                        name,
                        email,
                        curso,
                        password
                    });

                    bcrypt.genSalt(10, (err, salt) => 
                        bcrypt.hash(newaluno.password, salt, (err, hash) => {
                            if (err) throw err

                            newaluno.password = hash;
                            newaluno.save()
                                .then(aluno => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.render('login', { errors, email, name, user: req.user, login:true, pag: "Entrar", cadastro_sucesso: true});
                                })
                                .catch(err => console.log(err));
                    }));
                }
            });
    }
})

//Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('aluno', {
        successRedirect: '/',
        failureRedirect: '/aluno/login',
        failureFlash: true
    })(req, res, next);
});

//Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

router.get('/solicitacoes', (req, res) => {
    Solicitacao.find({ aluno: req.user._id }).then(solicitacoes => {
        if (solicitacoes) {

            solic_data = [];

            if (solicitacoes.length == 0) {
                res.render('solicitacoes', {
                    user: req.user,
                    solicitacoes: solic_data,
                });
            }

            solicitacoes.forEach(solicitacao => {
                Docente.findOne({ id_lattes: solicitacao.id_lattes }).then(docente => {
                    if (!docente) { return; }

                    solic_data.push(
                        {
                            solicitacao: solicitacao,
                            docente: docente
                        }
                    );

                    res.render('solicitacoes',
                    {
                        user: req.user,
                        solicitacoes: solic_data
                    });
                });
            });
        };
    })
});

router.post('/favoritar/:id_lattes/:pag?', ensureAuthenticated, (req, res) => {
    if (req.user == undefined) res.sendStatus(204);
    const id_lattes = req.params.id_lattes;

    Favorito.findOne({id_lattes, aluno: req.user.id}).then( favorito => {
        if (favorito) {
            Favorito.deleteOne({id_lattes, aluno: req.user._id}).exec();
        } else {
            const favorito = new Favorito({
                id_lattes,
                aluno: req.user.id
            })
            
            favorito.save();
        }
    })

    console.log("Favoritado")
    console.log(id_lattes);
    
    if (req.params.pag == "Perfil")
        res.redirect("/aluno/perfil/favoritos");
    else
        res.sendStatus(204);
});

router.get('/notificacoes', ensureAuthenticated, async (req, res) => {
    const notificacoes_query = Notificacao.find({});
    const notificacoes = await notificacoes_query.exec();

    console.log(notificacoes)

    res.render('notificacoes', {user: req.user, notificacoes: notificacoes, pag: "Notificações"})
});

module.exports = router;