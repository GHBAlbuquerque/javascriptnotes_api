var express = require('express');
var router = express.Router();
const Note = require('../models/note.js');
const withAuth = require('../middlewares/auth');


router.get('/', withAuth, async (req, res) => { //minha pagina inicial vai mostrar minhas notas
    try {
        let notes = await Note.find({ author: req.user._id }) //aqui estou procurando todas as notas que tem esse author
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Problem to get notes' });
    }
});


router.post('/', withAuth, async (req, res) => {
    const { title, body } = req.body;
    let note = new Note({ title: title, body: body, author: req.user._id }); //o id do user virá do withAuth que pega a variavel user

    try {
        await note.save();
        res.status(200).json(note);
    } catch (error) {
        res.status(401).json({ error: 'Problem to create a new note' });
    }
});

router.get('/search', withAuth, async (req, res) => {
    const { query } = req.query; //isso é conhecido como query param

    try {
        let notes = await Note
            .find({ author: req.user._id }) //aqui estou procurando todas as notas que tem esse author
            .find({ $text: { $search: query } }) //vou usar o que foi capturado na URL pelo meu query como método do search. quero procurar tanto no title quanto no body
        res.json(notes);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Problem while trying to search' });
    }
});

router.get('/:id', withAuth, async (req, res) => { //vou buscar pelo id da nota
    let { id } = req.params;

    try {
        let note = await Note.findById(id); // encontrei a nota que ele pediu. Mas antes de devolver, preciso ver se esse user é o autor da nota
        if (isOwner(req.user, note)) {
            res.json(note); //se for true, devolvo a nota
        } else {
            res.status(500).json({ error: 'Unauthorized Access' }) //se for false, dou um erro
        }

    } catch (error) {
        res.status(401).json({ error: 'Problem to get note' });
    }
})


router.put('/:id', withAuth, async (req, res) => { //minha pagina inicial vai mostrar minhas notas
    const { title, body } = req.body;
    const { id } = req.params;

    try {
        let note = await Note.findById(id);
        if (isOwner(req.user, note)) { //preciso ter certeza que é o user certo
            note = await Note.findOneAndUpdate({ _id: id }, //aqui nao posso usar só o id, ou ele nao vai atualizar! preciso de id: id
                { $set: { title: title, body: body } }, //operador do mongo para escolher o que eu vou atualizar
                { upsert: true, 'new': true }); //quando atualizamos, ele vai devolver a nota antiga. nao queremos, queremos devolver a atualizada. Colocamos upsert: true e o new:true
            res.json(note)
        } else {
            res.status(500).json({ error: 'Unauthorized Access' }) //se for false, dou um erro
        }
    } catch (error) {
        res.status(500).json({ error: 'Problem to update note' });
    }
});

router.delete('/:id', withAuth, async (req, res) => { //vou buscar pelo id da nota
    const { id } = req.params; //sempre preciso disso

    try {
        let note = await Note.findById(id); // encontrei a nota que ele pediu. Mas antes de deletar, preciso ver se esse user é o autor da nota
        if (isOwner(req.user, note)) {
            await note.delete(); //se for true, devolvo a nota
            res.json({ message: 'OK' }).status(204)
        } else {
            res.status(500).json({ error: 'Unauthorized Access' }) //se for false, dou um erro
        }
    } catch (error) {
        res.status(401).json({ error: 'Problem to get note' });
    }
})

//minha funcao para validar o owner
const isOwner = function (user, note) { //isso poderia estar no model!
    if (JSON.stringify(user._id) == JSON.stringify(note.author._id)) {
        return true
    } else {
        return false
    }
}

//

module.exports = router;



    /*router.get('/viewusers', withAuth, async (req, res) => {
    try {
        let users = await User.find()
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Problem to get users' });
    }
    });*/