import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

dotenv.config();

/*
============================
CONNECT TO MONGODB ATLAS
============================
*/

console.log("MONGO_URL:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => {
        console.error("Mongo connection error", err);
        process.exit(1);
    });

/*
============================
SETUP EXPRESS
============================
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();



app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
/*
============================
CREATE BOOK SCHEMA
============================
*/

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["read", "unread"],
        default: "unread"
    }
}, { timestamps: true });

const Book = mongoose.model("Book", bookSchema);

/*
============================
CRUD OPERATIONS
============================
*/

/////////////////////////////////////////////////
// READ ALL + SEARCH + FILTER
/////////////////////////////////////////////////

app.get("/api/books", async (req, res) => {
    try {
        const { search, status, genre } = req.query;

        let filter = {};

        // Search by title (case insensitive)
        if (search) {
            filter.title = { $regex: search, $options: "i" };
        }

        // Filter by read/unread
        if (status) {
            filter.status = status;
        }

        // Filter by genre
        if (genre) {
            filter.genre = { $regex: genre, $options: "i" };
        }

        const books = await Book.find(filter).sort({ createdAt: -1 });
        res.json(books);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/////////////////////////////////////////////////
// CREATE BOOK
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// CREATE BOOK
/////////////////////////////////////////////////

app.post("/api/books", async (req, res) => {
    try {
        const { title, author, genre } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }

        if (!author || !author.trim()) {
            return res.status(400).json({ message: "Author is required" });
        }

        if (!genre || !genre.trim()) {
            return res.status(400).json({ message: "Genre is required" });
        }

        const newBook = await Book.create({
            title: title.trim(),
            author: author.trim(),
            genre: genre.trim()
        });

        res.status(201).json(newBook);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

/////////////////////////////////////////////////
// UPDATE BOOK (edit or mark read/unread)
/////////////////////////////////////////////////

app.put("/api/books/:id", async (req, res) => {
    try {
        const { title, author, genre, status } = req.body;

        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({ message: "Title cannot be empty" });
            }
            book.title = title.trim();
        }

        if (author !== undefined) {
            book.author = author.trim();
        }

        if (genre !== undefined) {
            book.genre = genre.trim();
        }

        if (status !== undefined) {
            book.status = status;
        }

        await book.save();
        res.json(book);

    } catch (error) {
        res.status(400).json({ message: "Invalid ID" });
    }
});

/////////////////////////////////////////////////
// DELETE BOOK
/////////////////////////////////////////////////

app.delete("/api/books/:id", async (req, res) => {
    try {
        const deleted = await Book.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json({ message: "Deleted successfully" });

    } catch (error) {
        res.status(400).json({ message: "Invalid ID" });
    }
});

/*
============================
START SERVER
============================
*/

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});