const express = require("express");
let cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

const bodyParser = require("body-parser");

const urlDatabase = {
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" }
};

const users = {
  // userRandomID: {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: "purple-monkey-dinosaur"
  // },
  // user2RandomID: {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk"
  // }
};

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
      return true;
    }
  }
  return false;
}

function checkPassword(username, password) {
  for (const key in users) {
    if (users[key].email === username && users[key].password === password) {
      return key;
    }
  }
  return false;
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
  if (
    findEmail(req.body.email) &&
    checkPassword(req.body.email, req.body.password)
  ) {
    res.cookie("user_id", checkPassword(req.body.email, req.body.password));
    res.redirect(`/urls`);
  } else if (
    !checkPassword(req.body.email, req.body.password) &&
    findEmail(req.body.email) === true
  ) {
    res.status(403).send("Wrong password, please try again");
    return;
  } else if (findEmail(req.body.email) === false) {
    res.status(403).send("Cannot locate email, please try again");
    return;
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  console.log(urlDatabase);
  res.redirect(`/urls/${random}`);
});

app.get("/urls/new", (req, res) => {
  if (Object.entries(req.cookies).length === 0) {
    res.render("urls_login");
  } else {
    let templateVars = { user: users[req.cookies.user_id] };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user_id]
  };
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
    ? res.redirect(urlDatabase[req.params.shortURL].longURL)
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
