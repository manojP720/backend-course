const express = require('express')
const https = require('https')
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

const exchangeMonitor = {
    rates: {},
    lastUpdated: null,
    history: []
}

function fetchExchangeRate(base = 'USD', target = 'EUR') {
    const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(target)}`

    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = ''
            response.on('data', chunk => data += chunk)
            response.on('end', () => {
                try {
                    const parsed = JSON.parse(data)
                    if (!parsed.success) {
                        return reject(new Error(parsed.error || 'Exchange rate API returned an error'))
                    }
                    const rate = parsed.rates && parsed.rates[target]
                    if (typeof rate !== 'number') {
                        return reject(new Error(`Rate not found for ${base}/${target}`))
                    }
                    resolve(rate)
                } catch (err) {
                    reject(err)
                }
            })
        }).on('error', reject)
    })
}

async function updateMonitoredRate(base = 'USD', target = 'EUR') {
    try {
        const rate = await fetchExchangeRate(base, target)
        const key = `${base}_${target}`
        const previous = exchangeMonitor.rates[key]

        exchangeMonitor.rates[key] = rate
        exchangeMonitor.lastUpdated = new Date().toISOString()
        exchangeMonitor.history.unshift({ base, target, rate, timestamp: exchangeMonitor.lastUpdated })
        if (exchangeMonitor.history.length > 20) {
            exchangeMonitor.history.pop()
        }

        if (previous && previous !== rate) {
            console.log(`📈 Exchange rate changed ${base}/${target}: ${previous} → ${rate}`)
        }
    } catch (err) {
        console.error('Exchange monitor error:', err.message)
    }
}


async function fetchAndLogRate(base, target) {
    try {
        const rate = await fetchExchangeRate(base, target)  
        console.log(`Current exchange rate ${base}/${target}: ${rate}`)
    } catch (err) {
        console.error('Error fetching exchange rate:', err.message)
    }
}

async function pollExchangeRates() {
    const pairs = [
        { base: 'USD', target: 'EUR' },
        { base: 'USD', target: 'INR' }
    ]

    await Promise.all(pairs.map(pair => updateMonitoredRate(pair.base, pair.target)))
}



async function fetchAllExchangeRates() {
    const pairs = [
        { base: 'USD', target: 'EUR' },
        { base: 'USD', target: 'INR' }
    ]   
    const results = {}
    for (const pair of pairs) {
        try {
            const rate = await fetchExchangeRate(pair.base, pair.target)
            results[`${pair.base}/${pair.target}`] = rate
        } catch (err) {
            results[`${pair.base}/${pair.target}`] = `Error: ${err.message}`
        }
    }
    return results;
}

// Start the monitor immediately and then every 60 seconds
pollExchangeRates()
setInterval(pollExchangeRates, 60 * 1000)

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

// GET /exchange — get current exchange rate for a currency pair
app.get('/exchange', async (req, res) => {
    try {
        const base = (req.query.base || 'USD').toString().toUpperCase()
        const target = (req.query.target || 'EUR').toString().toUpperCase()
        const rate = await fetchExchangeRate(base, target)

        res.status(200).json({
            base,
            target,
            rate,
            updatedAt: new Date().toISOString()
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /exchange/monitor — view monitored exchange rates and history
app.get('/exchange/monitor', (req, res) => {
    res.status(200).json(exchangeMonitor)
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


// ಎಲ್ಲಾ unhandled errors ಇಲ್ಲಿ catch ಆಗುತ್ತೆ
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error"
    })
})

// Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err.message)
})
