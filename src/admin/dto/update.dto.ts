import { PartialType } from '@nestjs/swagger';
import { CreateAdminDto } from '@admin/dto/create.dto';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {}
