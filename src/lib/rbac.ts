import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return user;
}

export async function requireRole(role: Role) {
  const user = await requireAuth();

  if (user.role !== role) {
    redirect("/auth/error?error=unauthorized");
  }

  return user;
}

export async function requireMinimumRole(minimumRole: Role) {
  const user = await requireAuth();

  const roleHierarchy = {
    VIEWER: 0,
    EDITOR: 1,
    OWNER: 2,
  };

  const userRoleLevel = roleHierarchy[user.role];
  const requiredRoleLevel = roleHierarchy[minimumRole];

  if (userRoleLevel < requiredRoleLevel) {
    redirect("/auth/error?error=unauthorized");
  }

  return user;
}

export async function requireStoreRole(storeId: string, requiredRole: Role) {
  const user = await requireAuth();

  // Owners can access everything
  if (user.role === Role.OWNER) {
    return user;
  }

  // Check if user has the required role for the specific store
  const storeRole = user.storeRoles?.find(sr => sr.storeId === storeId);

  if (!storeRole) {
    redirect("/auth/error?error=no_store_access");
  }

  const roleHierarchy = {
    VIEWER: 0,
    EDITOR: 1,
    OWNER: 2,
  };

  const userRoleLevel = roleHierarchy[storeRole.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    redirect("/auth/error?error=insufficient_store_role");
  }

  return user;
}

export async function canAccessStore(storeId: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  // Owners can access everything
  if (user.role === Role.OWNER) {
    return true;
  }

  // Check if user has any role for the store
  return user.storeRoles?.some(sr => sr.storeId === storeId) ?? false;
}

export function hasRole(user: { role?: Role }, role: Role): boolean {
  return user?.role === role;
}

export function hasMinimumRole(user: { role?: Role }, minimumRole: Role): boolean {
  const roleHierarchy = {
    VIEWER: 0,
    EDITOR: 1,
    OWNER: 2,
  };

  const userRoleLevel = user?.role ? roleHierarchy[user.role] : 0;
  const requiredRoleLevel = roleHierarchy[minimumRole];

  return userRoleLevel >= requiredRoleLevel;
}

export function hasStoreRole(user: { role?: Role; storeRoles?: Array<{storeId: string, role: string}> }, storeId: string, role: Role): boolean {
  if (!user) return false;

  // Owners can access everything
  if (user.role === Role.OWNER) {
    return true;
  }

  const storeRole = user.storeRoles?.find((sr) => sr.storeId === storeId);

  if (!storeRole) {
    return false;
  }

  const roleHierarchy = {
    VIEWER: 0,
    EDITOR: 1,
    OWNER: 2,
  };

  const userRoleLevel = roleHierarchy[storeRole.role as Role];
  const requiredRoleLevel = roleHierarchy[role];

  return userRoleLevel >= requiredRoleLevel;
}