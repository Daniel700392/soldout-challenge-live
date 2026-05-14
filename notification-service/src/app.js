const express = require('express');

const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
  });
});

app.listen(3004, () => {
  console.log(
    'Notification service running on port 3004'
  );
});