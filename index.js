const express = require('express')
const path = require("path");
const sqlite3 = require('sqlite3').verbose();

// conexão com o bd sqlite3 criação do banco no folder data deve ser inicializado antes do app
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Sucessful connection to the database 'apptest.db");
});

//criação da tabela books
const sql_create = ` CREATE TABLE IF NOT EXISTS Books (
  Book_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Title VARCHAR(100) NOT NULL,
  Publisher VARCHAR(100) NOT NULL,
  Photo VARCHAR(100) NOT NULL,
  Author VARCHAR(100) NOT NULL
);`;

db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of 'Books' table");
});

//  Inserção de uma  obra para consulta (seeding)
//  const sql_insert = `INSERT INTO Books (Book_ID, Title, Publisher, Photo, Author) VALUES
// (1, 'Harry Potter and the philosopher stone', 'Editora Rocco',' https://images-na.ssl-images-amazon.com/images/I/81YOuOGFCJL.jpg', 'J.K Rowling' ),
// (2, 'Lord of the Rings', 'Editora Infe', 'https://images-na.ssl-images-amazon.com/images/I/912xq7RMZjL.jpg', 'J.R.R Tolkien'),
// (3, 'Bento', 'Editora Novo Século', 'https://cache.skoob.com.br/local/images//VEa3eZnT2Z6cHJnEWluWlb6Sdhg=/300x0/center/top/filters:format(jpeg)/https://skoob.s3.amazonaws.com/livros/944/BENTO_1241185678B.jpg', 'André VIanco');`;

// db.run(sql_insert, err => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log("Successful creation of 3 books");
// });

//inicialização do app
const app = express()

// configuração do server
app.set("view engine", "ejs");
app.set("views", path.join( __dirname, "views"));
app.use(express.urlencoded({ extended: false }));

//verbos http GET
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req,res) => {
  res.render("about");
});

app.get("/books", (req, res) => {
  const sql = "SELECT * FROM Books ORDER BY Title"
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("books", {model: rows});
  });
});

app.get("/edit/:id", (req, res) => {   // Renderização do formulário de edição
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("edit", {model: row});
  });
});

app.get("/create", (req, res) => {        //Renderização do formulário de criação 
  const book = {
    Author: ""
  }
  res.render("create", {model: book });
})

app.get("/delete/:id", (req, res) => {      //Renderização do formulário de deleção
  const id = req.params.id;
  const sql = "SELECT * FROM Books WHERE Book_ID = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("delete", {model: row});
  })
})

//verbos http POST

  app.post("/edit/:id", (req, res) => {           //Editar um arquivo 
    const id = req.params.id;
    const book = [req.body.Title, req.body.Author, req.body.Publisher, req.body.Photo, id];
    const sql = "UPDATE Books SET Title = ?, Author = ?, Publisher = ?, Photo=? WHERE (Book_ID = ?)";
    db.run(sql, book, err => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/books");
    });
  });
  
  app.post("/create", (req, res) => {             // Criação de um novo arquivo 
    const sql= "INSERT INTO Books ( Title, Author, Publisher, Photo) VALUES (?, ?, ?, ?)";
    const book = [req.body.Title, req.body.Author, req.body.Publisher, req.body.Photo];
    db.run(sql, book, err => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/books");
    });
  });

  app.post("/delete/:id", (req, res) => {           // Deletar um arquivo 
    const id = req.params.id;
    const sql = "DELETE FROM Books WHERE Book_ID = ?";
    db.run(sql, id, err => {
      if (err) {
        return console.error(err.message);
      }
      res.redirect("/books");
    });
  });

// Inicialização do server na porta 3000 
app.listen(3000, (req, res) => {
  console.log(" Up and running")
})