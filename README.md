# Project: 0x04. Files manager

This project is a summary of this back-end trimester: authentication, NodeJS, MongoDB, Redis, pagination and background processing.

The objective is to build a simple platform to upload and view files:

- User authentication via a token
- List all files
- Upload a new file
- Change permission of a file
- View a file
- Generate thumbnails for images

## Resources

#### Read or watch:

- [Node JS getting started](https://intranet.alxswe.com/rltoken/buFPHJYnZjtOrTd610j6Og)
- [Process API doc](https://intranet.alxswe.com/rltoken/uYPplj2cPK8pcP0LtV6RuA)
- [Express getting started](https://intranet.alxswe.com/rltoken/SujfeWKCWmUMomfETjETEg)
- [Mocha documentation](https://intranet.alxswe.com/rltoken/FzEwplmoZiyGvkgKllZNJw)
- [Nodemon documentation](https://intranet.alxswe.com/rltoken/pdNNTX0OLugbhxvP3sLgOw)
- [MongoDB](https://intranet.alxswe.com/rltoken/g1x7y_3GskzVAJBTXcSjmA)
- [Bull](https://intranet.alxswe.com/rltoken/NkHBpGrxnd0sK_fDPMbihg)
- [Image thumbnail](https://intranet.alxswe.com/rltoken/KX6cck2nyLpQOTDMLcwxLg)
- [Mime-Types](https://intranet.alxswe.com/rltoken/j9B0Kc-4HDKLUe88ShbOjQ)
- [Redis](https://intranet.alxswe.com/rltoken/nqwKRszO8Tkj_ZWW1EFwGw)

## Tasks

| Task                         | File                                                                                                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Redis utils               | [utils/redis.js](./utils/redis.js)                                                                                                                                           |
| 1. MongoDB utils             | [utils/db.js](./utils/db.js)                                                                                                                                                 |
| 2. First API                 | [server.js,routes/index.js,controllers/AppController.js](./server.js,./routes/index.js,controllers/AppController)                                                            |
| 3. Create a new user         | [utils/,routes/index.js,controllers/UsersController.js](./utils/,routes/index.js,controllers/UsersController.js)                                                             |
| 4. Authenticate a user       | [utils/,routes/index.js,controllers/UsersController.js,controllers/AuthController.js](./utils/,routes/index.js,controllers/UsersController.js,controllers/AuthController.js) |
| 5. First file                | [utils/,routes/index.js,controllers/FilesController.js](./utils/,routes/index.js,controllers/FilesController.js)                                                             |
| 6. Get and list file         | [utils/,routes/index.js,controllers/FilesController.js](./utils/,routes/index.js,controllers/FilesController.js)                                                             |
| 7. File publish/unpublish    | [utils/,routes/index.js,controllers/FilesController.js](./utils/,routes/index.js,controllers/FilesController.js)                                                             |
| 8. File data                 | [utils/,routes/index.js,controllers/FilesController.js](./utils/,routes/index.js,controllers/FilesController.js)                                                             |
| 9. Image Thumbnails          | [utils/,controllers/FilesController.js,worker.js](./utils/,controllers/FilesController.js,worker.js)                                                                         |
| 10. Tests!                   | [tests/](./tests/)                                                                                                                                                           |
| 11. New user - welcome email | [utils/,worker.js,controllers/UsersController.js](./utils/,worker.js,controllers/UsersController.js)                                                                         |
