import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@tecno-gamerz/utils/db';
import type { Role } from '@tecno-gamerz/types';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  
  providers: [
    Google({
      clientId: process.env.OAUTH_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET!,
    }),
    // TODO: Add Twitch and YouTube providers
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        // Get user with roles from database
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (dbUser) {
          // Extract roles and permissions
          const roles = dbUser.userRoles.map((ur) => ur.role.name as Role);
          const permissions = dbUser.userRoles.flatMap((ur) =>
            ur.role.rolePermissions.map((rp) => rp.permission.key)
          );

          token.userId = dbUser.id;
          token.email = dbUser.email;
          token.username = dbUser.username;
          token.roles = roles;
          token.permissions = permissions;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.roles = token.roles as Role[];
        session.user.permissions = token.permissions as string[];
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          include: { userRoles: true },
        });

        if (!existingUser) {
          // User will be created by the adapter
          // We'll assign the FAN role in the database after user creation
          return true;
        }

        // If user exists but has no roles, assign FAN role
        if (existingUser.userRoles.length === 0) {
          const fanRole = await db.role.findUnique({
            where: { name: 'FAN' },
          });

          if (fanRole) {
            await db.userRole.create({
              data: {
                userId: existingUser.id,
                roleId: fanRole.id,
              },
            });
          }
        }

        return true;
      } catch (error) {
        console.error('Error during sign in:', error);
        return false;
      }
    },
  },

  events: {
    async createUser({ user }) {
      try {
        // Assign FAN role to new users by default
        const fanRole = await db.role.findUnique({
          where: { name: 'FAN' },
        });

        if (fanRole && user.id) {
          await db.userRole.create({
            data: {
              userId: user.id,
              roleId: fanRole.id,
            },
          });

          // Log the user creation
          await db.auditLog.create({
            data: {
              userId: user.id,
              action: 'user.created',
              resource: 'User',
              resourceId: user.id,
              metadata: {
                source: 'oauth',
                provider: 'google', // TODO: Get actual provider
                email: user.email,
              },
            },
          });
        }
      } catch (error) {
        console.error('Error assigning default role to new user:', error);
      }
    },

    async signIn({ user, account, profile }) {
      if (user.id) {
        // Log successful sign in
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'user.login',
            resource: 'User',
            resourceId: user.id,
            metadata: {
              provider: account?.provider,
              timestamp: new Date().toISOString(),
            },
          },
        });
      }
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  debug: process.env.NODE_ENV === 'development',
});