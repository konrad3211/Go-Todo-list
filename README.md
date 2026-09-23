# Go Todo List

> Learning project built while following the **Codesistency** course and later extended as part of my full-stack development practice.

A full-stack todo application with a backend written in **Go** using **Fiber** and **MongoDB**, paired with a **React + TypeScript** frontend.

The project focuses on building and consuming a REST API, working with MongoDB from Go, and connecting a modern React frontend to a non-JavaScript backend.

## Live Demo

**Live application:** https://todo.konradpatla.pl

## Features

- Create new todos.
- View all todos.
- View a single todo.
- Mark todos as completed.
- Delete todos.
- Persist todos in MongoDB.
- Communicate between the React frontend and Go REST API.
- Serve the production frontend build directly from the Go server.

## Tech Stack

### Backend

- Go
- Fiber
- MongoDB
- MongoDB Go Driver
- godotenv

### Frontend

- React
- TypeScript
- Vite
- TanStack Query
- Chakra UI
- React Hot Toast
- Framer Motion

## REST API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/todos` | Get all todos |
| `GET` | `/api/todos/:id` | Get a single todo |
| `POST` | `/api/todos` | Create a todo |
| `PATCH` | `/api/todos/:id` | Mark a todo as completed |
| `DELETE` | `/api/todos/:id` | Delete a todo |

## Project Structure

```text
Go-Todo-list/
├── client/           # React + TypeScript frontend
├── main.go           # Go/Fiber server and REST API
├── go.mod
├── go.sum
└── air.toml
```

## Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=4000
ENV=development
```

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/konrad3211/Go-Todo-list.git
cd Go-Todo-list
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

### 4. Start the Go backend

From the project root:

```bash
go run main.go
```

The backend runs on:

```text
http://localhost:4000
```

## Production

When:

```env
ENV=production
```

the Go server serves the compiled frontend from:

```text
client/dist
```

Build the frontend with:

```bash
cd client
npm run build
```

## What I Practiced

This project helped me practice:

- Building REST APIs with Go and Fiber.
- Working with MongoDB from Go.
- Converting MongoDB `ObjectID` values from URL parameters.
- Designing CRUD endpoints.
- Handling JSON and BSON serialization.
- Connecting a React frontend to a Go backend.
- Managing server state with TanStack Query.
- Serving a frontend production build from a backend server.

## Author

**Konrad Patla**

GitHub: [konrad3211](https://github.com/konrad3211)
