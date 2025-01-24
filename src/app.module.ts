import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';


const mongoUri = process.env.MONGO_URI;
const mongoDbName = process.env.MONGO_DB_NAME;

if (!mongoUri || !mongoDbName) {
  throw new Error('Las variables de entorno MONGO_URI y MONGO_DB_NAME deben estar definidas');
}

@Module({
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forRoot( mongoUri, {
      dbName: mongoDbName,
    }),

    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
