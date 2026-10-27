import React, { useState } from 'react';
import { Star, Trophy, Sparkles, Check, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audio';

interface MathQuestion {
  pergunta: string;
  respostaCorreta: number;
  dica: string;
}

const DESAFIOS: MathQuestion[] = [
  { pergunta: '7 + 5', respostaCorreta: 12, dica: 'Tente somar 7 + 3 = 10 e depois adicione mais 2!' },
  { pergunta: '15 - 8', respostaCorreta: 7, dica: 'Pense: 8 mais quanto dá 15?' },
  { pergunta: '4 × 3', respostaCorreta: 12, dica: 'São 4 grupos de 3!' },
  { pergunta: '18 ÷ 2', respostaCorreta: 9, dica: 'Qual é a metade de 18?' },
  { pergunta: '9 + 6', respostaCorreta: 15, dica: 'Tire 1 de 6 para fazer 10 com o 9!' },
  { pergunta: '6 × 5', respostaCorreta: 30, dica: 'Conte de 5 em 5 seis vezes!' }
];

export const PracticeChallenge: React.FC = () => {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostaUsuario, setRespostaUsuario] = useState('');
  const [estrelas, setEstrelas] = useState(0);
  const [mostrarDica, setMostrarDica] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState<string | null>(null);

  const desafio = DESAFIOS[indiceAtual];

  const verificarResposta = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(respostaUsuario.trim());
    if (isNaN(num)) return;

    if (num === desafio.respostaCorreta) {
      soundEffects.playSuccessChime();
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      setEstrelas((prev) => prev + 1);
      setMensagemStatus('Correto! Você acertou em cheio! 🌟');

      setTimeout(() => {
        setMensagemStatus(null);
        setRespostaUsuario('');
        setMostrarDica(false);
        setIndiceAtual((prev) => (prev + 1) % DESAFIOS.length);
      }, 1500);
    } else {
      soundEffects.playFriendlyOops();
      setMensagemStatus('Quase lá! Tente de novo ou use a calculadora para conferir! 🎈');
    }
  };

  return (
    <div className="bg-linear-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 rounded-3xl p-5 max-w-xl mx-auto shadow-xs text-center space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 font-display">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Desafio Divertido da Lição</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{estrelas} Estrelas</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500">Quanto é:</p>
        <div className="text-3xl font-display font-bold text-indigo-950 mt-1">
          {desafio.pergunta} = ?
        </div>
      </div>

      <form onSubmit={verificarResposta} className="flex items-center justify-center gap-2 max-w-xs mx-auto">
        <input
          type="number"
          value={respostaUsuario}
          onChange={(e) => setRespostaUsuario(e.target.value)}
          placeholder="Sua resposta"
          className="w-32 text-center text-lg font-bold font-display px-3 py-2 bg-white rounded-xl border border-indigo-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
        >
          <Check className="w-4 h-4" />
          <span>Conferir</span>
        </button>
      </form>

      {mensagemStatus && (
        <p className="text-xs font-semibold text-indigo-800 animate-fade-in font-display">
          {mensagemStatus}
        </p>
      )}

      <div className="pt-1">
        <button
          type="button"
          onClick={() => setMostrarDica(!mostrarDica)}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mx-auto underline"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{mostrarDica ? 'Esconder dica' : 'Precisa de uma dica?'}</span>
        </button>

        {mostrarDica && (
          <p className="text-xs text-indigo-900/80 bg-white/80 p-2.5 rounded-xl border border-indigo-100 mt-2 max-w-sm mx-auto">
            💡 {desafio.dica}
          </p>
        )}
      </div>
    </div>
  );
};
