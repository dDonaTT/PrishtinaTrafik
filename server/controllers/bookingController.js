const bookingService = require("../services/bookingService");

const getUserBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json({
      success: true,
      message: "All bookings fetched successfully",
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(
      req.params.id,
      req.user.role === 'admin' ? null : req.user.id
    );
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking({
      user_id: req.user.id,
      ...req.body
    });
    
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const booking = await bookingService.updateBookingStatus(
      req.params.id,
      req.user.id,
      req.body.status
    );
    
    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const result = await bookingService.cancelBooking(
      req.params.id,
      req.user.id
    );
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getUserBookings,
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking
};