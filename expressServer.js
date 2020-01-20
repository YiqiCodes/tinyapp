const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {}

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//.RENDER IS ACTUALLY CREATING AND PULLING FROM URL DATABASE?
// HOW IS URLS_INDEX KNOW THAT EXPRESSSERVER NEEDS IT?

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// WHY IS LONGURL THE KEY HERE OF THE OBJECT PRINTED??
// I THOUGHT NODEMON MADE UPDATES REFLECT RIGHT AWAY??
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Okay"); // Respond with 'Ok' (we will replace this)
});

// wHY CAN'T I CONSOLE LOG ON GET? BUT I CAN ON POST??

// WHEN I INSPECT ELEMENTS OF THIS URL IT IS NOT THE SAME STYLE AS LOGGED HERE?
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: req.params.longURL
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
