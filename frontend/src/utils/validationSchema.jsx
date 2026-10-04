// src/utils/validationSchema.js
import * as yup from 'yup';

export const predictionFormSchema = yup.object().shape({
    year: yup
        .number()
        .required('Year is required')
        .min(1990, 'Year must be after 1990')
        .max(2100, 'Year must be relevant (within 2100)'),
    exposureNo2: yup
        .number()
        .required('Exposure Mean NO2 is required')
        .min(0, 'Must be a positive number')
        .max(1000, 'Must be a reasonable number (within 1000)'),
    exposureOzone: yup
        .number()
        .required('Exposure Mean Ozone is required')
        .min(0, 'Must be a positive number')
        .max(1000, 'Must be a reasonable number (within 1000)'),
    exposurePm25: yup
        .number()
        .required('Exposure Mean PM2.5 is required')
        .min(0, 'Must be a positive number')
        .max(1000, 'Must be a reasonable number (within 1000)'),
    country: yup
        .string()
        .required('Country is required'),
    regionName: yup
        .string()
        .required('Region Name is required'),
});
