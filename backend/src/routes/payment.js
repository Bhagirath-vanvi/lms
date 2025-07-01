import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import auth from "../middleware/auth.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { courseId } = req.body;

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user already enrolled
    const user = await User.findById(req.user.userId);
    const isEnrolled = user.enrolledCourses.some(
      (enrollment) => enrollment.course.toString() === courseId
    );

    if (isEnrolled) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Create Razorpay order
    const options = {
      amount: course.price * 100, // amount in paise
      currency: "INR",
      receipt: `course_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: req.user.userId,
        courseName: course.title,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseTitle: course.title,
      courseId: courseId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error creating payment order" });
  }
});

// Verify payment and enroll user
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      courseId,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    res.json({
      message: "Payment verified",
      paymentVerified: true,
      razorpay_payment_id,
      razorpay_order_id,
      courseId,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Error verifying payment" });
  }
});

// Get payment status
router.get("/payment-status/:paymentId", auth, async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    res.json(payment);
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({ message: "Error fetching payment status" });
  }
});

export default router;
