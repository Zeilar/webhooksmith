import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { Logger, ValidationPipe, type LogLevel } from "@nestjs/common";
import { UsersService } from "./users/users.service";
import { SettingsService } from "./settings/settings.service";

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

  // TODO: validate env variables at startup

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

  await app.get(SettingsService).get();

  await app.listen(PORT, process.env.WEB_HOST ?? "0.0.0.0");
  Logger.log(`Server running and listening at ${await app.getUrl()}`);
}

bootstrap().catch((error) => {
  Logger.fatal(`Server failed to start: ${JSON.stringify(error, null, 2)}`);
});
