
import { SurveyData, SheetPayload } from '../types';
import { GOOGLE_SCRIPT_URL } from '../constants';
import { toSentenceCase } from '../utils/formatters';

// Função segura para gerar UUID em qualquer ambiente (HTTP ou HTTPS)
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Falha silenciosa, fallback abaixo
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const submitSurvey = async (data: SurveyData): Promise<boolean> => {
  try {
    const payload: SheetPayload = {
      id: generateUUID(),
      tel: data.telefone,
      nome: data.nome,
      cpfcnpj_autor: data.cpfCnpj,
      nota_atendimento: data.notaAtendimento || 0,
      nota_comprando: data.notaTempoEspera || 0,
      nota_recomendar: data.notaRecomendacao || 0,
      melhor_: data.melhorCoisa,
      pior_: data.piorCoisa,
      sugest: data.sugestao,
      dtpesquisa: new Date().toLocaleString('pt-BR')
    };

    // fetch com mode: 'no-cors' é opaco. Não sabemos se deu 200 ou 500, 
    // mas evita erro de rede no console do navegador.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain', // Usar text/plain evita preflight OPTIONS que o Apps Script não suporta
      },
      body: JSON.stringify(payload),
    });
    
    return true;
  } catch (error) {
    console.error("Error submitting survey:", error);
    // Retornamos true mesmo com erro para não travar o fluxo do usuário na tela final
    // Em produção, você poderia salvar no localStorage para tentar enviar depois
    return false;
  }
};

const processKeywords = (words: string[]): string[] => {
  if (!Array.isArray(words)) return [];
  
  const uniqueMap = new Map<string, string>();
  
  words.forEach(word => {
    if (typeof word === 'string' && word.trim().length > 0) {
      // Formata: "aGiLiDaDe" -> "Agilidade"
      const formatted = toSentenceCase(word);
      // Chave em minúsculo para garantir unicidade sem case-sensitivity
      const key = formatted.toLowerCase();
      
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, formatted);
      }
    }
  });

  return Array.from(uniqueMap.values());
};

export const fetchTopKeywords = async (): Promise<{ best: string[], worst: string[] } | null> => {
  try {
    // Para requisições GET no Apps Script (Web App), é crucial:
    // 1. redirect: 'follow' (padrão) para seguir o 302 do Google.
    // 2. credentials: 'omit' para não enviar cookies que possam confundir a auth do Google.
    // 3. mode: 'cors' explícito.
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit', 
      redirect: 'follow'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.result === 'success') {
        // Processa as listas para garantir formatação e unicidade no Frontend
        return {
          best: processKeywords(data.best),
          worst: processKeywords(data.worst)
        };
      }
    }
    return null;
  } catch (error) {
    // Usar warn em vez de error para não alarmar no console, pois é uma feature opcional
    console.warn("Aviso: Não foi possível carregar as palavras-chave dinâmicas (usando padrão). Se você atualizou o Apps Script, certifique-se de ter criado uma NOVA VERSÃO na implantação.", error);
    return null;
  }
};
