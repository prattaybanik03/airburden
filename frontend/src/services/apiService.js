import axios from 'axios';

const apiService = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
});

export const getHealthPrediction = async (inputData) => { 
  try {
    const response = await apiService.post('/predict_health_burden', inputData);
    return response.data;
  } catch (error) {
    console.error('Error fetching health prediction:', error);
    throw error;
  }
};

export const getRiskClassification = async (inputData) => {
  try {
    const response = await apiService.post('/classify_risk_level', inputData);
    return response.data;
  } catch (error) {
    console.error('Error fetching risk classification:', error);
    throw error;
  }
};

export const getClusterInfo = async (inputData) => {
  try {
    const response = await apiService.post('/get_cluster_info', inputData);
    return response.data;
  } catch (error) {
    console.error('Error fetching cluster info:', error);
    throw error;
  }
};

// Fetch air quality data
export const getAirQuality = async (city) => {
    try {
        const response = await apiService.get('/air_quality', {
            params: { city },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        throw error;
    }
};

// Fetch health news data
export const getHealthNews = async (query) => {
    try {
        const response = await apiService.get('/health_news', {
            params: { query },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching health news:', error);
        throw error;
    }
};
