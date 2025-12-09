import React, { useState } from 'react';
import { SurveyData, SurveyStep } from './types';
import { BEST_THING_OPTIONS, WORST_THING_OPTIONS } from './constants';
import { submitSurvey } from './services/sheetService';
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

// Reverted to Image based on user request, maintaining glow effects via CSS drop-shadow
const MakeLogo = ({ className }: { className?: string }) => (
  <img 
    src="logo.png" 
    alt="MAKE Distribuidora" 
    className={`select-none pointer-events-none ${className}`}
  />
);

const App: React.FC = () => {
  const [step, setStep] = useState<SurveyStep>(SurveyStep.INTRO);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SurveyData>(INITIAL_DATA);
  const [error, setError] = useState<string | null>(null);

  // Calculate progress relative to questions (Step 3 to 8)
  // Step 3 (Atendimento) -> 0%
  // Step 8 (Sugestao) -> 100%
  // Denominator is 5 (8 - 3)
  const totalQuestions = 5; 
  const currentQuestionIndex = Math.max(0, step - 3);
  const progress = Math.min(100, (currentQuestionIndex / totalQuestions) * 100);

  const handleNext = () => {
    // Clear any previous errors on attempt
    setError(null);

    if (step === SurveyStep.INTRO) {
      setStep(SurveyStep.CPF_CNPJ);
      return;
    }

    if (step === SurveyStep.CPF_CNPJ) {
      if (!data.cpfCnpj) {
        setError("Por favor, preencha o campo.");
        return;
      }
      if (!validateCpfCnpj(data.cpfCnpj)) {
        setError("CPF ou CNPJ inválido. Verifique o número.");
        return;
      }
    }
    
    if (step === SurveyStep.NOME && !data.nome) {
      setError("Por favor, informe seu nome.");
      return;
    }
    
    if (step === SurveyStep.TELEFONE) {
       if (!data.telefone) {
         setError("Por favor, informe seu telefone.");
         return;
       }
       const phoneValidation = validatePhone(data.telefone);
       if (!phoneValidation.isValid) {
         setError(phoneValidation.message || "Telefone inválido.");
         return;
       }
    }

    if (step === SurveyStep.NOTA_ATENDIMENTO && data.notaAtendimento === null) {
      setError("Por favor, selecione uma nota.");
      return;
    }
    if (step === SurveyStep.NOTA_TEMPO && data.notaTempoEspera === null) {
      setError("Por favor, selecione uma nota.");
      return;
    }
    if (step === SurveyStep.NOTA_RECOMENDACAO && data.notaRecomendacao === null) {
      setError("Por favor, selecione uma nota.");
      return;
    }
    if (step === SurveyStep.MELHOR_COISA && !data.melhorCoisa) {
      setError("Por favor, selecione uma opção ou digite no campo.");
      return;
    }
    if (step === SurveyStep.PIOR_COISA && !data.piorCoisa) {
      setError("Por favor, selecione uma opção ou digite no campo.");
      return;
    }
    
    if (step === SurveyStep.SUGESTAO) {
      handleSubmit();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null); // Clear errors when going back
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
      console.error("Erro fatal no envio:", e);
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
        // Prevent skipping step if focusing on a textarea/input that needs Enter
        if (step !== SurveyStep.SUGESTAO && step !== SurveyStep.MELHOR_COISA && step !== SurveyStep.PIOR_COISA) {
            handleNext();
        }
    }
  };

  // --- Input Change Handlers (Auto-clear error) ---

  const handleChangeCpfCnpj = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setData({ ...data, cpfCnpj: maskCpfCnpj(e.target.value) });
  };

  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setData({ ...data, telefone: maskPhone(e.target.value) });
  };

  const updateData = (field: keyof SurveyData, value: any) => {
    if (error) setError(null);
    setData({ ...data, [field]: value });
  };

  const getQuestionPrefix = () => {
    if (step >= SurveyStep.NOTA_ATENDIMENTO && step <= SurveyStep.SUGESTAO) {
      return `${step - 2}. `;
    }
    return "";
  };

  const renderContent = () => {
    const prefix = getQuestionPrefix();

    switch (step) {
      case SurveyStep.INTRO:
        return (
          <div className="flex flex-col items-center text-center h-full justify-center animate-fade-in px-4">
             
             {/* Logo Container with Intense Glow Effects */}
             <div className="mb-8 md:mb-12 p-6 relative group">
                {/* Core ambient glow - Neon Green */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-make-primary/20 rounded-full blur-[40px] animate-pulse"></div>
                {/* Secondary ambient glow - White/Auxiliary Mix */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white/5 rounded-full blur-[20px]"></div>
                
                {/* Logo Image with Drop Shadow for Neon Effect on Transparent Pixels */}
                <MakeLogo className="h-24 md:h-32 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(203,245,66,0.5)] animate-float" />
             </div>
             
             <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-md">
               Pesquisa de <span className="text-make-primary drop-shadow-[0_0_15px_rgba(203,245,66,0.8)]">Satisfação</span>
             </h1>
             
             <p className="text-gray-300 text-base md:text-xl leading-relaxed max-w-lg mb-10 font-light">
               Sua opinião é fundamental para nossa evolução. <br/>
               Ajude-nos a construir um futuro melhor para você e seu negócio.
             </p>

             <Button onClick={handleNext} className="w-full md:w-auto px-10 md:px-16 py-4 md:py-5 text-lg md:text-xl shadow-[0_0_30px_rgba(203,245,66,0.3)] hover:shadow-[0_0_50px_rgba(203,245,66,0.6)] animate-fade-in-up">
               Iniciar Pesquisa
             </Button>
          </div>
        );

      case SurveyStep.CPF_CNPJ:
        return (
          <>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white leading-tight">
              Para iniciar, insira o <span className="text-make-primary drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">CPF ou CNPJ</span> da sua empresa:
            </h1>
            <Input 
              autoFocus
              type="tel" 
              placeholder="000.000.000-00" 
              value={data.cpfCnpj}
              onChange={handleChangeCpfCnpj}
              maxLength={18}
            />
            <p className="text-gray-400 text-[10px] md:text-xs mt-2 ml-1">Digite apenas números.</p>
          </>
        );
      case SurveyStep.NOME:
        return (
          <>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white leading-tight">
              Agora, informe seu <span className="text-make-primary drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">nome</span>:
            </h1>
            <Input 
              autoFocus
              type="text" 
              placeholder="Seu nome completo" 
              value={data.nome}
              onChange={(e) => updateData('nome', e.target.value)}
            />
          </>
        );
      case SurveyStep.TELEFONE:
        return (
          <>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white leading-tight">
              Informe o número de telefone cadastrado em seu <span className="text-make-primary drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">WhatsApp</span>:
            </h1>
            <Input 
              autoFocus
              type="tel" 
              placeholder="(00) 90000-0000" 
              value={data.telefone}
              onChange={handleChangePhone}
              maxLength={15} 
            />
            <p className="text-gray-400 text-[10px] md:text-xs mt-2 ml-1">DDD + 9 + Número</p>
          </>
        );
      case SurveyStep.NOTA_ATENDIMENTO:
        return (
          <>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white leading-tight">
              {prefix}Em uma escala de 1 a 10, qual nota você atribuiria ao nosso <span className="text-make-primary drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">atendimento ao cliente</span>?
            </h1>
            <RatingGrid 
              value={data.notaAtendimento} 
              onChange={(val) => updateData('notaAtendimento', val)} 
            />
          </>
        );
      case SurveyStep.NOTA_TEMPO:
        return (
          <>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white leading-tight">
              {prefix}Em uma escala de 1 a 10, qual nota você atribui ao <span className="text-make-primary drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">tempo de espera</span>?
            </h1>
            <RatingGrid 
              value={data.notaTempoEspera} 
              onChange={(val) => updateData('notaTempoEspera', val)} 
            />
          </>
        );
      case SurveyStep.NOTA_RECOMENDACAO:
        return (
          <>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white leading-tight">
              {prefix}Quanto você <span className="text-make-primary drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">recomendaria a MAKE</span> para um amigo ou revenda parceira?
            </h1>
            <RatingGrid 
              value={data.notaRecomendacao} 
              onChange={(val) => updateData('notaRecomendacao', val)} 
            />
          </>
        );
      case SurveyStep.MELHOR_COISA:
        const bestOptions = [...BEST_THING_OPTIONS, "Nada"];
        return (
          <>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white leading-tight">
              {prefix}Em uma palavra, qual foi a <span className="text-make-primary drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">melhor coisa</span> de ter optado pela MAKE Distribuidora!
            </h1>
            <div className="grid grid-cols-2 gap-2 md:gap-4 w-full mb-4">
              {bestOptions.map(opt => (
                <Button 
                  key={opt} 
                  variant="option" 
                  isActive={data.melhorCoisa === opt}
                  onClick={() => updateData('melhorCoisa', opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
            <div className="w-full">
              <p className="text-gray-400 text-xs mb-2 ml-1">Ou digite (máx. 20 caracteres):</p>
              <Input
                placeholder="Digite outra opção..."
                // Show value only if it's NOT in the predefined options list to avoid visual duplication
                value={bestOptions.includes(data.melhorCoisa) ? '' : data.melhorCoisa}
                onChange={(e) => updateData('melhorCoisa', e.target.value)}
                maxLength={20}
                className="py-2 md:py-3 text-base"
              />
            </div>
          </>
        );
      case SurveyStep.PIOR_COISA:
        const worstOptions = [...WORST_THING_OPTIONS, "Nada"];
        return (
          <>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white leading-tight">
              {prefix}Em uma palavra, qual foi a <span className="text-make-primary drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">pior coisa</span> de ter optado pela MAKE Distribuidora?
            </h1>
            <div className="grid grid-cols-2 gap-2 md:gap-4 w-full mb-4">
              {worstOptions.map(opt => (
                <Button 
                  key={opt} 
                  variant="option" 
                  isActive={data.piorCoisa === opt}
                  onClick={() => updateData('piorCoisa', opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
            <div className="w-full">
              <p className="text-gray-400 text-xs mb-2 ml-1">Ou digite (máx. 20 caracteres):</p>
              <Input
                placeholder="Digite outra opção..."
                // Show value only if it's NOT in the predefined options list
                value={worstOptions.includes(data.piorCoisa) ? '' : data.piorCoisa}
                onChange={(e) => updateData('piorCoisa', e.target.value)}
                maxLength={20}
                className="py-2 md:py-3 text-base"
              />
            </div>
          </>
        );
      case SurveyStep.SUGESTAO:
        return (
          <>
            <h1 className="text-base sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white leading-tight">
              {prefix}Em suas palavras, como você acha que devemos melhorar para <span className="text-make-primary drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">atender melhor suas necessidades</span>?
            </h1>
            <textarea
              autoFocus
              className="w-full h-24 md:h-40 bg-white border-2 border-transparent rounded-xl text-make-textDark p-3 md:p-4 text-base focus:outline-none focus:border-make-primary focus:ring-4 focus:ring-make-primary/20 resize-none transition-all placeholder-gray-400 select-text font-medium shadow-inner"
              placeholder="Digite sua sugestão aqui..."
              value={data.sugestao}
              onChange={(e) => updateData('sugestao', e.target.value)}
            />
          </>
        );
      case SurveyStep.FINAL:
        return (
          <div className="flex flex-col items-center justify-center text-center h-full animate-fade-in py-6 md:py-10">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-make-primary rounded-full flex items-center justify-center mb-4 md:mb-8 shadow-[0_0_30px_rgba(203,245,66,0.6)] animate-scale-in">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12 text-make-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 13l4 4L19 7" 
                  className="animate-draw"
                  style={{ strokeDasharray: 30, strokeDashoffset: 30 }}
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-6">Obrigado!</h1>
            <p className="text-gray-300 text-base md:text-xl leading-relaxed max-w-sm mb-8">
              Obrigado por participar da nossa pesquisa, sua opinião é muito importante para nos ajudar a melhorar.
            </p>
            <Button onClick={handleReset} className="w-auto px-8 md:px-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              Nova Pesquisa
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[100dvh] w-screen flex flex-col bg-make-dark relative overflow-hidden select-none" onKeyDown={handleKeyDown}>
      {/* Background Ambience - Vertical Lava Lamp Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* Multiple blobs with varying sizes, horizontal positions, colors, and animation delays */}
          
          {/* Blob 1 - Green Primary - Left */}
          <div className="absolute w-32 h-32 md:w-48 md:h-48 bg-make-primary/20 blur-[30px] rounded-full animate-float-up left-[10%]" 
               style={{ animationDuration: '18s', animationDelay: '0s' }}></div>

          {/* Blob 2 - Aux Green - Center Right */}
          <div className="absolute w-24 h-24 md:w-40 md:h-40 bg-make-auxiliary/20 blur-[25px] rounded-full animate-float-up left-[70%]" 
               style={{ animationDuration: '22s', animationDelay: '5s' }}></div>
          
          {/* Blob 3 - Primary - Right */}
          <div className="absolute w-40 h-40 md:w-56 md:h-56 bg-make-primary/15 blur-[40px] rounded-full animate-float-up left-[85%]" 
               style={{ animationDuration: '25s', animationDelay: '2s' }}></div>

          {/* Blob 4 - Aux - Center Left */}
          <div className="absolute w-28 h-28 md:w-44 md:h-44 bg-make-auxiliary/25 blur-[35px] rounded-full animate-float-up left-[30%]" 
               style={{ animationDuration: '20s', animationDelay: '10s' }}></div>

          {/* Blob 5 - Primary - Center */}
          <div className="absolute w-20 h-20 md:w-32 md:h-32 bg-make-primary/20 blur-[25px] rounded-full animate-float-up left-[50%]" 
               style={{ animationDuration: '16s', animationDelay: '8s' }}></div>
      </div>
      
      {/* Decorative Top Line */}
      <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-gradient-to-r from-make-auxiliary via-make-primary to-make-auxiliary shadow-[0_0_15px_rgba(203,245,66,0.5)] z-20"></div>
      
      {/* Main Container */}
      <div className="flex-1 flex flex-col w-full max-w-xl mx-auto px-4 md:px-6 relative z-10 min-h-0">
        
        {/* Header Section - Hide on Intro and Final */}
        {step !== SurveyStep.INTRO && step !== SurveyStep.FINAL && (
          <div className="w-full pt-4 md:pt-6 pb-2 shrink-0 flex flex-col items-center min-h-[5rem]">
             <div className="mb-1 w-full flex justify-center">
               {/* Increased Logo Size from h-16/20 to h-24/32 for better visibility and filling space */}
               <MakeLogo className="h-24 md:h-32 w-auto object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
             </div>
             
             {/* Error Message Display Area - Replacing previous Header Text */}
             {error ? (
                <div className="animate-fade-in bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold flex items-center shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                   {error}
                </div>
             ) : (
                // Spacer to keep layout stable if needed, or just empty
                <div className="h-8"></div>
             )}
          </div>
        )}

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col justify-center relative w-full overflow-y-auto no-scrollbar py-2">
          <div key={step} className="animate-fade-in-up w-full my-auto">
            {renderContent()}
          </div>
        </div>

        {/* Footer Actions */}
        {step !== SurveyStep.INTRO && step !== SurveyStep.FINAL && (
          <div className="w-full pt-2 pb-4 md:pt-4 md:pb-6 shrink-0 animate-fade-in flex gap-3">
            
            {/* Show Back Button on CPF screen and onwards */}
            {(step >= SurveyStep.CPF_CNPJ) && (
              <Button 
                variant={step === SurveyStep.CPF_CNPJ ? "ghost" : "secondary"}
                onClick={handleBack}
                className="w-1/3 md:w-1/4"
                title="Voltar"
              >
                Voltar
              </Button>
            )}

            <Button onClick={handleNext} disabled={loading} className="flex-1">
              <span className="relative z-10">{loading ? 'Enviando...' : (step === SurveyStep.SUGESTAO ? 'Finalizar Pesquisa' : 'Próximo')}</span>
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 ml-2 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Progress Bar - Updated to show only up to Suggestion step */}
      {step >= SurveyStep.NOTA_ATENDIMENTO && step <= SurveyStep.SUGESTAO && (
        <ProgressBar progress={progress} />
      )}
    </div>
  );
};

export default App;