const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

let notes = [
    { id: 1, title: "Shopping List", content: "Milk, Eggs, Bread", createdAt: new Date().toLocaleString() },
    { id: 2, title: "Study Plan", content: "Node.js, Express, MongoDB", createdAt: new Date().toLocaleString() }
]

// GET /notes
app.get('/notes', (req, res) => {
    res.status(200).json({
        count: notes.length,
        notes: notes
    })
})

// GET /notes/search?title=xxx
app.get('/notes/search', (req, res) => {
    const { title } = req.query
    if (!title) {
        return res.status(400).json({ error: "title query required" })
    }
    const results = notes.filter(n => 
        n.title.toLowerCase().includes(title.toLowerCase())
    )
    res.status(200).json({ count: results.length, notes: results })
})

// GET /notes/:id
app.get('/notes/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const note = notes.find(n => n.id === id)
    if (!note) return res.status(404).json({ error: "Note not found" })
    res.status(200).json(note)
})

// POST /notes
app.post('/notes', (req, res) => {
    const { title, content } = req.body
    if (!title || !content) {
        return res.status(400).json({ error: "title and content required" })
    }
    const newNote = {
        id: notes.length + 1,
        title,
        content,
        createdAt: new Date().toLocaleString()
    }
    notes.push(newNote)
    res.status(201).json({ message: "Note created!", note: newNote })
})

// PUT /notes/:id
app.put('/notes/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const note = notes.find(n => n.id === id)
    if (!note) return res.status(404).json({ error: "Note not found" })
    const { title, content } = req.body
    if (title) note.title = title
    if (content) note.content = content
    res.status(200).json({ message: "Note updated!", note })
})

// DELETE /notes/:id
app.delete('/notes/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const index = notes.findIndex(n => n.id === id)
    if (index === -1) return res.status(404).json({ error: "Note not found" })
    notes.splice(index, 1)
    res.status(200).json({ message: "Note deleted!" })
})

// 404
app.use((req, res) => {
    res.status(404).json({ error: "Route not found", path: req.url })
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})