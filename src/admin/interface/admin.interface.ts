export class IAdmin {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userName?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    salt?: string;
    isAdmin?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
