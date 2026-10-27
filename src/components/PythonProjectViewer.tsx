import React, { useState } from 'react';
import { PYTHON_PROJECT_FILES, PythonFileItem } from '../utils/pythonProjectData';
import JSZip from 'jszip';
import {
  FileCode,
  FolderTree,
  Copy,
  Check,
  Download,
  Folder,
  FileText,
  Package,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const PythonProjectViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFileItem>(PYTHON_PROJECT_FILES[0]);
  const [copiado, setCopiado] = useState<boolean>(false);
  const [baixandoZip, setBaixandoZip] = useState<boolean>(false);

  const copiarCodigo = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const baixarArquivoIndividual = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

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

      // Adiciona __init__.py vazios nas pastas necessárias
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
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Top Banner com Botão de Download ZIP do Projeto Completo */}
      <div className="bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 p-4 rounded-3xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐍</span>
            <h3 className="text-base font-bold text-slate-800 font-display">
              Código-Fonte Python 3.10+ & Arquitetura Limpa
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            100% tipado com Type Hints, desacoplado em Models, Services e Components CustomTkinter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={baixarProjetoZip}
            disabled={baixandoZip}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <Package className="w-4 h-4" />
            <span>{baixandoZip ? 'Gerando ZIP...' : 'Baixar Projeto Completo (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Navegador de Arquivos à Esquerda + Visualizador de Código à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Navegador de Diretórios (4 colunas) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs">
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-slate-100 mb-2">
            <FolderTree className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-display">
              Estrutura de Arquivos
            </span>
          </div>

          <div className="space-y-1">
            {PYTHON_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-amber-100/80 text-amber-900 font-bold border border-amber-300/80 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.filename.endsWith('.py') ? (
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-700' : 'text-blue-500'}`} />
                    ) : (
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-700' : 'text-slate-400'}`} />
                    )}
                    <span className="font-mono truncate">{file.path}</span>
                  </div>

                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-sans uppercase font-semibold shrink-0 ml-1 ${
                      file.category === 'models'
                        ? 'bg-blue-50 text-blue-700'
                        : file.category === 'services'
                        ? 'bg-emerald-50 text-emerald-700'
                        : file.category === 'components'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 p-2 bg-slate-50 rounded-xl text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">Como rodar no terminal:</p>
            <div className="font-mono bg-white p-2 rounded-lg border border-slate-200 text-slate-800 text-[10px] space-y-1">
              <div>pip install -r requirements.txt</div>
              <div className="text-emerald-700 font-bold">python main.py</div>
            </div>
          </div>
        </div>

        {/* Visualizador de Código (8 colunas) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Header do Arquivo */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                {selectedFile.path}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copiarCodigo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                title="Copiar código para a área de transferência"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiado ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={baixarArquivoIndividual}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                title="Baixar este arquivo"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar</span>
              </button>
            </div>
          </div>

          {/* Descrição do Arquivo */}
          <div className="bg-slate-800/60 px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{selectedFile.description}</span>
          </div>

          {/* Área de Código */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed custom-scrollbar selection:bg-amber-500/30">
            <pre className="whitespace-pre">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
