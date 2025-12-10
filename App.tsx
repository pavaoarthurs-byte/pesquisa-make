
import React, { useState, useEffect } from 'react';
import { SurveyData, SurveyStep } from './types';
import { BEST_THING_OPTIONS, WORST_THING_OPTIONS } from './constants';
import { submitSurvey, fetchTopKeywords } from './services/sheetService';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { RatingGrid } from './components/RatingGrid';
import { ProgressBar } from './components/ProgressBar';
import { validateCpfCnpj, validatePhone } from './utils/validators';
import { maskCpfCnpj, maskPhone } from './utils/masks';

const INITIAL_DATA: SurveyData = {
  cpfCnpj: '',
  nome: '',
  telefone: '',
  notaAtendimento: null,
  notaTempoEspera: null,
  notaRecomendacao: null,
  melhorCoisa: '',
  piorCoisa: '',
  sugestao: ''
};

const MakeLogo = ({ className = '' }: { className?: string }) => (
  <img 
    src="logo.png" 
    alt="MAKE Distribuidora" 
    className={`select-none pointer-events-none object-contain ${className}`}
  />
);

const InlineError = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return (
    <div className="animate-fade-in mt-2 w-full p-2 rounded-lg bg-red-900/40 border border-red-500/30 text-red-200 text-[10px] md:text-xs font-medium flex items-center shadow-sm backdrop-blur-sm">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
       </svg>
       {message}
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<SurveyStep>(SurveyStep.INTRO);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SurveyData>(INITIAL_DATA);
  const [error, setError] = useState<string | null>(null);

  const [bestOptionsList, setBestOptionsList] = useState<string[]>(BEST_THING_OPTIONS);
  const [worstOptionsList, setWorstOptionsList] = useState<string[]>(WORST_THING_OPTIONS);

  useEffect(() => {
    const loadKeywords = async () => {
      const keywords = await fetchTopKeywords();
      if (keywords) {
        if (keywords.best && keywords.best.length > 0) setBestOptionsList(keywords.best);
        if (keywords.worst && keywords.worst.length > 0) setWorstOptionsList(keywords.worst);
      }
    };
    loadKeywords();
  }, []);

  const totalQuestions = 5; 
  const currentQuestionIndex = Math.max(0, step - 3);
  const progress = Math.min(100, (currentQuestionIndex / totalQuestions) * 100);

  const handleNext = () => {
    setError(null);

    if (step === SurveyStep.INTRO) {
      setStep(SurveyStep.CPF_CNPJ);
      return;
    }

    if (step === SurveyStep.CPF_CNPJ) {
      if (!data.cpfCnpj) { setError("Por favor, preencha o campo."); return; }
      if (!validateCpfCnpj(data.cpfCnpj)) { setError("CPF ou CNPJ inválido."); return; }
    }
    
    if (step === SurveyStep.NOME) {
      if (!data.nome) { setError("Por favor, informe seu nome."); return; }
      if (data.nome.trim().length < 3) { setError("Mínimo 3 caracteres."); return; }
    }
    
    if (step === SurveyStep.TELEFONE) {
       if (!data.telefone) { setError("Por favor, informe seu telefone."); return; }
       const phoneValidation = validatePhone(data.telefone);
       if (!phoneValidation.isValid) { setError(phoneValidation.message || "Telefone inválido."); return; }
    }

    if (step === SurveyStep.NOTA_ATENDIMENTO && data.notaAtendimento === null) { setError("Selecione uma nota."); return; }
    if (step === SurveyStep.NOTA_TEMPO && data.notaTempoEspera === null) { setError("Selecione uma nota."); return; }
    if (step === SurveyStep.NOTA_RECOMENDACAO && data.notaRecomendacao === null) { setError("Selecione uma nota."); return; }
    if (step === SurveyStep.MELHOR_COISA && !data.melhorCoisa) { setError("Selecione ou digite."); return; }
    if (step === SurveyStep.PIOR_COISA && !data.piorCoisa) { setError("Selecione ou digite."); return; }
    
    if (step === SurveyStep.SUGESTAO) {
      handleSubmit();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > SurveyStep.CPF_CNPJ && step < SurveyStep.FINAL) {
      setStep(prev => prev - 1);
    } else if (step === SurveyStep.CPF_CNPJ) {
      setStep(SurveyStep.INTRO);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitSurvey(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setStep(SurveyStep.FINAL);
    }
  };

  const handleReset = () => {
    setData(INITIAL_DATA);
    setStep(SurveyStep.INTRO);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step !== SurveyStep.FINAL && !loading && step !== SurveyStep.INTRO) {
        if (step !== SurveyStep.SUGESTAO && step !== SurveyStep.MELHOR_COISA && step !== SurveyStep.PIOR_COISA) {
            handleNext();
        }
    }
  };

  const handleChangeCpfCnpj = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setData({ ...data, cpfCnpj: maskCpfCnpj(e.target.value) });
  };

  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setData({ ...data, telefone: maskPhone(e.target.value) });
  };
  
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    const validValue = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    setData({ ...data, nome: validValue });
  };

  const updateData = <K extends keyof SurveyData>(field: K, value: SurveyData[K]) => {
    if (error) setError(null);
    setData({ ...data, [field]: value });
  };

  const renderContent = () => {
    // Classes for Question Title text size - responsive
    // Slightly adjusted for longer text
    const titleClass = "text-base sm:text-lg md:text-xl font-bold mb-3 md:mb-5 text-white leading-tight";

    switch (step) {
      case SurveyStep.INTRO:
        return (
          <div className="flex flex-col items-center text-center justify-center h-full w-full px-4 relative z-20">
             <div className="mb-6 md:mb-10 relative group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-make-primary/20 rounded-full blur-[30px] animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/5 rounded-full blur-[15px]"></div>
                <MakeLogo className="h-40 md:h-52 lg:h-64 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(203,245,66,0.5)] animate-float" />
             </div>
             
             <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-md">
               Pesquisa de <span className="text-make-primary drop-shadow-[0_0_15px_rgba(203,245,66,0.8)]">Satisfação</span>
             </h1>
             
             <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-md mb-8 font-light">
               Olá! Sua parceria é o que nos move. Dedique alguns segundos para compartilhar sua experiência e nos ajude a entregar sempre o melhor para o seu negócio.
             </p>

             <Button onClick={handleNext} className="w-full md:w-auto px-10 py-3 md:py-4 text-base md:text-lg shadow-[0_0_20px_rgba(203,245,66,0.3)] animate-fade-in-up">
               Avaliar
             </Button>
          </div>
        );

      case SurveyStep.CPF_CNPJ:
        return (
          <>
            <h1 className={titleClass}>
              Por favor, para iniciar, insira o <span className="text-make-primary drop-shadow-glow">CPF ou CNPJ</span> da sua empresa:
            </h1>
            <Input 
              autoFocus type="tel" placeholder="000.000.000-00" 
              value={data.cpfCnpj} onChange={handleChangeCpfCnpj} maxLength={18}
            />
            <p className="text-gray-400 text-[10px] mt-1 ml-1">Digite apenas números.</p>
            <InlineError message={error} />
          </>
        );
      case SurveyStep.NOME:
        return (
          <>
            <h1 className={titleClass}>
              Agora, informe seu <span className="text-make-primary drop-shadow-glow">nome</span>:
            </h1>
            <Input 
              autoFocus type="text" placeholder="Seu nome completo" 
              value={data.nome} onChange={handleChangeName}
            />
            <p className="text-gray-400 text-[10px] mt-1 ml-1">Apenas letras, mín. 3 caracteres.</p>
            <InlineError message={error} />
          </>
        );
      case SurveyStep.TELEFONE:
        return (
          <>
            <h1 className={titleClass}>
              Para completar, informe o número de telefone cadastrado em seu <span className="text-make-primary drop-shadow-glow">WhatsApp</span>:
            </h1>
            <Input 
              autoFocus type="tel" placeholder="(00) 90000-0000" 
              value={data.telefone} onChange={handleChangePhone} maxLength={15} 
            />
            <p className="text-gray-400 text-[10px] mt-1 ml-1">DDD + 9 + Número</p>
            <InlineError message={error} />
          </>
        );
      case SurveyStep.NOTA_ATENDIMENTO:
        return (
          <>
            <h1 className={titleClass}>
              Em uma escala de 1 a 10, sendo 1 muito insatisfeito e 10 muito satisfeito, qual nota você atribuiria ao nosso <span className="text-make-primary drop-shadow-glow">atendimento ao cliente</span>?
            </h1>
            <RatingGrid 
              value={data.notaAtendimento} 
              onChange={(val) => updateData('notaAtendimento', data.notaAtendimento === val ? null : val)} 
              minLabel="Muito Insatisfeito" maxLabel="Muito Satisfeito"
            />
            <InlineError message={error} />
          </>
        );
      case SurveyStep.NOTA_TEMPO:
        return (
          <>
            <h1 className={titleClass}>
              Em uma escala de 1 a 10, sendo 1 muito insatisfeito e 10 muito satisfeito, qual nota você atribui ao <span className="text-make-primary drop-shadow-glow">tempo de espera</span>?
            </h1>
            <RatingGrid 
              value={data.notaTempoEspera} 
              onChange={(val) => updateData('notaTempoEspera', data.notaTempoEspera === val ? null : val)} 
              minLabel="Muito Insatisfeito" maxLabel="Muito Satisfeito"
            />
            <InlineError message={error} />
          </>
        );
      case SurveyStep.NOTA_RECOMENDACAO:
        return (
          <>
            <h1 className={titleClass}>
              Em uma escala de 1 a 10, sendo 1 muito insatisfeito e 10 muito satisfeito, quanto você <span className="text-make-primary drop-shadow-glow">recomendaria a MAKE Distribuidora</span> para um amigo ou revenda parceira?
            </h1>
            <RatingGrid 
              value={data.notaRecomendacao} 
              onChange={(val) => updateData('notaRecomendacao', data.notaRecomendacao === val ? null : val)} 
              minLabel="Muito Pouco Provável" maxLabel="Muito Provável"
            />
            <InlineError message={error} />
          </>
        );
      case SurveyStep.MELHOR_COISA:
        const bestOptions = [...bestOptionsList, "Nada"];
        const uniqueBestOptions = Array.from(new Set(bestOptions));
        return (
          <>
            <h1 className={titleClass}>
              Em uma palavra, qual foi a <span className="text-make-primary drop-shadow-glow">melhor coisa</span> de ter optado pela MAKE Distribuidora! (Ex. Qualidade)
            </h1>
            <div className="grid grid-cols-2 gap-2 w-full mb-2 relative z-30">
              {uniqueBestOptions.map(opt => (
                <Button 
                  key={opt} variant="option" 
                  isActive={data.melhorCoisa === opt}
                  onClick={() => updateData('melhorCoisa', data.melhorCoisa === opt ? '' : opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
            <div className="w-full relative z-30">
              <Input
                placeholder="Outro (máx 20)..."
                value={uniqueBestOptions.includes(data.melhorCoisa) ? '' : data.melhorCoisa}
                onChange={(e) => updateData('melhorCoisa', e.target.value)}
                maxLength={20}
                className="py-2 text-sm"
              />
            </div>
            <InlineError message={error} />
          </>
        );
      case SurveyStep.PIOR_COISA:
        const worstOptions = [...worstOptionsList, "Nada"];
        const uniqueWorstOptions = Array.from(new Set(worstOptions));
        // Stronger/Bolder Red: #FF4D4D. 
        // More vivid than previous coral, but not eye-bleeding neon. Good contrast with Green.
        const RED_COLOR = "#FF4D4D"; 
        
        return (
          <>
            <h1 className={titleClass}>
              Em uma palavra, qual foi a <span className="text-[#FF4D4D] drop-shadow-[0_0_15px_rgba(255,77,77,0.4)]">pior coisa</span> de ter optado pela MAKE Distribuidora?
            </h1>
            <div className="grid grid-cols-2 gap-2 w-full mb-2 relative z-30">
              {uniqueWorstOptions.map(opt => (
                <Button 
                  key={opt} variant="option" 
                  isActive={data.piorCoisa === opt}
                  onClick={() => updateData('piorCoisa', data.piorCoisa === opt ? '' : opt)}
                  dynamicColor={opt === "Nada" ? undefined : RED_COLOR}
                  className="min-h-[3rem] py-3"
                >
                  {opt}
                </Button>
              ))}
            </div>
            <div className="w-full relative z-30">
              <Input
                placeholder="Outro (máx 20)..."
                value={uniqueWorstOptions.includes(data.piorCoisa) ? '' : data.piorCoisa}
                onChange={(e) => updateData('piorCoisa', e.target.value)}
                maxLength={20}
                className="py-2 text-sm"
              />
            </div>
            <InlineError message={error} />
          </>
        );
      case SurveyStep.SUGESTAO:
        return (
          <>
            <h1 className={titleClass}>
              Em suas palavras, como você acha que devemos <span className="text-make-primary drop-shadow-glow">melhorar</span> para atender melhor suas necessidades?
            </h1>
            <textarea
              autoFocus
              className="w-full h-32 md:h-40 bg-white border-2 border-transparent rounded-xl text-make-textDark p-3 text-sm focus:outline-none focus:border-make-primary focus:ring-4 focus:ring-make-primary/20 resize-none transition-all placeholder-gray-400 select-text font-medium shadow-inner"
              placeholder="Digite aqui..."
              value={data.sugestao}
              onChange={(e) => updateData('sugestao', e.target.value)}
            />
            <InlineError message={error} />
          </>
        );
      case SurveyStep.FINAL:
        return (
          <div className="flex flex-col items-center justify-center text-center h-full animate-fade-in relative z-20">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-make-primary rounded-full flex items-center justify-center mb-6 shadow-glow animate-scale-in">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-make-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-draw" style={{ strokeDasharray: 30, strokeDashoffset: 30 }} />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">Muito Obrigado!</h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-sm mb-8">
              Recebemos sua avaliação. Agradecemos por fazer parte da nossa história e por nos ajudar a evoluir sempre!
            </p>
            <Button onClick={handleReset} className="w-auto px-8 animate-fade-in-up">Nova Pesquisa</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-make-dark relative overflow-hidden select-none" onKeyDown={handleKeyDown}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute w-32 h-32 bg-make-primary/20 blur-[30px] rounded-full animate-float-up left-[10%]" style={{ animationDuration: '18s', animationDelay: '0s' }}></div>
          <div className="absolute w-24 h-24 bg-make-auxiliary/20 blur-[25px] rounded-full animate-float-up left-[70%]" style={{ animationDuration: '22s', animationDelay: '5s' }}></div>
          <div className="absolute w-40 h-40 bg-make-primary/15 blur-[40px] rounded-full animate-float-up left-[85%]" style={{ animationDuration: '25s', animationDelay: '2s' }}></div>
          <div className="absolute w-28 h-28 bg-make-auxiliary/25 blur-[35px] rounded-full animate-float-up left-[30%]" style={{ animationDuration: '20s', animationDelay: '10s' }}></div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-make-auxiliary via-make-primary to-make-auxiliary shadow-glow z-20"></div>
      
      {/* 
        LAYOUT STRATEGY FOR NO SCROLL:
        1. Outer Flex Container (h-full)
        2. Header (flex-shrink-0) -> Takes required space but shrinks logo if needed
        3. Content (flex-1) -> Takes remaining space, centers content vertically
        4. Footer (flex-shrink-0) -> Fixed height at bottom
      */}
      <div className="flex flex-col h-full w-full max-w-3xl mx-auto px-4 md:px-6 relative z-10">
        
        {step !== SurveyStep.INTRO && step !== SurveyStep.FINAL && (
          // Header Section: Updated size (approx 40% smaller than Intro)
          // Intro was h-40 md:h-52 lg:h-64
          // New size is h-24 md:h-32 lg:h-40
          <div className="shrink-0 flex flex-col items-center justify-center relative z-0 pointer-events-none py-2 md:py-4">
             <MakeLogo className="h-24 md:h-32 lg:h-40 w-auto object-contain drop-shadow-[0_0_15px_rgba(203,245,66,0.5)] animate-float" />
          </div>
        )}

        {/* Content Section: Flex-1 fills available space. Justify-center puts inputs in the middle. */}
        {/* lg:-mt-8 pulls content up to overlap logo on desktop without scrolling */}
        <div className={`flex-1 flex flex-col justify-center w-full relative z-20 pointer-events-auto lg:-mt-8`}>
          <div key={step} className="animate-fade-in-up w-full">
            {renderContent()}
          </div>
        </div>

        {/* Footer Section */}
        {step !== SurveyStep.INTRO && step !== SurveyStep.FINAL && (
          <div className="shrink-0 w-full pb-4 pt-2 animate-fade-in flex gap-3 relative z-30">
            {(step >= SurveyStep.CPF_CNPJ) && (
              <Button 
                variant={step === SurveyStep.CPF_CNPJ ? "ghost" : "secondary"}
                onClick={handleBack}
                className="w-1/3 max-w-[120px]"
                title="Voltar"
              >
                Voltar
              </Button>
            )}
            <Button onClick={handleNext} disabled={loading} className="flex-1">
              <span className="relative z-10">{loading ? 'Enviando...' : (step === SurveyStep.SUGESTAO ? 'Finalizar' : 'Próximo')}</span>
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </Button>
          </div>
        )}
      </div>

      {step >= SurveyStep.NOTA_ATENDIMENTO && step <= SurveyStep.SUGESTAO && (
        <ProgressBar progress={progress} />
      )}
    </div>
  );
};

export default App;
