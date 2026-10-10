import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: +configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USERNAME', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', ''),
        database: configService.get('DATABASE_NAME', 'dietandwell'),
        entities: [User, BlogPost, Category, Tag, Product, ProductCategory, Order, OrderItem, Cart, CartItem, Subscription, Service, Calculator, ContactInquiry, Metric, CalculatorResult],
        synchronize: true, // Set to false in production
        logging: true,
      }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
