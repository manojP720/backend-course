// index.js
const express = require('express')

const app = express()
const PORT = 3000

// Middleware - tells Express to parse JSON request bodies 
// (we'll explain  middleware deeply on Day 6)
app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to my Express server!",
        author : "Manoj.P"

    })
})    