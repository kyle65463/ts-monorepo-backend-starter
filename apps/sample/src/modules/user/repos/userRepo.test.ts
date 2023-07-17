import { PrismaClient } from "@prisma/client";
import { beforeAll, beforeEach, describe, it } from "vitest";

import {
  createUserRepo,
  UserCreationData,
  UserRepo,
  UserRepoErrors,
  UserUpdateData,
} from "./userRepo";

describe("UserRepo", () => {
  let db: PrismaClient;
  let userRepo: UserRepo;

  beforeAll(async () => {
    db = new PrismaClient({});
    userRepo = createUserRepo(db);
  });

  beforeEach(async () => {
    await db.$executeRawUnsafe("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
    await db.user.create({
      data: {
        email: "test@mail.com",
        profile: {
          create: {
            name: "user 1",
            age: 18,
            address: "Taipei",
            birthday: new Date(2000, 1, 2),
          },
        },
      },
    });
  });

  describe("createUser", () => {
    let userCreationData: UserCreationData;

    describe("when create successfully", () => {
      beforeEach(() => {
        userCreationData = {
          email: "test2@mail.com",
          name: "user 2",
          age: 20,
          address: "Japan",
          birthday: new Date(2005, 5, 2),
        };
      });

      it("should return user", async ({ expect }) => {
        const user = await userRepo.createUser(userCreationData);
        expect(user).toEqual({
          ...userCreationData,
          id: 2,
        });
      });

      it("should create user in db", async ({ expect }) => {
        await userRepo.createUser(userCreationData);

        const user = await db.user.findUnique({ where: { id: 2 } });
        expect(user).toEqual(
          expect.objectContaining({
            id: 2,
            email: "test2@mail.com",
          }),
        );

        const userProfile = await db.userProfile.findUnique({
          where: { userId: 2 },
        });
        expect(userProfile).toEqual(
          expect.objectContaining({
            userId: 2,
            name: "user 2",
            age: 20,
            address: "Japan",
            birthday: new Date(2005, 5, 2),
          }),
        );
      });
    });

    describe("when email already exists", () => {
      beforeEach(() => {
        userCreationData = {
          email: "test@mail.com",
          name: "user 2",
          age: 20,
          address: "Japan",
          birthday: new Date(2005, 5, 2),
        };
      });

      it("should throw UserRepoErrors.UserRepoErrors.userNotFound", async ({
        expect,
      }) => {
        await expect(
          userRepo.createUser(userCreationData),
        ).rejects.toThrowError(UserRepoErrors.emailAlreadyExists);
      });
    });
  });

  describe("getUser", () => {
    describe("when user exists", () => {
      it("should return user", async ({ expect }) => {
        const user = await userRepo.getUser(1);
        expect(user).toEqual({
          id: 1,
          email: "test@mail.com",
          name: "user 1",
          age: 18,
          address: "Taipei",
          birthday: new Date(2000, 1, 2),
        });
      });
    });

    describe("when user does not exist", () => {
      it("should throw UserRepoErrors.userNotFound", async ({ expect }) => {
        await expect(userRepo.getUser(2)).rejects.toThrowError(
          UserRepoErrors.userNotFound,
        );
      });
    });
  });

  describe("updateUser", () => {
    let userUpdateData: UserUpdateData;

    describe("when user exists", () => {
      beforeEach(() => {
        userUpdateData = {
          name: "user 1 updated",
          age: 20,
          address: "Japan",
          birthday: new Date(2005, 5, 2),
        };
      });

      it("should return user", async ({ expect }) => {
        const user = await userRepo.updateUser(1, userUpdateData);
        expect(user).toEqual({
          ...userUpdateData,
          id: 1,
          email: "test@mail.com",
        });
      });

      it("should update user in db", async ({ expect }) => {
        await userRepo.updateUser(1, userUpdateData);

        const user = await db.user.findUnique({ where: { id: 1 } });
        expect(user).toEqual(
          expect.objectContaining({
            id: 1,
            email: "test@mail.com",
          }),
        );

        const userProfile = await db.userProfile.findUnique({
          where: { userId: 1 },
        });
        expect(userProfile).toEqual(
          expect.objectContaining({
            userId: 1,
            name: "user 1 updated",
            age: 20,
            address: "Japan",
            birthday: new Date(2005, 5, 2),
          }),
        );
      });
    });

    describe("when user does not exist", () => {
      it("should throw UserRepoErrors.userNotFound", async ({ expect }) => {
        await expect(
          userRepo.updateUser(2, userUpdateData),
        ).rejects.toThrowError(UserRepoErrors.userNotFound);
      });
    });
  });

  describe("deleteUser", () => {
    describe("when user exists", () => {
      it("should succeed", async ({ expect }) => {
        await expect(userRepo.deleteUser(1)).resolves.not.toThrowError();
      });

      it("should delete user in db", async ({ expect }) => {
        await userRepo.deleteUser(1);

        const user = await db.user.findUnique({ where: { id: 1 } });
        expect(user).toEqual(null);

        const userProfile = await db.userProfile.findUnique({
          where: { userId: 1 },
        });
        expect(userProfile).toEqual(null);
      });
    });

    describe("when user does not exist", () => {
      it("should throw UserRepoErrors.userNotFound", async ({ expect }) => {
        await expect(userRepo.deleteUser(2)).rejects.toThrowError(
          UserRepoErrors.userNotFound,
        );
      });
    });
  });
});
