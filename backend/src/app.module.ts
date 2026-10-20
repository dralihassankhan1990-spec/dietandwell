import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { ProductsModule } from './products/products.module';
import { ServicesModule } from './services/services.module';
import { ContactModule } from './contact/contact.module';
import { CartModule } from './cart/cart.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { CalculatorsModule } from './calculators/calculators.module';
import { MetricsModule } from './metrics/metrics.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { CategoriesModule } from './categories/categories.module';
import { DigitalOrdersModule } from './digital-orders/digital-orders.module';
import { SettingsModule } from './settings/settings.module';
import { PaymentsModule } from './payments/payments.module';
import { StudioModule } from './diet-plan-studio/studio.module';
import {
  User,
  BlogPost,
  Category,
  Tag,
  Product,
  ProductCategory,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Subscription,
  Service,
  Calculator,
  ContactInquiry,
  Metric,
  CalculatorResult,
  Subscriber,
  DigitalOrder,
  Setting,
} from './entities';

@Module({
  imports: [
    StudioModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const base = {
          type: 'postgres' as const,
          entities: [
            User,
            BlogPost,
            Category,
            Tag,
            Product,
            ProductCategory,
            Order,
            OrderItem,
            Cart,
            CartItem,
            Subscription,
            Service,
            Calculator,
            ContactInquiry,
            Metric,
            CalculatorResult,
            Subscriber,
            DigitalOrder,
            Setting,
          ],
          // Never auto-alter the schema in production; use migrations there.
          synchronize: !isProduction,
          // Query parameters can contain password hashes and refresh tokens.
          // Keep SQL logging off unless a developer explicitly opts in.
          logging: configService.get('DATABASE_LOGGING') === 'true',
        };
        if (databaseUrl) {
          // Single-URL config (Railway / Neon / hosted Postgres) wins.
          return {
            ...base,
            url: databaseUrl,
            ssl:
              configService.get('DATABASE_SSL') === 'true'
                ? { rejectUnauthorized: false }
                : false,
          };
        }
        return {
          ...base,
          host: configService.get<string>('DATABASE_HOST', 'localhost'),
          port: configService.get<number>('DATABASE_PORT', 5432),
          username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
          password: configService.get<string>('DATABASE_PASSWORD', ''),
          database: configService.get<string>('DATABASE_NAME', 'dietandwell'),
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    BlogModule,
    ProductsModule,
    ServicesModule,
    CalculatorsModule,
    MetricsModule,
    ContactModule,
    CartModule,
    UsersModule,
    UploadModule,
    NewsletterModule,
    CategoriesModule,
    DigitalOrdersModule,
    SettingsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
