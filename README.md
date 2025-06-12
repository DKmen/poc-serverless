# Serverless Task Management API

A simple REST API for task management built with AWS Lambda, DynamoDB, and TypeScript.

## Features

- Create, read, update, delete tasks
- Bulk task creation (up to 25 tasks)
- List tasks with pagination and filtering
- TypeScript with validation
- Serverless architecture

## API Endpoints

| Method | Endpoint       | Description                |
|--------|----------------|----------------------------|
| POST   | `/task`        | Create a new task          |
| POST   | `/tasks/bulk`  | Create multiple tasks      |
| GET    | `/task/{id}`   | Get task by ID             |
| PATCH  | `/task/{id}`   | Update task                |
| DELETE | `/task/{id}`   | Delete task                |
| GET    | `/tasks`       | List tasks (with filters)  |

## Tech Stack

- **Backend**: Node.js 20.x, TypeScript
- **Framework**: Serverless Framework
- **Database**: Amazon DynamoDB
- **AWS SDK**: v3 (modular)
- **Validation**: Zod

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Deploy to AWS**
   ```bash
   npx serverless deploy
   ```

4. **Local development**
   ```bash
   npx serverless offline
   ```

## Environment Variables

```bash
TASKS_TABLE=tasks
STAGE=dev
```

## Usage Examples

**Create Task:**
```bash
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Serverless", "description": "Build API"}'
```

**Bulk Create:**
```bash
curl -X POST http://localhost:3000/tasks/bulk \
  -H "Content-Type: application/json" \
  -d '{"tasks": [{"title": "Task 1", "description": "First task"}]}'
```

**List Tasks:**
```bash
curl http://localhost:3000/tasks?limit=10&title=Learn
```

## Project Structure

```
handlers/          # Lambda functions
├── createTask.ts
├── bulkCreateTasks.ts
├── getTask.ts
├── listTasks.ts
├── updateTask.ts
└── deleteTask.ts
```

## License

Educational/POC project
