import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { storage } from './storage';
import bcrypt from 'bcrypt';

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
    
    if (user) {
      // User exists, log them in
      return done(null, user);
    } else {
      // Create new user from Google profile
      const newUser = await storage.createUser({
        username: profile.displayName || profile.id,
        email: profile.emails?.[0]?.value || '',
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        role: 'customer'
      });
      return done(null, newUser);
    }
  } catch (error) {
    return done(error, undefined);
  }
}));

// Configure Facebook OAuth Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID!,
  clientSecret: process.env.FACEBOOK_APP_SECRET!,
  callbackURL: "/api/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Facebook email
    let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
    
    if (user) {
      // User exists, log them in
      return done(null, user);
    } else {
      // Create new user from Facebook profile
      const newUser = await storage.createUser({
        username: profile.displayName || profile.id,
        email: profile.emails?.[0]?.value || '',
        password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        role: 'customer'
      });
      return done(null, newUser);
    }
  } catch (error) {
    return done(error, undefined);
  }
}));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;