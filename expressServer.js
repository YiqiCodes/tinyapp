const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);

const urlDatabase = {
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" }
};

const users = {
  userRandomID: {
    id: "user1",
    email: "b@b.com",
    password: bcrypt.hashSync("123", 10)
  },
  user2RandomID: {
    id: "user2",
    email: "a@a.com",
    password: bcrypt.hashSync("123", 10)
  }
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
    if (
      users[key].email === username &&
      bcrypt.compareSync(password, users[key].password)
    ) {
      return key;
    }
  }
  return false;
}

function urlsForUser(id) {
  let specificURL = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id)
      specificURL[shortURL] = urlDatabase[shortURL];
  }
  return specificURL;
}

app.get("/register", (req, res) => {
  res.render("urls_register.ejs", { error: false, message: null });
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
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

app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  res.redirect(`/urls/${random}`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    error: false,
    message: null
  };
  if (Object.entries(req.session).length === 0) {
    res.render("urls_login", templateVars);
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
