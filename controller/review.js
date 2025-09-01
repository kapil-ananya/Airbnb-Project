const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id); // pehle listing dhundo
  const review = new Review(req.body.review); // form se review lo
  review.author = req.user._id; // jo user review likh raha hai uska ID
  listing.reviews.push(review); // listing mein review jodo

  await review.save(); // review ko save karo
  await listing.save(); // updated listing ko save karo

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};


module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted successfully");
    res.redirect(`/listings/${id}`); 
};
