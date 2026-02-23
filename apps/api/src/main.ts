import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { Logger, ValidationPipe, type LogLevel } from "@nestjs/common";
import { UsersService } from "./users/users.service";
import { SettingsService } from "./settings/settings.service";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { COOKIE_NAME } from "./auth/auth.config";

const PORT = process.env.PORT ?? 3030;
const LOG_LEVELS: LogLevel[] = ["error", "warn", "log", "debug", "verbose"];

function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().toLowerCase())
    .filter(Boolean);
}

function resolveLogLevels(level: LogLevel | undefined): LogLevel[] {
  const normalized = level?.toLowerCase() as LogLevel | undefined;
  const maxIndex = normalized ? LOG_LEVELS.indexOf(normalized) : -1;
  if (maxIndex === -1) {
    return ["error", "warn", "log"];
  }
  return LOG_LEVELS.slice(0, maxIndex + 1);
}

const initialUsername = process.env.INITIAL_USERNAME;
const initialPassword = process.env.INITIAL_PASSWORD;
const SWAGGER_PATH = process.env.SWAGGER_PATH?.trim() || "docs";

function isSwaggerEnabled(): boolean {
  if (process.env.SWAGGER_ENABLED) {
    return process.env.SWAGGER_ENABLED.toLowerCase() === "true";
  }
  return process.env.NODE_ENV !== "production";
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: resolveLogLevels(process.env.LOG_LEVEL),
    cors: {
      credentials: true,
      origin(origin, callback) {
        const allowedOrigins = getAllowedOrigins();
        // Requests from non-browser clients (curl/postman) have no origin header.
        if (!origin) {
          return callback(null, true);
        }
        const normalizedOrigin = origin.toLowerCase();
        const host = new URL(origin).hostname.toLowerCase();
        if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(host)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
      },
    },
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // The get method will seed the table if necessary.
  await app.get(SettingsService).get();

  if (isSwaggerEnabled()) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Webhooksmith API")
      .setDescription("HTTP API for managing webhook blueprints, users, auth sessions, and settings.")
      .setVersion("1.0")
      .addCookieAuth(COOKIE_NAME, undefined, "cookie")
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument, {
      swaggerOptions: { persistAuthorization: true },
    });
    Logger.log(`Swagger available at ${SWAGGER_PATH}`, "Bootstrap");
  } else {
    Logger.log("Swagger is disabled", "Bootstrap");
  }

  if (initialUsername && initialPassword) {
    const usersService = app.get(UsersService);
    if (await usersService.existsWithSameCredentials({ username: initialUsername, password: initialPassword })) {
      Logger.warn(
        "User with initial credentials already exists. You may change or remove these environment variables.",
        "Bootstrap",
      );
    } else {
      // Create user and remove any old ones. The app is meant to have a single admin user.
      // These initial credentials are only meant to be used the first time, or as recovery.
      Logger.log(
        `Initial credentials provided, upserting user. This will change the password if a user with ${initialUsername} exists.`,
        "Bootstrap",
      );
      const user = await usersService.findByUsername(initialUsername);
      if (user) {
        Logger.log(`Username: ${initialUsername} exists, updating password`, "Bootstrap");
        await usersService.update(user.id, { password: initialPassword });
      } else {
        Logger.log(`Username: ${initialUsername} available, truncating and seeding users table`, "Bootstrap");
        await usersService.deleteAll();
        await usersService.create({ username: initialUsername, password: initialPassword });
      }
    }
  }

  await app.listen(PORT, process.env.HOST ?? "0.0.0.0");
  Logger.log(`Server listening at ${await app.getUrl()}`, "Bootstrap");
}

bootstrap().catch((error) => {
  Logger.fatal(`Server failed to start: ${JSON.stringify(error, null, 2)}`, "Bootstrap");
});
