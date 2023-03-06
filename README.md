# Backend Assessment

A secure and scalable RESTful API that allows users to create, read, update, and delete notes. The application also allow users to share their notes with other users and search for notes based on keywords.

It's based on [Nest](https://nestjs.com/), a framework for building efficient,
scalable Node.js server-side applications.

## [Running with Docker](#docker) *(recommended)*

This guide is designed to help you get up and running with this setup.

- First ensure you have [Docker](https://www.docker.com/get-started/) configured.
- Then start the environment with:

  ```sh
  $ docker compose up --build
  ```

  > 💡 Optionally, [install Tilt](https://docs.tilt.dev/install.html) and you can
  > start the services with:
  >
  >  ```sh
  >  $ tilt up
  >  ```
    and you can see the services state and logs on Tilt interface.

    Services included are
    - mongo
    - api (API docs address: [http://localhost:3000/api](http://localhost:3000/api))

## Development installation

- `Node.js >= 18` is required, along with `npm >= 9`.
- Install project dependencies:

  ```sh
  $ npm install
  ```

### Configuration

- Running on Docker Compose, a MongoDB database is included. [Read here](#docker).
  
- If you want to run the Node.js app elsewhere, provide this env vars (replacing "x"):

  ```sh
  $ export NODE_ENV=development
  $ export JWT_SECRET=x
  $ export DB_URL=x
  ```

### Running the app

```sh
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```sh
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
