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

    console.log(participantes);

    res.send('status 422');
});

app.listen(5000, () => console.log('Listening on port 5000'));