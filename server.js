import express from 'express';
import router from './routes/index';

// Set the network port
const PORT = process.env.PORT || 5000;
// Init the Express application
const app = express();

app.use('/', router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`);
  console.log('Press CTRL+C to stop server');
});

export default app;
