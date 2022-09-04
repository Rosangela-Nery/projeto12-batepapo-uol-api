import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;

mongoClient.connect().then(() => {
    db = mongoClient.db('batepapouol');
});

const participantes = [];
const mensagens = [];

app.post('/participants', (req, res) => {
    const { name } = req.body;

    if(!name) {
        res.sendStatus(422);
        return;
    }

    db.collection('participantes').insertOne({ name });

    res.send(201);
});

app.get('/participants', (req, res) => {

    db.collection('participantes').find().toArray().then(data => {
        res.send(data);
    });
});

app.post('/messages', (req, res) => {
    const { to, text, type } = req.body;

    if(!to || !text || !type) {
        res.sendStatus(422);
        return;
    }

    db.collection('mensagens').insertOne({ to, text, type });

    res.send(201);
});

app.get('/messages', (req, res) => {
    const limit = mensagens.slice(-100);

    db.collection('mensagens').find().toArray().then(data => {
        res.send(data);
        res.send(limit);
    });
});

app.listen(5000, () => console.log('Listening on port 5000'));