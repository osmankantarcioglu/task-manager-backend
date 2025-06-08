# Task Manager Application

A modern task management application built with React, TypeScript, and Material-UI.

## Features

- 🔐 User authentication (login/register)
- 📝 Create, read, update, and delete tasks
- ✅ Mark tasks as complete/incomplete
- 🔄 Drag and drop task reordering
- 🌓 Dark mode support
- 📱 Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your backend API URL:
```
REACT_APP_API_URL=http://localhost:8080
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── contexts/      # React context providers
  ├── pages/         # Page components
  ├── types/         # TypeScript type definitions
  ├── theme.ts       # Material-UI theme configuration
  └── App.tsx        # Main application component
```

## Dependencies

- React
- TypeScript
- Material-UI
- React Router
- React Beautiful DnD
- Axios

## Development

To run the development server with hot reload:

```bash
npm run dev
```

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## License

MIT 