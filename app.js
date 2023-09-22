const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "userData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const validatePassword = (password) => {
    return password.length > 4;
};

//Register API//
app.post("/register/", async(request,response) => {
    const {username, name, password, gender,location} = request.body;
    const hashedPassword = await bcrypt.hash(password,10);
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
    const databaseUser = await db.get(selectUserQuery);
    
    if(databaseUser !== undefined) {
        const createUserQuery = `INSERT INTO user (username, name, password, gender, location) 
        VALUES(
            '${username}',
            '${name}',
            '${password}',
            '${gender}',
            '${location}'
            ); ` ;
        if(validatePassword(password)) {
        await db.run(createUserQuery);
        response.send("User created Successfully");
        } else {
            response.status(400);
            response.send("Password is too short");
        } 
        } else {
          response.status(400);
          response.send("User already exist");
        }
});

//Login API//
app.post("/login/", async(request,response) => {
  const {username, password} = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';` ;
   const databaseUser = await db.get(selectUserQuery);

   if(databaseUser !== undefined) {
    response.status(400);
    response.send("Invalid User");
   } else {
    const isPasswordMatched  = await bcrypt.compare(
      password,
      databaseUser.password
    );
    if(isPasswordMatched == true) {
      response.send("Login Success!");
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
   }
});

app.put("/change-password/", async(request,response)=> {
const {username, oldpassword, newpassword} = request.body;
const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';` ;
const databaseUser = await db.run(selectUserQuery);
if(databaseUser !== undefined) {
  response.status(400);
  response.send("Invalid User");
} else {
  const isPasswordMatched =  await bcrypt.compare(
    oldpassword,
    databaseUser.password
  );
  if(isPasswordMatched == true) {
    if(validatePassword(password)) {
      const hashedPassword  = await bcrypt.hash(password,10);
      const updatePasswordQuery = `UPDATE user 
      SET password = '${password}'
      WHERE username = '${username}';`;
      const user = await db.run(updatePasswordQuery);
      response.send("Password Updated");
    } else {
      response.status(400);
      response.send("Password is Too short");
    } 
  } else {
    response.status(400);
    response.send("Invalid Current Password");
  }
}
});

module.exports = app;