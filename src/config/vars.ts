import * as dotenv from 'dotenv'

dotenv.config()

export const config: {
  PORT: number
  MONGO_URI: string

} = {
  PORT: Number(process.env.PORT) || 8080,
  MONGO_URI: process.env.MONGO_URI || '',
}
