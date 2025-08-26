import express from 'express';
const router = express.Router();

// Route to set name in session
router.get('/setname', (req, res) => {
  req.session.name = 'UserName'; // You can customize the name here
  res.send('Name has been set in session.');
});

// Route to show name from session
router.get('/showname', (req, res) => {
  const name = req.session.name || 'Guest';
  res.render('classroom/showname', { name });
});

export default router;
