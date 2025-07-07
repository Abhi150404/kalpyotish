const Pooja = require('../models/Pooja');

exports.createPooja = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const image = req.file.path;
    const newPooja = new Pooja({ name, description, category, image });
    await newPooja.save();
    res.status(201).json({ message: 'Pooja created successfully', data: newPooja });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create pooja', error });
  }
};

exports.getAllPoojas = async (req, res) => {
  try {
    const poojas = await Pooja.find();
    const categorized = {};
    poojas.forEach((pooja) => {
      if (!categorized[pooja.category]) {
        categorized[pooja.category] = [];
      }
      categorized[pooja.category].push(pooja);
    });
    res.status(200).json({ message: 'Poojas fetched', data: categorized });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch poojas', error });
  }
};

exports.getPoojaById = async (req, res) => {
  try {
    const pooja = await Pooja.findById(req.params.id);
    if (!pooja) return res.status(404).json({ message: 'Pooja not found' });
    res.status(200).json({ data: pooja });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pooja', error });
  }
};

exports.deletePooja = async (req, res) => {
  try {
    await Pooja.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pooja deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pooja', error });
  }
};
