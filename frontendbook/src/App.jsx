const BASE_URL = import.meta.env.VITE_API_URL || "https://book-backend11.onrender.com/api/books";


import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const API = "https://book-backend11.onrender.com/api/books";

  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: ""
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [genreFilter, setGenreFilter] = useState("");

  /*
  ============================
  FETCH BOOKS
  ============================
  */

  const fetchBooks = async () => {
    const res = await axios.get(API, {
      params: {
        search,
        status,
        genre: genreFilter
      }
    });
    setBooks(res.data);
  };

  useEffect(() => {
    fetchBooks();
  }, [search, status, genreFilter]);

  /*
  ============================
  HANDLE INPUT
  ============================
  */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /*
  ============================
  ADD BOOK
  ============================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(API, form);
    setForm({ title: "", author: "", genre: "" });
    fetchBooks();
  };

  /*
  ============================
  DELETE BOOK
  ============================
  */

  const deleteBook = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchBooks();
  };

  /*
  ============================
  TOGGLE READ/UNREAD
  ============================
  */

  const toggleStatus = async (book) => {
    await axios.put(`${API}/${book._id}`, {
      status: book.status === "read" ? "unread" : "read"
    });
    fetchBooks();
  };

  return (
    <div className="container">
      <h1>📚 Book Library</h1>

      {/* ADD BOOK FORM */}
      <form onSubmit={handleSubmit} className="form">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="author"
          placeholder="Author"
          value={form.author}
          onChange={handleChange}
          required
        />
        <input
          name="genre"
          placeholder="Genre"
          value={form.genre}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Book</button>
      </form>

      {/* SEARCH */}
      <input
        placeholder="Search by title..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTERS */}
      <div className="filters">
        <select onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="read">Read</option>
          <option value="unread">Unread</option>
        </select>

        <input
          placeholder="Filter by genre"
          onChange={(e) => setGenreFilter(e.target.value)}
        />
      </div>

      {/* BOOK LIST */}
      <div className="book-list">
        {books.map((book) => (
          <div key={book._id} className="card">
            <h3>{book.title}</h3>
            <p>Author: {book.author}</p>
            <p>Genre: {book.genre}</p>
            <p>Status: {book.status}</p>

            <button onClick={() => toggleStatus(book)}>
              Toggle Status
            </button>

            <button onClick={() => deleteBook(book._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;