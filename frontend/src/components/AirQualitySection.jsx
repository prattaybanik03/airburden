// src/components/AirQualitySection.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Paper, Autocomplete } from '@mui/material';
import { getAirQuality } from '../services/apiService';

const AirQualitySection = () => {
    const [city, setCity] = useState('');
    const [airQuality, setAirQuality] = useState(null);
    const [loading, setLoading] = useState(false);

    // Example city list for autocomplete
    const cities = [
        'New York',
        'Los Angeles',
        'San Francisco',
        'Delhi',
        'Mumbai',
        'Sydney',
        'Melbourne',
        'Beijing',
        'Tokyo',
    ];

    const handleCheckAirQuality = async () => {
        setLoading(true);
        const result = await getAirQuality(city);
        setAirQuality(result.air_quality);
        setLoading(false);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 3,
                marginY: 4,
                textAlign: 'center',
                gap: 2,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 3,
                    width: '100%',
                    maxWidth: '600px',
                }}
            >
               <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          color: "black",
          marginBottom: "1rem",
        }}
      >
       Check Air Quality By City
      </Typography>

                <Box
                    display="flex"
                    gap={2}
                    mt={2}
                    sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                    }}
                >
                    <Autocomplete
                        options={cities}
                        getOptionLabel={(option) => option}
                        value={city}
                        onChange={(event, newValue) => setCity(newValue || '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="City"
                                variant="outlined"
                                fullWidth
                            />
                        )}
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCheckAirQuality}
                        disabled={loading || !city}
                        sx={{
                            height: '50px',
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Check'}
                    </Button>
                </Box>

                {airQuality && (
                    <Box mt={2}>
                        <Typography variant="body1">
                            <strong>AQI:</strong> {airQuality.aqi}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Category:</strong> {airQuality.category}
                        </Typography>
                        <Typography variant="body2" sx={{ marginTop: 1 }}>
                            {airQuality.health_recommendations}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default AirQualitySection;
