import AWS from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionbyID(id) {
  let auction;

  try {
    const result = await dynamodb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();
    auction = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!auction) {
    throw new createError.NotFound(`Action with ID ${id} not found!`);
  }

  return auction;
}

async function getAuction(event, context) {
  const { id } = event.pathParameters;

  const auction = await getAuctionbyID(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction);
