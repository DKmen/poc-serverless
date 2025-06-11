import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();
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

        // Delete the task
        await dynamoDb
            .delete({
                TableName: TABLE_NAME,
                Key: { id },
            })
            .promise();

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
