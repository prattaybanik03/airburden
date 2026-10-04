import React, { useState } from 'react';
import PredictionForm from './PredictionForm';
import { getHealthPrediction } from '../services/apiService';

const HealthPredictionForm = () => {
    const [result, setResult] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const countries = ["USA", "Canada", "Australia"]; // Define or load this list dynamically
    const regions = ["Region 1", "Region 2", "Region 3"]; // Should be filtered based on country selection

    const handleSubmit = async (values) => {
        setIsSubmitting(true);

        const inputData = {
            year: parseInt(values.year, 10),
            exposure_mean_no2: parseFloat(values.exposureNo2),
            exposure_mean_ozone: parseFloat(values.exposureOzone),
            exposure_mean_pm25: parseFloat(values.exposurePm25),
            country: values.country,
            region_name: values.regionName,
        };

        try {
            const response = await getHealthPrediction({ features: inputData });
            setResult(`Predicted health burden: ${Math.round(response.prediction).toLocaleString()} (${response.unit}). ${response.disclaimer}`);
        } catch (error) {
            console.error('Error while fetching prediction:', error);
            setResult('Error while fetching prediction');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2>Health Burden Prediction</h2>
            <PredictionForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                countries={countries}
                regions={regions}
            />
            {result && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Health Burden Prediction Result:</h3>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
};

export default HealthPredictionForm;
