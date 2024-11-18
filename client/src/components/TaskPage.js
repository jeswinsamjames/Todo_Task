import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AiFillApi, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import EditProjectForm from "./EditProjectForm";
import axios from "axios";

const TaskPage = ({ tasks, deleteTask, editTask, fetchProjects }) => {
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [gistUrl, setGistUrl] = useState(null);
  const exporttask = async (projectId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/export-summary/${projectId}`
      );

      setGistUrl(response.data.gistUrl);
    } catch (error) {
      console.error("Error exporting project summary:", error);
      alert("Failed to export project summary");
    }
  };
  const handleEditClick = (projectId) => {
    setEditingProjectId(projectId);
    setIsEditFormVisible(true);
  };

  // Close the edit form
  const handleCloseForm = () => {
    setIsEditFormVisible(false);
    setEditingProjectId(null);
  };
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task.id} className="task-item">
          <h3>{task.name}</h3>
          <div className="button-container">
            <div className="button-group">
              <button onClick={() => handleEditClick(task.id)} className="edit">
                <AiOutlineEdit />
              </button>
              <button onClick={() => deleteTask(task.id)} className="delete">
                <AiOutlineDelete />
              </button>
              <Link to={`/task/${task.id}`}>
                <button className="view-subtasks">View Subtasks</button>
              </Link>
            </div>
            <button
              onClick={() => exporttask(task.id)}
              className="export-button"
            >
              Export <AiFillApi />
            </button>
          </div>
        </div>
      ))}

      {/* gist url  */}

      {gistUrl && (
        <a href={gistUrl} target="_blank" rel="noopener noreferrer">
          View Gist
        </a>
        
      )}
      {isEditFormVisible && (
        <EditProjectForm
          projectId={editingProjectId}
          closeForm={handleCloseForm}
          fetchProjects={fetchProjects}
        />
      )}
    </div>
  );
};

export default TaskPage;
