import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  HeartHandshake,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  const [copiadoCmd, setCopiadoCmd] = useState<string | null>(null);

  const copiarComando = (texto: string, chave: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoCmd(chave);
    setTimeout(() => setCopiadoCmd(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Instruções Rápidas de Execução */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 text-lg">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Como Executar Localmente no seu Computador
            </h3>
            <p className="text-xs text-slate-500">
              Passo a passo rápido para Windows, macOS e Linux
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Opção A: Execução Modular */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 font-display">
                Opção 1: Projeto Modular (Recomendado)
              </span>
              <button
                onClick={() =>
                  copiarComando(
                    'pip install -r requirements.txt\npython main.py',
                    'modular'
                  )
                }
                className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
              >
                {copiadoCmd === 'modular' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiadoCmd === 'modular' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono overflow-x-auto">
              <code>{`pip install -r requirements.txt\npython main.py`}</code>
            </pre>
            <p className="text-[11px] text-slate-500">
              Executa a arquitetura completa com pastas <code>models/</code>, <code>services/</code> e <code>components/</code>.
            </p>
          </div>

          {/* Opção B: Arquivo Único */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 font-display">
                Opção 2: Arquivo Único Standalone
              </span>
              <button
                onClick={() =>
                  copiarComando(
                    'pip install customtkinter\npython calculadora_infantil_completa.py',
                    'standalone'
                  )
                }
                className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
              >
                {copiadoCmd === 'standalone' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiadoCmd === 'standalone' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono overflow-x-auto">
              <code>{`pip install customtkinter\npython calculadora_infantil_completa.py`}</code>
            </pre>
            <p className="text-[11px] text-slate-500">
              Ideal para quem quer um único arquivo <code>.py</code> sem gerenciar subpastas.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Os 4 Pilares da Arquitetura Pedagógica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pilar 1: Modelos & Dataclasses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-display">
              Modelos Tipados (models/)
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Utiliza <code>OperationType(Enum)</code> para as 4 operações da BNCC com símbolos legíveis e <code>CalculationRecord(dataclass)</code> imutável com UUID e timestamp.
          </p>
          <ul className="text-xs text-slate-500 space-y-1 pt-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Garante segurança de tipos (Type Hints) em Python 3.10+.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Serialização direta com <code>asdict()</code> para JSON.</span>
            </li>
          </ul>
        </div>

        {/* Pilar 2: Persistência Local */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-display">
              Armazenamento Local (services/)
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A classe <code>HistoryStorageService</code> salva no arquivo seguro <code>historico_calculadora.json</code> com limite máximo de 30 operações escolares.
          </p>
          <ul className="text-xs text-slate-500 space-y-1 pt-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Auto-recuperação caso o arquivo JSON seja corrompido externamente.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Operações atômicas de leitura, gravação e limpeza.</span>
            </li>
          </ul>
        </div>

        {/* Pilar 3: Componentes Visuais */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-display">
              Componentes Desacoplados (components/)
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Interface modular com <code>VisorComponent</code>, <code>TecladoComponent</code> e <code>HistoricoComponent</code> desacoplados do controlador.
          </p>
          <ul className="text-xs text-slate-500 space-y-1 pt-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Layout em grid responsivo com pesos proporcionais.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Paleta suave/pastel (sem cansaço visual para crianças).</span>
            </li>
          </ul>
        </div>

        {/* Pilar 4: UX EdTech & Prevenção de Erros */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="text-sm font-bold text-slate-900 font-display">
              Didática & Reforço Positivo
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Focado nas necessidades reais da infância: divisão por zero acolhedora (<em>"Não é possível dividir por zero! 🍰"</em>) e botão <code>⌫</code>.
          </p>
          <ul className="text-xs text-slate-500 space-y-1 pt-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Arredondamento limpo com <code>Decimal</code> para evitar <code>0.30000000004</code>.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Elogios alternados que aumentam o engajamento e a autoestima.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
