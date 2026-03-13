import express from 'express';
import windController from '../controllers/windController.js';

const router = express.Router();

router.get('/fetch-actual', windController.fetchAndStoreActualData);
router.get('/fetch-forecast', windController.fetchAndStoreForecastData);
router.get('/chart', windController.getChartData);

export default router;

