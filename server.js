const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config();


// Initialize Express app
const app = express();
const port = 5004;

// Middleware
app.use(cors());
app.use(express.json());

require('dotenv').config();  // Load environment variables from .env file



// MongoDB URI from the .env file
const dbURI = process.env.MONGO_URI;  // Access MongoDB URI using process.env

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Routes
const UserRouter = require('./api/User'); // Router should be initialized after `app`
app.use('/user', UserRouter);

// Define Song schema and model
const SongSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    audioUrl: { type: String, required: true },
    coverImage: { type: String, required: true }
});

const Song = mongoose.model('Song', SongSchema, 'song');

// Routes for songs
app.get('/songs', async (req, res) => {
    try {
        const songs = await Song.find();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching songs', error });
    }
});

app.post('/songs', async (req, res) => {
    try {
        const { title, artist, audioUrl, coverImage } = req.body;

        if (!title || !artist || !audioUrl || !coverImage) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newSong = new Song({ title, artist, audioUrl, coverImage });
        await newSong.save();
        res.status(201).json({ message: 'Song added successfully', song: newSong });
    } catch (error) {
        res.status(500).json({ message: 'Error adding song', error });
    }
});

app.get('/songs/:id', async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }
        res.status(200).json(song);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching song', error });
    }
});

app.put('/songs/:id', async (req, res) => {
    try {
        const { title, artist, audioUrl, coverImage } = req.body;

        if (!title || !artist || !audioUrl || !coverImage) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const updatedSong = await Song.findByIdAndUpdate(
            req.params.id,
            { title, artist, audioUrl, coverImage },
            { new: true }
        );

        if (!updatedSong) {
            return res.status(404).json({ message: 'Song not found' });
        }
        res.status(200).json({ message: 'Song updated successfully', song: updatedSong });
    } catch (error) {
        res.status(500).json({ message: 'Error updating song', error });
    }
});

app.delete('/songs/:id', async (req, res) => {
    try {
        const deletedSong = await Song.findByIdAndDelete(req.params.id);

        if (!deletedSong) {
            return res.status(404).json({ message: 'Song not found' });
        }
        res.status(200).json({ message: 'Song deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting song', error });
    }
});

// Start the server
const PORT = process.env.PORT || 5004
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
