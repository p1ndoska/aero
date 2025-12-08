export type UserRole = 
  | 'SUPER_ADMIN'
  | 'NEWS_ADMIN' 
  | 'ABOUT_ADMIN'
  | 'SERVICES_ADMIN'
  | 'AIRNAV_ADMIN'
  | 'APPEALS_ADMIN'
  | 'SOCIAL_ADMIN'
  | 'MEDIA_ADMIN';

export interface RolePermissions {
  canManageRoles: boolean;
  canManageUsers: boolean;
  canManageNews: boolean;
  canManageAbout: boolean;
  canManageServices: boolean;
  canManageAirNav: boolean;
  canManageAppeals: boolean;
  canManageSocial: boolean;
  canManageMedia: boolean;
  canManageBranches: boolean;
  canManageManagement: boolean;
  canManageVacancies: boolean;
  canManageLogos: boolean;
  canManageHomePage: boolean;
}

export const getRolePermissions = (userRole: string | undefined): RolePermissions => {
  // Обрабатываем случай, когда роль может быть объектом
  const roleString = typeof userRole === 'string' ? userRole : userRole?.name || '';
  const role = roleString.toString().toUpperCase() as UserRole;
  
  // Отладочная информация отключена
  
  switch (role) {
    case 'SUPER_ADMIN':
      const superAdminPermissions = {
        canManageRoles: true,
        canManageUsers: true,
        canManageNews: true,
        canManageAbout: true,
        canManageServices: true,
        canManageAirNav: true,
        canManageAppeals: true,
        canManageSocial: true,
        canManageMedia: true,
        canManageBranches: true,
        canManageManagement: true,
        canManageVacancies: true,
        canManageLogos: true,
        canManageHomePage: true,
      };
      return superAdminPermissions;
    
    case 'NEWS_ADMIN':
      const newsAdminPermissions = {
        canManageRoles: false,
        canManageUsers: false,
        canManageNews: true,
        canManageAbout: false,
        canManageServices: false,
        canManageAirNav: false,
        canManageAppeals: false,
        canManageSocial: false,
        canManageMedia: false,
        canManageBranches: false,
        canManageManagement: false,
        canManageVacancies: false,
        canManageLogos: false,
        canManageHomePage: false,
      };
      return newsAdminPermissions;
    
    case 'ABOUT_ADMIN':
      return {
        canManageRoles: false,
        canManageUsers: false,
        canManageNews: false,
        canManageAbout: true,
        canManageServices: false,
        canManageAirNav: false,
        canManageAppeals: false,
        canManageSocial: false,
        canManageMedia: false,
        canManageBranches: true,
        canManageManagement: true,
        canManageVacancies: true,
        canManageLogos: false,
        canManageHomePage: false,
      };
    
    case 'SERVICES_ADMIN':
      return {
        canManageRoles: false,
        canManageUsers: false,
        canManageNews: false,
        canManageAbout: false,
        canManageServices: true,
        canManageAirNav: false,
        canManageAppeals: false,
        canManageSocial: false,
        canManageMedia: false,
        canManageBranches: false,
        canManageManagement: false,
        canManageVacancies: false,
        canManageLogos: false,
        canManageHomePage: false,
      };
    
    case 'AIRNAV_ADMIN':
      return {
        canManageRoles: false,
        canManageUsers: false,
        canManageNews: false,
        canManageAbout: false,
        canManageServices: false,
        canManageAirNav: true,
        canManageAppeals: false,
        canManageSocial: false,
        canManageMedia: false,
        canManageBranches: false,
        canManageManagement: false,
        canManageVacancies: false,
        canManageLogos: false,
        canManageHomePage: false,
      };
    
    case 'APPEALS_ADMIN':
      return {
        canManageRoles: false,
        canManageUsers: false,
        canManageNews: false,
        canManageAbout: false,
        canManageServices: false,
        canManageAirNav: false,
        canManageAppeals: true,
        canManageSocial: false,
        canManageMedia: false,
        canManageBranches: false,
        canManageManagement: false,
        canManageVacancies: false,
        canManageLogos: false,
        canManageHomePage: false,
      };
    
    case 'SOCIAL_ADMIN':
      return {
        canManageRoles: false,
        canManageUsers: false,
        canManageNews: false,
        canManageAbout: false,
        canManageServices: false,
        canManageAirNav: false,
        canManageAppeals: false,
        canManageSocial: true,
        canManageMedia: false,
        canManageBranches: false,
        canManageManagement: false,
        canManageVacancies: false,
        canManageLogos: true,
        canManageHomePage: false,
      };
    
    case 'MEDIA_ADMIN':
      return {
        canManageRoles: false,
        canManageUsers: false,
        canManageNews: false,
        canManageAbout: false,
        canManageServices: false,
        canManageAirNav: false,
        canManageAppeals: false,
        canManageSocial: false,
        canManageMedia: true,
        canManageBranches: false,
        canManageManagement: false,
        canManageVacancies: false,
        canManageLogos: false,
        canManageHomePage: true,
      };
    
    default:
      const defaultPermissions = {
        canManageRoles: false,
        canManageUsers: false,
        canManageNews: false,
        canManageAbout: false,
        canManageServices: false,
        canManageAirNav: false,
        canManageAppeals: false,
        canManageSocial: false,
        canManageMedia: false,
        canManageBranches: false,
        canManageManagement: false,
        canManageVacancies: false,
        canManageLogos: false,
        canManageHomePage: false,
      };
      return defaultPermissions;
  }
};

export const hasPermission = (userRole: string | undefined, permission: keyof RolePermissions): boolean => {
  // Обрабатываем случай, когда роль может быть объектом
  const roleString = typeof userRole === 'string' ? userRole : userRole?.name || '';
  const permissions = getRolePermissions(roleString);
  return permissions[permission];
};

export const canAccessAdminPanel = (userRole: string | undefined): boolean => {
  // Обрабатываем случай, когда роль может быть объектом
  const roleString = typeof userRole === 'string' ? userRole : userRole?.name || '';
  const role = roleString.toString().toUpperCase();
  const allowedRoles = [
    'SUPER_ADMIN',
    'NEWS_ADMIN',
    'ABOUT_ADMIN', 
    'SERVICES_ADMIN',
    'AIRNAV_ADMIN',
    'APPEALS_ADMIN',
    'SOCIAL_ADMIN',
    'MEDIA_ADMIN'
  ];
  const hasAccess = allowedRoles.includes(role || '');
  
  // Отладочная информация отключена
  
  return hasAccess;
};
