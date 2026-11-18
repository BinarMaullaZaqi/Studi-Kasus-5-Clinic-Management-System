import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID('4', { message: 'patient_id harus berupa UUID versi 4 yang valid' })
  @IsNotEmpty()
  patient_id: string;

  @IsUUID('4', { message: 'doctor_id harus berupa UUID versi 4 yang valid' })
  @IsNotEmpty()
  doctor_id: string;

  @IsDateString(
    {},
    {
      message:
        'appointment_date harus berformat ISO 8601, contoh: 2026-11-20T09:00:00Z',
    },
  )
  @IsNotEmpty()
  appointment_date: string;
}
