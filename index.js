const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

const logger = (req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`)
    next()
}
app.use(logger)

const timer = (req, res, next) => {
    req.startTime = Date.now()
    next()
}
app.use(timer)

const checkName = (req, res, next) => {
    const { name } = req.body
    if (!name) {
        return res.status(400).json({ error: "name is required" })
    }
    next()
}

const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key']
    if (!apiKey || apiKey !== 'manoj123') {
        return res.status(401).json({ error: "Unauthorized!" })
    }
    next()
}

app.get('/', (req, res) => {
    const timeTaken = Date.now() - req.startTime
    res.status(200).json({ message: "Hello!", timeTaken: `${timeTaken}ms` })
})

app.post('/greet', checkName, (req, res) => {
    res.status(200).json({ message: `Hello ${req.body.name}!` })
})

app.get('/secret', authMiddleware, (req, res) => {
    res.status(200).json({ message: "This is a secret message!" })
})

app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500).json({ error: "Something went wrong!" })
})

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})