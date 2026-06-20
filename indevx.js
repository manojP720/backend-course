const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()
const PORT = 3000
const JWT_SECRET = 'manoj-secret-key-2026'

app.use(express.json())

// Fake users database
const users = []

// ─── REGISTER ────────────────────────────────
app.post('/register', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: "username and password required" })
    }

    // Check if user exists
    const exists = users.find(u => u.username === username)
    if (exists) {
        return res.status(409).json({ error: "Username already exists" })
    }

    // Hash password — never store plain text!
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword
    }
    users.push(newUser)

    res.status(201).json({ message: "User registered successfully!" })
})

// ─── LOGIN ────────────────────────────────────
app.post('/login', async (req, res) => {
    const { username, password } = req.body

    // Find user
    const user = users.find(u => u.username === username)
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" })
    }

    // Create JWT token
    const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '1h' }
    )

    res.status(200).json({
        message: "Login successful!",
        token: token
    })
})

// ─── AUTH MIDDLEWARE ──────────────────────────
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']
    // Format: "Bearer eyJhbGci..."
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: "Token required" })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.user = decoded  // user info route ನಲ್ಲಿ use ಮಾಡಬಹುದು
        next()
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" })
    }
}

// ─── PROTECTED ROUTE ─────────────────────────
app.get('/profile', authenticate, (req, res) => {
    res.status(200).json({
        message: "Welcome!",
        user: req.user
    })
})

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})

