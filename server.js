const express = require('express')
const app = express()

app.set("view engine" , "ejs")
app.use(express.static("public"))
const port = 3000

app.get('/', (req, res) => res.render("homepage"))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))