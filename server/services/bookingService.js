const Booking = require('../models/Booking');

const getUserBookings = async (user_id) => {
  if (!user_id) {
    throw new Error('User ID is required');
  }
  return await Booking.findByUserId(user_id);
};

const getAllBookings = async () => {
  return await Booking.findAll();
};

const getBookingById = async (id, user_id = null) => {
  const booking = await Booking.findById(id, user_id);
  if (!booking) {
    throw { status: 404, message: 'Booking not found' };
  }
  return booking;
};

const createBooking = async (data) => {
  const { user_id, vehicle_id, eta, cost } = data;
  
  // Validimet
  if (!user_id) {
    throw { status: 400, message: 'User ID is required' };
  }
  
  if (!vehicle_id) {
    throw { status: 400, message: 'Vehicle ID is required' };
  }
  
  if (!cost || cost <= 0) {
    throw { status: 400, message: 'Valid cost is required' };
  }

  // Kontrollo nëse vehicle ekziston (optional)
  // const vehicle = await Vehicle.findById(vehicle_id);
  // if (!vehicle) {
  //   throw { status: 404, message: 'Vehicle not found' };
  // }

  return await Booking.create({
    user_id,
    vehicle_id,
    eta,
    cost,
    status: 'pending'
  });
};

const updateBookingStatus = async (id, user_id, status) => {
  const booking = await Booking.findById(id, user_id);
  
  if (!booking) {
    throw { status: 404, message: 'Booking not found' };
  }

  // Logjika e statuseve
  const allowedTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['in_progress', 'cancelled'],
    'in_progress': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': []
  };

  if (!allowedTransitions[booking.status].includes(status)) {
    throw { 
      status: 400, 
      message: `Cannot change status from ${booking.status} to ${status}` 
    };
  }

  const updated = await Booking.updateStatus(id, user_id, status);
  
  if (!updated) {
    throw { status: 400, message: 'Failed to update booking status' };
  }
  
  return await Booking.findById(id, user_id);
};

const cancelBooking = async (id, user_id) => {
  const booking = await Booking.findById(id, user_id);
  
  if (!booking) {
    throw { status: 404, message: 'Booking not found' };
  }
  
  if (booking.status === 'completed') {
    throw { status: 400, message: 'Cannot cancel completed booking' };
  }
  
  if (booking.status === 'cancelled') {
    throw { status: 400, message: 'Booking is already cancelled' };
  }
  
  const cancelled = await Booking.cancelBooking(id, user_id);
  
  if (!cancelled) {
    throw { status: 400, message: 'Failed to cancel booking' };
  }
  
  return { message: 'Booking cancelled successfully' };
};

module.exports = {
  getUserBookings,
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking
};