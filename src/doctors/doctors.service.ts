import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity.js';
import { Department } from '../departments/entities/department.entity.js';
import { CreateDoctorDto } from './dto/create-doctor.dto.js';
import { UpdateDoctorDto } from './dto/update-doctor.dto.js';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(dto: CreateDoctorDto) {
    const department = await this.departmentRepository.findOne({
      where: { id: dto.department_id },
    });

    if (!department) {
      throw new NotFoundException('Departemen tidak ditemukan');
    }

    const existingEmail = await this.doctorRepository.findOne({
      where: { email: dto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email dokter sudah digunakan');
    }

    const doctor = this.doctorRepository.create(dto);
    return this.doctorRepository.save(doctor);
  }

  findAll(departmentId?: string) {
    return this.doctorRepository.find({
      where: departmentId ? { department_id: departmentId } : {},
      relations: {
        department: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: {
        department: true,
        appointments: {
          patient: true,
        },
      },
    });

    if (!doctor) {
      throw new NotFoundException('Dokter tidak ditemukan');
    }

    return doctor;
  }

  async update(id: string, dto: UpdateDoctorDto) {
    const doctor = await this.findOne(id);

    if (dto.department_id && dto.department_id !== doctor.department_id) {
      const department = await this.departmentRepository.findOne({
        where: { id: dto.department_id },
      });

      if (!department) {
        throw new NotFoundException('Departemen tidak ditemukan');
      }
    }

    if (dto.email && dto.email !== doctor.email) {
      const existingEmail = await this.doctorRepository.findOne({
        where: { email: dto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email dokter sudah digunakan');
      }
    }

    Object.assign(doctor, dto);
    return this.doctorRepository.save(doctor);
  }

  async remove(id: string) {
    const doctor = await this.findOne(id);

    if (doctor.appointments && doctor.appointments.length > 0) {
      throw new ConflictException(
        'Dokter tidak dapat dihapus karena memiliki riwayat janji temu',
      );
    }

    await this.doctorRepository.remove(doctor);
    return { message: 'Dokter berhasil dihapus', deletedId: id };
  }
}
