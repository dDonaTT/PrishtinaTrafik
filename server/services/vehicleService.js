const Vehicle = require("../models/Vehicle");

const getAll = async () => {
  return await Vehicle.findAll();
};

const getById = async (id) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) throw { status: 404, message: "Vehicle not found" };
  return vehicle;
};

const create = async (data) => {
  return await Vehicle.create(data);
};

const update = async (id, fields) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) throw { status: 404, message: "Vehicle not found" };
  return await Vehicle.update(id, fields);
};

const remove = async (id) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) throw { status: 404, message: "Vehicle not found" };
  return await Vehicle.delete(id);
};

module.exports = { getAll, getById, create, update, remove };