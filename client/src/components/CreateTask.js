import React, { useState } from 'react';
import axios from 'axios'; // Install axios if not already installed

const CreateTask = ({ closeForm, addProject, fetchProjects }) => {
  const [projectName, setProjectName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!projectName.trim()) {
      alert("Project name cannot be empty");
      return;
    }

    try {
      // Example API call to create a new project
      const response = await axios.post("http://localhost:5000/api/projects", {
        title: projectName,
        id: localStorage.getItem("userId")
      });

      // Update the project list in the parent component
      addProject(response.data);

      // Clear input and close the form
      setProjectName("");
      closeForm();
      fetchProjects();

    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  return (
    <div className="overlay">
      <div className="form-container">
        <div className="form-title">
          <h2>Create New Project</h2>
          <button className="close-button" onClick={closeForm}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            required
            placeholder="Enter Project Name"
            name="title"
            type="text"
            className="input-field"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)} // Update project name state
          />
          <button type="submit" className="submit-button create">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
