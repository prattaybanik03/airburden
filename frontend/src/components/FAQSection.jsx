import React from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FAQSection = () => {
  const faqs = [
    {
      question: "Why is air quality important?",
      answer: "Air quality is essential for maintaining public health, reducing respiratory issues, and preventing long-term illnesses caused by pollutants.",
    },
    {
      question: "How do air pollutants affect health?",
      answer: "Air pollutants can lead to respiratory issues, cardiovascular problems, and even cancer. They are particularly harmful to vulnerable groups like children and the elderly.",
    },
    {
      question: "Where does the data on this website come from?",
      answer: "The data on this website is sourced from reputable organizations such as WHO, governmental agencies, and open datasets.",
    },
    {
      question: "Can you trust the predictions made by this website?",
      answer: "Our predictions are based on robust AI models and verified data sources. While they are highly accurate, they should be used for informational purposes only.",
    },
    {
      question: "Want to learn more?",
      answer: "Explore our blog and resources section for detailed articles on air quality, its impact, and how to mitigate pollution.",
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "2rem auto",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          
          marginBottom: "1.5rem",
        }}
      >
        Frequently Asked Questions
      </Typography>
      {faqs.map((faq, index) => (
        <Accordion key={index} sx={{ marginBottom: "0.5rem", borderRadius: "8px", overflow: "hidden" }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#1976D2" }} />}
            sx={{
              backgroundColor: "#f5f5f5",
              "&:hover": { backgroundColor: "#e3f2fd" },
            }}
          >
            <Typography sx={{ fontWeight: "bold" }}>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: "#555" }}>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FAQSection;
