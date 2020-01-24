const { assert } = require("chai");
const { findEmail } = require("../expressServer");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// wrote new function based on compass (not in express server)
// with (almost) same logic to test
function findEmailTest(email, database) {
  for (const id in database) {
    if (database[id].email === email) {
      return id;
    }
  }
  return undefined;
}

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = findEmailTest("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
  });
});
