const express = require('express');
const router = express.Router();

const fs = require('fs');
const fast_xml_parser = require('fast-xml-parser');

const Docente = require('../models/Docente')
const Curriculo = require('../models/Curriculo')
const Favorito = require('../models/Favorito')

router.get('/', (req, res) => {
    res.render('index', { user: req.user});
});

router.get('/cursos', (req, res) => res.render('cursos', { user: req.user, pag: "Cursos" }));

router.get('/index_smd', (req, res) => {

    Docente.find({})
        .then(async (docentes) => {

            for (let i = 0; i < docentes.length; i++) {
                docentes[i].favoritado = false;
                if (req.isAuthenticated()) {
                    const favorito_query = Favorito.exists({id_lattes: docentes[i].id_lattes, aluno: req.user._id});
                    docentes[i].favoritado = await favorito_query;
                }
            }

            res.render('index_smd', {
                docentes: docentes,
                user: req.user,
                pag: "Sistemas e Mídias Digitais"
            });
        });

});

router.get('/:id', (req, res) => {

    let id = req.params.id;

    Docente.findOne({ id_lattes: id })
        .then( async (docente) => {
            if (docente) {
                console.log(docente.nome)
                Curriculo.findOne({ id_lattes: id })
                    .then(async (curriculo) => {
                        if (!curriculo) {
                            res.redirect('/');
                        }

                        docente.favoritado = false;
                        if (req.isAuthenticated()) {
                            const favorito_query = Favorito.exists({id_lattes: id, aluno: req.user._id});
                            docente.favoritado = await favorito_query;
                        }


                        res.render('professor', {
                            docente: docente,
                            apresentacao: curriculo.apresentacao,
                            formacao: curriculo.formacao,
                            publicacoes: curriculo.publicacoes,
                            user: req.user,
                            pag: "Docente"
                        });
                    })

            } else {
                res.redirect('/');
            }
        })

});

// router.get('/:id', (req, res) => {
//     const path = `./curriculos/${req.params.id}/curriculo.xml`;
//     const xml = fs.readFileSync(path,'binary');

//     var options = {
//         ignoreAttributes: false,
//         localeRange: "ptBR",
//     }

//     if (fast_xml_parser.validate(xml) === true) {
//         var json = fast_xml_parser.parse(xml, options);
//     }

//     res.render('professor', {
//         nome: json['CURRICULO-VITAE']['DADOS-GERAIS']['@_NOME-COMPLETO'],
//         apresentacao: json['CURRICULO-VITAE']['DADOS-GERAIS']['RESUMO-CV']['@_TEXTO-RESUMO-CV-RH'],
//     });
// });

router.get('/:id/json', (req, res) => {
    const path = 'curriculo/' + req.params.id + '/curriculo.xml';
    const xml = fs.readFileSync(path, 'binary');

    var options = {
        ignoreAttributes: false,
        localeRange: "ptBR",
    }

    if (fast_xml_parser.validate(xml) === true) {
        var json = fast_xml_parser.parse(xml, options);
    }

    res.send(json);
});

module.exports = router;