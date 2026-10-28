import React, { useState, useEffect, useCallback } from 'react';
import { CalculationRecord, DisplayState } from '../types/calculator';
import { soundEffects } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  History,
  Trash2,
  ArrowRight,
  Sparkles,
  RotateCcw,
  BookOpen
} from 'lucide-react';

const MENSAGENS_INCENTIVO = [
  'Muito bem! Continue assim! 🌟',
  'Fantástico! Você é fera! 🎉',
  'Excelente raciocínio! 🎈',
  'Parabéns! Conta resolvida! 🚀',
  'Que cálculo incrível! 🏆',
  'Matemática é pura diversão! 💡',
  'Você é um pequeno gênio! ⭐'
];

const LOCAL_STORAGE_KEY = 'historico_calculadora_infantil_v1';

export const CalculatorSimulator: React.FC = () => {
  const [displayState, setDisplayState] = useState<DisplayState>({
    expressao_anterior: '',
    valor_atual: '0',
    resetar_proximo_digito: false,
    mensagem_feedback: 'Pronto para a matemática! ✨'
  });

  const [primeiroOperando, setPrimeiroOperando] = useState<number | null>(null);
  const [operadorAtual, setOperadorAtual] = useState<string | null>(null);
  const [historico, setHistorico] = useState<CalculationRecord[]>([]);
  const [historicoAberto, setHistoricoAberto] = useState<boolean>(true);
  const [somAtivo, setSomAtivo] = useState<boolean>(true);
  const [ultimoResultado, setUltimoResultado] = useState<string | null>(null);
  const [avisoDivisaoZero, setAvisoDivisaoZero] = useState<boolean>(false);

  // Carregar histórico do LocalStorage na inicialização (espelha o JSON do Python)
  useEffect(() => {
    try {
      const dados = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (dados) {
        const registros = JSON.parse(dados);
        if (Array.isArray(registros)) {
          setHistorico(registros.slice(0, 30));
        }
      }
    } catch {
      // Ignora erro
    }
  }, []);

  // Salvar no LocalStorage (limite 30 registros)
  const salvarHistoricoLocal = (novoHistorico: CalculationRecord[]) => {
    try {
      const truncado = novoHistorico.slice(0, 30);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(truncado));
      setHistorico(truncado);
    } catch {
      // Ignora erro
    }
  };

  const toggleSom = () => {
    const novo = !somAtivo;
    setSomAtivo(novo);
    soundEffects.enabled = novo;
  };

  const dispararConfetes = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#34d399', '#f472b6', '#facc15', '#a78bfa']
      });
    } catch {
      // Ignore
    }
  };

  const formatarNumero = (num: number): string => {
    const str = num.toString();
    if (str.includes('.')) {
      const arredondado = Math.round(num * 1000000) / 1000000;
      return arredondado.toString();
    }
    return str;
  };

  // Digitar Número (0-9)
  const aoDigitarNumero = useCallback((digito: string) => {
    soundEffects.playKeyClick(480 + parseInt(digito, 10) * 15);
    setAvisoDivisaoZero(false);

    setDisplayState((prev) => {
      let novoValor = prev.valor_atual;
      if (prev.resetar_proximo_digito || prev.valor_atual === '0') {
        novoValor = digito;
      } else {
        if (prev.valor_atual.replace('.', '').length < 10) {
          novoValor = prev.valor_atual + digito;
        }
      }
      return {
        ...prev,
        valor_atual: novoValor,
        resetar_proximo_digito: false
      };
    });
  }, []);

  // Digitar Ponto Decimal
  const aoDigitarPonto = useCallback(() => {
    soundEffects.playKeyClick(600);
    setAvisoDivisaoZero(false);

    setDisplayState((prev) => {
      if (prev.resetar_proximo_digito) {
        return {
          ...prev,
          valor_atual: '0.',
          resetar_proximo_digito: false
        };
      }
      if (!prev.valor_atual.includes('.')) {
        return {
          ...prev,
          valor_atual: prev.valor_atual + '.'
        };
      }
      return prev;
    });
  }, []);

  // Apagar Último Dígito (⌫)
  const aoApagarUltimo = useCallback(() => {
    soundEffects.playKeyClick(420);
    setAvisoDivisaoZero(false);

    setDisplayState((prev) => {
      if (prev.resetar_proximo_digito) return prev;
      let novo = prev.valor_atual;
      if (novo.length > 1) {
        novo = novo.slice(0, -1);
        if (novo === '-') novo = '0';
      } else {
        novo = '0';
      }
      return {
        ...prev,
        valor_atual: novo
      };
    });
  }, []);

  // Limpar Tudo (C)
  const aoLimparTudo = useCallback(() => {
    soundEffects.playKeyClick(360);
    setAvisoDivisaoZero(false);
    setPrimeiroOperando(null);
    setOperadorAtual(null);
    setUltimoResultado(null);
    setDisplayState({
      expressao_anterior: '',
      valor_atual: '0',
      resetar_proximo_digito: false,
      mensagem_feedback: 'Tudo limpo! Comece de novo 🎈'
    });
  }, []);

  // Selecionar Operador (+, -, ×, ÷, %)
  const aoSelecionarOperador = useCallback((op: string) => {
    soundEffects.playKeyClick(580);
    setAvisoDivisaoZero(false);
    setUltimoResultado(null);

    const valorNum = parseFloat(displayState.valor_atual) || 0;

    // Se já havia uma operação pendente e a criança não clicou em igual
    if (primeiroOperando !== null && operadorAtual && !displayState.resetar_proximo_digito) {
      executarCalculo(op, valorNum);
    } else {
      setPrimeiroOperando(valorNum);
      setOperadorAtual(op);
      setDisplayState((prev) => ({
        ...prev,
        expressao_anterior: `${formatarNumero(valorNum)} ${op}`,
        resetar_proximo_digito: true
      }));
    }
  }, [displayState.valor_atual, displayState.resetar_proximo_digito, primeiroOperando, operadorAtual]);

  // Executar Cálculo Principal
  const executarCalculo = (proximoOperador: string | null = null, segundoManual?: number) => {
    if (primeiroOperando === null || operadorAtual === null) return;

    const op2 = segundoManual !== undefined ? segundoManual : (parseFloat(displayState.valor_atual) || 0);
    const op1 = primeiroOperando;
    const op = operadorAtual;

    // TRATAMENTO PEDAGÓGICO DE DIVISÃO POR ZERO
    if (op === '÷' && op2 === 0) {
      soundEffects.playFriendlyOops();
      setAvisoDivisaoZero(true);
      setDisplayState((prev) => ({
        ...prev,
        expressao_anterior: `${formatarNumero(op1)} ÷ 0 =`,
        valor_atual: '🍰 Ops!',
        resetar_proximo_digito: true,
        mensagem_feedback: 'Não é possível dividir por zero! 🍰'
      }));
      setPrimeiroOperando(null);
      setOperadorAtual(null);
      setUltimoResultado(null);
      return;
    }

    let resultadoCalculado = 0;
    if (op === '+') resultadoCalculado = op1 + op2;
    else if (op === '-') resultadoCalculado = op1 - op2;
    else if (op === '×') resultadoCalculado = op1 * op2;
    else if (op === '÷') resultadoCalculado = Math.round((op1 / op2) * 1000000) / 1000000;
    else if (op === '%') resultadoCalculado = (op1 * op2) / 100;

    const resStr = formatarNumero(resultadoCalculado);
    const contaStr = `${formatarNumero(op1)} ${op} ${formatarNumero(op2)} =`;
    const incentivo = MENSAGENS_INCENTIVO[Math.floor(Math.random() * MENSAGENS_INCENTIVO.length)];

    soundEffects.playSuccessChime();
    dispararConfetes();
    setUltimoResultado(resStr);

    setDisplayState({
      expressao_anterior: contaStr,
      valor_atual: resStr,
      resetar_proximo_digito: true,
      mensagem_feedback: incentivo
    });

    // Salvar registro de histórico
    const dataHoraFormatada = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const novoRegistro: CalculationRecord = {
      id: Math.random().toString(36).substring(2, 7),
      primeiro_operando: op1,
      segundo_operando: op2,
      operador: op,
      resultado: resStr,
      data_hora: `Hoje às ${dataHoraFormatada}`
    };

    const novoHistorico = [novoRegistro, ...historico];
    salvarHistoricoLocal(novoHistorico);

    if (proximoOperador) {
      setPrimeiroOperando(resultadoCalculado);
      setOperadorAtual(proximoOperador);
      setDisplayState((prev) => ({
        ...prev,
        expressao_anterior: `${resStr} ${proximoOperador}`,
        resetar_proximo_digito: true
      }));
    } else {
      setPrimeiroOperando(null);
      setOperadorAtual(null);
    }
  };

  // Atalhos de teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        aoDigitarNumero(e.key);
      } else if (e.key === '+') {
        aoSelecionarOperador('+');
      } else if (e.key === '-') {
        aoSelecionarOperador('-');
      } else if (e.key === '*' || e.key === 'x') {
        aoSelecionarOperador('×');
      } else if (e.key === '/') {
        e.preventDefault();
        aoSelecionarOperador('÷');
      } else if (e.key === '.' || e.key === ',') {
        aoDigitarPonto();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        executarCalculo();
      } else if (e.key === 'Backspace') {
        aoApagarUltimo();
      } else if (e.key === 'Escape') {
        aoLimparTudo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aoDigitarNumero, aoSelecionarOperador, aoDigitarPonto, aoApagarUltimo, aoLimparTudo, primeiroOperando, operadorAtual, displayState.valor_atual]);

  // Reutilizar cálculo do histórico
  const reutilizarCalculo = (rec: CalculationRecord) => {
    soundEffects.playKeyClick(640);
    setAvisoDivisaoZero(false);
    setDisplayState({
      expressao_anterior: `Reutilizando: ${rec.primeiro_operando} ${rec.operador} ${rec.segundo_operando}`,
      valor_atual: rec.resultado,
      resetar_proximo_digito: true,
      mensagem_feedback: 'Resultado recuperado! Pode continuar calculando 🎯'
    });
    setPrimeiroOperando(null);
    setOperadorAtual(null);
    setUltimoResultado(rec.resultado);
  };

  // Limpar Histórico
  const limparHistoricoTotal = () => {
    soundEffects.playKeyClick(300);
    salvarHistoricoLocal([]);
    setDisplayState((prev) => ({
      ...prev,
      mensagem_feedback: 'Histórico de lições limpo com sucesso! 📝'
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5">
      {/* Barra de Controles Rápidos do Simulador */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shadow-xs">
            🎨
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-2">
              Calculadora Infantil Desktop
              <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-body">
                Simulador CustomTkinter
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interface tátil com paleta pastel e prevenção de frustrações
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Som */}
          <button
            onClick={toggleSom}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              somAtivo
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title="Alternar sons da calculadora"
          >
            {somAtivo ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{somAtivo ? 'Sons ON' : 'Mudo'}</span>
          </button>

          {/* Botão Alternar Histórico */}
          <button
            onClick={() => setHistoricoAberto(!historicoAberto)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              historicoAberto
                ? 'bg-sky-50 border-sky-300 text-sky-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{historicoAberto ? 'Ocultar Histórico' : 'Ver Histórico'}</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Calculadora Desktop + Gaveta Lateral de Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LADO ESQUERDO: Corpo da Calculadora (8 colunas em lg) */}
        <div className={`transition-all duration-300 ${historicoAberto ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-200/90 shadow-sm relative overflow-hidden">
            {/* Decoração superior lúdica */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
                <span className="text-xs font-bold text-slate-400 ml-2 tracking-wide font-display">
                  JANELA PYTHON DESKTOP (CUSTOMTKINTER)
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">PT-BR · 100% Offline</span>
            </div>

            {/* VISOR COMPONENTE (Dupla Linha + Banner de Incentivo) */}
            <div className={`rounded-2xl p-4.5 mb-5 border-2 transition-colors ${
              avisoDivisaoZero
                ? 'bg-orange-50 border-orange-300'
                : 'bg-slate-900 text-white border-slate-800'
            }`}>
              {/* Linha de Incentivo Emocional */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${avisoDivisaoZero ? 'text-orange-600' : 'text-teal-400'}`} />
                  <span className={`text-xs font-semibold font-display tracking-wide ${
                    avisoDivisaoZero ? 'text-orange-700' : 'text-teal-300'
                  }`}>
                    {displayState.mensagem_feedback}
                  </span>
                </div>
                {ultimoResultado && !avisoDivisaoZero && (
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-medium">
                    Acertou! 🎉
                  </span>
                )}
              </div>

              {/* Linha Superior Menor: Expressão em montagem */}
              <div className="h-6 flex items-center justify-end text-sm font-mono tracking-wider overflow-hidden">
                <span className={avisoDivisaoZero ? 'text-orange-900/60' : 'text-slate-400'}>
                  {displayState.expressao_anterior || '\u00A0'}
                </span>
              </div>

              {/* Linha Inferior Maior: Valor Atual / Resultado Destacado */}
              <div className="flex items-baseline justify-end overflow-hidden pt-1">
                <span className={`font-display text-4xl sm:text-5xl font-bold tracking-tight select-all tabular-nums ${
                  avisoDivisaoZero ? 'text-orange-600' : 'text-white'
                }`}>
                  {displayState.valor_atual}
                </span>
              </div>
            </div>

            {/* TECLADO COMPONENTE (Grade 4x5 de Botões Pastéis) */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {/* LINHA 0: C, ⌫, %, ÷ */}
              <button
                onClick={aoLimparTudo}
                className="h-14 rounded-2xl bg-rose-100 hover:bg-rose-200 active:scale-95 text-rose-700 font-display text-lg font-bold shadow-xs border border-rose-200/60 transition-all flex items-center justify-center gap-1"
                title="Limpar tudo (Esc)"
              >
                <RotateCcw className="w-4 h-4" />
                <span>C</span>
              </button>

              <button
                onClick={aoApagarUltimo}
                className="h-14 rounded-2xl bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-800 font-display text-lg font-bold shadow-xs border border-amber-200/60 transition-all flex items-center justify-center gap-1"
                title="Corrigir último dígito (Backspace)"
              >
                <span>⌫</span>
              </button>

              <button
                onClick={() => aoSelecionarOperador('%')}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-display text-lg font-bold shadow-xs border border-slate-200 transition-all"
                title="Porcentagem"
              >
                %
              </button>

              <button
                onClick={() => aoSelecionarOperador('÷')}
                className={`h-14 rounded-2xl font-display text-2xl font-bold shadow-xs border transition-all ${
                  operadorAtual === '÷'
                    ? 'bg-orange-400 text-white border-orange-500 scale-102 ring-2 ring-orange-200'
                    : 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200/60'
                }`}
                title="Dividir (/)"
              >
                ÷
              </button>

              {/* LINHA 1: 7, 8, 9, × */}
              {['7', '8', '9'].map((dig) => (
                <button
                  key={dig}
                  onClick={() => aoDigitarNumero(dig)}
                  className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 font-display text-2xl font-bold shadow-xs border border-slate-200/70 transition-all"
                >
                  {dig}
                </button>
              ))}
              <button
                onClick={() => aoSelecionarOperador('×')}
                className={`h-14 rounded-2xl font-display text-2xl font-bold shadow-xs border transition-all ${
                  operadorAtual === '×'
                    ? 'bg-purple-400 text-white border-purple-500 scale-102 ring-2 ring-purple-200'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200/60'
                }`}
                title="Multiplicar (*)"
              >
                ×
              </button>

              {/* LINHA 2: 4, 5, 6, - */}
              {['4', '5', '6'].map((dig) => (
                <button
                  key={dig}
                  onClick={() => aoDigitarNumero(dig)}
                  className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 font-display text-2xl font-bold shadow-xs border border-slate-200/70 transition-all"
                >
                  {dig}
                </button>
              ))}
              <button
                onClick={() => aoSelecionarOperador('-')}
                className={`h-14 rounded-2xl font-display text-2xl font-bold shadow-xs border transition-all ${
                  operadorAtual === '-'
                    ? 'bg-sky-400 text-white border-sky-500 scale-102 ring-2 ring-sky-200'
                    : 'bg-sky-100 hover:bg-sky-200 text-sky-800 border-sky-200/60'
                }`}
                title="Subtrair (-)"
              >
                -
              </button>

              {/* LINHA 3: 1, 2, 3, + */}
              {['1', '2', '3'].map((dig) => (
                <button
                  key={dig}
                  onClick={() => aoDigitarNumero(dig)}
                  className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 font-display text-2xl font-bold shadow-xs border border-slate-200/70 transition-all"
                >
                  {dig}
                </button>
              ))}
              <button
                onClick={() => aoSelecionarOperador('+')}
                className={`h-14 rounded-2xl font-display text-2xl font-bold shadow-xs border transition-all ${
                  operadorAtual === '+'
                    ? 'bg-emerald-500 text-white border-emerald-600 scale-102 ring-2 ring-emerald-200'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200/60'
                }`}
                title="Somar (+)"
              >
                +
              </button>

              {/* LINHA 4: 0 (span 2), ., = */}
              <button
                onClick={() => aoDigitarNumero('0')}
                className="col-span-2 h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 font-display text-2xl font-bold shadow-xs border border-slate-200/70 transition-all"
              >
                0
              </button>

              <button
                onClick={aoDigitarPonto}
                className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-800 font-display text-2xl font-bold shadow-xs border border-slate-200/70 transition-all"
                title="Vírgula decimal"
              >
                .
              </button>

              <button
                onClick={() => executarCalculo()}
                className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-display text-2xl font-bold shadow-md shadow-emerald-500/20 transition-all border border-emerald-400"
                title="Calcular resultado (Enter)"
              >
                =
              </button>
            </div>

            {/* Rodapé de Dica de Atalhos de Teclado */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-400 flex items-center justify-center gap-3">
              <span>⌨️ Digite pelo teclado: <strong>0-9</strong>, <strong>+</strong>, <strong>-</strong>, <strong>*</strong>, <strong>/</strong>, <strong>Enter</strong> e <strong>Backspace</strong></span>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Painel de Histórico Visual (4 colunas em lg) */}
        {historicoAberto && (
          <div className="lg:col-span-4 bg-slate-50 rounded-3xl p-4 border-2 border-slate-200/90 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-800 font-display">
                  Minhas Contas 📚
                </h4>
              </div>

              {historico.length > 0 && (
                <button
                  onClick={limparHistoricoTotal}
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
                  title="Limpar histórico"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mb-2">
              Confira suas lições de matemática. Salva as últimas 30 contas:
            </p>

            {/* Lista Scrollável de Contas */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {historico.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl mb-2">
                    🎈
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Nenhuma conta ainda!</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Faça seu primeiro cálculo para conferir seu dever aqui.
                  </p>
                </div>
              ) : (
                historico.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-800">
                        {item.primeiro_operando} {item.operador} {item.segundo_operando} ={' '}
                        <span className="text-emerald-600">{item.resultado}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.data_hora}</div>
                    </div>

                    <button
                      onClick={() => reutilizarCalculo(item)}
                      className="opacity-80 group-hover:opacity-100 px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1"
                      title="Usar esse resultado"
                    >
                      <span>Usar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
