const express = require('express')
const app = express()

app.set("view engine" , "ejs")
app.use(express.urlencoded({extended: false}))
app.use(express.static("public"))

const port = 3000

app.get('/', (req, res) => res.render("homepage"))

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/register", (req , res) =>{
    const errors = []

    if (typeof req.body.username !== "string") req.body.username = ""
    if (typeof req.body.password !== "string") req.body.password = ""

    req.body.username = req.body.username.trim()

    if (!req.body.username) errors.push("You must provide a username.")
    if (req.body.username && req.body.username.length < 3) errors.push("Username must be at least  3 characters.")    
    if (req.body.username && req.body.password.length < 10) errors.push("Username cannot exceed 10 characters.")    
    if (req.body.username && !req.body.password.match(/^[a-zA-Z0-9]+$/)) errors.push("Username can only contain letters and numbers.")    
    
    if (errors.length) {
        return res.render("homepage", { errors })

    }else {
        res.send("Thank you for filling out the form.")

    }
  

})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))