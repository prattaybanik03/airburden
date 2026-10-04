import React, { useState } from 'react';
import PredictionForm from './PredictionForm';
import { getRiskClassification } from '../services/apiService';

const RiskClassificationForm = () => {
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
            const response = await getRiskClassification({ features: inputData });
            setResult(`Risk Classification: ${response.risk_level}`);
        } catch (error) {
            console.error('Error while fetching risk classification:', error);
            setResult('Error while fetching risk classification');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2>Risk Classification</h2>
            <PredictionForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                countries={countries}
                regions={regions}
            />
            {result && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Risk Classification Result:</h3>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
};

export default RiskClassificationForm;
