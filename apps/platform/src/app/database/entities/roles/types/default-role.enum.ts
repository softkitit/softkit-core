/**
 * This role type is useful for default types that are not tenant specific
 * and default types that user can't be changed, but users can be assigned to them
 * */
export enum RoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  REGULAR_USER = 'REGULAR_USER',
}
