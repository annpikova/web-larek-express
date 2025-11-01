/// <reference types="express" />

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
      };
      csrfToken?: () => string;
    }
  }
}

export {};
