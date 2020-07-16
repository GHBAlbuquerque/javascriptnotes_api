var express = require('express');
var router = express.Router();
const User = require('../models/user.js');
const jwt = require('jsonwebtoken'); //recebe o login e com isso criamos um token
require('dotenv').config(); //variaveis de ambiente no .env ficam disponiveis para aplicacao 
const secret = process.env.JWT_TOKEN;
const withAuth = require('../middlewares/auth');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save()
    res.status(200).json(user);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error registering new user please try again." });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }); //vou procurar o usuario pelo email que passou
    if (!user) { // se nao encontrar o usuario (!)
      res.status(401).json({ error: 'Incorrect email or password' })
    } else { //ai vou checar a senha
      user.isCorrectPassword(password, function (err, same) { //método que criei la dentro, e vou passar o password e uma funcao
        if (!same) { //se estiver errada na comparação
          res.status(401).json({ error: 'Incorrect email or password' })
        } else {
          const token = jwt.sign({ email }, secret, { expiresIn: '10d' }) //passo o email para poder extrair essa informacao depois em outras situacoes
          res.json({ user: user, token: token });
        }
      })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal error, please try again' })
  }

})

//atualizar o user? não peguei pela id do user, só pelo /user

router.put('/', withAuth, async (req, res) => {
  const { name, email } = req.body;

  try {
    user = await User.findOneAndUpdate(
      { _id: req.user._id }, //peguei com o middleware de identificacao
      { $set: { name: name, email: email } }, //operador do mongo para escolher o que eu vou atualizar
      { upsert: true, 'new': true }); //quando atualizamos, ele vai devolver a nota antiga. nao queremos, queremos devolver a atualizada. Colocamos upsert: true e o new:true
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Problem to update user' });
  }
});


//atualizar a senha

router.put('/password', withAuth, async (req, res) => {
  const { password } = req.body;

  try {
    let user = await User.findOne({_id: req.user._id})
      user.password = password;
      user.save() //outro método
      res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Problem to update password' });
  }
});


//deletar o user? não tem pq eu colocar o id na url, posso pegar da requisição 

router.delete('/', withAuth, async (req, res) => { 

  try {
    let user = await User.findOne({_id: req.user._id});
      await user.delete(); //se for true, devolvo a nota
      res.json({ message: 'OK' }).status(204)
  } catch (error) {
    res.status(401).json({ error: 'Problem to delete user' });
  }
})

module.exports = router;

