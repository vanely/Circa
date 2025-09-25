import { createApp } from './app';
import config from './config';

const start = async () => {
  const app = await createApp();

  try {
    await app.listen({ 
      port: config.port,
      host: config.host 
    });
    
    app.log.info(`Server is running on http://${config.host}:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
