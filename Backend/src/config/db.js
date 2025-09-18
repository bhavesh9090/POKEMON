import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // ye sabse upar hona chahiye

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_NAME:", process.env.DB_NAME);

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});



export default db;
