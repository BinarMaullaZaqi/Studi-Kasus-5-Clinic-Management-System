import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PatientsModule } from './patients/patients.module.js';
import { DoctorsModule } from './doctors/doctors.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { MedicalRecordsModule } from './medical-records/medical-records.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: Number(configService.get('DB_PORT')) || 5433,
        username: configService.get<string>('DB_USERNAME') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || 'password123',
        database:
          configService.get<string>('DB_DATABASE') || 'clinic_management_db',
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),

    AuthModule,
    DepartmentsModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
