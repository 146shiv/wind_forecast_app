import mongoose from 'mongoose';

const forecastWindSchema = new mongoose.Schema(
  {
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    publishTime: {
      type: Date,
      required: true,
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


forecastWindSchema.index({ startTime: 1, publishTime: 1 }, { unique: true });

const ForecastWind = mongoose.model('ForecastWind', forecastWindSchema);

export default ForecastWind;

