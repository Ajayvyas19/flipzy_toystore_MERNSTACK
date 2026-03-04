const mongoose = require('mongoose');

const toySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Product name is required"],
      maxlength: 100,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: 2000,
    },
    image: {
      type: String, // URL only
      required: [true, "Product image is required"],
    },
    brand: {
      type: String,
      default: "Generic",
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Toy', toySchema);
