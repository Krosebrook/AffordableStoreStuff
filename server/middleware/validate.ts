import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Validates req.body against a Zod schema. Returns 400 with errors on failure.
 */
export function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid data",
        errors: result.error.errors,
      });
    }
    req.body = result.data;
    next();
  };
}
