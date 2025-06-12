import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE || 'Tasks';

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { id } = event.pathParameters || {};

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Task ID is required' }),
            };
        }

        // First check if task exists
        const getResult = await dynamoDb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { id },
        }));

        if (!getResult.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Task not found' }),
            };
        }

        // Delete the task
        await dynamoDb.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id },
        }));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Task deleted successfully',
                deletedTask: getResult.Item
            }),
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: error.message }),
        };
    }
};
