const express = require('express');
const User = require('../../models/User')
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const {check, validationResult } = require('express-validator');


const router = express.Router();

router.get('/', auth, async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//login user
router.post('/', [
  check('email', ' please include a valid email').isEmail(),
  check('password', 'password is required').exists()
],  async (req, res) =>{
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     return res.status(400).json({ errors: errors.array() });
   }

   const{email, password} = req.body;

   try{
     let user = await User.findOne({ email });
     if(!user){
       res.status(400).json({ errors: [{ msg: 'Invalid credentials'}]});
     }

     const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
      res.status(400).json({ errors: [{ msg: 'Invalid credentials'}]});
    }

     const payload = {
       user:{
         id: user.id
       }
     }

     jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000000 }, (err, token) =>{
       if(err) throw err;
       res.status(200).json({token});
     });

   }catch(err){
     console.error(err.message);
     req.status(500).send('Server Error');
   }
});



module.exports = router;
