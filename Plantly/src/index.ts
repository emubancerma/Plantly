import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap } from "azle";
import express from "express";
import { time } from "azle";

/**
 * This type represents a listing on Plantly.
 */
class Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date | null;
}

const listingsStorage = StableBTreeMap<string, Listing>(0);

const app = express();
app.use(express.json());

app.post("/listings", (req, res) => {
  const listing: Listing = {
    id: uuidv4(),
    createdAt: getCurrentDate(),
    ...req.body,
  };
  listingsStorage.insert(listing.id, listing);
  res.json(listing);
});

app.get("/listings", (req, res) => {
  res.json(listingsStorage.values());
});

app.get("/listings/:id", (req, res) => {
  const listingId = req.params.id;
  const listingOpt = listingsStorage.get(listingId);
  if (!listingOpt) {
    res.status(404).send(`The listing with id=${listingId} not found.`);
  } else {
    res.json(listingOpt);
  }
});

app.put("/listings/:id", (req, res) => {
  const listingId = req.params.id;
  const listingOpt = listingsStorage.get(listingId);
  if (!listingOpt) {
    res
      .status(400)
      .send(
        `Couldn't update a listing with id=${listingId}. Listing not found.`
      );
  } else {
    const listing = listingOpt;

    const updatedListing = {
      ...listing,
      ...req.body,
      updatedAt: getCurrentDate(),
    };
    listingsStorage.insert(listing.id, updatedListing);
    res.json(updatedListing);
  }
});

app.delete("/listings/:id", (req, res) => {
  const listingId = req.params.id;
  const deletedListing = listingsStorage.remove(listingId);
  if (!deletedListing) {
    res
      .status(400)
      .send(
        `Couldn't delete a listing with id=${listingId}. Listing not found.`
      );
  } else {
    res.json(deletedListing);
  }
});

app.listen();

function getCurrentDate() {
  const timestamp = new Number(time());
  return new Date(timestamp.valueOf() / 1000_000);
}
