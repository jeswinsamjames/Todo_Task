import React, { useState, useEffect } from "react";
import axios from "axios";

const EditProjectForm = ({ projectId, closeForm, fetchProjects }) => {
  const [projectName, setProjectName] = useState("");

  // Fetch the current project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/projects/${projectId}`
        );
        console.log("Fetched project:", response.data); // Confirm the data

        setProjectName(response.data.title);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Handle form submission to update project name
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      alert("Project name cannot be empty");
      return;
    }

    try {
      // Send the updated project name to the backend
      const response = await axios.put(
        `http://localhost:5000/api/projects/${projectId}`,
        { title: projectName }
      );

      console.log("Response:", response); // Check response details in the console

      // Ensure the response status is 200 before proceeding
      if (response.status === 200) {
        fetchProjects(); // Update state in parent
        closeForm(); // Close the form
      } else {
        alert("Unexpected response from server. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        // Server returned an error response
        console.error("Server error:", error.response.data);
        alert(
          `Error: ${
            error.response.data.error || "Failed to update project name"
          }`
        );
      } else {
        // Network or other error
        console.error("Error updating project name:", error);
        alert("Failed to update project name. Please check your connection.");
      }
    }
  };

  return (
    <div className="overlay">
      <div className="form-container">
        <div className="form-title">
          <h2>Edit Project Name</h2>
          <button className="close-button" onClick={closeForm}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter new project name"
            className="input-field"
          />
          <button type="submit" className="submit-button">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProjectForm;
