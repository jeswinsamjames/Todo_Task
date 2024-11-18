import React, { useState } from "react";
import axios from "axios";

const CreateSubtask = ({ closeForm, addSubtask, taskId, fetchSubtasks }) => {
  const [subtaskName, setSubtaskName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!subtaskName.trim()) {
      alert("Subtask description cannot be empty");
      return;
    }

    try {
      // API call to create a new subtask
      const response = await axios.post("http://localhost:5000/api/todos", {
        project_id: taskId,
        description: subtaskName,
      });

      // Update the subtask list in the parent component
      addSubtask(response.data);

      // Clear input and close the form
      setSubtaskName("");
      closeForm();
      fetchSubtasks();
    } catch (error) {
      console.error("Error creating subtask:", error);
      alert("Failed to create subtask. Please try again.");
    }
  };

  return (
    <div className="overlay">
      <div className="form-container">
        <div className="form-title">
          <h2>Create New Subtask</h2>
          <button className="close-button" onClick={closeForm}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            required
            placeholder="Enter Subtask Description"
            name="descp"
            type="text"
            className="input-field"
            value={subtaskName}
            onChange={(e) => setSubtaskName(e.target.value)} // Update subtask description state
          />
          <button type="submit" className="submit-button create">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSubtask;
