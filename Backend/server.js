
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import db from "./src/config/db.js";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API WORKING 🚀");
});


// ---------------- SIGN-UP ----------------
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    // Check if email exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      if (result.length > 0) return res.status(400).json({ message: "Email already exists" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role],
        (err, result) => {
          if (err) return res.status(500).json({ message: err.message });

          const newUser = { id: result.insertId, name, email, role, createdAt: new Date() };
          return res.status(201).json({ user: newUser });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- SIGN-IN ----------------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "All fields required" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.length === 0) return res.status(400).json({ message: "Invalid email or password" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const loggedInUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    };

    res.json({ user: loggedInUser });
  });
});




// Test DB connection route
app.get("/test-db", (req, res) => {
  db.query("SELECT DATABASE() AS db", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "DB Connected!", database: result[0].db });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
