import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsUUID('4', { message: 'patient_id harus berupa UUID versi 4 yang valid' })
  patient_id?: string;

  @IsOptional()
  @IsUUID('4', { message: 'doctor_id harus berupa UUID versi 4 yang valid' })
  doctor_id?: string;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'appointment_date harus berformat ISO 8601, contoh: 2026-11-20T09:00:00Z',
    },
  )
  appointment_date?: string;
}
