export class CreateAdminDto {
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  avatar?: string;
  roles?: string[];
  password: string;
  salt?: string;

}

