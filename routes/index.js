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


function alfa_filter(left, right) {
    if (left.nome < right.nome) {
        return -1;
    } else if (right.nome > left.nome) {
        return 1;
    }

    return 0;
}

function disp_filter(left, right) {
    if ((right.disponivel_tcc && right.disponivel) && (!left.disponivel)) {
        return 1;
    }
    if ((left.disponivel_tcc && left.disponivel) && (!right.disponivel)) {
        return -1;
    }

    if ((right.disponivel_tcc && right.disponivel) && (!left.disponivel_tcc && left.disponivel)) {
        return 1;
    }
    if ((!right.disponivel_tcc && right.disponivel) && (left.disponivel_tcc && left.disponivel)) {
        return -1;
    }

    if (!left.disponivel && right.disponivel) {
        return 1;
    }
    if (!right.disponivel && left.disponivel) {
            return -1;
    }
    
    return 0;
}

router.get('/index_smd/:section?/:filter_type?', (req, res) => {

    Docente.find({})
        .then(async (docentes) => {
            for (let i = 0; i < docentes.length; i++) {
                docentes[i].favoritado = false;
                if (req.isAuthenticated()) {
                    const favorito_query = Favorito.exists({id_lattes: docentes[i].id_lattes, aluno: req.user._id});
                    docentes[i].favoritado = await favorito_query;
                }

                const curriculo_query = Curriculo.findOne({ id_lattes: docentes[i].id_lattes });
                const curriculo = await curriculo_query.exec();

                docentes[i].apresentacao = curriculo.descricao;
            }

            res.render('index_smd', {
                docentes: docentes.sort(alfa_filter),
                user: req.user,
                pag: "Sistemas e Mídias Digitais",
                section: (typeof req.params.section == 'undefined')? 'Sobre': req.params.section,
                filter_type: req.params.filter_type,
                filter: (req.params.filter_type=="alfa")? alfa_filter : disp_filter,
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
                            profissional: curriculo.profissional,
                            publicacoes: curriculo.publicacoes,
                            extensao: curriculo.extensao,
                            user: req.user,
                            pag: "Docente"
                        });
                    })

            } else {
                res.redirect('/');
            }
        })

});
 
router.post('/busca', async (req, res) => {
    const { search } = req.body;

    let reg = new RegExp(`${search}`, 'i')
    let query = Docente.find().or([ {tags: reg}, {nome_completo: reg}, {trilhas: reg}])
    const result = await query.exec();

    console.log(result);

    res.render('busca', {user: req.user, docentes: result, pag: `Busca: "${search}"`})
});

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