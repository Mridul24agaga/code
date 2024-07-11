'use server';

import { currentUser } from "@clerk/nextjs/server";

import UserModel from "@/models/user-model";
import { connectmongoDB } from "@/config/databaseConnect";


connectmongoDB();


export const saveAndGetCurrentUser = async () => {

    try {

        const authenticatedUser = await currentUser();

        const isUserAlreadyExists = await UserModel.findOne({clerkUserId: authenticatedUser?.id});

        if(isUserAlreadyExists) {

            return {
                success: true,
                data: JSON.parse(JSON.stringify(isUserAlreadyExists))
            }

        }

        const userObj = {
            fullname: authenticatedUser?.firstName! + authenticatedUser?.lastName!,
            email: authenticatedUser?.emailAddresses[0]?.emailAddress,
            clerkUserId: authenticatedUser?.id
        }

        const newUser = await UserModel.create(userObj);

        return {
            success: true,
            data: JSON.parse(JSON.stringify(newUser))
        }
        
    } catch (error: any) {
        
        return {
            success: false,
            message: error.message
        }

    }

}