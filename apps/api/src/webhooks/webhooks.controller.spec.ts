import { Test, TestingModule } from "@nestjs/testing";
import { WebhooksController } from "src/webhooks/webhooks.controller";
import { WebhooksService } from "src/webhooks/webhooks.service";

describe("WebhooksController", () => {
  let webhooksController: WebhooksController;

  beforeEach(async () => {
    const webhooks: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [WebhooksService],
    }).compile();

    webhooksController = webhooks.get<WebhooksController>(WebhooksController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      // expect(webhooksController.getHello()).toBe("Hello World!");
    });
  });
});
