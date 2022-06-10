const express = require('express');
const bodyParser = require('body-parser');
const res = require('express/lib/response');
const { ObjectId } = require('mongodb');
const { ObjectID } = require('bson');
const app = express();

const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://byanca:maia@cluster0.zd3pa.mongodb.net/teste?retryWrites=true&w=majority"

MongoClient.connect(uri, (err, client) => {
    if (err) return console.log(err)
    db = client.db('teste')

    app.listen(3000, function () {
        console.log('Servidor rodando...')
    })
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());

app.set('view engine', 'ejs');

//arquivos estáticos
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))


app.get('/', (req, res) => {
    res.render('index.ejs');
})

app.get('/cadastro.ejs', (req, res) => {
    res.render('cadastro.ejs');
})

app.get('/index.ejs', (req, res) => {
    res.render('index.ejs');
})

app.post('/show', (req, res) => {

    db.collection('usuario').find({ "usuario": req.body.usuario }).toArray(function (err, items) {
        if (err) {
            console.log(err);
        } else {
            if (items == undefined) {
                res.render('index.ejs');
            }
            else if (items[0].senha != req.body.senha) {
                res.render('index.ejs');
            }
            else {
                db.collection('produto').find().toArray(function (err, produtos) {
                    if (err) {
                        console.log(err);
                    } else {
                        // console.log(produtos);
                        res.render('menu.ejs', { table: produtos });
                    }
                })
            };
        }
    })
})

app.post('/login', (req, res) => {
    console.log(req.body);
    db.collection('usuario').find({ "usuario": req.body.usuario }).toArray(function (err, items) {
        console.log("Uma requisiçao externa foi solicitada. getlistarprodutos");

        if (err) {
            console.log(err);
        } else {

            try {

                if (items[0].senha === req.body.senha) {
                    res.send(true);
                }

            } catch (err) {

                res.send(false);

            }


        }
    })
})

app.get('/listarprodutos', (req, res) => {

    console.log("Uma requisiçao externa foi solicitada. getlistarprodutos")

    db.collection('produto').find().toArray(function (err, produtos) {
        if (err) {
            console.log(err);
        } else {
            res.send(produtos);
        }
    })
})

app.post('/cadastrar', (req, res) => {
    db.collection('produto').insertOne(req.body, (err, result) => {
        if (err) {
            console.log(err);
        } else {

            console.log('salvo com sucesso');

            db.collection('produto').find().toArray(function (err, produtos) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('menu.ejs', { table: produtos });
                }
            })
        }

    })
})

app.post('/atualizarproduto', (req, res) => {

    console.log(req.body._idedit);
    db.collection('produto').updateOne({ _id: new ObjectId(req.body._idedit) },
        {
            $set: {
                nome: req.body.nomeedit,
                lote: req.body.loteedit,
                datafabricacao: req.body.datafabricacaoedit,
                datavencimento: req.body.datavencimentoedit,
                funcao: req.body.funcaoedit,
                quantidade: req.body.quantidadeedit,
                precocusto: req.body.precocustoedit,
                precovendas: req.body.precovendasedit,
                nomealocado: req.body.nomealocadoedit,
                alocado: req.body.alocadoedit,
            }
        },
        { upsert: true }
        , (err, result) => {
            if (err) {
                console.log(err);
            } else {

                console.log('atualizado com sucesso');

                db.collection('produto').find().toArray(function (err, produtos) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render('menu.ejs', { table: produtos });
                    }
                })
            }

        })
})

app.post('/buscaritem', (req, res) => {
    var data = req.body;
    var id = data.id;
    db.collection('produto').find({ _id: ObjectId(id) }).toArray(function (err, produtos) {
        if (err) {
            console.log(err);
        } else {
            res.send(produtos[0]);
        }
    })
})

app.post('/deletaritem', (req, res) => {
    var data = req.body;
    var id = data.id;
    db.collection('produto').deleteOne({ _id: ObjectId(id) }, function (err, obj) {
        if (err) throw err;

        db.collection('produto').find().toArray(function (err, produtos) {
            if (err) {
                console.log(err);
            } else {
                res.render('menu.ejs', { table: produtos });
            }
        })
    });
    console.log("produto deletado");
})