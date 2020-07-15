const mongoose = require ('mongoose');

let noteSchema = new mongoose.Schema({
    title: String,
    body: String,
    created_at: { type: Date, default:Date.now },
    updated_at: { type: Date, default:Date.now }, //esses são os valores default
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //estou referenciando a collection User
        required: true //toda nota terá que ter um usuario associado
    }
});

noteSchema.index({'title': 'text', 'body': 'text'}); //estou criando um index

module.exports = mongoose.model('Note', noteSchema)