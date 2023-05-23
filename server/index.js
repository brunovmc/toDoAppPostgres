require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Middleware for inspecting response headers
app.use((req, res, next) => {
  res.on("finish", () => {
    const headers = res.getHeaders();
    const cspHeader = headers["content-security-policy"];
    const xCspHeader = headers["x-content-security-policy"];

    console.log("Content-Security-Policy:", cspHeader);
    console.log("X-Content-Security-Policy:", xCspHeader);
  });

  next();
});

// Get all tasks
app.get("/api/tasks", (req, res) => {
  console.log("Fetching tasks...");
  pool.query("SELECT * FROM tasks", (error, results) => {
    if (error) {
      console.log("Error fetching tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    } else {
      console.log("Tasks fetched successfully:", results.rows);
      res.status(200).json(results.rows);
    }
  });
});

// Create a new task
app.post("/api/tasks", (req, res) => {
  console.log("Adding new task:", req.body);
  const { task, completed, category } = req.body;

  pool.query(
    "INSERT INTO tasks (task, completed, category) VALUES ($1, $2, $3) RETURNING *",
    [task, completed, category],
    (error, result) => {
      if (error) {
        console.log("Error adding task:", error);
        res.status(500).json({ error: "Internal server error" });
      } else {
        console.log("Task added successfully:", result.rows[0]);
        res.status(201).json(result.rows[0]);
      }
    }
  );
});

// Update a task
app.put("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const { task, completed, category } = req.body;

  pool.query(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks')",
    (error, result) => {
      if (error) {
        res.status(500).json({ error: "Internal server error" });
      } else if (!result.rows[0].exists) {
        res.status(500).json({ error: "Tasks table does not exist" });
      } else {
        pool.query(
          "UPDATE tasks SET task = $1, completed = $2, category = $3 WHERE id = $4 RETURNING *",
          [task, completed, category, taskId],
          (error, result) => {
            if (error) {
              res.status(500).json({ error: "Internal server error" });
            } else if (result.rows.length === 0) {
              res.status(404).json({ error: "Task not found" });
            } else {
              res.status(200).json(result.rows[0]);
            }
          }
        );
      }
    }
  );
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  pool.query(
    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks')",
    (error, result) => {
      if (error) {
        res.status(500).json({ error: "Internal server error" });
      } else if (!result.rows[0].exists) {
        res.status(500).json({ error: "Tasks table does not exist" });
      } else {
        pool.query(
          "DELETE FROM tasks WHERE id = $1 RETURNING *",
          [taskId],
          (error, result) => {
            if (error) {
              res.status(500).json({ error: "Internal server error" });
            } else if (result.rows.length === 0) {
              res.status(404).json({ error: "Task not found" });
            } else {
              res.status(200).json(result.rows[0]);
            }
          }
        );
      }
    }
  );
});

app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
