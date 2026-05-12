const router = require('express').Router();
const userController = require('../controllers/userController');

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const {
  signupValidator,
  loginValidator
} = require('../validators/userValidator');

// Public routes
router.post('/signup', signupValidator, validate, userController.signup);
router.post('/login', loginValidator, validate, userController.login);

// Protected routes
router.get('/profile', auth, userController.getProfile);

// 👉 ADD THIS (Budget route)
router.put('/budget', auth, userController.setBudget);

module.exports = router;