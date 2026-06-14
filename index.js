const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

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

// ─── USERS ────────────────────────────────────
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
        return res.status(404).json({ error: "User not found", id })
    }
    res.status(200).json(user)
})

// ─── PRODUCTS ─────────────────────────────────
const products = [
    { id: 1, name: "Laptop",     price: 50000 },
    { id: 2, name: "Smartphone", price: 20000 },
    { id: 3, name: "Tablet",     price: 15000}
]

// ✅ GET /products — all products
app.get('/products', (req, res) => {
    res.status(200).json({
        count: products.length,
        products: products
    })
})

// ✅ specific route BEFORE dynamic route — very important!
app.get('/products/search', (req, res) => {
    const maxPrice = parseInt(req.query.maxPrice)

    if (isNaN(maxPrice)) {
        return res.status(400).json({ error: "maxPrice is required" })
    }

    const results = products.filter(p => p.price <= maxPrice)
    res.status(200).json({
        count: results.length,
        products: results
    })
})

// ✅ dynamic route AFTER specific route
app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const product = products.find(p => p.id === id)
    if (!product) {
        return res.status(404).json({ error: "Product not found" })
    }
    res.status(200).json(product)
})

// ✅ POST — name and price from client
app.post('/products', (req, res) => {
    const { name, price } = req.body
    if (!name || !price) {
        return res.status(400).json({ error: "name and price are required" })
    }
    const newProduct = {
        id: products.length + 1,
        name: name,
        price: price        // ← client ಕಳಿಸಿದ price!
    }
    products.push(newProduct)
    res.status(201).json({
        message: "Product created successfully",
        product: newProduct
    })
})

//----------REST API-------------
const orders = [
    { id: 1, userId: 1, item: "Laptop", amount: 50000},
    { id: 2, userId: 2, item: "Mouse",amount: 500},
    { id: 3, userId: 1, item: "Tablet", amount:15000}
]


//---------Delete products----------
app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const index = products.findIndex(p => p.id === id)


    if (index === -1){
        return  res.status(404).json({ error: "Product not found" })
    }
    products.splice(index, 1)
    res.status(200).json({message: "Product deleted successfully"})

})


//PUT /Products for update
app.put('/products/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const product = products.find(p => p.id === id)

    if (!product) {
        return res.status(404).json({ error: "Product not found" })
    }

    const { name, price } = req.body
    if (name) product.name = name
    if (price) product.price = price

    res.status(200).json({
        message: "Product updated successfully",
        product: product
    })
    
})
























// ─── 404 — ALWAYS LAST ────────────────────────
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.url
    })
})


    


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})