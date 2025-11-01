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
