import validator from "@middy/validator";
import AWS from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";
import placeBidSchema from "../lib/schemas/placeBidSchema";
import { getAuctionbyID } from "./getAuction";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionbyID(id);

  // Bid identity validation
  if (auction.seller === email) {
    throw new createError.Forbidden("You cannot bid on your own auctions!");
  }

  // Avoid double bidding
  if (auction.highestBid.bidder === email) {
    throw new createError.Forbidden("You are already the highest bidder!");
  }

  // Auction status validation
  if (auction.status !== "OPEN") {
    throw new createError.Forbidden("You cannot bid on closed auctions!");
  }

  // Bid amount validation
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden({
      message: `Your bid must be greater than ${auction.highestBid.amount}`,
    });
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction;

  try {
    const result = await dynamodb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid).use(
  validator({ inputSchema: placeBidSchema })
);
