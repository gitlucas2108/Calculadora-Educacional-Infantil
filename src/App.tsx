/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalculatorSimulator } from './components/CalculatorSimulator';
import { PythonProjectViewer } from './components/PythonProjectViewer';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { PracticeChallenge } from './components/PracticeChallenge';
import {
  Calculator,
  Code2,
  BookOpen,
  Trophy,
  Download,
  Package,
  Sparkles
} from 'lucide-react';
import JSZip from 'jszip';
import { PYTHON_PROJECT_FILES } from './utils/pythonProjectData';

type ActiveTab = 'calculadora' | 'codigo' | 'arquitetura' | 'desafios';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculadora');
  const [baixandoZip, setBaixandoZip] = useState<boolean>(false);

  const baixarProjetoZip = async () => {
    setBaixandoZip(true);
    try {
      const zip = new JSZip();
      const pastaRaiz = zip.folder('calculadora_infantil');

      PYTHON_PROJECT_FILES.forEach((f) => {
        if (pastaRaiz) {
          pastaRaiz.file(f.path, f.code);
        }
      });

      pastaRaiz?.file('models/__init__.py', 'from .enums import OperationType\nfrom .records import CalculationRecord, DisplayState\n');
      pastaRaiz?.file('services/__init__.py', 'from .history_service import HistoryStorageService\n');
      pastaRaiz?.file('components/__init__.py', 'from .visor import VisorComponent\nfrom .teclado import TecladoComponent\nfrom .historico import HistoricoComponent\n');

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'calculadora_infantil_python.zip';
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro ao gerar zip:', e);
    } finally {
      setBaixandoZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-body">
      {/* Top Bar seguindo rigorosamente o contrato de 3 zonas */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('calculadora')}
            className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span>🎈</span>
            <span>Calculadora Infantil</span>
          </button>

          {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('calculadora')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'calculadora'
                  ? 'text-slate-950 font-bold border-b-2 border-amber-500'
                  : ''
              }`}
            >
              Simulador
            </button>

            <button
              onClick={() => setActiveTab('codigo')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'codigo'
                  ? 'text-slate-950 font-bold border-b-2 border-amber-500'
                  : ''
              }`}
            >
              Código Python
            </button>

            <button
              onClick={() => setActiveTab('arquitetura')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'arquitetura'
                  ? 'text-slate-950 font-bold border-b-2 border-amber-500'
                  : ''
              }`}
            >
              Arquitetura & Instalação
            </button>

            <button
              onClick={() => setActiveTab('desafios')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'desafios'
                  ? 'text-slate-950 font-bold border-b-2 border-amber-500'
                  : ''
              }`}
            >
              Desafio Escolar
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={baixarProjetoZip}
              disabled={baixandoZip}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Package className="w-3.5 h-3.5" />
              <span>{baixandoZip ? 'Baixando...' : 'Baixar Projeto Python (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navegação Mobile / Tablet em segmented control abaixo do header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('calculadora')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'calculadora'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600'
            }`}
          >
            Simulador
          </button>
          <button
            onClick={() => setActiveTab('codigo')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'codigo'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600'
            }`}
          >
            Código Python
          </button>
          <button
            onClick={() => setActiveTab('arquitetura')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'arquitetura'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600'
            }`}
          >
            Arquitetura & Instalação
          </button>
          <button
            onClick={() => setActiveTab('desafios')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'desafios'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600'
            }`}
          >
            Desafio Escolar
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'calculadora' && (
          <div className="space-y-6">
            <CalculatorSimulator />
          </div>
        )}

        {activeTab === 'codigo' && (
          <div className="space-y-6">
            <PythonProjectViewer />
          </div>
        )}

        {activeTab === 'arquitetura' && (
          <div className="space-y-6">
            <ArchitectureGuide />
          </div>
        )}

        {activeTab === 'desafios' && (
          <div className="space-y-6 py-4">
            <PracticeChallenge />
          </div>
        )}
      </main>

      {/* Rodapé Limpo e Discreto */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Calculadora Infantil Educacional</span>
            <span>·</span>
            <span>EdTech Ensino Fundamental I (6 a 10 anos)</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>Python 3.10+ · CustomTkinter</span>
            <span>·</span>
            <span>Persistência JSON Local</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
