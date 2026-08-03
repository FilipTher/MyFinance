import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { GoalsModule } from './goals/goals.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'finance.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    GoalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}