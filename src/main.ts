import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let port = 3000;
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  port = process.env.APPLICATION_PORT ? +process.env.APPLICATION_PORT : port;
  await app.listen(port);
}

bootstrap()
  .then(() => console.log(`Server is running on port ${port}`))
  .catch((err) => console.error(err));
