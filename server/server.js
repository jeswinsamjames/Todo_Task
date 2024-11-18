const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getConnection } = require("./db");
require("dotenv").config();
const cors = require("cors");
const { exportProjectSummary } = require("./summary");
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// Registration Route
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  console.log("helooo");
  console.log(password);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await getConnection();

    await connection.execute(
      `INSERT INTO Users (username, password) VALUES (:username, :password)`,
      [email, hashedPassword],
      { autoCommit: true }
    );

    res.status(201).json({ message: "User registered successfully" });
    await connection.close();
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT id, password FROM Users WHERE username = :email`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [userId, hashedPassword] = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token, userId });
    await connection.close();
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

//create a new project
app.post("/api/projects", async (req, res) => {
  console.log("Create a new project");
  const { title } = req.body;
  console.log(title);

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Project title cannot be empty" });
  }

  try {
    const userId = req.body.id;
    const connection = await getConnection();
    const result = await connection.execute(
      `INSERT INTO project (title, user_id) VALUES (:title, :userId)`,
      [title, userId],
      { autoCommit: true }
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

//fetch all projects
app.post("/api/fetch_projects", async (req, res) => {
  let connection;
  try {
    const userId = req.body.id;
    console.log(userId);
    connection = await getConnection();

    const resultProjects = await connection.execute(
      `SELECT * FROM project WHERE user_id = :userId`,
      [userId]
    );
    const resultSubtasks = await connection.execute(
      `SELECT * FROM todo WHERE project_id IN (SELECT id FROM project)`
    );

    const tasks = resultProjects.rows;
    const subtasks = resultSubtasks.rows;

    const tasksWithSubtasks = tasks.map((task) => ({
      id: task[0],
      name: task[1],
      subtasks: subtasks.filter((subtask) => subtask[1] === task[0]),
    }));

    res.status(200).json(tasksWithSubtasks);
  } catch (error) {
    console.error("Error fetching tasks and subtasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks and subtasks" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing the connection:", error);
      }
    }
  }
});

//dlt project
app.delete("/api/projects/delete/:id", async (req, res) => {
  const projectId = req.params.id;
  let connection;
  try {
    connection = await getConnection();

    const deleteSubtasks = await connection.execute(
      `DELETE FROM todo WHERE project_id = :projectId`,
      [projectId],
      { autoCommit: true }
    );

    const deleteProject = await connection.execute(
      `DELETE FROM project WHERE id = :projectId`,
      [projectId],
      { autoCommit: true }
    );

    res
      .status(200)
      .json({ message: "Project and its subtasks deleted successfully" });
  } catch (error) {
    console.error("Error deleting project and subtasks:", error);
    res.status(500).json({ error: "Failed to delete project and subtasks" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }
});

//create sub task
app.post("/api/todos", async (req, res) => {
  try {
    const { project_id, description } = req.body;
    console.log(req.body);

    // Validate required fields
    if (!project_id || !description || !description.trim()) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `INSERT INTO todo (project_id, description) 
         VALUES (:project_id, :description)`,

      [project_id, description]
    );

    await connection.commit();

    res.status(201).json({
      project_id,
      description,
    });
  } catch (error) {
    console.error("Error creating subtask:", error);
    res.status(500).json({ error: "Failed to create subtask" });
  }
});

//fetch the sub task
app.get("/api/todos/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT id, description, status, created_date
      FROM todo 
      WHERE project_id = :projectId`,
      [projectId]
    );
    console.log(result);
    const subtasks = result.rows.map((row) => ({
      id: row[0],
      description: row[1],
      status: row[2],
      created_date: row[3],
    }));
    res.status(200).json(subtasks);
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    res.status(500).json({ error: "Failed to fetch subtasks" });
  }
});

//checkbox for subtask
app.put("/api/todos/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (status !== 0 && status !== 1) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const connection = await getConnection();
    const result = await connection.execute(
      `UPDATE todo SET status = :status WHERE id = :id`,
      [status, id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    res.status(200).json({ message: "Subtask status updated successfully" });
  } catch (error) {
    console.error("Error updating subtask status:", error);
    res.status(500).json({ error: "Failed to update subtask status" });
  }
});

//delete subtasks
app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    await connection.execute(`DELETE FROM todo WHERE id = :id`, [id]);
    await connection.commit();
    res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    res.status(500).json({ error: "Failed to delete subtask" });
  }
});

//edit subtasks
app.get("/api/todos/subtask/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT id, description, status FROM todo WHERE id = :id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    const [subtask] = result.rows.map((row) => ({
      id: row[0],
      description: row[1],
      status: row[2],
    }));
    console.log(result.rows);

    res.status(200).json(subtask);
  } catch (error) {
    console.error("Error fetching subtask:", error);
    res.status(500).json({ error: "Failed to fetch subtask" });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  try {
    const connection = await getConnection();

    await connection.execute(
      `UPDATE todo SET description = :description WHERE id = :id`,
      { description, id }
    );

    await connection.commit();
    res.status(200).json({ message: "Subtask updated successfully" });
  } catch (error) {
    console.error("Error updating subtask:", error);
    res.status(500).json({ error: "Failed to update subtask" });
  }
});

//edit project
app.put("/api/projects/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const connection = await getConnection();

    await connection.execute(
      `UPDATE project SET title = :title WHERE id = :id`,
      [title, id]
    );

    await connection.commit();
    res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});
app.get("/api/projects/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT id, title FROM project WHERE id = :id`,
      [id]
    );

    if (result.rows.length > 0) {
      const [projectId] = result.rows.map((row) => ({
        id: row[0],
        title: row[1],
      }));
      res.status(200).json(projectId);
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  } catch (error) {
    console.error("Error fetching project details:", error);
    res.status(500).json({ error: "Failed to fetch project details" });
  }
});

app.get("/api/export-summary/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const gistUrl = await exportProjectSummary(projectId);
  res.status(200).json({ gistUrl });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
