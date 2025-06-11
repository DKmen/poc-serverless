# 📝 Serverless Task Management API

A modern, scalable serverless REST API built with AWS Lambda, DynamoDB, and the Serverless Framework. This project demonstrates best practices for building production-ready serverless applications with TypeScript, featuring comprehensive CRUD operations for task management.

## 🚀 Features

- **Full CRUD Operations**: Create, read, update, delete tasks
- **Advanced Querying**: List tasks with pagination, filtering, and sorting
- **Data Validation**: Schema validation using Zod
- **Type Safety**: Written in TypeScript with comprehensive type definitions
- **Serverless Architecture**: Scalable and cost-effective AWS Lambda functions
- **NoSQL Database**: Fast and flexible DynamoDB integration
- **CORS Support**: Cross-origin requests enabled for frontend integration
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │────│  Lambda Functions │────│    DynamoDB     │
│                 │    │                   │    │                 │
│ • CORS enabled  │    │ • TypeScript      │    │ • Tasks Table   │
│ • REST endpoints│    │ • Zod validation  │    │ • Auto-scaling  │
│ • Request/Response│  │ • Error handling  │    │ • Pay-per-use   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 API Endpoints

| Method | Endpoint       | Description                    | Parameters                    |
|--------|----------------|--------------------------------|-------------------------------|
| POST   | `/task`        | Create a new task              | `title`, `description`        |
| GET    | `/task/{id}`   | Get a specific task by ID      | `id` (path parameter)         |
| PUT    | `/task/{id}`   | Update an existing task        | `id`, `title`, `description`  |
| DELETE | `/task/{id}`   | Delete a task                  | `id` (path parameter)         |
| GET    | `/tasks`       | List all tasks with pagination | Query parameters (see below)  |

### Query Parameters for `/tasks` endpoint:

- `limit` (default: 10): Number of tasks to return
- `nextToken`: Pagination token for next page
- `title`: Filter tasks by title (contains search)
- `sortBy` (default: createdAt): Field to sort by
- `sortOrder` (default: desc): Sort direction (asc/desc)

## 🛠️ Tech Stack

- **Runtime**: Node.js 20.x
- **Language**: TypeScript
- **Framework**: Serverless Framework
- **Cloud Provider**: AWS
- **Database**: Amazon DynamoDB
- **Validation**: Zod
- **Build Tool**: esbuild
- **Development**: serverless-offline

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd poc-serverless
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS credentials**
   ```bash
   aws configure
   # Or set environment variables:
   # AWS_ACCESS_KEY_ID
   # AWS_SECRET_ACCESS_KEY
   # AWS_REGION
   ```

## 🚀 Deployment

### Deploy to AWS

```bash
# Deploy to development stage
npx serverless deploy

# Deploy to specific stage
npx serverless deploy --stage prod

# Deploy individual function
npx serverless deploy function --function createTask
```

### Local Development

```bash
# Start local development server
npx serverless offline

# The API will be available at:
# http://localhost:3000
```

## 📚 Usage Examples

### Create a Task

```bash
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Serverless",
    "description": "Build a serverless task management API"
  }'
```

### Get a Task

```bash
curl http://localhost:3000/task/1704657600000
```

### Update a Task

```bash
curl -X PUT http://localhost:3000/task/1704657600000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Master Serverless Architecture"
  }'
```

### List Tasks with Filtering

```bash
# Basic list
curl http://localhost:3000/tasks

# With pagination and filtering
curl "http://localhost:3000/tasks?limit=5&title=Learn&sortBy=title&sortOrder=asc"
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/task/1704657600000
```

## 🗂️ Project Structure

```
poc-serverless/
├── handlers/                 # Lambda function handlers
│   ├── createTask.ts         # Create new task
│   ├── getTask.ts           # Get task by ID
│   ├── listTasks.ts         # List tasks with pagination
│   ├── updateTask.ts        # Update existing task
│   └── deleteTask.ts        # Delete task
├── handler.ts               # Export all handlers
├── serverless.yml           # Serverless configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

- `TASKS_TABLE`: DynamoDB table name for tasks (set to "tasks")

### DynamoDB Tables

The application automatically creates the following DynamoDB table:

**Tasks Table**
- Primary Key: `id` (String)
- Billing Mode: Pay-per-request (PAY_PER_REQUEST)
- Fields: `id`, `title`, `description`, `createdAt`, `updatedAt`

## 🔒 Security & Permissions

The Lambda functions have minimal IAM permissions:

- **DynamoDB**: Query, Scan, GetItem, PutItem, UpdateItem, DeleteItem (for tasks table)
- **CloudWatch**: Logs creation and writing

## 🧪 Data Validation

The API uses Zod schemas for request validation:

### Task Creation Schema
```typescript
{
  title: string (required, min length: 1),
  description: string (required, min length: 1)
}
```

### Task Update Schema
```typescript
{
  title?: string (optional, min length: 1),
  description?: string (optional, min length: 1)
}
// At least one field must be provided
```

## 📊 Response Format

### Success Response
```json
{
  "message": "Task created",
  "task": {
    "id": "1704657600000",
    "title": "Learn Serverless",
    "description": "Build a serverless task management API",
    "createdAt": "2024-01-08T00:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "path": ["title"],
      "message": "Title is required"
    }
  ]
}
```

### List Tasks Response
```json
{
  "tasks": [...],
  "pagination": {
    "limit": 10,
    "totalItems": 25,
    "hasNextPage": true,
    "nextToken": "..."
  },
  "count": 10,
  "scannedCount": 10
}
```

## 🛡️ Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Invalid input data or missing required fields
- **404 Not Found**: Task not found
- **500 Internal Server Error**: Server-side errors with error details

## 🔄 Development Workflow

1. **Make changes** to handlers or configuration
2. **Test locally** using `serverless offline`
3. **Deploy to development** stage for testing
4. **Deploy to production** when ready

## 📈 Performance Considerations

- **DynamoDB**: Pay-per-request billing mode for cost optimization
- **Lambda**: Individual packaging for faster cold starts
- **esbuild**: Fast TypeScript compilation and bundling
- **Pagination**: Efficient data retrieval for large datasets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and proof-of-concept purposes.

---

**Built with ❤️ using Serverless Framework and AWS**