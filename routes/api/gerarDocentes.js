const express = require('express');
const router = express.Router();

const fs = require('fs');
const fast_xml_parser = require('fast-xml-parser');

const Docente = require('../../models/Docente')
const Curriculo = require('../../models/Curriculo')
const Curso = require('../../models/Curso')

router.get('/atualizarDados', (req, res) => {
    const docentes = fs.readFileSync('config/dados_docentes', 'utf-8').split('\r\n');
    const cursos = fs.readFileSync('config/cursos', 'utf-8').split('\r\n');
    // console.log(docentes);

    cursos.forEach( name => {
        Curso.findOneAndUpdate({ name: name },{
        }, { upsert: true }, doc => {});
    });


    docentes.reverse().pop();
    docentes.forEach(docente_string => {
        const docente_info = docente_string.split(',');
        const nome = docente_info[0];
        const id_lattes = docente_info[1].replace(/['"]+/g, '');
        const img = docente_info[2];
        const email = docente_info[3];
        const trilhas = docente_info[4];
        const tags = [docente_info[5], docente_info[6], docente_info[7], docente_info[8]].join();
        const descricao = docente_info[9].replace(/['"]+/g, '');

        const json = lerCurriculo(id_lattes);
        gerarDocente(nome,id_lattes, json, img, email, trilhas, tags);
        gerarCurriculo(id_lattes, json, descricao);
    })

    res.send('');

});

function lerCurriculo(id) {
    const path = 'curriculo/' + id + '/curriculo.xml';
    const xml = fs.readFileSync(path, 'binary');

    var options = {
        ignoreAttributes: false,
        localeRange: "ptBR",
    }

    if (fast_xml_parser.validate(xml) === true) {
        var json = fast_xml_parser.parse(xml, options);
        return json['CURRICULO-VITAE'];
    }
}

function gerarDocente(nome, id_lattes, json, image, email, trilhas_string, tags) {
    let nome_completo = json['DADOS-GERAIS']['@_NOME-COMPLETO'];
    let curso = 'Sistemas e Mídias Digitais'

    const trilhas = trilhas_string.split(" | ").join();
    Docente.findOneAndUpdate({ id_lattes: id_lattes },{
        id_lattes,
        nome,
        nome_completo,
        curso,
        trilhas,
        tags,
        disponivel: true,
        disponivel_tcc: true,
        email,
        image
    }, { upsert: true }, doc => {});
}

function gerarCurriculo(id_lattes, json, descricao) {
    let apresentacao = json['DADOS-GERAIS']['RESUMO-CV']['@_TEXTO-RESUMO-CV-RH'];

    let formacao = {};
    formacao['graduacao'] = [];
    formacao['mestrado'] = [];
    formacao['doutorado'] = [];

    let grad = json['DADOS-GERAIS']['FORMACAO-ACADEMICA-TITULACAO']['GRADUACAO'];
    let mestr = json['DADOS-GERAIS']['FORMACAO-ACADEMICA-TITULACAO']['MESTRADO'];
    let doutr = json['DADOS-GERAIS']['FORMACAO-ACADEMICA-TITULACAO']['DOUTORADO'];

    if (grad.forEach != undefined) {
        grad.forEach(g => {
            formacao['graduacao'].push(`Graduação em ${g['@_NOME-CURSO']} pela ${g['@_NOME-INSTITUICAO']} em ${g['@_ANO-DE-CONCLUSAO']}`);
        })
    } else {
        formacao['graduacao'].push(`Graduação em ${grad['@_NOME-CURSO']} pela ${grad['@_NOME-INSTITUICAO']} em ${grad['@_ANO-DE-CONCLUSAO']}`);
    }

    if (mestr.forEach != undefined) {
        mestr.forEach(g => {
            formacao['mestrado'].push(`Graduação em ${g['@_NOME-CURSO']} pela ${g['@_NOME-INSTITUICAO']} em ${g['@_ANO-DE-CONCLUSAO']}`);
        })
    } else {
        formacao['mestrado'].push(`Mestrado em ${mestr['@_NOME-CURSO']} pela ${mestr['@_NOME-INSTITUICAO']} em ${mestr['@_ANO-DE-CONCLUSAO']}, com a tese "${mestr['@_TITULO-DA-DISSERTACAO-TESE']}".`);
    }

    if (doutr != undefined) {

        if (doutr.forEach != undefined) {
            doutr.forEach(g => {
                formacao['doutorado'].push(`Doutorado em ${g['@_NOME-CURSO']} pela ${g['@_NOME-INSTITUICAO']} em ${g['@_ANO-DE-CONCLUSAO']}`);
            })
        } else {
            formacao['doutorado'].push(`Doutorado em ${doutr['@_NOME-CURSO']} pela ${doutr['@_NOME-INSTITUICAO']} em ${doutr['@_ANO-DE-CONCLUSAO']} com a tese "${doutr['@_TITULO-DA-DISSERTACAO-TESE']}".`);
        }
    }

    // console.log(formacao);

    let profissional = [];
    let publicacoes = [];
    if (json['PRODUCAO-BIBLIOGRAFICA']['ARTIGOS-PUBLICADOS'] != undefined) {
        let pub = json['PRODUCAO-BIBLIOGRAFICA']['ARTIGOS-PUBLICADOS']['ARTIGO-PUBLICADO'];
        if (pub.forEach != undefined) {
            pub.forEach(p => {
                let dados = p['DADOS-BASICOS-DO-ARTIGO']
                publicacoes.push(
                    `${dados['@_TITULO-DO-ARTIGO']}`
                )
            });
        }
    }
    if (json['PRODUCAO-BIBLIOGRAFICA']['TRABALHOS-EM-EVENTOS'] != undefined) {
        let pub = json['PRODUCAO-BIBLIOGRAFICA']['TRABALHOS-EM-EVENTOS']['TRABALHO-EM-EVENTOS'];
        if (pub.forEach != undefined) {
            pub.forEach(p => {
                let dados = p['DADOS-BASICOS-DO-TRABALHO']
                publicacoes.push(
                    `${dados['@_TITULO-DO-TRABALHO']}`
                )
            });
        }
    }

    let extensao = [];

    Curriculo.findOneAndUpdate({ id_lattes: id_lattes },{
        id_lattes,
        descricao,
        apresentacao,
        formacao,
        profissional,
        publicacoes,
        extensao
    }, { upsert: true }, doc => {});
}

module.exports = router;