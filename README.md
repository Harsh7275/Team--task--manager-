# Team Task Manager

A comprehensive full-stack web application for managing team projects and tasks with role-based access control.

## 🎯 Key Features

### Authentication & Authorization
- User signup and login with JWT
- Password hashing with bcrypt
- Protected routes and role-based access control
- User profile management

### Project Management
- Create, read, update, and delete projects
- Add/remove team members
- Assign roles (Admin/Member) to team members
- Project status tracking (Active, Paused, Completed)
- Project timeline (start and end dates)

### Task Management
- Create tasks with detailed information
- Assign tasks to team members
- Track task status (Todo, In Progress, Review, Done)
- Set task priority (Low, Medium, High, Critical)
- Due date management with overdue tracking
- Estimated and actual hours tracking
- Comment system for collaboration

### Dashboard & Analytics
- Overview statistics (projects, tasks, overdue)
- Task status distribution
- Task priority breakdown
- Recent tasks and overdue alerts
- Team productivity insights

## 📁 Project Structure

```
Team-Task-Manager/
├── backend/                          # Node.js/Express API
│   ├── src/
│   │   ├── config/database.js       # MongoDB connection
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   └── Task.js
│   │   ├── controllers/              # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   └── dashboardController.js
│   │   ├── routes/                   # API routes
│   │   ├── middleware/               # Auth, error handling
│   │   ├── utils/                    # Helper functions
│   │   └── index.js                  # Server entry point
│   ├── package.json
│   └── .env
│
└── frontend/                         # React application
    ├── src/
    │   ├── components/               # Reusable components
    │   │   ├── Navbar.jsx
    │   │   ├── Modal.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Spinner.jsx
    │   ├── pages/                    # Page components
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   ├── ProjectDetail.jsx
    │   │   ├── Tasks.jsx
    │   │   └── TaskDetail.jsx
    │   ├── context/                  # React context
    │   │   └── AuthContext.jsx
    │   ├── services/                 # API services
    │   │   └── api.js
    │   ├── styles/                   # CSS files
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js
    ├── package.json
    ├── index.html
    └── .env
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Project Endpoints
- `POST /api/projects` - Create project
- `GET /api/projects` - Get user's projects
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add team member
- `DELETE /api/projects/:id/members` - Remove team member

### Task Endpoints
- `POST /api/tasks` - Create task
- `GET /api/tasks/project/:projectId` - Get project tasks
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment

### Dashboard Endpoints
- `GET /api/dashboard` - Get user dashboard statistics

## 🔐 Role-Based Access Control

### Admin Role
- Create and manage projects
- Add/remove team members
- Delete tasks
- Access all project resources

### Member Role
- View assigned projects and tasks
- Create tasks (with owner approval)
- Update own assigned tasks
- Add comments
- Limited access to project management

## 💾 Database Schema

### User
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date
}
```

### Project
```
{
  name: String,
  description: String,
  owner: ObjectId (ref: User),
  members: [{
    user: ObjectId (ref: User),
    role: String (Admin/Member),
    joinedAt: Date
  }],
  status: String (Active/Paused/Completed),
  startDate: Date,
  endDate: Date,
  createdAt: Date
}
```

### Task
```
{
  title: String,
  description: String,
  project: ObjectId (ref: Project),
  assignee: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  status: String (Todo/In Progress/Review/Done),
  priority: String (Low/Medium/High/Critical),
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
  comments: [{
    user: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  isOverdue: Boolean,
  createdAt: Date
}
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Security**: bcryptjs
- **CORS**: cors package
- **Environment**: dotenv

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Styling**: CSS3

## 📝 Key Implementation Details

### Authentication Flow
1. User signs up with email and password
2. Password is hashed using bcrypt
3. JWT token is generated upon login
4. Token is stored in localStorage
5. Token is included in Authorization header for all API requests
6. Protected routes check for valid token before rendering

### Task Status Workflow
- **Todo**: New tasks start here
- **In Progress**: Task is being worked on
- **Review**: Task is waiting for approval
- **Done**: Task is completed

### Overdue Tracking
- Tasks with due date in the past and status != Done are marked as overdue
- Dashboard shows number of overdue tasks
- Overdue tasks are highlighted in warnings

## 🎨 UI/UX Features

- Clean and modern interface
- Responsive design for mobile and desktop
- Kanban-style task board
- Modal dialogs for creating/editing
- Real-time form validation
- Loading spinners for async operations
- Alert messages for user feedback
- Avatar displays for team members

## 📊 Dashboard Analytics

- Total projects count
- Total tasks count
- Assigned tasks count
- Overdue tasks count
- Status distribution (Todo, In Progress, Review, Done)
- Priority distribution (Low, Medium, High, Critical)
- Recent tasks list
- Overdue tasks list

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- Error handling and logging
- Protected API endpoints
- CORS configuration

## 🐛 Error Handling

- Comprehensive error messages
- Proper HTTP status codes
- Custom error handler middleware
- Try-catch blocks for async operations
- Validation error responses

## 🚀 Deployment

### Backend
1. Set production environment variables
2. Use MongoDB Atlas or similar for database
3. Deploy to Heroku, AWS, or similar platform
4. Ensure NODE_ENV=production

### Frontend
1. Run `npm run build`
2. Deploy build folder to hosting (Vercel, Netlify, GitHub Pages)
3. Update VITE_API_URL to production API URL

## 📝 Usage Examples

### Creating a Project
1. Login to the application
2. Go to Projects page
3. Click "New Project" button
4. Fill in project details
5. Click "Create Project"

### Creating a Task
1. View a project
2. Click "New Task" button
3. Fill in task details (title, priority, due date, etc.)
4. Click "Create Task"
5. Task appears in "Todo" column

### Managing Team Members
1. Open project details
2. Click "Add Member" button
3. Enter user email/ID
4. Select role (Admin/Member)
5. Click "Add Member"

## 📞 Support & Contribution

For issues or contributions, please follow the project's contribution guidelines.

## 📄 License

This project is licensed under the MIT License.

---

**Happy Task Management! 🎯📋**
