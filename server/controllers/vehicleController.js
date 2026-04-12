const vehicleService = require("../services/vehicleService");

const getAll = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAll();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const vehicle = await vehicleService.getById(req.params.id);
    res.json(vehicle);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const vehicle = await vehicleService.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    await vehicleService.update(req.params.id, req.body);
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await vehicleService.remove(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };