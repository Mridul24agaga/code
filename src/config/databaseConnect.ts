import mongoose from 'mongoose';

export const connectmongoDB = async () => {

    try {

        await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI!);

        console.log('connection to mongoDB successful...');
        
        
    } catch (error) {
        
        console.log(error);

        
    }

}