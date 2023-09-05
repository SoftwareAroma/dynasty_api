import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import {EmployeeService} from "@employee/employee.service";
import {CreateEmployeeInput} from "@employee/dto/employee.input.dto";
import {GEmployee} from "@employee/model/employee.model";
import {UpdateEmployeeInput} from "@employee/dto/update.input.dto";
import {CreateAttendanceInput} from "@employee/dto/attendance.input.dto";
import {UpdateAttendanceInput} from "@employee/dto/attendance.update.dto";
import {GAttendance} from "@employee/model/attendance.model";
import {IAttendance} from "@employee/interface/attendance.interface";
import {IEmployee} from "@employee/interface/employee.interface";
import {UseGuards} from "@nestjs/common";
import {GqlAuthGuard} from "@common/guards";
import {CheckPolicies, PoliciesGuard} from "@common";
import {
    DeleteEmployeePolicyHandler, UpdateCustomerPolicyHandler,
    UpdateEmployeePolicyHandler,
} from "@shared/casl/handler/policy.handler";
import {PubSub} from "graphql-subscriptions";
import {Employee as EmployeeModel} from "@prisma/client";
import {FileUpload, GraphQLUpload} from "graphql-upload";

/// pub sub
const pubSub : PubSub = new PubSub();

@Resolver(() => GEmployee)
export class EmployeeResolver {
    constructor(
        private readonly employeeService: EmployeeService,
    ) {}

    /// create employee
    @Mutation(() => GEmployee, {name: 'createEmployee'})
    // @UseGuards(GqlAuthGuard, PoliciesGuard)
    // @CheckPolicies(new CreateEmployeePolicyHandler())
    async createEmployee(
        @Args('createEmployeeInput') createEmployeeInput: CreateEmployeeInput,
    ) : Promise<IEmployee> {
        return await this.employeeService.createEmployee(createEmployeeInput);
    }

    /// get employees
    @Query(() => GEmployee, {name: 'getEmployees'})
    async getEmployees() : Promise<IEmployee[]> {
        return await this.employeeService.getEmployees();
    }

    /// get employee
    @Query(() => GEmployee, {name: 'getEmployee'})
    async getEmployee(
        @Args('id') id: string,
    ) : Promise<IEmployee> {
        return await this.employeeService.getEmployeeById(id);
    }

    /// update employee
    @Mutation(() => GEmployee, {name: 'updateEmployee'})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateEmployeePolicyHandler())
    async updateEmployee(
        @Args('id') id: string,
        @Args('updateEmployeeInput') updateEmployeeInput: UpdateEmployeeInput,
    ) : Promise<IEmployee> {
        const employee : EmployeeModel = await this.employeeService.updateEmployee(id, updateEmployeeInput);
        await pubSub.publish('employeeUpdated', {employeeUpdated: employee});
        return employee;
    }

    /// update avatar
    @Mutation(() => Boolean, {name: 'updateEmployeeAvatar'})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateEmployeePolicyHandler())
    async updateEmployeeAvatar(
        @Args('id') id: string,
        @Args('avatar', { type: () => GraphQLUpload }) avatar: FileUpload,
    ): Promise<boolean> {
        const _employee : boolean = await this.employeeService.updateEmployeeAvatar(id, avatar);
        await pubSub.publish('employeeAvatarUpdated', {userUpdated: _employee});
        return _employee;
    }

    /// update customer -> delete avatar
    @Mutation(() => Boolean, {name: "deleteEmployeeAvatar"})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new UpdateCustomerPolicyHandler())
    async deleteAvatar(
        @Args('id') id: string,
    ): Promise<boolean> {
        const _employee : boolean = await this.employeeService.deleteEmployeeAvatar(id);
        await pubSub.publish('employeeAvatarUpdated', {userUpdated: _employee});
        return _employee;
    }

    /// clock in employee
    @Mutation(() => GEmployee, {name: 'createAttendance'})
    async clockInEmployee(
        @Args('id') id: string,
        @Args('clockInInput') clockInInput: CreateAttendanceInput,
    ) : Promise<IEmployee> {
        const employee: EmployeeModel = await this.employeeService.clockIn(id, clockInInput);
        await pubSub.publish('employeeUpdated', {employeeUpdated: employee});
        return employee;
    }

    /// clock out employee
    @Mutation(() => GEmployee, {name: 'updateAttendance'})
    async clockOutEmployee(
        @Args('employeeId') employeeId: string,
        @Args('attendanceId') attendanceId: string,
        @Args('clockOutInput') clockOutInput: UpdateAttendanceInput,
    ) : Promise<IEmployee> {
        const employee: EmployeeModel = await this.employeeService.clockOut(employeeId, attendanceId, clockOutInput);
        await pubSub.publish('employeeUpdated', {employeeUpdated: employee});
        return employee;
    }

    /// get attendance
    @Query(() => GAttendance, {name: 'getAllAttendance'})
    async getAllAttendance() : Promise<IAttendance[]> {
        return await this.employeeService.getAttendance();
    }

    /// get attendance by id
    @Query(() => GAttendance, {name: 'getAttendance'})
    async getAttendance(
        @Args('id') id: string,
    ) : Promise<IAttendance> {
        return await this.employeeService.getAttendanceById(id);
    }


    /// delete employee
    @Mutation(() => Boolean, {name: 'deleteEmployee'})
    @UseGuards(GqlAuthGuard, PoliciesGuard)
    @CheckPolicies(new DeleteEmployeePolicyHandler())
    async deleteEmployee(
        @Args('id') id: string,
    ) : Promise<boolean> {
        const result:boolean = await this.employeeService.deleteEmployee(id);
        await pubSub.publish('employeeDeleted', {employeeDeleted: result});
        return result;
    }
}
