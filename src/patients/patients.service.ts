import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from './entities/patient.entity.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(dto: CreatePatientDto) {
    const patient = this.patientRepository.create(dto);
    return this.patientRepository.save(patient);
  }

  findAll(search?: string) {
    if (search) {
      return this.patientRepository.find({
        where: [
          { name: Like(`%${search}%`) },
          { phone: Like(`%${search}%`) },
        ],
        order: { created_at: 'DESC' },
      });
    }

    return this.patientRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: {
        appointments: {
          doctor: {
            department: true,
          },
          medical_record: true,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Pasien tidak ditemukan');
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.findOne(id);
    Object.assign(patient, dto);
    return this.patientRepository.save(patient);
  }

  async remove(id: string) {
    const patient = await this.findOne(id);

    if (patient.appointments && patient.appointments.length > 0) {
      throw new ConflictException(
        'Pasien tidak dapat dihapus karena memiliki riwayat janji temu',
      );
    }

    await this.patientRepository.remove(patient);
    return { message: 'Pasien berhasil dihapus', deletedId: id };
  }
}
