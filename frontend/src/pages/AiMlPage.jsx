import React from 'react';
import { Container, Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import AIMLDetailsSection from '../components/AIMLDetailsSection';
import HealthPredictionForm from '../components/HealthPredictionForm';
import RiskClassificationForm from '../components/RiskClassificationForm';
import ClusterInfoForm from '../components/ClusterInfoForm';

const AiMlPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Container maxWidth="md" sx={{ padding: '2rem 0', textAlign: 'center' }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: '#1976D2', fontWeight: 'bold' }}
        >
          AI/ML Dashboard
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ marginBottom: '2rem', color: '#555' }}
        >
          Explore advanced AI/ML features tailored for air quality analysis.
        </Typography>

        {/* AI/ML Guidance Section */}
        <Box sx={{ marginBottom: '1.5rem' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Accordion sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#1976D2' }} />}
                sx={{
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  AI/ML Dashboard Guidance
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '1.5rem' }}>
                <AIMLDetailsSection />
              </AccordionDetails>
            </Accordion>
          </motion.div>
        </Box>

        {/* Health Prediction Section */}
        <Box sx={{ marginBottom: '1.5rem' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Accordion sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#1976D2' }} />}
                sx={{
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Health Burden Prediction
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '1.5rem' }}>
                <HealthPredictionForm />
              </AccordionDetails>
            </Accordion>
          </motion.div>
        </Box>

        {/* Risk Classification Section */}
        <Box sx={{ marginBottom: '1.5rem' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Accordion sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#1976D2' }} />}
                sx={{
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Risk Classification
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '1.5rem' }}>
                <RiskClassificationForm />
              </AccordionDetails>
            </Accordion>
          </motion.div>
        </Box>

        {/* Cluster Information Section */}
        <Box>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
          >
            <Accordion sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#1976D2' }} />}
                sx={{
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Cluster Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: '1.5rem' }}>
                <ClusterInfoForm />
              </AccordionDetails>
            </Accordion>
          </motion.div>
        </Box>
      </Container>
    </motion.div>
  );
};

export default AiMlPage;
