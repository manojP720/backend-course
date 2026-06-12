// index.js
const express = require('express')

const app = express()
const PORT = 3000

// Middleware - tells Express to parse JSON request bodies 
// (we'll explain  middleware deeply on Day 6)
app.use(express.json())


//
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to my Express server!",
        author : "Manoj.P"

    })
})    

app.get('/about', (req, res) => {
    res.status(200).json({
        name : "Manoj.P",
        role : "Backend Developer (in training)",
        day : 3
    })
})

app.get('/skills', (req, res) => {
    res.status(200).json({
        skills : ["HTTP", "Node.js", "Express", "REST APIs"]
    })
})


app.get('/time', (req, res) => {
    res.status(200).json({
        currentTime: new Date().toLocaleString()
    })
})

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.url
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
