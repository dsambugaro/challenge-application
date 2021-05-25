# challenge-server

## Dependencies
- `mongodb 4.4.6`
- `npm 7.12.x`
- `nodejs 16.0.x`
> May work on other versions, but was not tested

To install npm depencencies, run:
```console
$ npm install
```

### Environment variables
This application uses the following environment variables:
```javascript
SECRET_KEY   // secret Key for JWT token generation
MONGODB_URI  // URL on which connects to MongoDB
PORT         // Port on which the server will listen
```

----

## Build
To build server, run:
```console
$ npm run build
```
The build result will be in `dist` folder.

----

## Development
To run server in development mode, run:
```console
$ npm start
```

### Run Linter
To run linter without auto fix:
```console
$ npm run lint
```

To run linter with auto fix:
```console
$ npm run lint-fix
```

### Run Tests
To run the tests:
```console
$ npm run test
```

To run the tests with coverage report:
```console
$ npm run test-coverage
```
