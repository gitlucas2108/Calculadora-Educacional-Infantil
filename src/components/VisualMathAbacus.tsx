import React, { useState } from 'react';
import { VisualCounterTheme } from '../types/calculator';
import { Sparkles, Apple, Star, Cake, PartyPopper } from 'lucide-react';

interface VisualMathAbacusProps {
  num1: number | null;
  num2: number | null;
  operador: string | null;
  resultado: string | null;
}

const THEME_ICONS: Record<VisualCounterTheme, { label: string; icon: string; component: React.ComponentType<{ className?: string }> }> = {
  apples: { label: 'Maçãs', icon: '🍎', component: Apple },
  stars: { label: 'Estrelas', icon: '⭐', component: Star },
  cakes: { label: 'Fatias de Bolo', icon: '🍰', component: Cake },
  balloons: { label: 'Balões', icon: '🎈', component: PartyPopper },
};

export const VisualMathAbacus: React.FC<VisualMathAbacusProps> = ({
  num1,
  num2,
  operador,
  resultado,
}) => {
  const [theme, setTheme] = useState<VisualCounterTheme>('apples');

  // Determina se podemos renderizar visualmente (números inteiros pequenos entre 0 e 20)
  const n1 = num1 !== null ? Math.round(num1) : 0;
  const n2 = num2 !== null ? Math.round(num2) : 0;
  const resNum = resultado ? parseFloat(resultado) : null;
  const resRound = resNum !== null && !isNaN(resNum) ? Math.round(resNum) : null;

  const podeVisualizar = n1 >= 0 && n1 <= 15 && (!num2 || (n2 >= 0 && n2 <= 15));

  const renderItems = (count: number, cor: string) => {
    const safeCount = Math.max(0, Math.min(count, 30));
    return (
      <div className="flex flex-wrap gap-1.5 justify-center py-1">
        {Array.from({ length: safeCount }).map((_, i) => (
          <span
            key={i}
            className={`inline-flex items-center justify-center w-7 h-7 text-base rounded-full ${cor} shadow-xs transform hover:scale-125 transition-transform duration-150 cursor-default select-none`}
            title={`Item #${i + 1}`}
          >
            {THEME_ICONS[theme].icon}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 transition-all">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-display">
            Ábaco Lúdico Visual (Aprenda Quantidades)
          </h4>
        </div>

        {/* Seletor de Tema Visual */}
        <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-amber-200 text-xs">
          {(Object.keys(THEME_ICONS) as VisualCounterTheme[]).map((tKey) => (
            <button
              key={tKey}
              onClick={() => setTheme(tKey)}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                theme === tKey
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
              title={`Trocar itens para ${THEME_ICONS[tKey].label}`}
            >
              {THEME_ICONS[tKey].icon}
            </button>
          ))}
        </div>
      </div>

      {!podeVisualizar && (
        <p className="text-xs text-amber-800/80 py-1">
          💡 <em>Dica:</em> Faça contas com números de 0 a 15 (ex: 5 + 3 ou 4 × 2) para ver os objetos agrupados aqui!
        </p>
      )}

      {podeVisualizar && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center text-center mt-2">
          {/* Grupo 1 */}
          <div className="bg-white/90 rounded-xl p-2.5 border border-amber-100 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Primeiro Grupo: <span className="text-slate-800 font-bold">{n1}</span>
            </div>
            {n1 === 0 ? (
              <span className="text-xs text-slate-400 italic">Zero itens</span>
            ) : (
              renderItems(n1, 'bg-amber-100/60')
            )}
          </div>

          {/* Operador Central */}
          <div className="flex flex-col items-center justify-center py-1">
            <span className="inline-block px-3 py-1 bg-amber-200/90 text-amber-900 font-bold text-lg rounded-full shadow-xs">
              {operador || '+'}
            </span>
            <span className="text-[11px] text-amber-700 font-medium mt-1">
              {operador === '+' && 'Juntando mais'}
              {operador === '-' && 'Tirando'}
              {operador === '×' && 'Grupos repetidos'}
              {operador === '÷' && 'Dividindo em partes'}
              {!operador && 'Operação'}
            </span>
          </div>

          {/* Grupo 2 ou Resultado */}
          <div className="bg-white/90 rounded-xl p-2.5 border border-amber-100 shadow-xs">
            {resRound !== null ? (
              <>
                <div className="text-xs font-semibold text-emerald-600 mb-1">
                  Total Final: <span className="text-emerald-800 font-bold">{resultado}</span>
                </div>
                {resRound > 0 && resRound <= 30 ? (
                  renderItems(resRound, 'bg-emerald-100/70')
                ) : (
                  <span className="text-xs text-emerald-700 font-medium">✨ {resultado}</span>
                )}
              </>
            ) : (
              <>
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  Segundo Grupo: <span className="text-slate-800 font-bold">{n2}</span>
                </div>
                {n2 === 0 ? (
                  <span className="text-xs text-slate-400 italic">Digite o 2º número</span>
                ) : (
                  renderItems(n2, 'bg-blue-100/60')
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
