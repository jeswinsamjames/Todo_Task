

# Todo Application

This is a full-stack Todo application built using React for the front-end and Node.js for the back-end and Oracle for database

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. Node.js: [Download and install Node.js](https://nodejs.org/)
2. Database: Install a database Oracle.
3. Package Manager: npm (comes with Node.js) .

---

## Installation

Follow these steps to set up the application:

## 1. Clone the Repository

Run the following command in your terminal to clone the repository:

```bash
git clone https://github.com/jeswinsamjames/Todo_Task.git
cd todo
```
## 2. Install Dependencies
```bash
For Client:
Navigate to the client directory and install dependencies:


cd client
npm install

For Server:
Navigate to the server directory and install dependencies:
cd ../server
npm install
```
## 3. Configure Environment Variables

In the server directory, create a .env file and add the following environment variables:
```bash
ORACLE_USER=user_name
ORACLE_PASSWORD=yourpassword
ORACLE_HOST=localhost
ORACLE_SERVICE_NAME = ??
ORACLE_PORT=1521
JWT_SECRET= key_jwt
GIT_TOKEN = git_token_personal

Replace the values with your actual database credentials. The PORT variable specifies the server port.
```
## 4. Set Up the Oracle Database

1.  **Install Oracle SQL Developer** from the official website.
2.  **Create a database connection** in SQL Developer using your Oracle database credentials (e.g., `localhost`, `port: 1521`, SID: `XE`).
3.  **Create the required tables** for the Todo project using the SQL queries provided in the backend setup, which create `users`, `projects`, and `todos` tables.


## 5.Running the Application

1. Start the Server
Navigate to the server directory and run the following command to start the Node.js server:
```bash
cd server
nodemon server.js
The server will start on the specified port .
```
2. Start the Client
Navigate to the client directory and start the React application:
```bash
cd ../client
npm start
```
The React app will start and be accessible at http://localhost:3000.

3. Access the Application
Once both the server and client are running:

Open your browser and go to http://localhost:3000.
