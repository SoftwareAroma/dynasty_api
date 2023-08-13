export class ICustomer {
    id: string;
    social: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userName: string;
    phone?: string;
    avatar?: string;
    role: string;
    salt?: string;
    isAdmin?: boolean;
    cart?: [];
    createdAt?: Date;
    updatedAt?: Date;
}
