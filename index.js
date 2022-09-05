import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient(process.env.MONGO_URI);

console.log(process.env.MONGO_URI)

let db;

mongoClient.connect().then(() => {
    db = mongoClient.db('batepapouol');
});

app.post('/participants', async (req, res) => {
    const { name } = req.body;

    if(!name) {
        res.sendStatus(422);
        return;
    }

    try {
        const response = await db.collection('participantes').insertOne({ name })
        res.send(response)
    } catch (error) {
        res.sendStatus(422);
    }
});

app.get('/participants', async (req, res) => {

    try {
        const response = await db.collection('participantes').find().toArray()
        res.send(response);
    } catch (error) {
        res.send(201)
    }
});

app.post('/messages', async (req, res) => {
    const { to, text, type } = req.body;

    if(!to || !text || !type) {
        res.sendStatus(422);
        return;
    }

    try {
        const response = await db.collection('mensagens').insertOne({ to, text, type })
        res.send(response)
    } catch (error) {
        res.send(201)
    }
});

app.get('/messages', async (req, res) => {
    const limit = mensagens.slice(-100);

    try {
        const response = await db.collection('mensagens').find().toArray()
        res.send(response);
    } catch (error) {
        res.send(201)
    }
});

app.post('/status', async (req, res) => {
    const {user: name} = req.headers;

    res.send(200)
});


app.delete('/messages/:ID_DA_MENSAGEM', async (req, res) => {
    const { ID_DA_MENSAGEM } = req.params;

    try {
        const response = await db.collection('mensagens').deleteOne({_id: ObjectId(ID_DA_MENSAGEM)});

        res.send(response);
    } catch (error) {
        res.status(401);
    }
});

app.listen(5000, () => console.log('Listening on port 5000'));