import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { compare, hash } from "bcrypt";
import { users } from "@workspace/lib/db/schema";
import { UsersService } from "./users.service";
import { createInMemoryPostgresDb, type InMemoryDb } from "@/test-utils/in-memory-db";

describe("UsersService", () => {
  const USER_ID = "u1";
  const USERNAME = "alice";
  const NEW_USERNAME = "bob";
  const HASH_PASSWORD = "x";
  const PLAIN_PASSWORD = "plain";
  const SECRET_PASSWORD = "secret";

  let service: UsersService;
  let testDb: InMemoryDb;

  const seedUser = async () => {
    await testDb.db.insert(users).values({ id: USER_ID, username: USERNAME, password: await hash(HASH_PASSWORD, 5) });
  };

  beforeAll(async () => {
    testDb = await createInMemoryPostgresDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: "DrizzleDB",
          useValue: testDb.db,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  beforeEach(() => {
    testDb.reset();
  });

  afterAll(async () => {
    await testDb.close();
  });

  it("creates a user with a hashed password", async () => {
    const result = await service.create({ username: USERNAME, password: PLAIN_PASSWORD });

    expect(result.username).toBe(USERNAME);
    expect(result.password).not.toBe(PLAIN_PASSWORD);
    await expect(compare(PLAIN_PASSWORD, result.password)).resolves.toBe(true);
  });

  it("throws when username is already taken", async () => {
    await seedUser();

    await expect(service.create({ username: USERNAME, password: PLAIN_PASSWORD })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("updates user data", async () => {
    await seedUser();

    const result = await service.update(USER_ID, { username: NEW_USERNAME });

    expect(result.id).toBe(USER_ID);
    expect(result.username).toBe(NEW_USERNAME);
  });

  it("finds a user by id", async () => {
    await seedUser();

    await expect(service.findById(USER_ID)).resolves.toMatchObject({ id: USER_ID, username: USERNAME });
  });

  it("returns true when credentials match", async () => {
    await testDb.db.insert(users).values({ id: USER_ID, username: USERNAME, password: await hash(SECRET_PASSWORD, 5) });

    await expect(service.existsWithSameCredentials({ username: USERNAME, password: SECRET_PASSWORD })).resolves.toBe(
      USER_ID,
    );
  });

  it("returns false when credentials do not match", async () => {
    await testDb.db.insert(users).values({ id: USER_ID, username: USERNAME, password: await hash(SECRET_PASSWORD, 5) });

    await expect(service.existsWithSameCredentials({ username: USERNAME, password: "wrong" })).resolves.toBe(false);
  });
});
