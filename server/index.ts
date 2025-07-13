import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// body-parser é o middleware que processa o corpo das requisições.
// O Express o inclui, mas usá-lo explicitamente nos dá mais controle.
import bodyParser from "body-parser";

const app = express();

// --- CORREÇÃO DEFINITIVA ---
// A configuração do limite do corpo da requisição DEVE ser a primeira
// coisa que o app usa para processar os dados que chegam.
// Removemos as chamadas duplicadas e usamos o bodyParser para garantir.
console.log("🚀 Aplicando configuração de limite de 50mb para o corpo da requisição...");
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// --- FIM DA CORREÇÃO ---


// Seu middleware de log original (mantido intacto)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Sua lógica de inicialização original (mantida intacta)
(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5000;
  server.listen({
    port,
    host: "127.0.0.1",
  }, () => {
    log(`serving on port ${port}`);
  });
})();