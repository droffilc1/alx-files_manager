import sha1 from 'sha1';
import dbClient from '../utils/db';

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    // Check if the email already exists
    const user = await dbClient.db.collection('users').findOne({ email });

    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Insert the new user into the database
    try {
      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: hashedPassword,
      });

      const newUser = {
        email: result.ops[0].email,
        id: result.insertedId,
      };
      res.status(201).json(newUser);
    } catch (err) {
      res.status(500).json(err);
    }
  }

  static async getMe(req, res) {
    const { user } = req;

    if (!user) {
      res.status(200).json({ email: user.email, id: user._id.toString() });
    }
  }
}
