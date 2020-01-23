const express = require('express');
const {check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const config = require('config');


const router = express.Router();
//create user
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', ' please include a valid email').isEmail(),
  check('password', 'please enter a password with 6 or more character').isLength({ min:6 })
],  async (req, res) =>{
   const errors = validationResult(req);
   if(!errors.isEmpty()){
     return res.status(400).json({ errors: errors.array() });
   }

   const{name, email, password} = req.body;

   try{
     let user = await User.findOne({ email });
     if(user){
       res.status(400).json({ errors: [{ msg: 'User already exists'}]});
     }
     const avatar = gravatar.url(email,{ s: '200', r : 'pg', d: 'mm'});
     user = new User({ name, email, avatar, password});
     const salt = await bcrypt.genSalt(10);
     user.password = await bcrypt.hash(password, salt);
     await user.save();

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
