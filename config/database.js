var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true, //para usar as novas ferramentas do mongoose
    useUnifiedTopology: true, //indexação dos conteudos
    useCreateIndex: true //tb tem a ver com indexação. para fazer buscas no mongo
}).then(() => console.log('connection succesful')) // para ele me dar uma mensagem quando conectar
    .catch((err) => console.error(err));  //para mostrar um erro se nao conectar