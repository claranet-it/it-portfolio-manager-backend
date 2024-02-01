# Fastify Serverless Spike SSO

Stack:
- [x] NodeJs
- [x] Fastify
- [x] Serverless Framework
- [x] Tap
- [x] Eslint
- [x] Prettier
- [x] Husky

## Commands

### Install DynamoDB local

```bash
npm run dynamodb:install
```

### Start serverless offline

Start serverless in offline mode (use only for development and testing purposes)

```bash
npm run offline
npm run dynamodb:start:dev
```

after that you can use the following command to stop dynamodb

```bash
npm run dynamodb:kill
```

You can open DynamoDB Admin UI using the command:

```bash
npm run dynamodb:admin
```

### Testing

Launch tests

```bash
npm run test
```

Launch tests with coverage

```bash
npm run test:coverage
```

Launch tests with filter

```bash
npm run test:filter --filter=<filter>
```

### Linting and Formatting

Check linting

```bash
npm run lint
```

Fix linting

```bash
npm run lint:fix
```

Format code

```bash
npm run format
```

### Pre-commit hook

```bash
npm run prepare
```

then copy the content of `pre-commit.dist` into `.husky/pre-commit`

## Use Cases

### Health Check

```bash
curl --location 'https://<app-url>/api/health/'
```

should return

```json
{
  "status": "ok"
}
```

## Swagger

You can find the swagger documentation at the following url:

```bash
https://<app-url>/api/documentation
```