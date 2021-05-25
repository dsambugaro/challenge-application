declare global {
  namespace Express {
    interface Request {
      currentUser: {
        id: number;
        role: string;
        company: number | undefined;
      };
    }
  }
}

export {};
