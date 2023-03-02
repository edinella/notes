import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesModule } from './notes/notes.module';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

const ThrottlerProvider = { provide: APP_GUARD, useClass: ThrottlerGuard };

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({ ttl: 60, limit: 30 }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    NotesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [ThrottlerProvider, UsersService],
})
export class AppModule {}
