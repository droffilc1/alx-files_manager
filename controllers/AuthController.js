import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64')
      .toString('ascii');
    const [email, password] = credentials.split(':');

    const hashedPassword = sha1(password);

    // Find the user associate to this email and with this password
    const user = await dbClient.db.collection('users').findOne({
      email, password: hashedPassword,
    });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a random string u(sing uuidv4) as token
    const token = uuidv4();

    // Create a token
    const key = `auth_${token}`;

    // Use key for storing in Redis the user ID for 24 hours
    await redisClient.set(key, user._id.toString(), 24 * 60 * 60); // 24 hours

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    await redisClient.del(key);
    return res.status(204).send();
  }
}
