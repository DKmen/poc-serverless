import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

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

        const result = await dynamoDb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { id },
        }));

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Task not found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ task: result.Item }),
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: error.message }),
        };
    }
};
