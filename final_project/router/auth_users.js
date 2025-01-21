const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const axios = require('axios');

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username
    const reviewText = req.body.review
    const isbn = req.params.isbn; // Substitua pelo ISBN que você deseja consultar
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    
    axios.get(url)
    .then (resposta =>{
        if(resposta.data.items && resposta.data.items.length >0){
            const titulo=resposta.data.items[0].volumeInfo.title.toLowerCase();
            
            const book = Object.values(books).find(book => book.title.toLowerCase() === titulo);

            if (!book) {
            return res.status(404).json({ message: "Livro não encontrado."});
            }

            const existingReviewId = Object.keys(book.reviews).find( id => book.reviews[id].username === username); //Test if there's a review for req.user

            if (existingReviewId){
                book.reviews[existingReviewId].review=reviewText;
                res.json({message: "Review editada com sucesso!"});
            }
            else{
                const reviewId = Object.keys(book.reviews).length + 1;
                book.reviews[reviewId] = { username, review: reviewText };
                res.json({message: "Review adicionada com sucesso!"});
            }
        }
        else {
            res.status(404).json({ message: "Livro não encontrado na API do Google" });
        }
    })
    .catch(error => {
        res.status(500).json({ message: "Erro ao acessar a API do Google", error: error.message });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
