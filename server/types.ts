declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}

export {};
