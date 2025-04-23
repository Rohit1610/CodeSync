import connectDB from "@/config/database";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { getSessionUser } from "@/utils/getSessionUser";
import mongoose from 'mongoose';

export const POST = async (request, response) => {
    try {
        const session = await getSessionUser();

        if (!session ||
            !session.user ||
            !session.user.id ||
            session.user.id !== '664da6fa0a207e01f76dfa25') {
            return new Response(JSON.stringify({
                message: 'Unauthorized', ok: false
            }), { status: 401 });
        }

        const { id, message } = await request.json();
        if (!id || !message) {
            return new Response(JSON.stringify({ message: 'Fill all the fields', ok: false }), { status: 400 });
        }

        await connectDB();

        const mongoSession = await mongoose.startSession();
        mongoSession.startTransaction();

        try {
            let users = [];
            if (id !== 'all') {
                const user = await User.findById(id).session(mongoSession);
                if (!user) {
                    await mongoSession.abortTransaction();
                    return new Response(JSON.stringify({ message: 'No such user exists', ok: false }), { status: 400 });
                }
                users.push(user);
            } else {
                users = await User.find({}).session(mongoSession);
            }

            // Use Promise.all to save notifications concurrently
            const notificationPromises = users.map(user => {
                const notification = new Notification({
                    sender: '664da6fa0a207e01f76dfa25',
                    receiver: user._id,
                    body: message,
                    toAdmin: false,
                });
                return notification.save({ session: mongoSession });
            });

            await Promise.all(notificationPromises);

            await mongoSession.commitTransaction();
            return new Response(JSON.stringify({ message: 'Notifications sent successfully', ok: true }), { status: 200 });

        } catch (error) {
            await mongoSession.abortTransaction();
            console.log(error);
            return new Response(JSON.stringify({ message: 'Could not send notification', ok: false }), { status: 500 });
        } finally {
            mongoSession.endSession(); // Ensure session ends here
        }

    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ message: 'Could not send notification', ok: false }), { status: 500 });
    }
}
