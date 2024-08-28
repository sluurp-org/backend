import { Workspace, User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      workspace?: Workspace;
    }

    interface User extends PrismaUser {}
  }
}
