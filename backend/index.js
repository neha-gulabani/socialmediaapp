require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/userRoutes');
const storyRoutes = require('./routes/storyRoutes');
const middleware = require('./middleware/middleware')
const path = require('path');






const app = express();
app.use(express.json());
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use('/auth', authRoutes);
app.use('/api/stories', storyRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));



app.listen(5000, () => {
    console.log(`listening at port http://localhost: 5000`);
})