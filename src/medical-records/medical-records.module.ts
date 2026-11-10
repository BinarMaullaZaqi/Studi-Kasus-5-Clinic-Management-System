import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecord } from './entities/medical-record.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord])],
})
export class MedicalRecordsModule {}