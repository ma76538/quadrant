# Quadrant ToDo List

A comprehensive task management system with quadrant-based organization, pomodoro timer, calendar, and more.

## Features

### Quadrant
- **Status Progress**
  - Show all
  - Hide archived
- **Time Dimension**
  - Before today
  - Today
  - After today
- **Repetition**
  - All
  - Non-repeating
  - Daily
  - Weekly
  - Monthly
  - Yearly
- **Importance and Urgency**
  - All tasks
  - Unclassified tasks
  - Classified tasks
- **Settings**
  - Drag the center circle to adjust the quadrant area size
  - Click the center circle to maximize this quadrant

### Pomodoro Timer
- **Functions**
  - Focus mode: automatically enter do-not-disturb mode when working
  - Focus music
  - Start/stop pomodoro timer
  - Daily focus time
  - Pomodoro duration, work duration
  - Rest duration
- **Settings**
  - Time style
    - Count up
    - Count down
  - Pause focus music when app is in the background

### Calendar
- **Functions**
  - Long press date to create date event
  - Quickly switch to today
- **Period**
  - Calendar style
    - Month
    - Week

### Notes/Journal
- **Functions**
  - Create note

### Schedule/Daily Plan
- **Functions**
  - Daily/weekly plan
  - Today's summary
  - Reverse display
  - Add/delete schedule
  - Enable/disable notification reminders

### Task List
- **Functions**
  - Time dimension
    - Before today
    - Today
    - After today
  - Repetition
    - All
    - Non-repeating
    - Daily
    - Weekly
    - Monthly
    - Yearly
  - Importance and urgency
    - All tasks
    - Unclassified tasks
    - Classified tasks
  - Mark as completed

### Personal Settings
- **Settings**
  - Theme style
    - Multilingual
  - Wake-up reminder
  - Customizable desktop widget
  - Customizable reminder sound
- **Multi-device data synchronization**
  - Support for Web, macOS, and iOS platforms
- **VIP features**
  - Lazy mode
  - Comment and like count
  - Copy and share
  - Add friends, join group chat
  - Support and help

### Data Statistics
- **Functions**
  - Automatic days: number of days the app has been opened
  - Number of tasks completed today
  - Total number of tasks completed
  - Number of tasks not completed
  - Number of tasks due today
  - Daily
    - Number of repeated tasks completed
  - Weekly
    - Number of daily goals
  - Monthly
    - Number of today's goals
  - 10,000-hour rule: xx days completed xx hours, remaining xx hours
  - Last record: xx days xx months xx days ago, xx days from today
  - Total xx days
  - How was your mood today?
  - Default
  - Today's rating
  - Invalidate and restart

### Create Event
- **Settings**
  - Event title
  - Quadrant location
  - Start/end time
  - Whether it's an all-day event
  - Repeat reminder
    - None
    - 5, 10, 15, 30 minutes before
    - 1, 2 hours after
    - 1, 2 days after
    - 1 week after
  - Label classification
    - Unclassified events can be hidden in the quadrant

### System Settings
- Privacy policy
- User agreement
- About Quadrant ToDo List
- Register account

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Python FastAPI
- Database: PostgreSQL
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js >= 18
- Python >= 3.8
- PostgreSQL >= 13

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Development

1. Start frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Start backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

## License

MIT