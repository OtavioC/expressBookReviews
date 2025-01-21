const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password ){
        return res.status(404).json({message: "Please, provide a username and a password"});
    }

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn; // Substitua pelo ISBN que você deseja consultar
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    
    axios.get(url)
    .then (resposta =>{
        if(resposta.data.items && resposta.data.items.length >0){
            const titulo=resposta.data.items[0].volumeInfo.title.toLowerCase();
            //console.log(titulo);
            const MyDataOnBook = Object.values(books).filter(book => book.title.toLowerCase() === titulo);
            if (MyDataOnBook.length > 0) {
                res.json(MyDataOnBook[0]); // Retorna o livro encontrado
            } else {
                res.status(404).json({ message: "Livro não encontrado no banco local" });
            }
        } else {
            return res.status(404).json({ message: "Livro não encontrado na API do Google" });
        }
    })
    .catch(error=>{
        res.status(500).json({message: "Erro ao pesquisar livro"});
    })
    
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorName = req.params.author //Extract the author name from the router parameter
    if (!authorName){                        //Test is there is a name
        return res.status(400).json({ message: "Please, specify the author name" });
    }

    new Promise((resolve, reject) => {
        const MyDataOnBook = Object.values(books).filter(book => book.author === authorName);
        if (MyDataOnBook.length === 0) {
            reject("No book written under that author name");
        } else {
            resolve(MyDataOnBook);
        }
    })
    .then(MyDataOnBook => {
        res.json(MyDataOnBook); // Envia a resposta com os livros encontrados
    })
    .catch(error => {
        res.status(400).json(error); // Retorna erro caso não encontre livros
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleName = req.params.title; // Extrai o título do livro do parâmetro da rota

    if (!titleName) {  // Testa se o título foi fornecido
        return res.status(400).json({ message: "Please, specify the book title" });
    }

    new Promise ((resolve,reject)=>{
        const MyDataOnBook = Object.values(books).filter(book => book.title === titleName);
        if (MyDataOnBook.length === 0) {  // Verifica se não encontrou livros com esse título
            reject("No book found with that title");
        } else {
            resolve(MyDataOnBook);  // Retorna os livros encontrados
        }
    }).then(MyDataOnBook => {
        res.json(MyDataOnBook); // Envia a resposta com os livros encontrados
    })
    .catch(error => {
        res.status(400).json(error); // Retorna erro caso não encontre livros
    });

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn; // Substitua pelo ISBN que você deseja consultar
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    
    axios.get(url)
    .then (resposta =>{
        if(resposta.data.items && resposta.data.items.length >0){
            const titulo=resposta.data.items[0].volumeInfo.title.toLowerCase();
            const MyDataOnBook = Object.values(books).filter(book => book.title.toLowerCase() === titulo);
            if (MyDataOnBook.length > 0) {
                res.json(MyDataOnBook[0].reviews); // Retorna o livro encontrado
            } else {
                res.status(404).json({ message: "Livro não encontrado no banco local" });
            }
        } else {
            return res.status(404).json({ message: "Livro não encontrado na API do Google" });
        }
    })
    .catch(error=>{
        res.status(500).json({message: "Erro ao pesquisar livro"});
    })
});

module.exports.general = public_users;
