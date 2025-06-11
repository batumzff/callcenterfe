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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
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
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

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
        setSelectedModel(result.data.post_call_analysis_model || '');
        setSelectedLanguage(result.data.language || '');
        console.log('Agent Info:', result.data);
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
      const body = { general_prompt: llmContent, model: selectedModel, language: selectedLanguage, agent_id: agent?.agent_id };
      console.log('Model update PATCH body:', body);
      const response = await fetch(`${API_BASE_URL}/retell/llms/${llmId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(body),
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
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="model-select-label">Model Seçimi</InputLabel>
                  <Select
                    labelId="model-select-label"
                    id="model-select"
                    value={selectedModel}
                    label="Model Seçimi"
                    onChange={e => setSelectedModel(e.target.value)}
                  >
                    <MenuItem value="gpt-4o">gpt-4o</MenuItem>
                    <MenuItem value="gpt-4o-mini">gpt-4o-mini</MenuItem>
                    <MenuItem value="gpt-4.1">gpt-4.1</MenuItem>
                    <MenuItem value="gpt-4.1-mini">gpt-4.1-mini</MenuItem>
                    <MenuItem value="gpt-4.1-nano">gpt-4.1-nano</MenuItem>
                    <MenuItem value="claude-3.7-sonnet">claude-3.7-sonnet</MenuItem>
                    <MenuItem value="claude-3.5-haiku">claude-3.5-haiku</MenuItem>
                    <MenuItem value="gemini-2.0-flash">gemini-2.0-flash</MenuItem>
                    <MenuItem value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="language-select-label">Dil Seçimi</InputLabel>
                  <Select
                    labelId="language-select-label"
                    id="language-select"
                    value={selectedLanguage}
                    label="Dil Seçimi"
                    onChange={e => setSelectedLanguage(e.target.value)}
                  >
                    <MenuItem value="en-US">🇺🇸 en-US</MenuItem>
                    <MenuItem value="en-IN">🇮🇳 en-IN</MenuItem>
                    <MenuItem value="en-GB">🇬🇧 en-GB</MenuItem>
                    <MenuItem value="en-AU">🇦🇺 en-AU</MenuItem>
                    <MenuItem value="en-NZ">🇳🇿 en-NZ</MenuItem>
                    <MenuItem value="de-DE">🇩🇪 de-DE</MenuItem>
                    <MenuItem value="es-ES">🇪🇸 es-ES</MenuItem>
                    <MenuItem value="es-419">🇲🇽 es-419</MenuItem>
                    <MenuItem value="hi-IN">🇮🇳 hi-IN</MenuItem>
                    <MenuItem value="fr-FR">🇫🇷 fr-FR</MenuItem>
                    <MenuItem value="fr-CA">🇨🇦 fr-CA</MenuItem>
                    <MenuItem value="ja-JP">🇯🇵 ja-JP</MenuItem>
                    <MenuItem value="pt-PT">🇵🇹 pt-PT</MenuItem>
                    <MenuItem value="pt-BR">🇧🇷 pt-BR</MenuItem>
                    <MenuItem value="zh-CN">🇨🇳 zh-CN</MenuItem>
                    <MenuItem value="ru-RU">🇷🇺 ru-RU</MenuItem>
                    <MenuItem value="it-IT">🇮🇹 it-IT</MenuItem>
                    <MenuItem value="ko-KR">🇰🇷 ko-KR</MenuItem>
                    <MenuItem value="nl-NL">🇳🇱 nl-NL</MenuItem>
                    <MenuItem value="pl-PL">🇵🇱 pl-PL</MenuItem>
                    <MenuItem value="tr-TR">🇹🇷 tr-TR</MenuItem>
                    <MenuItem value="vi-VN">🇻🇳 vi-VN</MenuItem>
                    <MenuItem value="ro-RO">🇷🇴 ro-RO</MenuItem>
                    <MenuItem value="bg-BG">🇧🇬 bg-BG</MenuItem>
                    <MenuItem value="ca-ES">🇪🇸 ca-ES</MenuItem>
                    <MenuItem value="da-DK">🇩🇰 da-DK</MenuItem>
                    <MenuItem value="fi-FI">🇫🇮 fi-FI</MenuItem>
                    <MenuItem value="el-GR">🇬🇷 el-GR</MenuItem>
                    <MenuItem value="hu-HU">🇭🇺 hu-HU</MenuItem>
                    <MenuItem value="id-ID">🇮🇩 id-ID</MenuItem>
                    <MenuItem value="no-NO">🇳🇴 no-NO</MenuItem>
                    <MenuItem value="sk-SK">🇸🇰 sk-SK</MenuItem>
                    <MenuItem value="sv-SE">🇸🇪 sv-SE</MenuItem>
                    <MenuItem value="multi">🌐 multi</MenuItem>
                  </Select>
                </FormControl>
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