const path = require('path');
const Toy = require('../models/toyModel');

// Helper: map uploaded file to URL
const fileToUrl = (req) => {
  if (!req.file) return null;
  const filename = path.basename(req.file.path);
  // Assuming app serves uploads statically at /uploads
  return `/uploads/${filename}`;
};

exports.createToy = async (req, res) => {
  try {
    // If file uploaded, override image with served URL
    const imageUrl = fileToUrl(req) || req.body.image;
    if (!imageUrl) return res.status(400).json({ message: "Product image is required" });

    const payload = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      image: imageUrl,
      brand: req.body.brand || 'Generic',
      category: req.body.category,
    };

    const newToy = await Toy.create(payload);
    res.status(201).json(newToy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getToys = async (req, res) => {
  try {
    const toys = await Toy.find();
    res.json(toys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getToyById = async (req, res) => {
  try {
    const toy = await Toy.findById(req.params.id);
    if (!toy) return res.status(404).json({ message: 'Toy not found' });
    res.json(toy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateToy = async (req, res) => {
  try {
    const imageUrl = fileToUrl(req); // if new file uploaded
    const update = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      brand: req.body.brand,
      category: req.body.category,
    };
    if (imageUrl) {
      update.image = imageUrl;
    } else if (req.body.image) {
      update.image = req.body.image; // URL passed
    }

    const toy = await Toy.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!toy) return res.status(404).json({ message: 'Toy not found' });
    res.json(toy);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteToy = async (req, res) => {
  try {
    const toy = await Toy.findByIdAndDelete(req.params.id);
    if (!toy) return res.status(404).json({ message: 'Toy not found' });
    res.json({ message: 'Toy deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
