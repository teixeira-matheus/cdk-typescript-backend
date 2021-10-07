import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { getEventBody } from '../Shared/Utils';

const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;
const dbClient = new DynamoDB.DocumentClient();

async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from dynamoDB'
  };

  try {
    const requestBody = getEventBody(event);
    const spaceId = event.queryStringParameters?.[PRIMARY_KEY]

    if(requestBody && spaceId){
      const requestBodyKey = Object.keys(requestBody)[0];
      const requestBodyValue = Object.keys(requestBodyKey)[0];

      const updateResult = await dbClient.update({
        TableName: TABLE_NAME,
        Key: {
          [PRIMARY_KEY]: spaceId
        },
        UpdateExpression: 'set #zzNew = :new',
        ExpressionAttributeValues: {
          ':new': requestBodyValue
        },
        ExpressionAttributeNames: {
          '#zzNew': requestBodyKey
        },
        ReturnValues: 'UPDATED_NEW'
      }).promise();

      result.body = JSON.stringify(updateResult);
    }
  } catch (e) {
    result.body = (e as Error).message;
  }
  
  return result;
}

export { handler };
