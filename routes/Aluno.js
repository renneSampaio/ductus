const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated} = require('../config/auth');

const Aluno = require('../models/Aluno')
const Solicitacao = require('../models/Solicitacao')
const Docente = require('../models/Docente')
const Curso = require('../models/Curso')

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('index', {
        user: req.user
    })
});

// Login Page
router.get('/login', (req, res) => { 
    if (req.isAuthenticated()) {
            res.redirect('/');
    }
    res.render('login', {user: req.user})
});

//Register page
router.get('/register', (req, res) => { 
    Curso.find({}).then( cursos => {
        if (cursos) {
            res.render('register', { user: req.user, cursos: cursos });
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
    Solicitacao.find({}).then(solicitacoes => {
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

module.exports = router;