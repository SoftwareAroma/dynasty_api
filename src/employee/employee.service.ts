import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import {
  Employee as EmployeeModel,
  Attendance as AttendanceModel,
} from '@prisma/client';
import {uploadFile} from "@shared";
import {CreateAttendanceDto, CreateEmployeeDto} from "@employee/dto/create.dto";
import {UpdateAttendanceDto, UpdateEmployeeDto} from "@employee/dto/update.dto";

@Injectable()
export class EmployeeService {
  constructor(
    private prismaService: PrismaService,
  ) { }

  async createEmployee(
    employeeDto: CreateEmployeeDto,
    file?: Express.Multer.File,
  ): Promise<EmployeeModel> {
    const _employee : EmployeeModel = await this.prismaService.employee.create({
      data: employeeDto,
    });
    if (file != null) {
      // await this.updateEmployeeAvatar(_employee.id, file);
    }
    return _employee;
  }

  /// update the avatar of customer
  async updateEmployeeAvatar(
    id: string,
    file: Express.Multer.File,
  ): Promise<boolean> {
    const _uploadFile: string = await uploadFile(
      file,
      `${file.filename?.split('.')[0]}`,
      'dynasty/customer/avatar',
        'employee_avatar'
    );
    const _employee : EmployeeModel = await this.prismaService.employee.update({
      where: {
        id: id,
      },
      data: {
        avatar: _uploadFile,
      },
    });
    return !!_employee;
  }

  /// delete the customer avatar
  async deleteEmployeeAvatar(id: string): Promise<boolean> {
    const _customer : EmployeeModel = await this.prismaService.employee.findUnique({
      where: { id: id },
    });
    if (_customer != null) {
      _customer.avatar =
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
    }
    const saved: EmployeeModel = await this.prismaService.employee.update({
      where: { id: id },
      data: {
        avatar: _customer.avatar,
      },
    });
    return !!saved;
  }

  /// get all employees
  async getEmployees(): Promise<Array<EmployeeModel>> {
    return this.prismaService.employee.findMany({
      include: {
        attendance: true,
      },
    });
  }

  async updateEmployee(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeModel> {
    return this.prismaService.employee.update({
      where: { id: id },
      data: updateEmployeeDto,
    });
  }

  async getEmployeeById(id: string): Promise<EmployeeModel> {
    return this.prismaService.employee.findUnique({
      where: { id: id },
      include: {
        attendance: true,
      },
    });
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const _deleted: EmployeeModel = await this.prismaService.employee.delete({
      where: { id: id },
    });
    return !!_deleted;
  }

  // Attendance
  async clockIn(
    id: string,
    attendanceInput: CreateAttendanceDto,
  ): Promise<EmployeeModel> {
    return this.prismaService.employee.update({
      where: { id: id },
      data: {
        attendance: {
          create: attendanceInput,
        },
      },
      include: {
        attendance: true,
      },
    });
  }

  async clockOut(
    employeeId: string,
    attendanceId: string,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<EmployeeModel> {
    return this.prismaService.employee.update({
      where: { id: employeeId },
      data: {
        attendance: {
          update: {
            where: { id: attendanceId },
            data: updateAttendanceDto,
          },
        },
      },
      include: {
        attendance: true,
      },
    });
  }

  // get all attendance
  async getAttendance(): Promise<AttendanceModel[]> {
    const _attendance: AttendanceModel[] = await this.prismaService.attendance.findMany({
      include: {
        employee: true,
      },
    });
    if (_attendance == null) {
      return undefined
    }
    return _attendance;
  }

  async getAttendanceById(id: string): Promise<AttendanceModel> {
    return this.prismaService.attendance.findUnique({
      where: { id: id },
      include: {
        employee: true,
      },
    });
  }
}
