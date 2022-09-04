import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const participantes = [];
const mensagens = [];

app.post('/participants', (req, res) => {
    const { name } = req.body;
    participantes.push({ name });

    if(!name) {
        res.sendStatus(422);
        return;
    }

    res.send(201);
});

app.get('/participants', (req, res) => {

    console.log(participantes)
    res.send(participantes);
});

app.post('/messages', (req, res) => {
    const { to, text, type } = req.body;
    mensagens.push({ to, text, type });

    if(!to || !text || !type) {
        res.sendStatus(422);
        return;
    }

    res.send(201);
});

app.get('/messages', (req, res) => {
    const limit = mensagens.slice(-100);

    console.log(limit)
    res.send(limit);
});

app.listen(5000, () => console.log('Listening on port 5000'));