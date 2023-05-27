import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.status = true;
    this.client.on('error', (error) => {
      console.error('Redis error:', error);
      this.status = false;
    });
    this.client.on('connect', () => {
      this.status = true;
    });
  }

  isAlive() {
    return this.status;
  }

  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  async set(key, value, duration) {
    await promisify(this.client.SETEX)
      .bind(this.client)(key, duration, value);
  }

  async del(key) {
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
