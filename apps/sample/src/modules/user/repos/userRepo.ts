import { Prisma, PrismaClient } from "@prisma/client";

import { handlePrismaError, PrismaError } from "@/utils/prismaError";

import { User } from "../models/user";

export const UserRepoErrors = {
  userNotFound: new Error("User not found"),
  userProfileNotFound: new Error("User profile not found"),
  emailAlreadyExists: new Error("Email already exists"),
};

export type UserCreationData = Pick<
  User,
  "name" | "address" | "age" | "birthday" | "email"
>;

export type UserUpdateData = Omit<UserCreationData, "email">;

export const userInclude = Prisma.validator<Prisma.UserArgs>()({
  include: {
    profile: true,
  },
});

type PrismaUser = Prisma.UserGetPayload<typeof userInclude>;

function transformPrismaUser(prismaUser: PrismaUser): User {
  if (!prismaUser.profile) throw UserRepoErrors.userProfileNotFound;
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    name: prismaUser.profile.name,
    age: prismaUser.profile.age,
    address: prismaUser.profile.address,
    birthday: prismaUser.profile.birthday,
  };
}

export function createUserRepo(db: PrismaClient) {
  return {
    async createUser(user: UserCreationData) {
      const createdUser = await db.user
        .create({
          ...userInclude,
          data: {
            email: user.email,
            profile: {
              create: {
                name: user.name,
                age: user.age,
                address: user.address,
                birthday: user.birthday,
              },
            },
          },
        })
        .catch(
          handlePrismaError({
            [PrismaError.UniqueConstraint]: UserRepoErrors.emailAlreadyExists,
          }),
        );

      return transformPrismaUser(createdUser);
    },

    async getUser(userId: number) {
      const user = await db.user.findUnique({
        ...userInclude,
        where: { id: userId },
      });
      if (!user) throw UserRepoErrors.userNotFound;

      return transformPrismaUser(user);
    },

    async updateUser(userId: number, user: UserUpdateData) {
      const updatedUser = await db.user
        .update({
          ...userInclude,
          where: { id: userId },
          data: {
            profile: {
              update: {
                name: user.name,
                age: user.age,
                address: user.address,
                birthday: user.birthday,
              },
            },
          },
        })
        .catch(
          handlePrismaError({
            [PrismaError.NotFound]: UserRepoErrors.userNotFound,
          }),
        );

      return transformPrismaUser(updatedUser);
    },

    async deleteUser(userId: number) {
      await db.user
        .delete({
          where: { id: userId },
        })
        .catch(
          handlePrismaError({
            [PrismaError.NotFound]: UserRepoErrors.userNotFound,
          }),
        );
    },
  };
}

export type UserRepo = ReturnType<typeof createUserRepo>;
