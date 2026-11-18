import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
} from './entities/appointment.entity.js';
import { Patient } from '../patients/entities/patient.entity.js';
import { Doctor } from '../doctors/entities/doctor.entity.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(dto: CreateAppointmentDto) {
    const patient = await this.patientRepository.findOne({
      where: { id: dto.patient_id },
    });
    if (!patient) {
      throw new NotFoundException('Pasien tidak ditemukan');
    }

    const doctor = await this.doctorRepository.findOne({
      where: { id: dto.doctor_id },
      relations: { department: true },
    });
    if (!doctor) {
      throw new NotFoundException('Dokter tidak ditemukan');
    }

    const appointment = this.appointmentRepository.create({
      patient_id: dto.patient_id,
      doctor_id: dto.doctor_id,
      appointment_date: new Date(dto.appointment_date),
      status: AppointmentStatus.MENUNGGU,
    });

    return this.appointmentRepository.save(appointment);
  }

  findAll(filters?: {
    status?: string;
    doctor_id?: string;
    patient_id?: string;
  }) {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.doctor_id) {
      where.doctor_id = filters.doctor_id;
    }
    if (filters?.patient_id) {
      where.patient_id = filters.patient_id;
    }

    return this.appointmentRepository.find({
      where,
      relations: {
        patient: true,
        doctor: {
          department: true,
        },
        medical_record: true,
      },
      order: { appointment_date: 'DESC' },
    });
  }

  async findOne(id: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        patient: true,
        doctor: {
          department: true,
        },
        medical_record: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Janji temu tidak ditemukan');
    }

    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);

    if (dto.patient_id && dto.patient_id !== appointment.patient_id) {
      const patient = await this.patientRepository.findOne({
        where: { id: dto.patient_id },
      });
      if (!patient) {
        throw new NotFoundException('Pasien tidak ditemukan');
      }
      appointment.patient_id = dto.patient_id;
    }

    if (dto.doctor_id && dto.doctor_id !== appointment.doctor_id) {
      const doctor = await this.doctorRepository.findOne({
        where: { id: dto.doctor_id },
      });
      if (!doctor) {
        throw new NotFoundException('Dokter tidak ditemukan');
      }
      appointment.doctor_id = dto.doctor_id;
    }

    if (dto.appointment_date) {
      appointment.appointment_date = new Date(dto.appointment_date);
    }

    return this.appointmentRepository.save(appointment);
  }

  async updateStatus(id: string, dto: UpdateAppointmentStatusDto) {
    const appointment = await this.findOne(id);

    // Validasi aturan bisnis transisi status
    if (
      appointment.status === AppointmentStatus.SELESAI &&
      dto.status === AppointmentStatus.DIBATALKAN
    ) {
      throw new BadRequestException(
        'Janji temu yang sudah selesai tidak dapat dibatalkan',
      );
    }

    if (
      appointment.status === AppointmentStatus.DIBATALKAN &&
      dto.status === AppointmentStatus.SELESAI
    ) {
      throw new BadRequestException(
        'Janji temu yang sudah dibatalkan tidak dapat diselesaikan',
      );
    }

    appointment.status = dto.status;
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: string) {
    const appointment = await this.findOne(id);

    if (appointment.medical_record) {
      throw new ConflictException(
        'Janji temu tidak dapat dihapus karena sudah memiliki catatan kunjungan',
      );
    }

    await this.appointmentRepository.remove(appointment);
    return { message: 'Janji temu berhasil dihapus', deletedId: id };
  }
}
