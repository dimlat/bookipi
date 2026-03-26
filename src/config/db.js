import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;

    await mongoose.connect('mongodb://mongodb:27017/shop');

    isConnected = true;
    console.log('MongoDB connected');
};