const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

const {
  findEmail,
  checkPassword,
  generateRandomString,
  urlsForUser,
  urlDatabase,
  users
} = require("./helpers");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);

app.get("/", (req, res) => {
  res.render("urls_register.ejs", { error: false, message: null });
});

app.get("/register", (req, res) => {
  res.render("urls_register.ejs", { error: false, message: null });
});

// on register, checks for error, allows entry if no error, otherwise display error
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).render("urls_register.ejs", {
      error: true,
      message: "Please enter valid email and password"
    });
    return;
  } else if (findEmail(req.body.email)) {
    res.status(400).render("urls_register.ejs", {
      error: true,
      message: "Email already exists, please try again"
    });
    return;
  }

  let id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = id;
  res.redirect(`/urls`);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    error: false,
    message: null
  };
  res.render("urls_login", templateVars);
});

// on login, checks for error, allows entry if no error, otherwise display error
app.post("/login", (req, res) => {
  if (
    findEmail(req.body.email) &&
    checkPassword(req.body.email, req.body.password)
  ) {
    req.session.user_id = checkPassword(req.body.email, req.body.password);
    res.redirect(`/urls`);
  } else if (
    !checkPassword(req.body.email, req.body.password) &&
    findEmail(req.body.email)
  ) {
    res.status(403).render("urls_login.ejs", {
      error: true,
      message: "Wrong password, please try again"
    });
    return;
  } else if (!findEmail(req.body.email)) {
    res.status(403).render("urls_login.ejs", {
      error: true,
      message: "Cannot locate email, please try again"
    });
    return;
  }
});

//clears cookies on logout and redirects to homepage
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
    error: false,
    message: null
  };

  if (!req.session.user_id) {
    res.render("urls_login", templateVars);
    return;
  }

  res.render("urls_index", templateVars);
});

// adds to database everytime url is created
app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  res.redirect(`/urls/${random}`);
});

// goes to login page if no cookies exist on creating new url
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    error: false,
    message: null
  };
  if (!req.session.user_id) {
    res.render("urls_login", templateVars);
    return;
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session.user_id],
    error: false,
    message: null
  };

  if (!req.session.user_id) {
    res.render("urls_login", templateVars);
    return;
  }
  res.render("urls_show", templateVars);
});

// redirects to shortURL on EDIT click
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
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
