const express = require('express');
const connectDB = require('./config/db');
const userRouter = require('./routes/api/users');
const authRouter = require('./routes/api/auth');
const profileRouter = require('./routes/api/profile');
const postsRouter = require('./routes/api/posts');

const app = express();
app.use(express.json({ extended: false }));
//connect DATABASE
connectDB();


app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
  console.log(`App running on port ${PORT}`)
});
