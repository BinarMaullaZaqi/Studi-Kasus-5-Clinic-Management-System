import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Patient])],
})
export class PatientsModule {}