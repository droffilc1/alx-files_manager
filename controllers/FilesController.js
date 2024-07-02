import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import mime from 'mime-types';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files')
        .findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? 0 : new ObjectId(parentId),
    };

    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const localPath = path.join(folderPath, uuidv4());
      const decodedData = Buffer.from(data, 'base64');

      try {
        fs.writeFileSync(localPath, decodedData);
        fileDocument.localPath = localPath;
      } catch (err) {
        console.error('Error writing file:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    try {
      const result = await dbClient.db.collection('files').insertOne(fileDocument);
      fileDocument.id = result.insertedId;

      return res.status(201).json(fileDocument);
    } catch (err) {
      console.error('Error inserting file into DB:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const file = await dbClient.db.collection('files')
      .findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { parentId = 0, page = 0 } = req.query;

    const pageSize = 20;
    const skip = page * pageSize;

    const files = await dbClient.db.collection('files').aggregate([
      { $match: { parentId: parentId === '0' ? 0 : new ObjectId(parentId), userId: new ObjectId(userId) } },
      { $skip: skip },
      { $limit: pageSize },
    ]).toArray();
    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const file = await dbClient.db.collection('files')
      .findOneAndUpdate(
        { _id: new ObjectId(id), userId: new ObjectId(userId) },
        { $set: { isPublic: true } },
        { returnOriginal: false },
      );

    if (!file.value) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(file.value);
  }

  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const file = await dbClient.db.collection('files')
      .findOneAndUpdate(
        { _id: new ObjectId(id), userId: new ObjectId(userId) },
        { $set: { isPublic: false } },
        { returnOriginal: false },
      );

    if (!file.value) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(file.value);
  }

  static async getFile(req, res) {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const file = await dbClient.db.collection('false').findOne({ _id: new ObjectId(id) });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    const token = req.headers['x-token'];
    const userId = token ? await redisClient.get(`auth_${token}`) : null;

    if (!file.isPublic) {
      if (!userId || !file.userId.equals(new ObjectId(userId))) {
        return res.status(404).json({ error: 'Not found' });
      }
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    if (!fs.existsSync(file.localPath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.lookup(file.name);
    res.setHeader('Content-Type', mimeType);

    return fs.createReadStream(file.localPath).pipe(res);
  }
}
