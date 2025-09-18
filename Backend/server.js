import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import db from "./src/config/db.js";
import bcrypt from "bcryptjs";
import { qrRoutes } from './routes/qrRoutes.js';


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
  const { name, email, password, role, rollNo, department, year } = req.body;

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

      // Insert into users table
      db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role],
        (err, result) => {
          if (err) return res.status(500).json({ message: err.message });

          const userId = result.insertId;

          // If role is student, insert into student_details
          if (role === "student") {
            if (!rollNo || !department || !year) {
              return res.status(400).json({ message: "Student fields missing" });
            }

            db.query(
              "INSERT INTO student_details (user_id, roll_no, department, year) VALUES (?, ?, ?, ?)",
              [userId, rollNo, department, year],
              (err2) => {
                if (err2) return res.status(500).json({ message: err2.message });

                const newUser = {
                  id: userId,
                  name,
                  email,
                  role,
                  rollNo,
                  department,
                  year,
                  createdAt: new Date(),
                };
                return res.status(201).json({ user: newUser });
              }
            );
          } else {
            // Admin user
            const newUser = {
              id: userId,
              name,
              email,
              role,
              createdAt: new Date(),
            };
            return res.status(201).json({ user: newUser });
          }
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

    if (user.role === "student") {
      // Fetch student details
      db.query("SELECT roll_no, department, year FROM student_details WHERE user_id = ?", [user.id], (err2, studentResult) => {
        if (err2) return res.status(500).json({ message: err2.message });

        const studentData = studentResult[0];
        const loggedInUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          rollNo: studentData?.roll_no,
          department: studentData?.department,
          year: studentData?.year,
          createdAt: user.created_at,
        };

        res.json({ user: loggedInUser });
      });
    } else {
      // Admin login
      const loggedInUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      };
      res.json({ user: loggedInUser });
    }
  });
});

// Use QR routes
app.use('/api/qrcode', qrRoutes);

app.get('/', (req, res) => {
  res.send('QR backend running');
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
``