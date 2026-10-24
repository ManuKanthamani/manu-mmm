import mongoose, { Schema } from "mongoose";

const locationSchema = new Schema({
  formattedAddress: { type: String, required: true, trim: true, maxlength: 300 },
  city: { type: String, required: true, trim: true, maxlength: 120 },
  state: { type: String, trim: true, maxlength: 120 },
  country: { type: String, trim: true, maxlength: 120 },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  googlePlaceId: { type: String, trim: true, maxlength: 200 },
}, { _id: false });

const weddingSchema = new Schema({
  brideName: { type: String, required: true, trim: true, maxlength: 120 },
  groomName: { type: String, required: true, trim: true, maxlength: 120 },
  title: { type: String, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 1000 },
  weddingDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  timeZone: { type: String, required: true, default: "Asia/Kolkata" },
  coverImageObjectKey: { type: String, trim: true, maxlength: 300 },
  coverImagePreset: {
    type: String,
    enum: ["palatial-arch", "lotus-motif", "marigold-modern", "custom"],
    default: "palatial-arch",
  },
  location: { type: locationSchema, required: true },
  website: {
    slug: { type: String, required: true, trim: true, lowercase: true },
    theme: { type: String, default: "CLASSIC_INDIAN" },
    isPublished: { type: Boolean, default: false },
    welcomeMessage: { type: String, trim: true, maxlength: 1000 },
  },
  gallery: {
    tokenHash: { type: String, required: true, unique: true, select: false },
    isEnabled: { type: Boolean, default: false },
    guestUploadsEnabled: { type: Boolean, default: false },
  },
  livestream: {
    youtubeUrl: { type: String, default: null },
    isEnabled: { type: Boolean, default: false },
  },
  createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  deletedAt: { type: Date, default: null },
}, {
  collection: "weddings",
  timestamps: true,
});

weddingSchema.index({ "website.slug": 1 }, { unique: true });

const weddingMembershipSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true },
  role: { type: String, enum: ["ADMIN", "MANAGER"], required: true },
  joinedAt: { type: Date, default: Date.now },
}, {
  collection: "wedding_memberships",
  timestamps: true,
});

weddingMembershipSchema.index({ weddingId: 1, userId: 1 }, { unique: true });
weddingMembershipSchema.index({ weddingId: 1, role: 1 });

export const Wedding = mongoose.models.Wedding ?? mongoose.model("Wedding", weddingSchema);
export const WeddingMembership = mongoose.models.WeddingMembership
  ?? mongoose.model("WeddingMembership", weddingMembershipSchema);
