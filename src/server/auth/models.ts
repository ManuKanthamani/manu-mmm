import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, maxlength: 254 },
  emailNormalized: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
}, {
  collection: "users",
  timestamps: true,
});

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: "sessions",
  versionKey: false,
});

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const passwordResetTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, {
  collection: "password_reset_tokens",
  versionKey: false,
});

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const authRateLimitSchema = new Schema({
  _id: { type: String, required: true },
  count: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
}, {
  collection: "auth_rate_limits",
  versionKey: false,
});

authRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
export const Session = mongoose.models.Session ?? mongoose.model("Session", sessionSchema);
export const PasswordResetToken = mongoose.models.PasswordResetToken ?? mongoose.model("PasswordResetToken", passwordResetTokenSchema);
export const AuthRateLimit = mongoose.models.AuthRateLimit ?? mongoose.model("AuthRateLimit", authRateLimitSchema);
