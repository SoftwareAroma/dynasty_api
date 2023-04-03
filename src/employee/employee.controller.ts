import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateAttendanceDto, CreateEmployeeDto } from './dto/create.dto';
import {
  Employee as EmployeeModel,
  Attendance as AttendanceModel,
} from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateEmployeeDto } from './dto/update.dto';
import { PoliciesGuard } from '@common/guards/policies.guard';
import { CheckPolicies, JwtAuthGuard } from '@common';
import {
  CreateEmployeePolicyHandler,
  DeleteEmployeePolicyHandler,
} from '@casl/handler/policy.handler';

@Controller({ path: 'employee', version: '1' })
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // @UseGuards(PoliciesGuard)
  // @CheckPolicies(new CreateEmployeePolicyHandler())
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('create')
  async createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<EmployeeModel> {
    return this.employeeService.createEmployee(createEmployeeDto, file);
  }

  @Get('employees')
  async getEmployees(): Promise<Array<EmployeeModel>> {
    return this.employeeService.getEmployees();
  }

  @Get('employee/:id')
  async getEmployeeById(@Param('id') id: string): Promise<EmployeeModel> {
    return this.employeeService.getEmployeeById(id);
  }

  @Patch('update/:id')
  updateEmployee(
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Param('id') id: string,
  ): Promise<EmployeeModel> {
    return this.employeeService.updateEmployee(id, updateEmployeeDto);
  }

  @Patch('clock-in/:id')
  async clockIn(
    @Param('id') id: string,
    @Body() createAttendanceDto: CreateAttendanceDto,
  ): Promise<EmployeeModel> {
    return this.employeeService.clockIn(id, createAttendanceDto);
  }

  @Get('attendance')
  async getAttendance(): Promise<Array<AttendanceModel>> {
    return this.employeeService.getAttendance();
  }

  @Get('attendance/:id')
  async getAttendanceById(@Param('id') id: string): Promise<AttendanceModel> {
    return this.employeeService.getAttendanceById(id);
  }

  @Patch('clock-out/:id/:attendanceId')
  async clockOut(
    @Param() params: { id: string; attendanceId: string },
    @Body() createAttendanceDto: CreateAttendanceDto,
  ): Promise<EmployeeModel> {
    return this.employeeService.clockOut(
      params.id,
      params.attendanceId,
      createAttendanceDto,
    );
  }

  @Post('update-avatar/:id')
  @UseInterceptors(FileInterceptor('avatar'))
  updateEmployeeAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.employeeService.updateEmployeeAvatar(id, file);
  }

  @Post('delete-avatar/:id')
  deleteEmployeeAvatar(@Param('id') id: string): Promise<boolean> {
    return this.employeeService.deleteEmployeeAvatar(id);
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(new DeleteEmployeePolicyHandler())
  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  deleteEmployee(@Param('id') id: string): Promise<boolean> {
    return this.employeeService.deleteEmployee(id);
  }
}
