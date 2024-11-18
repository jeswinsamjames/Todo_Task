import './app.css';
import React, { useState,useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListHeader from './components/ListHeader';
import TaskPage from './components/TaskPage';
import SubtaskPage from './components/ListItem';
//import CreateTask from './components/CreateTask';
import Auth from './components/Auth';
import axios from 'axios'; // Import axios for making HTTP requests


const App = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken")); // Persist token
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  
  useEffect(() => {
    if (authToken) {
      fetchProjects(); // Call fetchProjects only if authToken is available
    }
  }, [authToken]); // Run when authToken changes

  // Function to fetch the updated list of projects from the backend
  const fetchProjects = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/fetch_projects", {
        id: userId,
        headers: {
          Authorization: `Bearer ${authToken}` // Pass token if needed
        }
        
      });
      setTasks(response.data);  // Update state with the new project list
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      // Make DELETE request to the server to delete the project and its subtasks
      await axios.delete(`http://localhost:5000/api/projects/delete/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },  // Add the authorization token if needed
      });
  
      // Remove the task from the state after successful deletion
      setTasks(tasks.filter(task => task.id !== id));
  
      alert("Project and its subtasks deleted successfully.");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project and subtasks.");
    }
  };
  

  // Function to edit a task
  const editTask = (id) => {
    const taskName = prompt("Edit task name:");
    if (taskName) {
      setTasks(tasks.map(task => (task.id === id ? { ...task, name: taskName } : task)));
    }
  };

  // Function to delete a subtask
  const deleteSubtask = (taskId, subtaskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId) }
        : task
    ));
  };

  // Function to edit a subtask
  const editSubtask = (taskId, subtaskId) => {
    const subtaskName = prompt("Edit subtask name:");
    if (subtaskName) {
      setTasks(tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subtaskId ? { ...subtask, name: subtaskName } : subtask
              ),
            }
          : task
      ));
    }
  };
  const toggleSubtaskCompletion = (taskId, subtaskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            ),
          }
        : task
    ));
  };
  const addProject = (newProject) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      { id: newProject.id, name: newProject.name, subtasks: [] },
    ]);
  };

  return (
    <Router>
      <div className="app">
      {!authToken &&           <Auth setAuthToken={setAuthToken} setUserId={setUserId} />    }
        {authToken &&
        <>
        <ListHeader listName={'Project Task List'} setAuthToken={setAuthToken} addProject={addProject} fetchProjects={fetchProjects}   />
        <Routes>
          {/* Main Task List Page */}
          <Route
            path="/"
            element={<TaskPage tasks={tasks} deleteTask={deleteTask} editTask={editTask} fetchProjects={fetchProjects}/>}
          />

          {/* Subtask Page */}
          <Route
            path="/task/:taskId"
            element={
              <SubtaskPage
                tasks={tasks}
                deleteSubtask={deleteSubtask}
                editSubtask={editSubtask}
                toggleSubtaskCompletion={toggleSubtaskCompletion}
              />
            }
          />
        </Routes>
        </>}
      </div>
    </Router>
  );
};

export default App;
