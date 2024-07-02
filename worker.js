import Bull from 'bull';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files')
    .findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];
  const { localPath } = file.localPath;

  for (const size of sizes) {
    const options = { width: size };
    const thumbnail = imageThumbnail(localPath, options);

    const thumbnailPath = `${localPath}_${size}`;
    fs.writeFileSync(thumbnailPath, thumbnail);
  }
});

fileQueue.on('completed', (job) => {
  console.log(`Job completed with result ${job.returnValue}`);
});

fileQueue.on('failed', (job, err) => {
  console.log(`Job failed with error ${err.message}`);
});
