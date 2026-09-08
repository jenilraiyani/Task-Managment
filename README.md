# TaskFlow – Smart To-Do & Priority Manager

TaskFlow is a production-quality full-stack web application designed for personal task management. It allows users to create, edit, manage, and prioritize tasks efficiently using a deterministic rule-based priority algorithm (no AI/ML involved). The application features a clean, professional, and modern dashboard-style UI using React and Bootstrap 5, powered by an Express.js backend and MongoDB Atlas.

## Features

- **User Authentication**: Secure registration and login using JWT and bcrypt.
- **Task Management**: Complete CRUD operations for tasks.
- **Smart Priority Sorting**: Tasks are automatically sorted based on deterministic Priority and Deadline scores.
- **Dashboard Overview**: Visual statistics of Total, Pending, Completed, and Overdue tasks.
- **Categorization**: Group tasks by categories like College, Project, Personal, Work.
- **Filtering & Views**: View tasks by 'Today', 'Upcoming', 'Completed', and 'Overdue'.

## Technology Stack

### Frontend
- React.js (Vite)
- React Router DOM
- Bootstrap 5 & Bootstrap Icons
- Axios
- Vanilla CSS

### Backend
- Node.js & Express.js
- MongoDB Atlas (Mongoose)
- JWT & bcryptjs
- node-cron (for background reminder checks)

## Database Setup

1. Create a MongoDB Atlas cluster (or use an existing one).
2. Create a database user and allow network access (IP allowlist / `0.0.0.0/0` for local testing).
3. Copy your connection string into `backend/.env` as `MONGODB_URI`.
4. Collections (`users`, `tasks`, `categories`, `notifications`, `notificationhistories`) are created automatically on first write — no SQL script needed.

## Environment Configuration

### Backend Setup
1. Navigate to the `backend/` directory.
2. Rename `.env.example` to `.env`.
3. Update the `.env` file with your MongoDB URI:
   \`\`\`
   PORT=5000
   MONGODB_URI=mongodb+srv://USER:PASSWORD@to-do.ffy1snm.mongodb.net/taskflow?retryWrites=true&w=majority&appName=To-DO
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   \`\`\`
4. Install dependencies: `npm install`
5. Run the server: `npm run dev`

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. The frontend will be available at `http://localhost:5173`.

## Priority Algorithm Explained

The Smart Priority algorithm is completely deterministic. It calculates urgency based on two main factors:
- **Priority Score**: Critical (4), High (3), Medium (2), Low (1).
- **Deadline Score**: Overdue (6), Due today (5), Due tomorrow (4), Due within 3 days (3), Due within 7 days (2), Due after 7 days (1), No deadline (0).

**Total Score = Priority Score + Deadline Score**

Tasks are sorted primarily by `Status` (Pending first), then by `TotalScore` (Descending), followed by `Deadline` (Ascending), ensuring the most urgent tasks appear at the top of your list.
