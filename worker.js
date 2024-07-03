import Bull from 'bull';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

// Process fileQueue
fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  if (!dbClient.isAlive()) {
    throw new Error('Database is not connected');
  }

  const file = await dbClient.db.collection('files')
    .findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];
  const { localPath } = file;

  const thumbnailPromises = sizes.map(async (size) => {
    const options = { width: size };
    const thumbnail = await imageThumbnail(localPath, options);
    const thumbnailPath = `${localPath}_${size}`;
    fs.writeFileSync(thumbnailPath, thumbnail);
  });

  await Promise.all(thumbnailPromises);
});

fileQueue.on('completed', (job) => {
  console.log(`Job completed with result ${job.returnValue}`);
});

fileQueue.on('failed', (job, err) => {
  console.log(`Job failed with error ${err.message}`);
});

// Process userQueue
userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  if (!dbClient.isAlive()) {
    throw new Error('Database is not connected');
  }

  const user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
});

userQueue.on('completed', (job) => {
  console.log(`Job completed with result ${job.returnValue}`);
});

userQueue.on('failed', (job, err) => {
  console.log(`Job failed with error ${err.message}`);
});

export default userQueue;
