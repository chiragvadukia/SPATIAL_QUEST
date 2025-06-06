import { RequestHandler, Request, Response, NextFunction } from "express";

/**
 * Middleware function wrapper to handle asynchronous Express middleware.
 * @param fn Express RequestHandler function.
 * @returns Express RequestHandler function with error handling.
 */
const asyncMiddleware = (fn: RequestHandler): RequestHandler => {
  /**
   * Middleware function that calls the provided Express RequestHandler function,
   * and catches any errors to pass to the next middleware.
   * @param req Express request object.
   * @param res Express response object.
   * @param next Express next middleware function.
   * @returns A Promise representing the result of the asynchronous function.
   */
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default asyncMiddleware;
