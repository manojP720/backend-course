// ❌ BAD — server crash ಆಗುತ್ತೆ!
app.get('/users', (req, res) => {
    const data = JSON.parse("invalid json")  // crash!
    res.json(data)
})

// ✅ GOOD — error catch ಮಾಡ್ತೀವಿ
app.get('/users', async (req, res) => {
    try {
        const data = JSON.parse("invalid json")
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})