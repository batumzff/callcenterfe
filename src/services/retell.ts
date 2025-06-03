import { API_BASE_URL } from '@/config/api';
import { authService } from './auth';

export interface Agent {
  agent_id: string;
  version: number;
  is_published: boolean;
  response_engine: {
    type: string;
    llm_id: string;
    version: number;
  };
  agent_name: string;
  voice_id: string;
  voice_model: string;
  language: string;
  last_modification_timestamp: number;
}

const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const getAgents = async (): Promise<Agent[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/retell/agents`, {
      headers: getHeaders(),
      credentials: 'include',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
}; 