import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { z } from 'zod';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE || 'Tasks';

// Zod schema for single task validation
const taskSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
});

// Zod schema for bulk task validation
const bulkTaskSchema = z.object({
    tasks: z.array(taskSchema).min(1, 'At least one task is required').max(25, 'Maximum 25 tasks allowed per request'),
});

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const body = JSON.parse(event.body || '{}');

        // Validate input using Zod
        const { tasks } = bulkTaskSchema.parse(body);

        // Prepare batch write items
        const timestamp = Date.now();
        const items = tasks.map((task, index) => ({
            id: `${timestamp}-${index}`,
            title: task.title,
            description: task.description,
            createdAt: new Date().toISOString(),
        }));

        // DynamoDB batch write has a limit of 25 items per request
        const batchRequests = [];
        const batchSize = 25;

        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const requestItems = {
                [TABLE_NAME]: batch.map(item => ({
                    PutRequest: {
                        Item: item
                    }
                }))
            };

            batchRequests.push(
                dynamoDb.send(new BatchWriteCommand({ RequestItems: requestItems }))
            );
        }

        // Execute all batch requests
        const results = await Promise.all(batchRequests);

        // Check for unprocessed items
        const unprocessedItems = results.flatMap((result: any) =>
            result.UnprocessedItems && result.UnprocessedItems[TABLE_NAME]
                ? result.UnprocessedItems[TABLE_NAME]
                : []
        );

        let response: any = {
            message: 'Tasks created successfully',
            createdCount: items.length,
            tasks: items,
        };

        // Handle unprocessed items if any
        if (unprocessedItems.length > 0) {
            response.message = 'Some tasks could not be processed';
            response.unprocessedCount = unprocessedItems.length;
            response.processedCount = items.length - unprocessedItems.length;
        }

        return {
            statusCode: 201,
            body: JSON.stringify(response),
        };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Validation failed',
                    errors: error.errors
                }),
            };
        }

        // Handle DynamoDB specific errors
        if (error.code === 'ValidationException') {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'DynamoDB validation error',
                    error: error.message
                }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
                error: error.message
            }),
        };
    }
};
