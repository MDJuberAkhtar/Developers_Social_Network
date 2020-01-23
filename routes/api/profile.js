const express = require('express');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const {check, validationResult } = require('express-validator');


const router = express.Router();

router.get('/me', auth , async(req, res) => {
  try{
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if(!profile){
      return res.status(400).json({ msg: 'There is no profile for the user'});
    }

    res.json(profile);

  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//create or update profile

router.post('/',[ auth, [
  check('status', 'Status is required').not().isEmpty(),
  check('skills', ' Skills is required').not().isEmpty()
]] ,async(req, res) =>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }

  const{ company, website, location, bio, githubusername, status, skills, youtube, facebook, twitter, instagram, linkedin} = req.body;
  const profileFields = {};
  profileFields.user = req.user.id;
  if(company) profileFields.company = company;
  if(website) profileFields.website = website;
  if(location) profileFields.location = location;
  if(bio) profileFields.bio = bio;
  if(status) profileFields.status = status;
  if(githubusername) profileFields.githubusername = githubusername;

  if(skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }

  profileFields.social = {}
   if(youtube) profileFields.social.youtube = youtube;
   if(twitter) profileFields.social.twitter = twitter;
   if(facebook) profileFields.social.facebook = facebook;
   if(linkedin) profileFields.social.linkedin = linkedin;
   if(instagram) profileFields.social.instagram = instagram;

   try{
     let profile = await Profile.findOne({ user: req.user.id});
     if(profile){
       profile = await Profile.findOneAndUpdate( { user: req.body.id}, { $set: profileFields }, { new: true } );

       return res.json(profile);
     }
     profile = new Profile(profileFields);
     await profile.save();
     res.json(profile);

   }catch(err){
     console.error( err.message);
     res.status(500).send('Server Error');
   }
});
//get all profile
router.get('/', async (req, res)=>{
  try{
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//get profile with id
router.get('/user/:user_id', async (req, res)=>{
  try{
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
    if(!profile) return res.status(400).json({ msg: ' profile not found'})
    res.json(profile);
  }catch(err){
    console.error(err.message);
    if(err.kind == 'ObjectId'){
      return res.status(400).json({ msg: ' Profile not found'});
    }
    res.status(500).send('Server Error');
  }
});

//delete user
router.delete('/', auth, async (req, res)=>{
  try{

   await Post.deleteMany({ user: req.user.id });

    await Profile.findOneAndRemove({ user: req.user.id });

    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted '});
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//Add Experience
router.put('/experience', [auth,[
  check('title', 'Title is Required').not().isEmpty(),
  check('company', 'Company is required is Required').not().isEmpty(),
  check('from', 'from date  is Required').not().isEmpty(),
]], async (req, res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, company, location, from, to, current, description } = req.body;
  const newExp = { title, company, location, from, to, current, description };
  try{
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//Delete experience
router.delete('/experience/:exp_id', auth, async (req, res) =>{
  try{
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//Add education
router.put('/education', [auth,[
  check('school', 'School is Required').not().isEmpty(),
  check('degree', 'Degree is required is Required').not().isEmpty(),
  check('fieldofstudy', 'Field of Study is required is Required').not().isEmpty(),
  check('from', 'from date  is Required').not().isEmpty()
]], async (req, res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  const { school, degree, fieldofstudy, from, to, current, description } = req.body;
  const newEdu = { school, degree, fieldofstudy, from, to, current, description };
  try{
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(newEdu);
    await profile.save();
    res.json(profile);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//Delete education
router.delete('/education/:edu_id', auth, async (req, res) =>{
  try{
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  }catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;
