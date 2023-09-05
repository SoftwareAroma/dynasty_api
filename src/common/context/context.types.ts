import { Request, Response } from "express";
import { Admin as AdminModel, Customer as CustomerModel } from "@prisma/client";

type Ctx = {
    req: Request & {
        User?: Pick<AdminModel | CustomerModel, 'id' | 'email' | 'firstName' | 'lastName'>
    };
    res: Response;
};

export default Ctx;
