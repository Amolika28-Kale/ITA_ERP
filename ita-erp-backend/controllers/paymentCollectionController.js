import PaymentCollection from "../models/PaymentCollection.js";
import User from "../models/User.js";
import { sendNotification } from "../utils/notify.js";

/* ================= EMPLOYEE ================= */

// Add payment
export const createPayment = async (req, res) => {
  try {
    const {
      clientName,
      companyName,
      totalAmount,
      paidAmount,
      paymentMode,
      referenceId,
      notes,
    } = req.body;

    const pendingAmount = Number(totalAmount) - Number(paidAmount);

    const payment = await PaymentCollection.create({
      employee: req.user.id,
      clientName,
      companyName,
      totalAmount,
      paidAmount,
      pendingAmount,
      isPartPayment: pendingAmount > 0,
      paymentMode,
      referenceId,
      notes,
    });

    const admins = await User.find({ role: "admin" }).select("_id");

    await sendNotification({
      users: admins.map(a => a._id),
      title: "New Payment Collection",
      message: `₹${paidAmount} collected from ${clientName}`,
      type: "payment",
      entityId: payment._id,
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// My payments
export const getMyPayments = async (req, res) => {
  try {
    const payments = await PaymentCollection.find({
      employee: req.user.id,
    }).sort({ collectionDate: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get single payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await PaymentCollection.findOne({
      _id: req.params.id,
      employee: req.user.id, // Security: Ensure they own the record
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    console.error("Fetch single payment error:", err);
    res.status(500).json({ message: err.message });
  }
};
// Update my payment
export const updateMyPayment = async (req, res) => {
  try {
    const payment = await PaymentCollection.findOne({
      _id: req.params.id,
      employee: req.user.id,
    });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    Object.assign(payment, req.body);

    payment.pendingAmount =
      Number(payment.totalAmount) - Number(payment.paidAmount);

    payment.isPartPayment = payment.pendingAmount > 0;

    await payment.save();

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Delete my payment
export const deleteMyPayment = async (req, res) => {
  try {
    const payment = await PaymentCollection.findOneAndDelete({
      _id: req.params.id,
      employee: req.user.id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN ================= */

// All payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentCollection.find()
      .populate("employee", "name email")
      .sort({ collectionDate: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
