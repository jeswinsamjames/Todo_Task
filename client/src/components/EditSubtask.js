import React, { useState, useEffect } from "react";
import axios from "axios";

const EditSubtask = ({ subtaskId, closeForm, updateSubtask }) => {
  const [subtaskDescription, setSubtaskDescription] = useState("");

  // Fetch subtask details on load
  useEffect(() => {
    const fetchSubtask = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/todos/subtask/${subtaskId}`
        );
        setSubtaskDescription(response.data.description);
      } catch (error) {
        console.error("Error fetching subtask:", error);
      }
    };

    fetchSubtask();
  }, [subtaskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:5000/api/todos/${subtaskId}`, {
        description: subtaskDescription,
      });

      // Update parent state
      updateSubtask(subtaskId, {
        id: subtaskId,
        description: subtaskDescription,
      });

      closeForm();
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  return (
    <div className="overlay">
      <div className="form-container">
        <div className="form-title">
          <h2>Edit Subtask</h2>
          <button className="close-button" onClick={closeForm}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            required
            placeholder="Enter Subtask Description"
            type="text"
            className="input-field"
            value={subtaskDescription}
            onChange={(e) => setSubtaskDescription(e.target.value)}
          />

          <button type="submit" className="submit-button create">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSubtask;
