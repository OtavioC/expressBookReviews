const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
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
            const titulo=resposta.data.items[0].volumeInfo.title;
            const MyDataOnBook = Object.values(books).filter(book => book.title === titulo);
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
    const MyDataOnBook = Object.values(books).filter(book => book.author === authorName);
    if(MyDataOnBook.length ===0){                        //Test is there is a book
        return res.status(400).json({ message: "No book written under that author name" });
    } else{
        res.json(MyDataOnBook);
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleName = req.params.title; // Extrai o título do livro do parâmetro da rota

    if (!titleName) {  // Testa se o título foi fornecido
        return res.status(400).json({ message: "Please, specify the book title" });
    }

    // Find the books
    const MyDataOnBook = Object.values(books).filter(book => book.title === titleName);

    if (MyDataOnBook.length === 0) {  // Verifica se não encontrou livros com esse título
        return res.status(400).json({ message: "No book found with that title" });
    } else {
        res.json(MyDataOnBook);  // Retorna os livros encontrados
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
