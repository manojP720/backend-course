require("dotenv").config
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const express = require("express")
const db = require("better-sqlite3")("ourApp.db")
db.pragma("journal_mode = WAL")


//database setup starts  here
const createTables = db.transaction(() => {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username STRING NOT NULL UNIQUE,
      password STRING NOT NULL
    )
  `).run()
})

createTables() 



//database setup ends here
const app = express()



app.set("view engine" , "ejs")
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))
app.use(cookieParser())

app.use(function (req, res, next){
    res.locals.errors = []


    // try to get the cookie from the request
    try {
      const decoded = jwt.verify(req.cookies.ourSimpleApp, process.env.JWTSECRET)
      req.user = decoded
      
    } catch (err) {
      // Ignore JWT verification errors
      req.user = false
    }

    res.locals.user = req.user
    console.log("req.user", req.user)



    
    next()

})

const port = 3000

app.get('/', (req, res) => {
  if (req.user) {
    res.render("dashboard")
  } else {
    res.render("homepage")
  }
})

app.get("/login", (req, res) => {
    res.render("login")
})
app.get("/logout", (req, res) => {
    res.clearCookie("ourSimpleApp")
    res.redirect("/")
})

app.post("/login", (req, res) => {
    const errors = []
    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.password !== "string") req.body.password = ""

    if (!req.body.username.trim()== "") errors.push("Invalid Username / Password.")
    if (!req.body.password  == "") errors.push("Invalid Username / Password.")

    if (errors.length) {
        return res.render("login", { errors })
    }  

    res.send("Thank you for logging in !")
})



app.post("/register", (req , res) =>{
    const errors = []

    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.password !== "string") req.body.password = ""

    req.body.username = req.body.username.trim()

    if (!req.body.username) errors.push("You must provide a Username.")
    if (req.body.username && req.body.username.length < 3) errors.push("Username must be at least  3 characters.")    
    if (req.body.username && req.body.username.length > 10) errors.push("Username cannot exceed 10 characters.")    
    if (req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain letters and numbers.")    
    

      if (!req.body.password) errors.push("You must provide a Password.")
    if (req.body.password && req.body.password.length < 12) errors.push("Password must be at least 12 characters.")    
    if (req.body.password && req.body.password.length > 70) errors.push("Password cannot exceed 70 characters.")    
    if (req.body.password && !req.body.password.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain letters and numbers.")    
    


    if (errors.length) {
        return res.render("homepage", { errors })

    }
    
    // save the new user into a database 
    const salt = bcrypt.genSaltSync(10)
    req.body.password = bcrypt.haashSync(req.body.password, salt)




    const ourStatement = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)")
    const result = ourStatement.run(req.body.username, req.body.password)

    const lookupStatement = db.prepare("SELECT * FROM users WHERE ROWID =?")
    const ourUser = lookupStatement.get(result.lastInsertRowid)

    //log the user in by giving them a cookie
const ourTakenValue = jwt.sign( { exp: Math.floor(Date,now() / 1000) + 60 * 60 * 24, skyColor: "blue", userid: ourUser.id, username: ourUser.username } , process.env.JWTSECRET)

    res.cookie("ourSimpleApp",ourTakenValue, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24
    })
    res.send("Thank you !")
  

})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))