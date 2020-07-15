require('dotenv').config(); // para fazer enegnharia reversa e pegar o dono da requisção
const secret = process.env.JWT_TOKEN;
const jwt = require('jsonwebtoken');
const User = require('../models/user')

const withAuth = (req, res, next) => { //estou criando meu middleware que vai checar a requisicao
    const token = req.headers['access-token']; //poderia ser qualquer nome aqui

    if (!token) { //se nao houver token
        res.status(401).json({ error: 'Unauthorized: no token provided' });
    } else { //se houver token
        jwt.verify(token, secret, (err, decoded) => { //sign para criar o token, verify para verificar
            if (err) {
                res.status(401).json({ error: 'Unauthorized: token invalid' })
            } else { //extrair do token o email que la na rota eu passei
                res.email = decoded.email;
                User.findOne({ email: decoded.email }) //encontro o user baseado no email que extraí do token
                    .then(user => {
                        req.user = user;
                        next(); //vou para o proximo middleware
                    }).catch(error => {
                        res.status(401).json({ error: error });
                    })
            }
        })
    }
}

module.exports = withAuth;