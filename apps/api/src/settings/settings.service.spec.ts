import { Test, TestingModule } from "@nestjs/testing";
import { settings } from "@workspace/lib/db/schema";
import { SettingsService } from "./settings.service";
import { createInMemoryPostgresDb, type InMemoryDb } from "@/test-utils/in-memory-db";

describe("SettingsService", () => {
  const SETTINGS_ID = "default";
  const DEFAULT_PER_PAGE = 12;
  const CUSTOM_PER_PAGE = 24;
  const UPDATED_PER_PAGE = 50;

  let service: SettingsService;
  let testDb: InMemoryDb;

  beforeAll(async () => {
    testDb = await createInMemoryPostgresDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: "DrizzleDB",
          useValue: testDb.db,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  beforeEach(() => {
    testDb.reset();
  });

  afterAll(async () => {
    await testDb.close();
  });

  it("returns existing settings", async () => {
    await testDb.db.insert(settings).values({ id: SETTINGS_ID, perPage: CUSTOM_PER_PAGE });

    await expect(service.get()).resolves.toMatchObject({ id: SETTINGS_ID, perPage: CUSTOM_PER_PAGE });
  });

  it("seeds default settings when missing", async () => {
    await expect(service.get()).resolves.toMatchObject({ id: SETTINGS_ID, perPage: DEFAULT_PER_PAGE });
  });

  it("updates settings", async () => {
    await service.get();

    const updated = await service.update({ perPage: UPDATED_PER_PAGE });

    expect(updated).toMatchObject({ id: SETTINGS_ID, perPage: UPDATED_PER_PAGE });
  });
});
