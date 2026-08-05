import type { FastifyInstance } from "fastify";
import { getProjectBySlug } from "../services/project.service.js";
import {
  getContractHealth,
  getLatestProofStatusOnChain,
  getProjectOnChain,
  getProjectProofHistoryOnChain,
  getProofRequestOnChain,
  getProofResultByRequestIdOnChain,
  getProofResultOnChain,
  projectExistsOnChain,
  readProjectRegisteredEvents,
  readProofRequestCreatedEvents,
  readProofResultSubmittedEvents,
} from "../services/contract.service.js";

type BlockQuery = {
  fromBlock?: string;
  toBlock?: string;
};

function contractErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Contract call failed";
  const isConfigurationError = message.includes("not configured");

  return {
    statusCode: isConfigurationError ? 503 : 500,
    body: {
      success: false,
      error: isConfigurationError ? "Contract is not configured" : message,
    },
  };
}

export async function contractRoutes(app: FastifyInstance) {
  app.get("/contract/health", {
    schema: {
      tags: ["Contract"],
      summary: "Check ProofVaultRegistry contract connectivity",
    },
  }, async () => getContractHealth());

  app.get<{ Params: { slug: string } }>("/contract/projects/:slug/status", {
    schema: {
      tags: ["Contract"],
      summary: "Get database and on-chain project status",
      params: {
        type: "object",
        required: ["slug"],
        properties: {
          slug: { type: "string", example: "atlasx-exchange" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const databaseProject = await getProjectBySlug(request.params.slug);
      const onChainExists = await projectExistsOnChain(request.params.slug);
      const onChainProject = onChainExists.exists
        ? await getProjectOnChain(request.params.slug)
        : null;
      const latestProof = await getLatestProofStatusOnChain(request.params.slug);

      return {
        databaseProject,
        onChain: onChainExists,
        onChainProject,
        latestProof,
      };
    } catch (error) {
      request.log.error(error);
      const response = contractErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get<{ Params: { slug: string } }>("/contract/projects/:slug/latest-proof", {
    schema: {
      tags: ["Contract"],
      summary: "Get latest project proof status from ProofVaultRegistry",
      params: {
        type: "object",
        required: ["slug"],
        properties: {
          slug: { type: "string", example: "atlasx-exchange" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return await getLatestProofStatusOnChain(request.params.slug);
    } catch (error) {
      request.log.error(error);
      const response = contractErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get<{ Params: { slug: string } }>("/contract/projects/:slug/proof-history", {
    schema: {
      tags: ["Contract"],
      summary: "Get historical proof result IDs and results from ProofVaultRegistry",
      params: {
        type: "object",
        required: ["slug"],
        properties: {
          slug: { type: "string", example: "atlasx-exchange" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return await getProjectProofHistoryOnChain(request.params.slug);
    } catch (error) {
      request.log.error(error);
      const response = contractErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get<{ Params: { requestId: string } }>("/contract/proof-requests/:requestId", {
    schema: {
      tags: ["Contract"],
      summary: "Get on-chain proof request by request ID",
      params: {
        type: "object",
        required: ["requestId"],
        properties: {
          requestId: { type: "string", example: "1" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return await getProofRequestOnChain(request.params.requestId);
    } catch (error) {
      request.log.error(error);
      const response = contractErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get<{ Params: { resultId: string } }>("/contract/proof-results/:resultId", {
    schema: {
      tags: ["Contract"],
      summary: "Get on-chain proof result by result ID",
      params: {
        type: "object",
        required: ["resultId"],
        properties: {
          resultId: { type: "string", example: "1" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return await getProofResultOnChain(request.params.resultId);
    } catch (error) {
      request.log.error(error);
      const response = contractErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get<{ Params: { requestId: string } }>("/contract/proof-requests/:requestId/result", {
    schema: {
      tags: ["Contract"],
      summary: "Get on-chain proof result by proof request ID",
      params: {
        type: "object",
        required: ["requestId"],
        properties: {
          requestId: { type: "string", example: "1" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return await getProofResultByRequestIdOnChain(request.params.requestId);
    } catch (error) {
      request.log.error(error);
      const response = contractErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get<{ Querystring: BlockQuery }>("/contract/events/project-registered", {
    schema: {
      tags: ["Contract"],
      summary: "Read ProjectRegistered events",
      querystring: {
        type: "object",
        properties: {
          fromBlock: { type: "string", example: "0" },
          toBlock: { type: "string", example: "latest" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return {
        events: await readProjectRegisteredEvents(request.query.fromBlock, request.query.toBlock),
      };
    } catch (error) {
      request.log.error(error);
      const response = contractErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get<{ Querystring: BlockQuery }>("/contract/events/proof-requests", {
    schema: {
      tags: ["Contract"],
      summary: "Read ProofRequestCreated events",
      querystring: {
        type: "object",
        properties: {
          fromBlock: { type: "string", example: "0" },
          toBlock: { type: "string", example: "latest" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return {
        events: await readProofRequestCreatedEvents(request.query.fromBlock, request.query.toBlock),
      };
    } catch (error) {
      request.log.error(error);
      const response = contractErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });

  app.get<{ Querystring: BlockQuery }>("/contract/events/proof-results", {
    schema: {
      tags: ["Contract"],
      summary: "Read ProofResultSubmitted events",
      querystring: {
        type: "object",
        properties: {
          fromBlock: { type: "string", example: "0" },
          toBlock: { type: "string", example: "latest" },
        },
      },
    },
  }, async (request, reply) => {
    try {
      return {
        events: await readProofResultSubmittedEvents(request.query.fromBlock, request.query.toBlock),
      };
    } catch (error) {
      request.log.error(error);
      const response = contractErrorResponse(error);
      return reply.status(response.statusCode).send(response.body);
    }
  });
}
