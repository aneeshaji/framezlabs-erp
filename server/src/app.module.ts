import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'path';
import * as fs from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { FinanceModule } from './finance/finance.module';
import { SettingsModule } from './settings/settings.module';
import { HRModule } from './hr/hr.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EnquiriesModule } from './enquiries/enquiries.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), 'server', '.env'),
        resolve(process.cwd(), '..', '.env'),
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        const jwtSecret = configService.get<string>('JWT_SECRET');

        console.log('--- Environment Check ---');
        console.log(`- MONGODB_URI: ${uri ? 'FOUND' : 'MISSING'}`);
        console.log(`- JWT_SECRET: ${jwtSecret ? 'FOUND' : 'MISSING'}`);
        console.log('-------------------------');

        if (!uri) {
          console.error('CRITICAL: MONGODB_URI is still missing. Check your .env file.');
        }

        return {
          uri: uri || 'mongodb://localhost:27017/framezlabs-erp',
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    TransactionsModule,
    OrdersModule,
    CustomersModule,
    FinanceModule,
    SettingsModule,
    HRModule,
    NotificationsModule,
    EnquiriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // This will run when the module is fully initialized
  }
}
