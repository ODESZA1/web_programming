const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('mongodb');
const MongoClient = db.MongoClient;
const ObjectId = db.ObjectID;
const fs = require('fs');
app.use(bodyParser.urlencoded({
    extended: !1
}));
app.use(bodyParser.json());
app.listen(8080, () => {
    MongoClient.connect('mongodb://localhost:27017', {
        useNewUrlParser: !0,
        useUnifiedTopology: !0
    }, (err, database) => {
        if (err) return console.log(err);
        console.log('localhost:8080');
        const db_ = database.db('mongodb');
        // главная страница
        app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
        // запрос существующих пиц из json на сервере
        app.get('/get-pizza-json', (req, res) => {
            res.send(JSON.parse(JSON.stringify(require(__dirname + '/pizza.json'))))
        });
        // страница выбранной питсы
        app.post('/order', (req, res) => {
            fs.readFile(__dirname + '/order.html', (err, html) => {
                res.send(html.toString().replace("DATA", JSON.stringify(req.body.data)))
            })
        });
        // промежуточная база с уже заказанными пиццами для инфы к поварам
        app.get('/orders', (req, res) => {
            db_.collection('orders').find().toArray((err, docs) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500)
                }
                res.send(docs)
            })
        });
        // отправка заказа в промежуточную базу
        app.post('/next', (req, res) => {
            const data = JSON.parse(req.body.object);
            const ulti = {
                name: req.body.name,
                tel: req.body.telephone,
                pizza_info: data
            }
            console.log(ulti);
            db_.collection('orders').insertOne(ulti, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500)
                }
                res.send(`<h1>Уже <a href="/orders">начали</a> готовить ваш заказ, ${req.body.name}!<br> К оплате: ${data['price']} ₽</h1>`)
            })
        })
    })
})