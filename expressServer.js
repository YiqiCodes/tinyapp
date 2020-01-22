const express = require("express");
let cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

function generateRandomString() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuv";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function findEmail(existingEmail) {
  for (const emails in users) {
    if (users[emails].email === existingEmail) {
      console.log(users[emails]);
      return true;
    }
  }
  return false;
}
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/register", (req, res) => {
  res.render("urls_register.ejs");
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send(`Please enter valid username & password`);
    return;
  } else if (findEmail(req.body.email)) {
    res.status(400).send("Email already exists, please try another");
    return;
  }

  let id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie("user_id", id);
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("user_id", users[req.cookies.user_id]);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };

  // if (req.cookies["username"]) templateVars.username = req.cookies["username"];

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = req.body.longURL;

  res.redirect(`/urls/${random}`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
  console.log("test", templateVars);
  res.render("urls_show", templateVars);
});

// redirects to shortURL on EDIT click
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls/");
});

//redirects to longurl (website) or prints 404 error
app.get("/u/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL]
    ? res.redirect(urlDatabase[req.params.shortURL])
    : res.status(404).send(`Cannot find URL with ${req.params.shortURL}!`);
});

//deletes object key/value pairing on delete click
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(/urls/);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
