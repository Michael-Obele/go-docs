import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';

// Go Documentation components
import { goDocsAgent } from './agents/go-docs-agent';
import { goDocsMcpServer } from './mcp/go-docs-server';

export const mastra = new Mastra({
  agents: { 
    goDocsAgent,
  },
  scorers: { },
  mcpServers: {
    goDocsMcpServer,
  },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  bundler: {
    // axios needs to be external due to its CommonJS structure
    externals: ["axios"],
  },
  telemetry: {
    // Telemetry is deprecated and will be removed in the Nov 4th release
    enabled: false, 
  },
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true }, 
  },
});
