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

router.get('/perfil', ensureAuthenticated, async (req, res) => {

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

    console.log(docentes);

    res.render('perfil', {
        user: req.user,
        solicitacoes: solicitacoes_data,
        favoritos: docentes,
    });
});

// Login Page
router.get('/login', (req, res) => { 
    if (req.isAuthenticated()) {
            res.redirect('/');
    }
    res.render('login', {user: req.user, login: true})
});

//Register page
router.get('/register', (req, res) => { 
    Curso.find({}).then( cursos => {
        if (cursos) {
            res.render('login', { user: req.user, cursos: cursos, login:false });
        }
    });
});

// Register handle
router.post('/register', (req, res) => {
    const { name, email, curso, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !curso || !password || !password2) {
        errors.push({msg: 'Please fill all fields'});
    }

    if (password != password2) {
        errors.push({msg: 'Passwords do not match'});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            curso,
            user: req.user
        });
    } else {
        Aluno.findOne({email: email})
            .then(aluno => {
                if (aluno) {
                    errors.push({msg: 'Email already registered'});
                    res.render('register', {
                        errors,
                        name,
                        curso,
                        user: req.user
                    });
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
                                    res.redirect('/aluno/login');
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
        failureRedirect: '/users/login',
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

router.post('/favoritar/:id_lattes', (req, res) => {
    if (req.user == undefined) res.sendStatus(204);
    const id_lattes = req.params.id_lattes;

    const favorito = new Favorito({
        id_lattes,
        aluno: req.user.id
    })

    favorito.save();

    res.sendStatus(204);
});

module.exports = router;