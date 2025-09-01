const express = require("express");
const initData = require("./data.js");
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Airbnb";

main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=> ({...obj, owner:'68791bc719088b926c85709d'}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();