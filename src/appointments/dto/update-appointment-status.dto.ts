import { IsEnum, IsNotEmpty } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity.js';

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus, {
    message:
      'Status harus salah satu dari: menunggu, dikonfirmasi, selesai, dibatalkan',
  })
  @IsNotEmpty()
  status: AppointmentStatus;
}
