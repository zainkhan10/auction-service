import createError from "http-errors";
import { closeAuction } from "../lib/closeAuction";
import { getEndedAuctions } from "../lib/getEndAuctions";

async function processAuctions(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();
    console.log("auctionsToClose: ==================> ", auctionsToClose)
    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );
    console.log("closePromises: ==================> ", closePromises)
    await Promise.all(closePromises);
    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    createError.InternalServerError(error);
  }
}

export const handler = processAuctions;
