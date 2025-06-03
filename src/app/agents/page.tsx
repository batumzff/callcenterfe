'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAgents, Agent } from '@/services/retell';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Chip,
} from '@mui/material';

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await getAgents();
        setAgents(data);
      } catch (err) {
        setError('Failed to fetch agents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleAgentClick = (agentId: string) => {
    router.push(`/agents/${agentId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" color="error.main">
        {error}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Retell AI Agents
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Voice Model</TableCell>
                  <TableCell>Language</TableCell>
                  <TableCell>Last Modified</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow 
                    key={agent.agent_id}
                    onClick={() => handleAgentClick(agent.agent_id)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <TableCell>{agent.agent_name}</TableCell>
                    <TableCell>{agent.agent_id}</TableCell>
                    <TableCell>{agent.version}</TableCell>
                    <TableCell>
                      <Chip
                        label={agent.is_published ? 'Published' : 'Draft'}
                        color={agent.is_published ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{agent.voice_model}</TableCell>
                    <TableCell>{agent.language}</TableCell>
                    <TableCell>
                      {new Date(agent.last_modification_timestamp * 1000).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
} 