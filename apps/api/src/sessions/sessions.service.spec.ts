import { Test, TestingModule } from "@nestjs/testing";
import { hash } from "bcrypt";
import { sessions, users } from "@workspace/lib/db/schema";
import { SessionsService } from "./sessions.service";
import { createInMemoryPostgresDb, type InMemoryDb } from "@/test-utils/in-memory-db";

describe("SessionsService", () => {
  const USER_ID = "u1";
  const SESSION_ID = "s1";
  const USERNAME = "alice";
  const PASSWORD = "pw";

  let service: SessionsService;
  let testDb: InMemoryDb;

  const seedUser = async () => {
    await testDb.db.insert(users).values({ id: USER_ID, username: USERNAME, password: await hash(PASSWORD, 5) });
  };

  beforeAll(async () => {
    testDb = await createInMemoryPostgresDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: "DrizzleDB",
          useValue: testDb.db,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  beforeEach(() => {
    testDb.reset();
  });

  afterAll(async () => {
    await testDb.close();
  });

  it("creates a session and returns id", async () => {
    await seedUser();

    const id = await service.create({ userId: USER_ID });

    expect(id).toBeTruthy();
    const created = await service.findById(id);
    expect(created).toMatchObject({ id, userId: USER_ID });
  });

  it("returns session by id", async () => {
    await seedUser();
    await testDb.db.insert(sessions).values({ id: SESSION_ID, userId: USER_ID });

    await expect(service.findById(SESSION_ID)).resolves.toMatchObject({ id: SESSION_ID, userId: USER_ID });
  });

  it("returns null when session is missing", async () => {
    await expect(service.findById(SESSION_ID)).resolves.toBeNull();
  });

  it("deletes session by id", async () => {
    await seedUser();
    await testDb.db.insert(sessions).values({ id: SESSION_ID, userId: USER_ID });

    await service.deleteById(SESSION_ID);

    await expect(service.findById(SESSION_ID)).resolves.toBeNull();
  });
});
