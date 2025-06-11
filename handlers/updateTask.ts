import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { z } from 'zod';

const dynamoDb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TASKS_TABLE || 'Tasks';

// Zod schema for task update validation
const updateTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
}).refine(data => data.title || data.description, {
    message: 'At least one field (title or description) must be provided',
});

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { id } = event.pathParameters || {};

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Task ID is required' }),
            };
        }

        const body = JSON.parse(event.body || '{}');

        // Validate input using Zod
        const updateData = updateTaskSchema.parse(body);

        // First check if task exists
        const getResult = await dynamoDb
            .get({
                TableName: TABLE_NAME,
                Key: { id },
            })
            .promise();

        if (!getResult.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Task not found' }),
            };
        }

        // Build update expression
        const updateExpressions: string[] = [];
        const expressionAttributeValues: any = {};
        const expressionAttributeNames: any = {};

        if (updateData.title) {
            updateExpressions.push('#title = :title');
            expressionAttributeNames['#title'] = 'title';
            expressionAttributeValues[':title'] = updateData.title;
        }

        if (updateData.description) {
            updateExpressions.push('#description = :description');
            expressionAttributeNames['#description'] = 'description';
            expressionAttributeValues[':description'] = updateData.description;
        }

        // Always update the updatedAt timestamp
        updateExpressions.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        const updateParams = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW' as const,
        };

        const result = await dynamoDb.update(updateParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Task updated successfully',
                task: result.Attributes
            }),
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
