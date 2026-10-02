const Redis = require('ioredis');

const redis = new Redis(
    {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        db: process.env.REDIS_DB_OTP,
        retryDelayOnFailover: process.env.REDIS_RETRY_DELAY,
        maxRetriesPerRequest: process.env.REDIS_RETRY_COUNT,
    }
)

redis.on('connect', () => { console.log('Redis connected') });
redis.on('error', (err) => { console.error('Redis error:', err) });

module.exports = redis;
