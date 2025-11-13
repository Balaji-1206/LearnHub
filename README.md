# LearnHub

An educational full‑stack app for browsing courses, enrolling, taking notes, tracking daily study streaks, and personalizing your learning journey.

## 🚀 Overview
- Browse curated courses with rich details, tags, assets, and levels.
- Enroll and track progress with a streak heatmap and daily pings.
- Create, edit, tag, pin, and delete notes with file attachments.
- Personalize your profile: update name and avatar.
- Bookmark courses to build a “To Learn” list (excludes already enrolled).

## 🛠️ Tech Stack
- Frontend: React, React Router, Axios, Bootstrap 5, Bootstrap Icons
- Backend: Node.js, Express.js, Multer, JWT (jsonwebtoken)
- Database: MongoDB via Mongoose

## 📦 Project Structure
```
backend/           # Express API
	src/
		controllers/   # auth, courses, notes, users, progress
		middleware/    # JWT auth, role checks
		models/        # User, Course, Enrollment, Note, Progress
		routes/        # /api/* route modules
		utils/         # file storage helpers
		config/db.js   # Mongo connection
		server.js      # App entry
	uploads/         # User uploads (created at runtime)
	seedCourses.js   # Seed demo courses

frontend/          # React client (CRA)
	src/
		components/    # Navbar, etc.
		pages/         # Dashboard, Courses, CourseDetails, Notes, Profile...
		api.js         # Axios instance + API helpers
```

## 🔑 Key Features
- Profile editing: change display name and upload avatar.
- Notes: tags, pin/unpin, edit, delete, file attachments, preview and sorting.
- Course details: quick actions, outcomes/requirements, resources section, in‑page “Write a Note” modal, colorful banner.
- Progress: “I studied today” ping, streak counters, 6‑month activity heatmap.
- Bookmarks: heart button on Course Details persists to localStorage and shows in Profile → “To Learn”.

Happy learning with LearnHub!
