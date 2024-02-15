import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: 'https://us1-evolving-flamingo-39523.upstash.io',
  token:process.env.REDIS_KEY!,
})