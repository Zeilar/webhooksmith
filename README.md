# Webhooksmith

Webhooksmith receives incoming webhook payloads, transforming them with a JSON blueprint, and forwards the transformed payload to a destination webhook URL.

## Setup

I recommend always using the latest version of `docker-compose.yml` as your guideline.
```yml
services:
  db:
    image: postgres:16-alpine
    container_name: webhooksmith_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: webhooksmith
      POSTGRES_USER: webhooksmith
      POSTGRES_PASSWORD: password # Change me
    ports:
      - 5432:5432
    volumes:
      # I recommend using an absolute path on the host, and that you back that directory up.
      - ./data:/var/lib/postgresql/data
    networks:
      - webhooksmith_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U webhooksmith -d webhooksmith"]
      interval: 5s
      timeout: 5s
      retries: 20
  api:
    image: ghcr.io/zeilar/webhooksmith-api:latest
    container_name: webhooksmith_api
    restart: unless-stopped
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: webhooksmith
      DB_USER: webhooksmith
      DB_PASSWORD: password # Change me
      DB_LOGGING: true
      LOG_LEVEL: verbose
      PORT: 3030
      HOST: 0.0.0.0
      ALLOWED_ORIGINS: web,webhooksmith.angelin.foo
      COOKIE_DOMAIN: .angelin.foo # I recommend using a dot prefix if you use subdomains.
      SESSION_TTL: 604800000 # 7 days
      SWAGGER_ENABLED: true
      SWAGGER_PATH: /docs
      INITIAL_USERNAME: admin
      INITIAL_PASSWORD: password
    # Set up tables etc if they don't exist, I recommend letting the CLI do this.
    # You may remove this whole line after the initial setup, if not then be sure to backup data in case of updates.
    command: sh -c "pnpm db:migrate && node dist/main"
    ports:
      - 3030:3030
    depends_on:
      db:
        condition: service_healthy
    networks:
      - webhooksmith_network
  web:
    image: ghcr.io/zeilar/webhooksmith-web:latest
    container_name: webhooksmith_web
    restart: unless-stopped
    environment:
      WEB_URL: https://webhooksmith.angelin.foo # Optional for SEO
      API_URL: http://webhooksmith-api:3030 # The web server will use this URL for API requests.
      SOCKET_URL: ws://webhooksmith-api:3030 # Same as above. Socket is mandatory for the intercept feature to work.
    ports:
      - 3000:3000
    depends_on:
      - api
    networks:
      - webhooksmith_network

networks:
  webhooksmith_network:
    name: webhooksmith_network
    external: false
```

## Workflow

* Start by creating the original webhook.

* Create a webhook in Webhooksmith.

* There is an interception URL that you can temporarily update your original webhook to.

* Fire your original webhook, doesn't matter how. You should immediately see the payload in the Webhooksmith tab. Don't worry, the request stops there.

Now you're at a point where you can see what the incoming payload would look like. Now you can use that structure to map the outgoing payload in whatever form you choose.

Whether you want to exclude fields, format things differently, Webhooksmith helps in these niche cases and lets you take control over your apps' webhook payloads. It's rare in my experience that an app allows you do customize the webhook payloads.

## Blueprint example

Incoming payload:
```json
{
  "event": "user.created",
  "data": {
    "user": {
      "id": "u_123",
      "email": "john@example.com"
    }
  }
}
```

Blueprint:
```json
{
  "type": "$event",
  "user_id": "$data.user.id",
  "email": "$data.user.email",
  "static_value": "hello"
}
```

Transformed output:
```json
{
  "type": "user.created",
  "user_id": "u_123",
  "email": "john@example.com",
  "static_value": "hello"
}
```

## Notes

### Database
* Currently only Postgres is supported. I don't plan on adding more support unless a lot of people use this app, and you can give good arguments for it.

* Keep in mind this is an ongoing project and I can't guarantee that version bumps will be smooth. Always back up your database before updating this app. If the migrate script fails for whatever reason, you may try changing `db:migrate` to `db:push` in the API image command.

### Authentication & security
* The app uses session cookies for authentication, and they're stored in the database. It's used as a single user system, that authenticates with username and password. I don't plan on adding support for external providers or email functionality.

* All requests are E2E between the servers. So you may hide your API behind a proxy, so long as the frontend server can reach the API_URL endpoint. But I cannot guarantee that SSL will work if you use secure protocols for the API URL, I've only tested it with my personal Nginx setup.

* If you forget your credentials, don't worry. Simply use the `INITIAL_USERNAME` and `INITIAL_PASSWORD` environment variables, and it'll delete all users and insert a new one with those credentials. Nothing except sessions is bound to a user, so the only effect will be that you need to log in again (which you would anyway as it's a new user). The rest of the app will be unaffected by this.

* The app doesn't handle certificates or anything of the like. It's up to you to use a proxy or whatever else.

* If you choose to enable Swagger, you must be aware that it's not protected. The API routes are, and you still need a valid session cookie in Swagger to make requests, but the Swagger dashboard itself is not protected.

* The app currently has no backup functionality, it's up to you to back your database up. But I may consider adding database backups in a future release.

## Final words
This is a niche app, and I half the reason I built this was to try some new things and stay up to date. I'd be happy for feedback, and feel free to open issues. I can't promise I'll resolve them quickly, but I'll do my best to maintain this little app.

Know that I built the app mostly for myself, and figured it'd be cool to share it with others as I couldn't find an existing app for this solution. If there are, I don't mind you using those instead.
