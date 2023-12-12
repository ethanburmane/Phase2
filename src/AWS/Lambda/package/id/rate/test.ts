import { handler } from './get'; // Update the path to your Lambda function
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

// Define the type for the mocked DynamoDB responses
interface MockDynamoDBResponse {
  Item?: {
    id: { S: string };
    Score?: { M: { [key: string]: { S: string } } };
  };
}

// Mock DynamoDBClient
const dynamoMock = mockClient(DynamoDBClient);

// Reset mocks before each test
beforeEach(() => {
  dynamoMock.reset();
});

// Test for successful data retrieval
test('handles successful data retrieval', async () => {
  // Mock DynamoDB response
  const mockResponse: MockDynamoDBResponse = {
    Item: {
      id: { S: '123' },
      Score: { M: { testScore: { S: '100' } } }
    }
  };

  dynamoMock.on(GetItemCommand).resolves(mockResponse);

  const event = { id: '123' };
  const response = await handler(event);

  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({ testScore: '100' });
});

// Test for item not found
test('handles item not found', async () => {
  dynamoMock.on(GetItemCommand).resolves({});

  const event = { id: 'not-found' };
  const response = await handler(event);

  expect(response.statusCode).toBe(404);
  expect(response.body).toBe(JSON.stringify({ error: 'Item not found or Score attribute not in expected format' }));
});

// Test for DynamoDB errors
test('handles dynamodb errors', async () => {
  dynamoMock.on(GetItemCommand).rejects(new Error('Internal Server Error'));

  const event = { id: '123' };
  const response = await handler(event);

  expect(response.statusCode).toBe(500);
  expect(response.body).toBe(JSON.stringify({ error: 'Internal Server Error' }));
});
