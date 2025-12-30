# flexilearn - A MERN Stack Web Application Project

## Project Description

flexilearn is a full-stack web application built using the MERN (MongoDB, Express, React, Node.js) technology stack. It is a freelance marketplace platform that allows users to create service listings (gigs), browse available services, make payments, and communicate with other users.

## Core Features

1. **User Authentication** - Sign up and login functionality with JWT-based authentication
2. **Gig Management** - Users can create, list, and manage service offerings
3. **Browsing & Search** - Users can search and filter gigs by category and keywords
4. **Real-time Messaging** - Chat system for communication between buyers and sellers
5. **Payment Processing** - Dummy payment system to simulate transaction flow
6. **Order Management** - Track and manage service orders and payments
7. **Ratings & Reviews** - Users can leave feedback on completed services


## Technology Stack

### Frontend
- HTML
- CSS / SCSS (styling)
- JavaScript
- React.js (UI library)
- Vite (build tool)
- Axios (HTTP client)

### Backend
- Node.js runtime
- Express.js (web framework)
- MongoDB (NoSQL database)
- JWT (authentication)

## Installation & Setup

### Prerequisites
- Node.js and npm installed
- MongoDB running locally or connection string available

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/flexilearn.git
   cd flexilearn
   ```

2. **Install backend dependencies**
   ```bash
   cd api
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   - Create a `.env` file in the `api` folder
   - Add MongoDB connection string and other required variables

5. **Run the application**
   
   Start API server (Terminal 1):
   ```bash
   cd api
   npm start
   ```
   
   Start frontend dev server (Terminal 2):
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:8800

## Project Structure

- `/api` - Backend server (Express.js, MongoDB)
- `/client` - Frontend application (React.js)

## Notes for Course Review

- This project demonstrates full-stack web development concepts
- Implements authentication, data management, and user interfaces
- Uses modern JavaScript frameworks and libraries
- Follows MVC-like architecture with separate frontend and backend

