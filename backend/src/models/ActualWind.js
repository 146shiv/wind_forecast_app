import mongoose from 'mongoose';

const actualWindSchema = new mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    generation: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ActualWind = mongoose.model('ActualWind', actualWindSchema);

export default ActualWind;

