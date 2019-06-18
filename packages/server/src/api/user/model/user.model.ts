import { arrayProp, prop, Typegoose } from 'typegoose';

export enum UserRole {
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN',
}

export class User extends Typegoose {
  @prop({ required: true })
  firstName: string;

  @prop({ required: true })
  lastName: string;

  @prop({ required: true, unique: true })
  email: string;

  @prop({ required: true })
  password: string;

  @arrayProp({
    items: String,
    enum: UserRole,
    default: [UserRole.USER],
  })
  roles: UserRole[] = [UserRole.USER];

  /**
   * Mapped by mongoose
   */
  createdAt: Date;
  updatedAt: Date;
}

export const USER_PUBLIC_FIELDS = {
  email: 1,
  roles: 1,
};

export const USER_SECURE_FIELDS = {
  email: 1,
  roles: 1,
  password: 1,
};