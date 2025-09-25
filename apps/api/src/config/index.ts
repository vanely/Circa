import 'dotenv/config';

interface Config {
  env: string;
  port: number;
  host: string;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  cloudflare: {
    accountId: string;
    r2Bucket: string;
    r2AccessKeyId: string;
    r2AccessKeySecret: string;
  };
}

// Load and validate environment variables
const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/circa',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'supersecret-dev-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true,
  },
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    r2Bucket: process.env.CLOUDFLARE_R2_BUCKET || 'circa',
    r2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    r2AccessKeySecret: process.env.CLOUDFLARE_R2_ACCESS_KEY_SECRET || '',
  },
};

// Validation for required config in production
if (config.env === 'production') {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CLOUDFLARE_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_SECRET',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Additional production validations
  if (config.jwt.secret === 'supersecret-dev-only') {
    throw new Error('Production requires a proper JWT_SECRET');
  }
}

export default config;
