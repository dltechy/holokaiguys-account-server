# holokaiguys Account Server

A centralized account server for holokaiguy apps.

## Installation

```bash
$ pnpm install
```

- Copy the `.env.example` file:
  - To a new `.env` file for development, and just general running of the application
  - To a new `.env.test` file for testing
- Modify each `.env` file as needed

## Database

```bash
# generate prisma client to work with imports
$ pnpm run db:generate

# run existing migration scripts
$ pnpm run db:migrate

# create and run new migration scripts
$ pnpm run db:migrate:dev

# create new migration scripts without running
$ pnpm run db:migrate:dev:createonly

# reset database
# warning: this will delete all data
$ pnpm run db:reset

# create super admin account
$ pnpm run db:create:superadmin
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# database tests
$ pnpm run test:db

# all tests
$ pnpm run test:all

# unit test coverage
$ pnpm run test:cov

# database test coverage
$ pnpm run test:cov:db

# all tests coverage
$ pnpm run test:cov:all
```
