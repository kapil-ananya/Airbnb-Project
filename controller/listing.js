const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm =  (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({
    path:"reviews",
  populate: {
    path: "author",
  },
}).populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createList = async (req, res, next) => {
  try {
    // 1. Geocoding से location लो
    let response = await geocodingClient
      .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
      .send();

    // अगर location नहीं मिली तो error संभालो
    if (!response.body.features.length) {
      req.flash("error", "Invalid location, please try again.");
      return res.redirect("/listings/new");
    }

    // 2. नया listing object बनाओ
    const newListing = new Listing(req.body.listing);

    // 3. Image add करो अगर है तो
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // 4. Geometry हमेशा add होनी चाहिए
    newListing.geometry = response.body.features[0].geometry;

    // 5. Owner set
    newListing.owner = req.user._id;

    // 6. Save और redirect
    let savedListing = await newListing.save();
    console.log("Listing Saved:", savedListing);

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${savedListing._id}`);
  } catch (error) {
    console.error("Error creating listing:", error);
    req.flash("error", "Failed to create listing. Please try again.");
    res.redirect("/listings/new");
  }
};


module.exports.updateList = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined") {
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`); 
};

module.exports.deleteList = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};

module.exports.editList = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl.replace("/upload", "/upload/w_250")
  res.render("listings/edit", { listing, originalImageUrl });
};