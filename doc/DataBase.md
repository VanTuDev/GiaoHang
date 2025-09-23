import mongoose from "mongoose";

// Thông tin mở rộng khi User là tài xế
const driverSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
   status: { type: String, enum: ["Pending", "Active", "Rejected", "Blocked"], default: "Pending" },
   rating: { type: Number, default: 5.0 },
   totalTrips: { type: Number, default: 0 },
   incomeBalance: { type: Number, default: 0 },
   isOnline: { type: Boolean, default: false },
   lastOnlineAt: { type: Date },
   avatarUrl: { type: String },
}, { timestamps: true });

export default mongoose.model("Driver", driverSchema);

import mongoose from 'mongoose';

const driverApplicationSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
   status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
   adminNote: { type: String },
   emailVerifiedAt: { type: Date },
   docs: {
      licenseFrontUrl: String,
      licenseBackUrl: String,
      idCardFrontUrl: String,
      idCardBackUrl: String,
      portraitUrl: String,
      vehiclePhotos: [String],
      vehicleDocs: [String]
   },
   reviewedAt: { type: Date },
   submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('DriverApplication', driverApplicationSchema);

import mongoose from "mongoose";

// Lịch sử giao dịch tiền của tài xế
const driverTransactionSchema = new mongoose.Schema({
   driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Liên quan cuốc xe nào
   type: {
      type: String,
      enum: ["TripIncome", "AppFee", "Withdrawal", "Refund", "Adjustment"],
      required: true
   },
   amount: { type: Number, required: true },        // Số tiền (+ thu nhập, - phí/rút tiền)
   balanceAfter: { type: Number, required: true },  // Số dư sau giao dịch
   description: String,                             // Ghi chú: "Thu nhập từ đơn X", "Phí 10% app"...
}, { timestamps: true });

export default mongoose.model("DriverTransaction", driverTransactionSchema);

import mongoose from "mongoose";

// Đánh giá dịch vụ
const feedbackSchema = new mongoose.Schema({
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
   customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
   rating: { type: Number, min: 1, max: 5 },
   comment: String,
}, { timestamps: true });

export default mongoose.model("Feedback", feedbackSchema);

import mongoose from "mongoose";

// Bảo hiểm đơn hàng
const insuranceSchema = new mongoose.Schema({
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
   provider: { type: String, default: "App" },
   amount: Number,
   status: { type: String, enum: ["Active", "Claiming", "Closed"], default: "Active" },
}, { timestamps: true });

export default mongoose.model("Insurance", insuranceSchema);

import mongoose from "mongoose";

// Item trong đơn: mỗi item có thể được 1 tài xế nhận riêng
const orderItemSchema = new mongoose.Schema({
   vehicleType: { type: String, required: true },
   weightKg: { type: Number, required: true },
   distanceKm: { type: Number, required: true },
   loadingService: { type: Boolean, default: false },
   insurance: { type: Boolean, default: false },
   priceBreakdown: {
      basePerKm: Number,
      distanceCost: Number,
      loadCost: Number,
      insuranceFee: Number,
      total: Number
   },
   status: { type: String, enum: ["Created", "Accepted", "PickedUp", "Delivering", "Delivered", "Cancelled"], default: "Created" },
   driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" }
}, { _id: true });

// Đơn hàng nhiều item
const orderSchema = new mongoose.Schema({
   customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   pickupAddress: { type: String, required: true },
   dropoffAddress: { type: String, required: true },
   items: { type: [orderItemSchema], default: [] },
   totalPrice: { type: Number, default: 0 },
   paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);

import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
   code: { type: String, required: true },
   purpose: { type: String, enum: ['verify_email', 'reset_password'], required: true },
   expiresAt: { type: Date, required: true, index: true },
   used: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Otp', otpSchema);

import mongoose from "mongoose";

// Thanh toán cho đơn hàng
const paymentSchema = new mongoose.Schema({
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
   method: { type: String, enum: ["MoMo", "VNPay", "ZaloPay", "COD"], required: true },
   amount: Number,
   status: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },
   transactionCode: String,
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);

import mongoose from "mongoose";

// Người dùng chung cho hệ thống (Customer, Driver, Admin)
const userSchema = new mongoose.Schema({
   name: { type: String, required: true },
   email: { type: String, unique: true, lowercase: true, trim: true },
   phone: { type: String, unique: true, required: true },
   passwordHash: { type: String, required: true },
   role: { type: String, enum: ["Customer", "Driver", "Admin"], default: "Customer" },
   roles: { type: [{ type: String, enum: ["Customer", "Driver", "Admin"] }], default: ["Customer"] },
   address: { type: String, default: "Đà Nẵng" },
   isEmailVerified: { type: Boolean, default: false },
   avatarUrl: { type: String },
}, { timestamps: true });

export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

// Phương tiện của tài xế
const vehicleSchema = new mongoose.Schema({
   driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
   type: { type: String, enum: ["Motorbike", "Pickup", "TruckSmall", "TruckBox", "DumpTruck", "PickupTruck", "Trailer", "TruckMedium", "TruckLarge"], required: true },
   licensePlate: { type: String, required: true },
   maxWeightKg: { type: Number, default: 1000 },
   vehicleDocs: [String],
   photoUrl: { type: String },
}, { timestamps: true });

export default mongoose.model("Vehicle", vehicleSchema);

import mongoose from "mongoose";

// Vi phạm của tài xế
const violationSchema = new mongoose.Schema({
   driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
   reason: String,
   penalty: Number,
}, { timestamps: true });

export default mongoose.model("Violation", violationSchema);

import mongoose from "mongoose";

// Mã khuyến mãi
const voucherSchema = new mongoose.Schema({
   code: { type: String, unique: true },
   discountPercent: Number,
   discountAmount: Number,
   expiryDate: Date,
   status: { type: String, enum: ["Active", "Expired", "Used"], default: "Active" },
}, { timestamps: true });

export default mongoose.model("Voucher", voucherSchema);
