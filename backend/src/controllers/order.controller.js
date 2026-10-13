import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import MenuItem from '../models/MenuItem.model.js';
import getAdmin from '../config/firebase.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private/Student
 */
export const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, transactionId } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order items',
      });
    }

    if (!paymentMethod || !['card', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    // Verify all items exist and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItemId} not found`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`,
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
      });
    }

    // Generate order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD-${dateStr}-${random}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      studentId: req.user.studentId,
      studentName: req.user.name,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending', // Will be updated to 'paid' after successful payment
      transactionId: transactionId || null,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Get student's orders
 * @route   GET /api/orders/student/:studentId
 * @access  Private/Student
 */
export const getStudentOrders = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Ensure student can only see their own orders
    if (req.userType === 'student' && req.user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these orders',
      });
    }

    const orders = await Order.find({ studentId })
      .sort({ createdAt: -1 })
      .populate('items.menuItemId', 'name imageUrl');

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get student orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:orderId
 * @access  Private
 */
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.menuItemId', 'name imageUrl category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization
    if (req.userType === 'student' && order.studentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentMethod, studentId, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (studentId) filter.studentId = studentId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('items.menuItemId', 'name imageUrl');

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Update order status
 * @route   PATCH /api/admin/orders/:orderId/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status',
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = status;

    // Set readyAt timestamp when status changes to 'ready'
    if (status === 'ready') {
      order.readyAt = new Date();
    }

    // Mark as picked up when status changes to 'completed'
    if (status === 'completed') {
      order.pickedUp = true;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Mark order as completed
 * @route   PATCH /api/admin/orders/:orderId/complete
 * @access  Private/Admin
 */
export const completeOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.orderStatus = 'completed';
    order.pickedUp = true;

    // If cash payment, mark as paid
    if (order.paymentMethod === 'cash') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order completed successfully',
      data: order,
    });
  } catch (error) {
    console.error('Complete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Notify student that order is ready
 * @route   POST /api/admin/orders/:orderId/notify
 * @access  Private/Admin
 */
export const notifyStudent = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const student = await User.findOne({ studentId: order.studentId });

    let fcmStatus = 'no_token';
    if (student?.fcmToken) {
      try {
        await getAdmin().messaging().send({
          token: student.fcmToken,
          notification: {
            title: 'Your order is ready! 🍽️',
            body: `Order ${order.orderNumber} is ready for pickup. Come collect it now!`,
          },
          data: {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
          },
        });
        fcmStatus = 'sent';
      } catch (fcmError) {
        console.error('FCM send error:', fcmError.message);
        fcmStatus = fcmError.message;
      }
    }

    order.notificationSent = true;
    await order.save();

    res.json({
      success: true,
      message: 'Student notified successfully',
      fcmStatus,
      data: order,
    });
  } catch (error) {
    console.error('Notify student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Cancel order
 * @route   DELETE /api/orders/:orderId
 * @access  Private/Student
 */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check authorization
    if (req.userType === 'student' && order.studentId !== req.user.studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Only allow cancellation if order is pending
    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending orders',
      });
    }

    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
