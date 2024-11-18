import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import CreateSubtask from "./CreateSubtask";
import axios from "axios";
import EditSubtask from "./EditSubtask";

const SubtaskPage = ({
  tasks,
  toggleSubtaskCompletion,
  deleteSubtask,
  editSubtask,
}) => {
  const { taskId } = useParams();
  const task = tasks.find((t) => t.id === parseInt(taskId));
  const [subtasks, setSubtasks] = useState([]);

  const [tab, setTab] = useState("pending"); // 'pending' or 'completed'
  const [isFormVisible, setIsFormVisible] = useState(false); // Form visibility
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [editSubtaskId, setEditSubtaskId] = useState(null);
  const fetchSubtasks = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/todos/${taskId}`
      );
      console.log(response);
      setSubtasks(
        response.data.map((subtask) => ({
          ...subtask,
          completed: subtask.status === 1, // Convert status to boolean
        }))
      );
    } catch (error) {
      console.error("Error fetching subtasks:", error);
    }
  };
  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  // Add new subtask
  const addSubtask = (newSubtask) => {
    setSubtasks((prev) => [
      ...prev,
      { ...newSubtask, completed: newSubtask.status === 1 },
    ]);
  };

  if (!task) {
    return <p>Task not found!</p>;
  }

  const pendingSubtasks = subtasks.filter((subtask) => !subtask.completed);
  console.log(pendingSubtasks);
  const completedSubtasks = subtasks.filter((subtask) => subtask.completed);

  const handleStatusChange = async (subtaskId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/todos/${subtaskId}/status`, {
        status: newStatus ? 1 : 0,
      });

      setSubtasks((prevSubtasks) =>
        prevSubtasks.map((subtask) =>
          subtask.id === subtaskId
            ? { ...subtask, completed: newStatus }
            : subtask
        )
      );

      // Optimistically update UI
      toggleSubtaskCompletion(subtaskId, newStatus);
    } catch (error) {
      console.error("Error updating subtask status:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      // Call the delete API
      await axios.delete(`http://localhost:5000/api/todos/${subtaskId}`);

      setSubtasks((prevSubtasks) =>
        prevSubtasks.filter((subtask) => subtask.id !== subtaskId)
      );
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  const updateSubtask = (subtaskId, updatedSubtask) => {
    setSubtasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask.id === subtaskId ? updatedSubtask : subtask
      )
    );
  };

  const handleEditSubtask = (subtaskId) => {
    setEditSubtaskId(subtaskId);
    setIsEditFormVisible(true);
  };

  return (
    <div className="subtask-page">
      <div className="subtask-title">
        <h2>Subtasks for {task.name}</h2>
        <button className="add-new-task" onClick={() => setIsFormVisible(true)}>
          ADD NEW
        </button>
      </div>

      {/* Tabs for Filtering */}
      <div className="tabs">
        <button
          className={tab === "pending" ? "active" : ""}
          onClick={() => setTab("pending")}
        >
          Pending
        </button>
        <button
          className={tab === "completed" ? "active" : ""}
          onClick={() => setTab("completed")}
        >
          Completed
        </button>
      </div>

      {/* Subtask List Based on Tab */}
      <div className="subtask-list">
        {tab === "pending" &&
          pendingSubtasks.map((subtask) => (
            <div key={subtask.id} className="subtask-item">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() =>
                  handleStatusChange(subtask.id, !subtask.completed)
                }
              />
              <p>{subtask.description}</p>
              <p className="timestamp">
                Created: {new Date(subtask.created_date).toLocaleString()}
              </p>

              <div className="button-container">
                <button
                  className="edit"
                  onClick={() => handleEditSubtask(subtask.id)}
                >
                  <AiOutlineEdit /> Edit
                </button>
                <button
                  className="delete"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                >
                  <AiOutlineDelete /> Deletee
                </button>
              </div>
            </div>
          ))}

        {tab === "completed" &&
          completedSubtasks.map((subtask) => (
            <div key={subtask.id} className="subtask-item">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() =>
                  handleStatusChange(subtask.id, !subtask.completed)
                }
              />
              <p>{subtask.description}</p>
              <p className="timestamp">
                Created: {new Date(subtask.created_date).toLocaleString()}
              </p>
              <div className="button-container">
                <button
                  className="edit"
                  onClick={() => handleEditSubtask(subtask.id)}
                >
                  <AiOutlineEdit /> Edit
                </button>
                <button
                  className="delete"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                >
                  <AiOutlineDelete /> Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      <Link to="/">
        <button className="back-button">Back to Task List</button>
      </Link>

      {isFormVisible && (
        <CreateSubtask
          task={task}
          fetchSubtasks={fetchSubtasks}
          closeForm={() => setIsFormVisible(false)} // Hide form
          addSubtask={addSubtask} // Add new subtask to the task
          taskId={task.id} // Pass the task ID
        />
      )}
      {isEditFormVisible && (
        <EditSubtask
          subtaskId={editSubtaskId}
          closeForm={() => setIsEditFormVisible(false)}
          updateSubtask={updateSubtask}
        />
      )}
    </div>
  );
};

export default SubtaskPage;
