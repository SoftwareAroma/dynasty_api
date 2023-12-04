import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CloudinaryService } from '@shared/cloudinary/cloudinary.service';
import {
  Employee as EmployeeModel,
  Attendance as AttendanceModel,
} from '@prisma/client';
import { CreateAttendanceDto, CreateEmployeeDto } from './dto/create.dto';
import { UpdateAttendanceDto, UpdateEmployeeDto } from './dto/update.dto';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly configService: ConfigService,
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) { }

  async createEmployee(
    employeeDto: CreateEmployeeDto,
    file: Express.Multer.File,
  ): Promise<EmployeeModel> {
    const _employee = await this.prismaService.employee.create({
      data: employeeDto,
      include: {
        attendance: true,
      }
    });
    if (file != null) {
      await this.updateEmployeeAvatar(_employee.id, file);
    }
    return _employee;
  }

  /// update the avatar of customer
  async updateEmployeeAvatar(
    id: string,
    file: Express.Multer.File,
  ): Promise<boolean> {
    // check if user exist
    await this.getOneEmployee(id);

    const _uploadFile = await this.cloudinaryService.uploadFile(
      file,
      `${file.originalname?.split('.')[0]}`,
      'dynasty/employee/avatar',
      'dynasty_employee_avatar',
    );

    const employee = await this.prismaService.employee.update({
      where: {
        id: id,
      },
      data: {
        avatar: _uploadFile,
      },
      include: {
        attendance: true,
      }
    });
    return !!employee;
  }

  /// delete the customer avatar
  async deleteEmployeeAvatar(id: string): Promise<boolean> {
    /// check if user exist
    await this.getOneEmployee(id);

    const _avatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

    const saved = await this.prismaService.customer.update({
      where: { id: id },
      data: {
        avatar: _avatar,
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
    /// check if user exist
    await this.getOneEmployee(id);

    return this.prismaService.employee.update({
      where: { id: id },
      data: updateEmployeeDto,
        include: {
            attendance: true,
        },
    });
  }

  async getEmployeeById(id: string): Promise<EmployeeModel> {
    return await this.getOneEmployee(id);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    /// check if user exist
    await this.getOneEmployee(id);

    const _deleted = await this.prismaService.employee.delete({
      where: { id: id },
    });

    return !!_deleted;
  }

  // Attendance
  async clockIn(
    id: string,
    attendanceDto: CreateAttendanceDto,
  ): Promise<EmployeeModel> {
    /// check if user exist
    await this.getOneEmployee(id);

    return this.prismaService.employee.update({
      where: { id: id },
      data: {
        attendance: {
          create: attendanceDto,
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
    /// check if user and attendance exist
    await this.getOneEmployee(employeeId);
    await this.getAttendanceById(employeeId);

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
  async getAttendance(): Promise<Array<AttendanceModel>> {
    return this.prismaService.attendance.findMany({
      include: {
        employee: true,
      },
    });
  }

  async getAttendanceById(id: string): Promise<AttendanceModel> {
    if (id == null) {
      throw new HttpException('No record found for attendance', HttpStatus.BAD_REQUEST);
    }

    const attendance = await this.prismaService.attendance.findUnique({
      where: { id: id },
      include: {
        employee: true,
      },
    });

    if (!attendance) {
      throw new HttpException("Attendance does't exist", HttpStatus.NOT_FOUND);
    }

    return attendance;
  }

  private async getOneEmployee(id: string): Promise<EmployeeModel> {
    if (id == null) {
      throw new HttpException('No record found for user', HttpStatus.BAD_REQUEST);
    }
    const _employee = await this.prismaService.employee.findUnique({
      where: { id: id },
      include: {
        attendance: true,
      }
    });
    if (!_employee) {
      throw new HttpException('No record found for user', HttpStatus.NOT_FOUND);
    }
    return _employee;
  }
}
