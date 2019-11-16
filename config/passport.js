const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Aluno = require('../models/Aluno');

module.exports = function (passport) {
    passport.use('aluno',
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            Aluno.findOne({ email: email })
                .then(aluno => {
                    if (!aluno) {
                        return done(null, false, { message: 'Email not registered' });
                    }

                    //Match password
                    bcrypt.compare(password, aluno.password, (err, isMatch) => {
                        if (err) throw err;

                        if (isMatch) {
                            return done(null, aluno);
                        } else {
                            return done(null, false, { message: 'Wrong password' });
                        }
                    })
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser(function (obj, done) {
        done(null, { id: obj.id });
    });

    passport.deserializeUser(function (obj, done) {
        Aluno.findById(obj.id, function (err, aluno) {
            done(err, aluno);
        });
    });
}