import connectDB from '@/config/database';
import User from '@/models/User';

import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',  // Use JWT sessions
    maxAge: 30 * 24 * 60 * 60, // Session duration: 30 days
    updateAge: 24 * 60 * 60,   // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // JWT expiry time: 30 days
  },
  callbacks: {
    // Invoked on successful signin
    async signIn({ profile }) {
      // 1. Connect to database
      await connectDB();
      // 2. Check if user exists
      const userExists = await User.findOne({ email: profile.email });
      // 3. If not, then add user to database
      if (!userExists) {
        // Truncate user name if too long
        const name = profile.name;

        await User.create({
          email: profile.email,
          name,
          image : profile.picture,
          codeforcesId : ''
        });

        return true 
      }
      
      // 4. Return true to allow sign in
      return true;
    },
    // Modifies the session object
    async session({ session }) {
      await connectDB()
      // 1. Get user from database
      const user = await User.findOne({ email: session.user.email });
      // 2. Assign the user id to the session
      session.user.id = user._id.toString();
      session.codeforcesId = user.codeforcesId
      // 3. return session
      return session;
    },
  },
  events: {
    async error(message) {
      console.error('NextAuth error:', message);
    },
  },
};