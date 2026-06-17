const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

// ─── MIDDLEWARE 1: Logger ──────────────────────
// ಪ್ರತಿ request ಬಂದಾಗ log ಮಾಡು
const logger = (req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`)
    next() // ← ಇದು ಇಲ್ಲದಿದ್ದರೆ request stuck ಆಗುತ್ತೆ!
}

app.use(logger) // ← ಎಲ್ಲಾ routes ಗೆ apply

// ─── MIDDLEWARE 2: Request Timer ──────────────
const timer = (req, res, next) => {
    req.startTime = Date.now() // request start time save ಮಾಡು
    next()
}

app.use(timer)

// ─── MIDDLEWARE 3: Route specific ─────────────
// ಈ middleware ಒಂದೇ route ಗೆ
const checkName = (req, res, next) => {
    const { name } = req.body
    if (!name) {
        return res.status(400).json({ error: "name is required" })
    }
    next()
}

// ─── ROUTES ───────────────────────────────────
app.get('/', (req, res) => {
    const timeTaken = Date.now() - req.startTime
    res.status(200).json({
        message: "Hello!",
        timeTaken: `${timeTaken}ms`
    })
})

// checkName middleware ಈ route ಗೆ ಮಾತ್ರ
app.post('/greet', checkName, (req, res) => {
    res.status(200).json({
        message: `Hello ${req.body.name}!`
    })
})

// ─── ERROR MIDDLEWARE ─────────────────────────
app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(500).json({ error: "Something went wrong!" })
})

// 404
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})


const authMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key']
    
    if (!apiKey || apiKey !== 'manoj123') {
        return res.status(401).json({ 
            error: "Unauthorized!",
            message: "Valid x-api-key header required"
        })
    }
    next()
}

app.get('/secret', authMiddleware, (req, res) => {
    res.status(200).json({ message: "This is a secret message!" })
})