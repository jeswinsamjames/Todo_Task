import React, { useState } from 'react';
import CreateTask from "./CreateTask";

const ListHeader = ({ listName, setAuthToken, addProject, fetchProjects }) => {
  const [showForm, setShowForm] = useState(false);

  const signOut = () => {
    // Clear the token from storage
    localStorage.removeItem("authToken");

    // Reset authToken state in App.js
    setAuthToken(null);
  };

  const toggleForm = () => {
    setShowForm(prev => !prev);
  };


  const closeForm = () => {
    setShowForm(false);
  };


  return (
    <div className="list-header">
      <h1>{listName}</h1>
      <div className="button-container">
        <button className="create" onClick={toggleForm}>
          CREATE NEW
        </button>
        <button className="signout" onClick={signOut}>
          SIGN OUT
        </button>
      </div>

      {/* Render the form only if showForm is true */}
      {showForm && <CreateTask closeForm={closeForm} addProject={addProject} fetchProjects={fetchProjects} />}
    
    </div>
  );
};

export default ListHeader;
