const bcrypt = require("bcrypt");

//check if existing email is valid
function findEmail(existingEmail) {
  for (const emails in users) {
    if (users[emails].email === existingEmail) {
      return true;
    }
  }
  return false;
}

//check if username and password are valid
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

// generates random shortURL
function generateRandomString() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuv";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// function for displaying only relevant shortURLs for current user
function urlsForUser(id) {
  let specificURL = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id)
      specificURL[shortURL] = urlDatabase[shortURL];
  }
  return specificURL;
}

const urlDatabase = {};

//baseline setup for users with encrypted passwords
const users = {
  userRandomID: {
    id: "user1",
    email: "a@a.com",
    password: bcrypt.hashSync("123", 10)
  },
  user2RandomID: {
    id: "user2",
    email: "b@b.com",
    password: bcrypt.hashSync("123", 10)
  }
};

module.exports = {
  findEmail,
  checkPassword,
  generateRandomString,
  urlsForUser,
  urlDatabase,
  users
};
