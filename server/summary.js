const axios = require("axios");
const oracledb = require("oracledb");
const fs = require("fs/promises");
require("dotenv").config();

const GITHUB_TOKEN = process.env.GIT_TOKEN; // Replace with your GitHub personal access token

const { getConnection } = require("./db");

// Helper function to fetch project details and todos
const fetchProjectData = async (projectId) => {
  let connection;

  try {
    connection = await getConnection();

    // Fetch project details
    const projectResult = await connection.execute(
      `SELECT title FROM project WHERE id = :projectId`,
      [projectId]
    );
    if (projectResult.rows.length === 0) {
      throw new Error("Project not found");
    }
    const projectTitle = projectResult.rows[0][0];

    // Fetch todos for the project
    const todosResult = await connection.execute(
      `SELECT description, status FROM todo WHERE project_id = :projectId`,
      [projectId]
    );

    const todos = todosResult.rows.map((row) => ({
      description: row[0],
      completed: row[1] === 1, // Convert status to boolean
    }));

    return { projectTitle, todos };
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

// Helper function to generate markdown
const generateMarkdown = ({ projectTitle, todos }) => {
  const completedTodos = todos.filter((todo) => todo.completed);
  const pendingTodos = todos.filter((todo) => !todo.completed);

  let markdown = `# ${projectTitle}\n\n`;
  markdown += `**Summary**: ${completedTodos.length} / ${todos.length} completed\n\n`;

  // Pending todos
  markdown += `## Pending Todos\n`;
  pendingTodos.forEach((todo) => {
    markdown += `- [ ] ${todo.description}\n`;
  });

  markdown += `\n`;

  // Completed todos
  markdown += `## Completed Todos\n`;
  completedTodos.forEach((todo) => {
    markdown += `- [x] ${todo.description}\n`;
  });

  return markdown;
};

// Helper function to create a secret Gist
const createGist = async (filename, content) => {
  const response = await axios.post(
    "https://api.github.com/gists",
    {
      files: {
        [filename]: {
          content,
        },
      },
      description: "Project Summary",
      public: false,
    },
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    }
  );

  return response.data.html_url; // Return the Gist URL
};

// Helper function to save markdown locally
const saveMarkdownLocally = async (filename, content) => {
  try {
    await fs.writeFile(filename, content, "utf-8");
    console.log(`Markdown saved locally as ${filename}`);
  } catch (error) {
    console.error("Error saving markdown locally:", error.message);
  }
};

// Main function
const exportProjectSummary = async (projectId) => {
  try {
    const projectData = await fetchProjectData(projectId);
    const markdownContent = generateMarkdown(projectData);
    const filename = `${projectData.projectTitle}.md`;

    // Save as a local file
    await saveMarkdownLocally(filename, markdownContent);

    // Export as a Gist
    const gistUrl = await createGist(filename, markdownContent);
    console.log(`Gist created successfully: ${gistUrl}`);
    return gistUrl;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Replace with the project ID you want to export
const projectId = 22; // Example project ID

module.exports = { exportProjectSummary };
