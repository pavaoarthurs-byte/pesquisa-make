
import { SurveyData, SheetPayload } from '../types';
import { GOOGLE_SCRIPT_URL } from '../constants';

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
