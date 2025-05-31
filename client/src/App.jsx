import React from 'react';
import { Button, Container, Typography } from '@mui/material';

function App() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Transport Management System
      </Typography>
      <Button variant="contained" color="primary">
        Sample Button
      </Button>
    </Container>
  );
}

export default App;
