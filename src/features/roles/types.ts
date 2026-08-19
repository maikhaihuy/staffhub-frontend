/**
 * Minimal Role type (RoleResponseDto) - only what the users form's role
 * dropdown needs. Full roles CRUD is a separate, not-yet-migrated feature.
 */
export type Role = {
  id: number;
  name: string;
};
