import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { z } from 'zod';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TASKS_TABLE || 'Tasks';

// Zod schema for task validation
const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
});

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');

        // Validate input using Zod
        const task = taskSchema.parse(body);

        const item = {
            id: Date.now().toString(),
            title: task.title,
            description: task.description,
            createdAt: new Date().toISOString(),
        };

        await dynamoDb
            .put({
                TableName: TABLE_NAME,
                Item: item,
            })
            .promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Task created', task: item }),
        };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Validation failed', errors: error.errors }),
            };
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: error.message }),
        };
    }
};