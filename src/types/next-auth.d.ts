import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      storeRoles: {
        id: string;
        storeId: string;
        role: Role;
        store: {
          id: string;
          name: string;
          slug: string;
        };
      }[];
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    storeRoles: {
      id: string;
      storeId: string;
      role: Role;
      store: {
        id: string;
        name: string;
        slug: string;
      };
    }[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    storeRoles: {
      id: string;
      storeId: string;
      role: Role;
      store: {
        id: string;
        name: string;
        slug: string;
      };
    }[];
  }
}