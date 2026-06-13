const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

// ─── EXISTING ROUTES ────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Welcome to my Express server!",
        author: "Manoj.P"
    })
})

app.get('/about', (req, res) => {
    res.status(200).json({
        name: "Manoj.P",
        role: "Backend Developer (in training)",
        day: 3
    })
})

app.get('/skills', (req, res) => {
    res.status(200).json({
        skills: ["HTTP", "Node.js", "Express", "REST APIs"]
    })
})

app.get('/time', (req, res) => {
    res.status(200).json({
        currentTime: new Date().toLocaleString()
    })
})

// ─── USERS ROUTES ───────────────────────────────
const users = [
    { id: 1, name: "Manoj",   city: "Bengaluru" },
    { id: 2, name: "Priya",   city: "Mumbai"    },
    { id: 3, name: "Rahul",   city: "Delhi"     },
    { id: 4, name: "Sneha",   city: "Kolkata"   },
    { id: 5, name: "Bhagya",  city: "Chennai"   },
    { id: 6, name: "Gagana",  city: "Tiptur"    },
    { id: 7, name: "Darshan", city: "Tumkur"    }
]

app.get('/users', (req, res) => {
    res.status(200).json({
        count: users.length,
        users: users
    })
})

app.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const user = users.find(u => u.id === id)

    if (!user) {
        return res.status(404).json({
            error: "User not found",
            id: id
        })
    }

    res.status(200).json(user)
})

// ─── YOUR TASK — WRITE THIS YOURSELF ────────────
const products = [
    { id: 1, name: "Laptop", price: 50000 },
    { id: 2, name: "Smartphone", price: 20000 },
    { id: 3, name: "Tablet", price: 15000 }
]

app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const product = products.find(p => p.id === id)
    if (!product) {
        return res.status(404).json({ error: "Product not found" })
    }
    res.status(200).json(product)
})

app.get('/products/search', (req, res) => {
    const maxPrice = parseInt(req.query.maxPrice)
    const results = products.filter(p => p.price <= maxPrice)
    res.status(200).json({
        count: results.length,
        products: results
    })
}


// ─── 404 HANDLER — ALWAYS LAST ──────────────────
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.url
    })
})

// ─── START SERVER ────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})