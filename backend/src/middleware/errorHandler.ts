import { Request, Response, NextFunction } from 'express'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err)
  const message = err instanceof Error ? err.message : 'Erro interno do servidor'
  res.status(500).json({ error: message })
}
