import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Department } from '../../departments/entities/department.entity.js';
import { Appointment } from '../../appointments/entities/appointment.entity.js';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'uuid' })
  department_id: string;

  @ManyToOne(() => Department, (department) => department.doctors, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'department_id' })
  department: Relation<Department>;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Relation<Appointment[]>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
