import Stripe from 'stripe';

// Lazy initialization to ensure env vars are loaded
let stripe;
const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

/**
 * @desc    Initialize payment
 * @route   POST /api/payment/initialize
 * @access  Private/Student
 */
export const initializePayment = async (req, res) => {
  try {
    const { amount, orderId, metadata } = req.body;

    // Validation
    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount and orderId',
      });
    }

    // Stripe expects amount in cents (multiply by 100)
    const amountInCents = Math.round(amount * 100);

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Change to 'ngn' for Nigerian Naira or your preferred currency
            product_data: {
              name: 'School Cafe Order',
              description: `Order #${orderId}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        orderId,
        studentId: req.user.studentId,
        studentName: req.user.name,
        ...metadata,
      },
      customer_email: req.user.email,
    });

    res.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Initialize payment error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment initialization failed',
    });
  }
};

/**
 * @desc    Verify payment
 * @route   POST /api/payment/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Payment session ID is required',
      });
    }

    // Retrieve session from Stripe
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Import Order model
      const Order = (await import('../models/Order.model.js')).default;

      // Update order with payment details
      const orderId = session.metadata.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          transactionId: session.payment_intent,
        });
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          sessionId: session.id,
          orderId,
          amount: session.amount_total / 100, // Convert back from cents
          paidAt: new Date(session.created * 1000),
          paymentIntent: session.payment_intent,
          metadata: session.metadata,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed',
    });
  }
};

/**
 * @desc    Get payment history for student
 * @route   GET /api/payment/history/:studentId
 * @access  Private/Student
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Ensure student can only see their own payment history
    if (req.userType === 'student' && req.user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment history',
      });
    }

    // Import Order model
    const Order = (await import('../models/Order.model.js')).default;

    // Get all paid orders for this student
    const orders = await Order.find({
      studentId,
      paymentStatus: 'paid',
      paymentMethod: 'card',
    })
      .select('orderNumber totalAmount transactionId createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
