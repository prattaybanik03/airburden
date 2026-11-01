import { Link as RouterLink } from "react-router-dom";
import { Button } from "@mui/material";
import { PageHeader } from "../components/ui";

const NotFoundPage = () => (
  <PageHeader eyebrow="404" title="This page drifted away." subtitle="The page you were looking for does not exist.">
    <Button component={RouterLink} to="/" variant="contained" size="large" sx={{ mt: 4 }}>
      Back to home
    </Button>
  </PageHeader>
);

export default NotFoundPage;
