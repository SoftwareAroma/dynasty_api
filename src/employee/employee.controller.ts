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
import { API_URI_VERSION, CheckPolicies, CreateEmployeePolicyHandler, DeleteEmployeePolicyHandler, JwtAuthGuard } from "@shared";
import { PoliciesGuard } from "@shared/secure/policy.guard";


@Controller({ path: 'employee', version: API_URI_VERSION })
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) { }

  /**
   * create an employee for the shop in the database
   * @param createEmployeeDto
   * @param file
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new CreateEmployeePolicyHandler())
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('create')
  async createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<EmployeeModel> {
    return this.employeeService.createEmployee(createEmployeeDto, file);
  }

  /**
   * get all employees from the database
   */
  @Get('employees')
  async getEmployees(): Promise<Array<EmployeeModel>> {
    return this.employeeService.getEmployees();
  }

  /**
   * get an employee by id
   * @param id
   */
  @Get('employee/:id')
  async getEmployeeById(@Param('id') id: string): Promise<EmployeeModel> {
    return this.employeeService.getEmployeeById(id);
  }

  /**
   * update an employee
   * @param updateEmployeeDto
   * @param id
   */
  @Patch('update/:id')
  updateEmployee(
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Param('id') id: string,
  ): Promise<EmployeeModel> {
    return this.employeeService.updateEmployee(id, updateEmployeeDto);
  }

  /**
   * clock in an employee at the beginning of a shift
   * @param id
   * @param createAttendanceDto
   */
  @Patch('clock-in/:id')
  async clockIn(
    @Param('id') id: string,
    @Body() createAttendanceDto: CreateAttendanceDto,
  ): Promise<EmployeeModel> {
    return this.employeeService.clockIn(id, createAttendanceDto);
  }

  /**
   * get all the attendance of employees
   */
  @Get('attendance')
  async getAttendance(): Promise<Array<AttendanceModel>> {
    return this.employeeService.getAttendance();
  }

  /**
   * get attendance with id
   * @param id
   */
  @Get('attendance/:id')
  async getAttendanceById(@Param('id') id: string): Promise<AttendanceModel> {
    return this.employeeService.getAttendanceById(id);
  }

  /**
   * clock out a user at the end of a shift
   * @param params
   * @param createAttendanceDto
   */
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

  /**
   * update the employee avatar
   * @param file
   * @param id
   */
  @Post('update-avatar/:id')
  @UseInterceptors(FileInterceptor('avatar'))
  updateEmployeeAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.employeeService.updateEmployeeAvatar(id, file);
  }

  /**
   * delete employee avatar
   * @param id
   */
  @Post('delete-avatar/:id')
  deleteEmployeeAvatar(@Param('id') id: string): Promise<boolean> {
    return this.employeeService.deleteEmployeeAvatar(id);
  }

  /**
   * delete admin
   * @param id
   */
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new DeleteEmployeePolicyHandler())
  @Delete('delete/:id')
  deleteEmployee(@Param('id') id: string): Promise<boolean> {
    return this.employeeService.deleteEmployee(id);
  }
}
