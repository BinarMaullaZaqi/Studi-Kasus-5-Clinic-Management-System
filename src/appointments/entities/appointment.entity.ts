
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Patient } from '../../patients/entities/patient.entity.js';
import { Doctor } from '../../doctors/entities/doctor.entity.js';
import { MedicalRecord } from '../../medical-records/entities/medical-record.entity.js';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.appointments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Relation<Patient>;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Relation<Doctor>;

  @Column({ type: 'timestamp' })
  appointment_date: Date;

  @Column({
    length: 20,
    default: 'menunggu',
  })
  status: string;

  @OneToOne(() => MedicalRecord, (record) => record.appointment)
  medical_record: Relation<MedicalRecord>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
