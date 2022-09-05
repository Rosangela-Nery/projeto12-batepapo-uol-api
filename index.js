import express, { response } from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import joi from 'joi';
import dayjs from 'dayjs';
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

const participantes = joi.object({
    name: joi.string().required()
});

const mensages = joi.object({
    to: joi.string().required().empty(), 
    text: joi.string().required().empty(), 
    type: joi.required().valid('message', 'private_message')
});

app.post('/participants', async (req, res) => {
    const { name } = req.body;

    const userExist = await db.collection('participantes').find({name: name}).count();

    if(userExist > 0) {
        res.status(409).send({"message": "Já existe usuário cadastrado!"});
        return;
    }

    const validation = participantes.validate(req.body, {abortEarly: true});

    if (validation.error){
        res.status(422).send({error: validation.error.message});
    };

    try {
        const response = await db.collection('participantes').insertOne({ name: name, lastStatus: Date.now() })
        res.send(response)
    } catch (error) {
        res.sendStatus(422);
    }
});

app.get('/participants', async (req, res) => {

    try {
        const response = await db.collection('participantes').find().toArray()
        res.send(response.map((value) => ({...value, _id: undefined})));
    } catch (error) {
        res.sendStatus(400);
    }
});

app.post('/messages', async (req, res) => {

    const validation = mensages.validate(req.body, {abortEarly: true});

    if (validation.error){
        return res.status(422).send({erros: validation.error});
    };

    try {
        const response = await db.collection('participantes').find({ name: req.headers.user }).toArray();
        if (response.length === 0) {
            return res.status(404)
        }
    } catch (error) {
        return res.sendStatus(422)
    }

    const messageData = {
        to: req.body.to,
        text: req.body.text,
        type: req.body.type,
        from: req.headers.users,
        time: `${dayjs().hour()}:${dayjs().minute()}:${dayjs().second()}`
    }

    try {
        await db.collection('mensagens').insertOne(messageData)
        res.sendStatus(201);
    } catch (error) {
         res.sendStatus(422)
    }
});

app.get('/messages', async (req, res) => {
    const users = req.headers.user
    // const limit = req.query.limit;
    // console.log(limit)

    try {
        const response = await db.collection('mensagens').find({$or: [{type: "message"}, {type: "status"}, {to: users}, {from: users}]}).sort({_id: 1}).toArray()
        res.send(response);
    } catch (error) {
        res.send(201)
    }
});

app.post('/status', async (req, res) => {
    const { user } = req.headers.user;

    try {
        await db.collection('participantes').updateOne({name: user}, {$set: {lastStatus: Date.now()}})
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(404)
    }
});

app.delete('/messages/:id', async (req, res) => {
    const ID_DA_MENSAGEM = req.params.id;

    try {
         const respond = await db.collection('mensagens').findOne({_id: ObjectId(ID_DA_MENSAGEM)});

         if(respond.from === req.headers.user) {
            await db.collection('mensagens').deleteOne({_id: ObjectId(ID_DA_MENSAGEM)})
         } else {
            return res.sendStatus(401);
         }
         return res.sendStatus(200);
    } catch (error) {
        return res.sendStatus(404);
    }
});

app.listen(5000, () => console.log('Listening on port 5000'));