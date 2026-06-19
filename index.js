const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
app.use(express.json())

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected!'))
    .catch(err => console.log('❌ Connection failed:', err))

// Schema — document structure define ಮಾಡು
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Model — Schema ನಿಂದ model create ಮಾಡು
const User = mongoose.model('User', userSchema)

// POST /users — create user
app.post('/users', async (req, res) => {
    try {
        const { username, email, age } = req.body

        const user = new User({ username, email, age })
        await user.save()

        res.status(201).json({
            message: "User created!",
            user: user
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// GET /users — all users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json({
            count: users.length,
            users: users
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /users/:id
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ error: "User not found" })
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// DELETE /users/:id
app.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) return res.status(404).json({ error: "User not found" })
        res.status(200).json({ message: "User deleted!" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
})