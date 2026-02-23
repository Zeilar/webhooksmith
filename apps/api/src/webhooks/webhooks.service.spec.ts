import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { webhooks } from "@workspace/lib/db/schema";
import { WebhooksService } from "./webhooks.service";
import { createInMemoryPostgresDb, type InMemoryDb } from "@/test-utils/in-memory-db";

describe("WebhooksService", () => {
  const WEBHOOK_ID = "w1";
  const MISSING_WEBHOOK_ID = "w-missing";
  const WEBHOOK_NAME = "n";
  const UPDATED_WEBHOOK_NAME = "new";
  const BLUEPRINT = "{}";
  const RECEIVER_URL = "https://example.com";
  const DESCRIPTION = "d";

  let service: WebhooksService;
  let testDb: InMemoryDb;

  const seedWebhook = async () => {
    await testDb.db
      .insert(webhooks)
      .values({ id: WEBHOOK_ID, name: WEBHOOK_NAME, blueprint: BLUEPRINT, receiver: RECEIVER_URL, enabled: true });
  };

  beforeAll(async () => {
    testDb = await createInMemoryPostgresDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: "DrizzleDB",
          useValue: testDb.db,
        },
      ],
    }).compile();

    service = module.get<WebhooksService>(WebhooksService);
  });

  beforeEach(() => {
    testDb.reset();
  });

  afterAll(async () => {
    await testDb.close();
  });

  it("creates a webhook", async () => {
    const created = await service.create({
      name: WEBHOOK_NAME,
      blueprint: BLUEPRINT,
      receiver: RECEIVER_URL,
      description: DESCRIPTION,
      enabled: true,
    });

    expect(created).toMatchObject({
      name: WEBHOOK_NAME,
      blueprint: BLUEPRINT,
      receiver: RECEIVER_URL,
      description: DESCRIPTION,
    });
  });

  it("returns paginated webhooks", async () => {
    await testDb.db.insert(webhooks).values([
      {
        id: "w1",
        name: "one",
        blueprint: "{}",
        receiver: "https://one.example",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        enabled: true,
      },
      {
        id: "w2",
        name: "two",
        blueprint: "{}",
        receiver: "https://two.example",
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
        enabled: true,
      },
      {
        id: "w3",
        name: "three",
        blueprint: "{}",
        receiver: "https://three.example",
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-03T00:00:00.000Z",
        enabled: true,
      },
    ]);

    await expect(service.getAll(9, 2)).resolves.toEqual({
      items: [expect.objectContaining({ id: "w1" })],
      page: 2,
      perPage: 2,
      total: 3,
      totalPages: 2,
    });
  });

  it("finds a webhook by id", async () => {
    await seedWebhook();

    await expect(service.findById(WEBHOOK_ID)).resolves.toMatchObject({ id: WEBHOOK_ID });
  });

  it("throws when webhook is missing", async () => {
    await expect(service.findById(MISSING_WEBHOOK_ID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("compiles blueprint mappings", () => {
    expect(service.findAndReplaceMappings({ event: { type: "created" } }, '{"kind":"$event.type"}')).toEqual({
      kind: "created",
    });
  });

  it("updates webhook", async () => {
    await seedWebhook();

    await expect(service.update(WEBHOOK_ID, { name: UPDATED_WEBHOOK_NAME })).resolves.toMatchObject({
      id: WEBHOOK_ID,
      name: UPDATED_WEBHOOK_NAME,
    });
  });

  it("throws when update returns nothing", async () => {
    await expect(service.update(MISSING_WEBHOOK_ID, { name: UPDATED_WEBHOOK_NAME })).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it("deletes webhook", async () => {
    await seedWebhook();

    await expect(service.delete(WEBHOOK_ID)).resolves.toMatchObject({ id: WEBHOOK_ID });
  });

  it("checks existence", async () => {
    await seedWebhook();

    await expect(service.exists(WEBHOOK_ID)).resolves.toBe(true);
    await expect(service.exists(MISSING_WEBHOOK_ID)).resolves.toBe(false);
  });
});
