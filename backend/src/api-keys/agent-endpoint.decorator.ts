import { SetMetadata } from '@nestjs/common';
import { IS_AGENT_ENDPOINT } from './api-key-auth.guard.js';

export const AgentEndpoint = () => SetMetadata(IS_AGENT_ENDPOINT, true);
