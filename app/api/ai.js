import { getApiBaseUrl, getSupabaseAccessToken, logHealthCheck } from '../config/api';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const PERMESSO_KEYWORDS = [
  'permesso di soggiorno',
  'permesso soggiorno',
  'questura',
  'ufficio immigrazione',
  'sportello amico',
  'kit',
  'mod 209',
  'mod. 209',
  'ricevuta poste',
  'codice assicurata',
  'codice ologramma',
  'impronte',
  'rinnovo permesso',
  'conversione',
  'decreto flussi',
];

export const inferIntentFromQuestion = (question) => {
  const normalized = String(question || '').toLowerCase();
  const isPermesso = PERMESSO_KEYWORDS.some((keyword) => normalized.includes(keyword));
  return isPermesso ? 'permesso_soggiorno' : 'passaporto';
};

export const askAI = async (question, options = {}) => {
  const baseUrl = getApiBaseUrl();
  logHealthCheck();
  if (!baseUrl) {
    throw new Error('API base URL is not configured.');
  }
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) {
    const authError = new Error('Session expired. Please sign in again.');
    authError.code = 'AUTH_REQUIRED';
    throw authError;
  }
  const manualIntent = options?.intent;
  const intent = manualIntent || inferIntentFromQuestion(question);
  const requestedLang = String(options?.lang || 'it').trim().toLowerCase();
  const lang = requestedLang === 'ar' ? 'ar' : 'it';
  const payload = {
    question,
    intent,
    lang,
  };
  if (__DEV__) {
    // Log ridotto - non espone il contenuto della domanda
    console.log('[askAI] request intent:', intent);
  }
  const response = await fetchWithTimeout(`${baseUrl}/api/ai/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  return response.json();
};
