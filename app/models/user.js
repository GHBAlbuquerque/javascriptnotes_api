const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let userSchema = new mongoose.Schema({
    name: {type: String},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});
//é como se fosse um middleware

userSchema.pre('save', function (next) { //toda vez que eu foz salvar meu user, ele vai rodar essa funcao
    if (this.isNew || this.isModified('password')) { //se nao for novo e nao teve modificacao, nao é pra executar
        bcrypt.hash(this.password, 10, 
            (err, hashedPassword) => {
            if (err) {
            next(err);
            } else {
                this.password = hashedPassword;
                next(); //para ir para o proximo middleware c onsitnuar o fluxo do mongoose
            }
        })
    }
});

userSchema.methods.isCorrectPassword = function (password, callback) {// método para comparar os passwords.
    bcrypt.compare(password, this.password, function (err, same){ //o password está disponivel pq estamos usando o pre
        if (err) {
            callback(err); // poderia ser o next aqui, pras funcoes continuarem
        } else {
            callback (err, same);
        }
    }); 
} 

module.exports = mongoose.model('User', userSchema);