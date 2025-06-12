import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TASKS_TABLE || 'Tasks';

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const queryParams = event.queryStringParameters || {};
        const {
            limit = '10',
            nextToken,
            title,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = queryParams;

        const pageSize = parseInt(limit);

        // Build scan parameters
        const scanParams: ScanCommandInput = {
            TableName: TABLE_NAME,
            Limit: pageSize,
        };

        // Handle pagination with nextToken (lastEvaluatedKey)
        if (nextToken) {
            try {
                scanParams.ExclusiveStartKey = JSON.parse(decodeURIComponent(nextToken));
            } catch (error) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Invalid nextToken format' }),
                };
            }
        }

        // Add title filter
        if (title) {
            scanParams.FilterExpression = 'contains(#title, :title)';
            scanParams.ExpressionAttributeNames = {
                '#title': 'title'
            };
            scanParams.ExpressionAttributeValues = {
                ':title': title
            };
        }

        // Execute scan
        const result = await dynamoDb.send(new ScanCommand(scanParams));
        let tasks = result.Items || [];

        // Sort tasks in memory (since DynamoDB scan doesn't guarantee order)
        tasks.sort((a: any, b: any) => {
            const aValue = a[sortBy] || '';
            const bValue = b[sortBy] || '';

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        // Get total count for metadata (separate scan)
        const countParams: ScanCommandInput = {
            TableName: TABLE_NAME,
            Select: 'COUNT'
        };

        if (title) {
            countParams.FilterExpression = 'contains(#title, :title)';
            countParams.ExpressionAttributeNames = {
                '#title': 'title'
            };
            countParams.ExpressionAttributeValues = {
                ':title': title
            };
        }

        const countResult = await dynamoDb.send(new ScanCommand(countParams));
        const totalItems = countResult.Count || 0;

        const response: any = {
            tasks,
            pagination: {
                limit: pageSize,
                totalItems: totalItems,
                hasNextPage: !!result.LastEvaluatedKey,
                nextToken: result.LastEvaluatedKey
                    ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
                    : null
            },
            count: tasks.length,
            scannedCount: result.ScannedCount,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: error.message }),
        };
    }
};
