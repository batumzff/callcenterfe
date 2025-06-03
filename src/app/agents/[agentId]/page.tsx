'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Agent } from '@/services/retell';
import { API_BASE_URL } from '@/config/api';
import { authService } from '@/services/auth';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Chip,
  Paper,
  Button,
  TextField,
  Alert,
} from '@mui/material';

export default function AgentDetailPage() {
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [llmContent, setLlmContent] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        const token = authService.getToken();
        const response = await fetch(`${API_BASE_URL}/retell/agents/${params.agentId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch agent details: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const result = await response.json();
        if (!result.data) throw new Error('No agent data received');
        setAgent(result.data);
        // LLM içeriğini ayrıca çek
        const llmId = result.data.response_engine?.llm_id;
        if (llmId) {
          const llmRes = await fetch(`${API_BASE_URL}/retell/llms/${llmId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            credentials: 'include',
          });
          if (llmRes.ok) {
            const llmData = await llmRes.json();
            setLlmContent(llmData.prompt || '');
          } else {
            setLlmContent('');
          }
        } else {
          setLlmContent('');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch agent details');
      } finally {
        setLoading(false);
      }
    };
    if (params.agentId) fetchAgentDetails();
  }, [params.agentId]);

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const token = authService.getToken();
      const llmId = agent?.response_engine?.llm_id;
      if (!llmId) throw new Error('LLM ID bulunamadı.');
      const response = await fetch(`${API_BASE_URL}/retell/llms/${llmId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ general_prompt: llmContent }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update LLM: ${response.status} ${response.statusText} - ${errorText}`);
      }
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update LLM');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !agent) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" color="error.main">
        <Typography variant="h6">
          {error || 'Agent not found'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {agent.agent_name}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Welcome Message / LLM İçeriği
                </Typography>
                <TextField
                  label="Welcome Message"
                  multiline
                  minRows={8}
                  fullWidth
                  value={llmContent}
                  onChange={e => setLlmContent(e.target.value)}
                  variant="outlined"
                  sx={{ mb: 2 }}
                  placeholder="Welcome Message burada gösterilecek."
                />
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  {saveSuccess && <Alert severity="success">Başarıyla kaydedildi!</Alert>}
                  {saveError && <Alert severity="error">{saveError}</Alert>}
                </Box>
              </Paper>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Agent ID:</strong> {agent.agent_id}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Version:</strong> {agent.version}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Status:</strong>{' '}
                      <Chip
                        label={agent.is_published ? 'Published' : 'Draft'}
                        color={agent.is_published ? 'success' : 'warning'}
                        size="small"
                      />
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Language:</strong> {agent.language}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Last Modified:</strong>{' '}
                      {new Date(agent.last_modification_timestamp * 1000).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Voice Configuration
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Voice Model:</strong> {agent.voice_model}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Voice ID:</strong> {agent.voice_id}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
            <Box>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Response Engine
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Type:</strong> {agent.response_engine.type}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>LLM ID:</strong> {agent.response_engine.llm_id}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Version:</strong> {agent.response_engine.version}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 