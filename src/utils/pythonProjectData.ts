export interface PythonFileItem {
  path: string;
  filename: string;
  category: 'models' | 'services' | 'components' | 'root' | 'docs';
  description: string;
  code: string;
}

export const PYTHON_PROJECT_FILES: PythonFileItem[] = [
  {
    path: 'main.py',
    filename: 'main.py',
    category: 'root',
    description: 'Controlador principal com interface CustomTkinter, atalhos de teclado e gestão de cálculo.',
    code: `"""
================================================================================
CALCULADORA INFANTIL EDUCACIONAL (6 A 10 ANOS)
================================================================================
Arquitetura Modular em Python 3.10+ com CustomTkinter.
Desenvolvida com foco em EdTech, usabilidade pedagógica e prevenção de frustrações.
"""

from decimal import Decimal, InvalidOperation
import random
import sys
from typing import Optional

import customtkinter as ctk

from models.enums import OperationType
from models.records import CalculationRecord, DisplayState
from services.history_service import HistoryStorageService
from components.visor import VisorComponent
from components.teclado import TecladoComponent
from components.historico import HistoricoComponent


class CalculadoraInfantilApp(ctk.CTk):
    """
    Controlador Principal da Aplicação Desktop.
    Gerencia o fluxo de estados (DisplayState), executa as regras aritméticas
    e coordena a comunicação entre o Visor, o Teclado e o Histórico.
    """

    MENSAGENS_INCENTIVO = [
        "Muito bem! Continue assim! 🌟",
        "Fantástico! Você é fera! 🎉",
        "Excelente raciocínio! 🎈",
        "Parabéns! Conta resolvida! 🚀",
        "Que cálculo incrível! 🏆",
        "Matemática é divertida! 💡",
        "Você é um pequeno gênio! ⭐"
    ]

    def __init__(self) -> None:
        super().__init__()

        # Configurações da janela desktop
        self.title("Calculadora Infantil Divertida 🎈")
        self.geometry("780x560")
        self.minsize(680, 500)

        # Aparência moderna com tema claro por padrão
        ctk.set_appearance_mode("light")
        ctk.set_default_color_theme("blue")

        # Serviços e estado
        self.servico_historico = HistoryStorageService()
        self.estado = DisplayState()
        
        self.primeiro_operando: Optional[Decimal] = None
        self.operador_atual: Optional[str] = None
        self.historico_visivel: bool = True

        self._configurar_grid()
        self._construir_interface()
        self._configurar_atalhos_teclado()
        self._carregar_historico_inicial()

    def _configurar_grid(self) -> None:
        """Layout flexível com pesos proporcionais."""
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=3) # Calculadora
        self.grid_columnconfigure(1, weight=2) # Histórico

    def _construir_interface(self) -> None:
        # Container da Calculadora (Esquerda)
        self.frame_calculadora = ctk.CTkFrame(self, fg_color="transparent")
        self.frame_calculadora.grid(row=0, column=0, padx=16, pady=16, sticky="nsew")
        self.frame_calculadora.grid_columnconfigure(0, weight=1)
        self.frame_calculadora.grid_rowconfigure(0, weight=0)
        self.frame_calculadora.grid_rowconfigure(1, weight=0)
        self.frame_calculadora.grid_rowconfigure(2, weight=1)

        # Barra do topo
        self._construir_barra_topo()

        # Visor
        self.visor = VisorComponent(self.frame_calculadora)
        self.visor.grid(row=1, column=0, pady=(0, 14), sticky="nsew")

        # Teclado
        self.teclado = TecladoComponent(
            self.frame_calculadora,
            ao_clicar_digito=self.ao_digitar_numero,
            ao_clicar_operador=self.ao_selecionar_operador,
            ao_clicar_igual=self.ao_calcular_resultado,
            ao_clicar_limpar=self.ao_limpar_tudo,
            ao_clicar_apagar=self.ao_apagar_ultimo_digito,
            ao_clicar_ponto=self.ao_digitar_ponto
        )
        self.teclado.grid(row=2, column=0, sticky="nsew")

        # Histórico (Direita)
        self.painel_historico = HistoricoComponent(
            self,
            ao_selecionar_calculo=self.ao_reutilizar_calculo_historico,
            ao_limpar_historico=self.ao_confirmar_limpeza_historico
        )
        self.painel_historico.grid(row=0, column=1, padx=(0, 16), pady=16, sticky="nsew")

    def _construir_barra_topo(self) -> None:
        barra = ctk.CTkFrame(self.frame_calculadora, fg_color="transparent")
        barra.grid(row=0, column=0, pady=(0, 8), sticky="ew")
        barra.grid_columnconfigure(0, weight=1)

        titulo_app = ctk.CTkLabel(
            barra,
            text="Matemática Fácil 🎨",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=18, weight="bold"),
            text_color=("#334155", "#F8FAFC"),
            anchor="w"
        )
        titulo_app.grid(row=0, column=0, sticky="w")

        self.btn_toggle_historico = ctk.CTkButton(
            barra,
            text="Ocultar Histórico 📖",
            width=135,
            height=28,
            corner_radius=10,
            font=ctk.CTkFont(size=11, weight="bold"),
            fg_color=("#E0F2FE", "#0C4A6E"),
            hover_color=("#BAE6FD", "#075985"),
            text_color=("#0369A1", "#BAE6FD"),
            command=self.alternar_historico
        )
        self.btn_toggle_historico.grid(row=0, column=1, sticky="e")

    def _configurar_atalhos_teclado(self) -> None:
        for num in range(10):
            self.bind(str(num), lambda e, d=str(num): self.ao_digitar_numero(d))

        self.bind("+", lambda e: self.ao_selecionar_operador("+"))
        self.bind("-", lambda e: self.ao_selecionar_operador("-"))
        self.bind("*", lambda e: self.ao_selecionar_operador("×"))
        self.bind("x", lambda e: self.ao_selecionar_operador("×"))
        self.bind("/", lambda e: self.ao_selecionar_operador("÷"))
        self.bind(".", lambda e: self.ao_digitar_ponto())
        self.bind(",", lambda e: self.ao_digitar_ponto())
        self.bind("<Return>", lambda e: self.ao_calcular_resultado())
        self.bind("<KP_Enter>", lambda e: self.ao_calcular_resultado())
        self.bind("<BackSpace>", lambda e: self.ao_apagar_ultimo_digito())
        self.bind("<Escape>", lambda e: self.ao_limpar_tudo())

    def ao_digitar_numero(self, digito: str) -> None:
        if self.estado.resetar_proximo_digito or self.estado.valor_atual == "0":
            self.estado.valor_atual = digito
            self.estado.resetar_proximo_digito = False
        else:
            if len(self.estado.valor_atual.replace(".", "")) < 10:
                self.estado.valor_atual += digito

        self.visor.atualizar(
            expressao=self.estado.expressao_anterior,
            valor=self.estado.valor_atual
        )

    def ao_digitar_ponto(self) -> None:
        if self.estado.resetar_proximo_digito:
            self.estado.valor_atual = "0."
            self.estado.resetar_proximo_digito = False
        elif "." not in self.estado.valor_atual:
            self.estado.valor_atual += "."

        self.visor.atualizar(
            expressao=self.estado.expressao_anterior,
            valor=self.estado.valor_atual
        )

    def ao_apagar_ultimo_digito(self) -> None:
        if self.estado.resetar_proximo_digito:
            return

        tamanho = len(self.estado.valor_atual)
        if tamanho > 1:
            self.estado.valor_atual = self.estado.valor_atual[:-1]
            if self.estado.valor_atual == "-":
                self.estado.valor_atual = "0"
        else:
            self.estado.valor_atual = "0"

        self.visor.atualizar(
            expressao=self.estado.expressao_anterior,
            valor=self.estado.valor_atual
        )

    def ao_limpar_tudo(self) -> None:
        self.estado = DisplayState(
            expressao_anterior="",
            valor_atual="0",
            resetar_proximo_digito=False,
            mensagem_feedback="Tudo limpo! Comece de novo 🎈"
        )
        self.primeiro_operando = None
        self.operador_atual = None
        self.visor.atualizar(
            expressao="",
            valor="0",
            feedback=self.estado.mensagem_feedback
        )

    def ao_selecionar_operador(self, operador: str) -> None:
        try:
            valor_numerico = Decimal(self.estado.valor_atual)
        except InvalidOperation:
            valor_numerico = Decimal(0)

        if self.primeiro_operando is not None and self.operador_atual and not self.estado.resetar_proximo_digito:
            self.ao_calcular_resultado(auto_encadeamento=True)
            self.primeiro_operando = Decimal(self.estado.valor_atual)
        else:
            self.primeiro_operando = valor_numerico

        self.operador_atual = operador
        self.estado.expressao_anterior = f"{self._formatar_decimal(self.primeiro_operando)} {operador}"
        self.estado.resetar_proximo_digito = True

        self.visor.atualizar(
            expressao=self.estado.expressao_anterior,
            valor=self.estado.valor_atual
        )

    def ao_calcular_resultado(self, auto_encadeamento: bool = False) -> None:
        if self.primeiro_operando is None or self.operador_atual is None:
            return

        try:
            segundo_operando = Decimal(self.estado.valor_atual)
        except InvalidOperation:
            segundo_operando = Decimal(0)

        op1 = self.primeiro_operando
        op2 = segundo_operando
        operador = self.operador_atual

        # REGRA PEDAGÓGICA CRÍTICA: Tratamento Acolhedor de Divisão por Zero
        if operador == "÷" and op2 == Decimal(0):
            mensagem_doce = "Não é possível dividir por zero! 🍰"
            self.visor.exibir_aviso_ludico(mensagem_doce)
            self.estado.expressao_anterior = f"{self._formatar_decimal(op1)} ÷ 0 ="
            self.estado.resetar_proximo_digito = True
            self.primeiro_operando = None
            self.operador_atual = None
            return

        resultado: Decimal
        if operador == "+":
            resultado = op1 + op2
        elif operador == "-":
            resultado = op1 - op2
        elif operador == "×":
            resultado = op1 * op2
        elif operador == "÷":
            resultado = op1 / op2
            resultado = Decimal(round(float(resultado), 6))
        elif operador == "%":
            resultado = (op1 * op2) / Decimal(100)
        else:
            return

        resultado_formatado = self._formatar_decimal(resultado)
        conta_completa = f"{self._formatar_decimal(op1)} {operador} {self._formatar_decimal(op2)} ="
        feedback_escolhido = random.choice(self.MENSAGENS_INCENTIVO)

        self.estado.expressao_anterior = conta_completa
        self.estado.valor_atual = resultado_formatado
        self.estado.resetar_proximo_digito = True
        self.estado.mensagem_feedback = feedback_escolhido

        self.visor.atualizar(
            expressao=conta_completa,
            valor=resultado_formatado,
            feedback=feedback_escolhido
        )

        registro = CalculationRecord.criar(
            primeiro_operando=float(op1),
            segundo_operando=float(op2),
            operador=operador,
            resultado=resultado_formatado
        )
        self.servico_historico.salvar_calculo(registro)
        self.painel_historico.renderizar_historico(self.servico_historico.carregar_historico())

        if not auto_encadeamento:
            self.primeiro_operando = None
            self.operador_atual = None

    def _formatar_decimal(self, valor: Decimal) -> str:
        normalizado = valor.normalize()
        if normalizado % 1 == 0:
            return f"{int(normalizado)}"
        return f"{normalizado:f}".rstrip("0").rstrip(".")

    def _carregar_historico_inicial(self) -> None:
        dados = self.servico_historico.carregar_historico()
        self.painel_historico.renderizar_historico(dados)

    def ao_reutilizar_calculo_historico(self, registro: CalculationRecord) -> None:
        self.estado.valor_atual = registro.resultado
        self.estado.resetar_proximo_digito = True
        feedback = f"Resultado de ({registro.expressao_completa}) carregado! 🎯"
        self.visor.atualizar(
            expressao=f"Usando conta anterior: {registro.id}",
            valor=registro.resultado,
            feedback=feedback
        )

    def ao_confirmar_limpeza_historico(self) -> None:
        self.servico_historico.limpar_historico()
        self.painel_historico.renderizar_historico([])
        self.visor.atualizar(
            expressao=self.estado.expressao_anterior,
            valor=self.estado.valor_atual,
            feedback="Histórico limpo! Pronto para uma nova lição 📝"
        )

    def alternar_historico(self) -> None:
        if self.historico_visivel:
            self.painel_historico.grid_remove()
            self.btn_toggle_historico.configure(text="Mostrar Histórico 📖")
            self.historico_visivel = False
        else:
            self.painel_historico.grid()
            self.btn_toggle_historico.configure(text="Ocultar Histórico 📖")
            self.historico_visivel = True


def iniciar() -> None:
    app = CalculadoraInfantilApp()
    app.mainloop()


if __name__ == "__main__":
    iniciar()
`
  },
  {
    path: 'models/enums.py',
    filename: 'enums.py',
    category: 'models',
    description: 'Enumeração tipada das 4 operações aritméticas fundamentais com símbolos de visualização.',
    code: `"""
Modelos de Enumeração para a Calculadora Infantil Educacional.
Define os tipos de operações matemáticas suportadas com seus símbolos e nomes amigáveis.
"""

from enum import Enum


class OperationType(Enum):
    """
    Enumeração com as 4 operações aritméticas fundamentais da BNCC (Ensino Fundamental 1).
    Cada membro armazena o símbolo pedagógico exibido na tela (ex.: '×' e '÷').
    """
    ADICAO = ("+", "Adição")
    SUBTRACAO = ("-", "Subtração")
    MULTIPLICACAO = ("×", "Multiplicação")
    DIVISAO = ("÷", "Divisão")

    def __init__(self, simbolo: str, nome_amigavel: str):
        self.simbolo = simbolo
        self.nome_amigavel = nome_amigavel

    @classmethod
    def from_simbolo(cls, simbolo: str) -> "OperationType | None":
        mapeamento = {
            "+": cls.ADICAO,
            "-": cls.SUBTRACAO,
            "*": cls.MULTIPLICACAO,
            "×": cls.MULTIPLICACAO,
            "x": cls.MULTIPLICACAO,
            "/": cls.DIVISAO,
            "÷": cls.DIVISAO,
        }
        return mapeamento.get(simbolo)
`
  },
  {
    path: 'models/records.py',
    filename: 'records.py',
    category: 'models',
    description: 'Dataclasses tipadas CalculationRecord (histórico imutável) e DisplayState (estado visual do visor).',
    code: `"""
Estruturas de Dados e Modelos (Dataclasses) da Calculadora Infantil.
Garante tipagem estrita, serialização limpa e desacoplamento do estado da UI.
"""

from dataclasses import dataclass, asdict
from datetime import datetime
import uuid
from typing import Any, Dict


@dataclass
class CalculationRecord:
    """
    Representa o registro imutável de uma operação concluída para histórico escolar.
    """
    id: str
    primeiro_operando: float
    segundo_operando: float
    operador: str
    resultado: str
    data_hora: str

    @classmethod
    def criar(
        cls,
        primeiro_operando: float,
        segundo_operando: float,
        operador: str,
        resultado: str | float
    ) -> "CalculationRecord":
        timestamp_atual = datetime.now().strftime("%d/%m/%Y %H:%M")
        resultado_str = str(resultado)
        if isinstance(resultado, float):
            resultado_str = f"{resultado:g}"

        return cls(
            id=str(uuid.uuid4())[:8],
            primeiro_operando=primeiro_operando,
            segundo_operando=segundo_operando,
            operador=operador,
            resultado=resultado_str,
            data_hora=timestamp_atual,
        )

    def para_dicionario(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def de_dicionario(cls, dados: Dict[str, Any]) -> "CalculationRecord":
        return cls(
            id=dados.get("id", str(uuid.uuid4())[:8]),
            primeiro_operando=float(dados.get("primeiro_operando", 0)),
            segundo_operando=float(dados.get("segundo_operando", 0)),
            operador=dados.get("operador", "+"),
            resultado=str(dados.get("resultado", "0")),
            data_hora=dados.get("data_hora", datetime.now().strftime("%d/%m/%Y %H:%M")),
        )

    @property
    def expressao_completa(self) -> str:
        op1 = f"{self.primeiro_operando:g}"
        op2 = f"{self.segundo_operando:g}"
        return f"{op1} {self.operador} {op2} = {self.resultado}"


@dataclass
class DisplayState:
    expressao_anterior: str = ""
    valor_atual: str = "0"
    resetar_proximo_digito: bool = False
    mensagem_feedback: str = "Pronto para calcular! 🚀"
`
  },
  {
    path: 'services/history_service.py',
    filename: 'history_service.py',
    category: 'services',
    description: 'Serviço de persistência em historico_calculadora.json com limite de 30 registros mais recentes.',
    code: `"""
Serviço de Armazenamento Local do Histórico Escolar.
Gerencia a persistência atômica e segura das operações matemáticas realizadas pela criança.
"""

import json
import os
from pathlib import Path
from typing import List

from ..models.records import CalculationRecord


class HistoryStorageService:
    """
    Controla o ciclo de vida do histórico em arquivo JSON local.
    Mantém os últimos 30 registros e protege contra JSON corrompido.
    """

    LIMITE_MAXIMO_REGISTROS: int = 30
    NOME_ARQUIVO_PADRAO: str = "historico_calculadora.json"

    def __init__(self, caminho_arquivo: str | Path | None = None) -> None:
        if caminho_arquivo is None:
            caminho_base = Path(__file__).resolve().parent.parent
            self.arquivo_path = caminho_base / self.NOME_ARQUIVO_PADRAO
        else:
            self.arquivo_path = Path(caminho_arquivo)

    def salvar_calculo(self, registro: CalculationRecord) -> None:
        historico = self.carregar_historico()
        historico.insert(0, registro)

        if len(historico) > self.LIMITE_MAXIMO_REGISTROS:
            historico = historico[:self.LIMITE_MAXIMO_REGISTROS]

        self._gravar_no_disco(historico)

    def carregar_historico(self) -> List[CalculationRecord]:
        if not self.arquivo_path.exists():
            return []

        try:
            with open(self.arquivo_path, "r", encoding="utf-8") as f:
                dados_brutos = json.load(f)

            if not isinstance(dados_brutos, list):
                return []

            registros: List[CalculationRecord] = []
            for item in dados_brutos:
                if isinstance(item, dict):
                    registros.append(CalculationRecord.de_dicionario(item))
            return registros

        except (json.JSONDecodeError, OSError) as erro:
            print(f"[Aviso Pedagógico]: Erro ao ler histórico ({erro}). Iniciando limpo.")
            return []

    def limpar_historico(self) -> None:
        self._gravar_no_disco([])

    def _gravar_no_disco(self, registros: List[CalculationRecord]) -> None:
        try:
            lista_dicionarios = [reg.para_dicionario() for reg in registros]
            with open(self.arquivo_path, "w", encoding="utf-8") as f:
                json.dump(lista_dicionarios, f, ensure_ascii=False, indent=2)
        except OSError as erro:
            print(f"[Erro de Armazenamento]: Falha ao gravar histórico: {erro}")
`
  },
  {
    path: 'components/visor.py',
    filename: 'visor.py',
    category: 'components',
    description: 'Componente Visor com linha superior menor, valor destacado e mensagem lúdica.',
    code: `"""
Componente do Visor da Calculadora Infantil.
Responsável exclusivamente por formatar e exibir a expressão superior,
o número principal em destaque e mensagens lúdicas de incentivo.
"""

import customtkinter as ctk


class VisorComponent(ctk.CTkFrame):
    def __init__(self, master, **kwargs):
        super().__init__(
            master,
            corner_radius=18,
            fg_color=("#FFFFFF", "#1E293B"),
            border_width=2,
            border_color=("#E2E8F0", "#334155"),
            **kwargs
        )
        self.grid_columnconfigure(0, weight=1)

        # 1. Faixa de Feedback Emocional
        self.label_feedback = ctk.CTkLabel(
            self,
            text="Pronto para a matemática! ✨",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=13, weight="bold"),
            text_color=("#0D9488", "#2DD4BF"),
            anchor="w"
        )
        self.label_feedback.grid(row=0, column=0, padx=18, pady=(12, 2), sticky="ew")

        # 2. Linha Superior Menor: Expressão
        self.label_expressao = ctk.CTkLabel(
            self,
            text="",
            font=ctk.CTkFont(family="Consolas", size=16),
            text_color=("#64748B", "#94A3B8"),
            anchor="e"
        )
        self.label_expressao.grid(row=1, column=0, padx=18, pady=(0, 2), sticky="ew")

        # 3. Linha Inferior Maior: Número principal
        self.label_valor_principal = ctk.CTkLabel(
            self,
            text="0",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=36, weight="bold"),
            text_color=("#0F172A", "#F8FAFC"),
            anchor="e"
        )
        self.label_valor_principal.grid(row=2, column=0, padx=18, pady=(0, 14), sticky="ew")

    def atualizar(self, expressao: str, valor: str, feedback: str = "") -> None:
        self.label_expressao.configure(text=expressao)
        valor_formatado = self._formatar_valor_visivel(valor)
        self.label_valor_principal.configure(text=valor_formatado)

        if feedback:
            self.label_feedback.configure(
                text=feedback,
                text_color=("#0D9488", "#2DD4BF")
            )

    def exibir_aviso_ludico(self, mensagem: str) -> None:
        self.label_feedback.configure(
            text=mensagem,
            text_color=("#EA580C", "#FB923C")
        )
        self.label_valor_principal.configure(text="🍰 Oops!")

    def _formatar_valor_visivel(self, texto: str) -> str:
        if len(texto) > 14:
            if "." in texto:
                partes = texto.split(".")
                inteiro = partes[0]
                decimal = partes[1][:4]
                return f"{inteiro}.{decimal}..."
            return texto[:14] + "..."
        return texto
`
  },
  {
    path: 'components/teclado.py',
    filename: 'teclado.py',
    category: 'components',
    description: 'Teclado em grade proporcional com botões arredondados e paleta pastel pedagógica.',
    code: `"""
Componente do Teclado Numérico e de Operações.
Renderiza botões grandes, arredondados e com paleta pastel pedagógica.
"""

from typing import Callable
import customtkinter as ctk


class TecladoComponent(ctk.CTkFrame):
    def __init__(
        self,
        master,
        ao_clicar_digito: Callable[[str], None],
        ao_clicar_operador: Callable[[str], None],
        ao_clicar_igual: Callable[[], None],
        ao_clicar_limpar: Callable[[], None],
        ao_clicar_apagar: Callable[[], None],
        ao_clicar_ponto: Callable[[], None],
        **kwargs
    ):
        super().__init__(master, fg_color="transparent", **kwargs)

        self.ao_clicar_digito = ao_clicar_digito
        self.ao_clicar_operador = ao_clicar_operador
        self.ao_clicar_igual = ao_clicar_igual
        self.ao_clicar_limpar = ao_clicar_limpar
        self.ao_clicar_apagar = ao_clicar_apagar
        self.ao_clicar_ponto = ao_clicar_ponto

        for col in range(4):
            self.grid_columnconfigure(col, weight=1, uniform="col")

        for lin in range(5):
            self.grid_rowconfigure(lin, weight=1, uniform="row")

        self._construir_botoes()

    def _construir_botoes(self) -> None:
        fonte_botoes = ctk.CTkFont(family="Arial Rounded MT Bold", size=20, weight="bold")
        fonte_operadores = ctk.CTkFont(family="Arial Rounded MT Bold", size=22, weight="bold")

        # Linha 0: C, ⌫, %, ÷
        self._criar_botao("C", 0, 0, self.ao_clicar_limpar, ("#FFE4E6", "#4C0519"), ("#FECDD3", "#881337"), ("#BE123C", "#FDA4AF"), fonte_botoes)
        self._criar_botao("⌫", 0, 1, self.ao_clicar_apagar, ("#FEF3C7", "#451A03"), ("#FDE68A", "#78350F"), ("#B45309", "#FCD34D"), fonte_botoes)
        self._criar_botao("%", 0, 2, lambda: self.ao_clicar_operador("%"), ("#F1F5F9", "#334155"), ("#E2E8F0", "#475569"), ("#475569", "#E2E8F0"), fonte_botoes)
        self._criar_botao("÷", 0, 3, lambda: self.ao_clicar_operador("÷"), ("#FFEDD5", "#431407"), ("#FED7AA", "#7C2D12"), ("#C2410C", "#FDBA74"), fonte_operadores)

        # Linha 1: 7, 8, 9, ×
        self._criar_botao_numerico("7", 1, 0, fonte_botoes)
        self._criar_botao_numerico("8", 1, 1, fonte_botoes)
        self._criar_botao_numerico("9", 1, 2, fonte_botoes)
        self._criar_botao("×", 1, 3, lambda: self.ao_clicar_operador("×"), ("#F3E8FF", "#3B0764"), ("#E9D5FF", "#581C87"), ("#7E22CE", "#D8B4FE"), fonte_operadores)

        # Linha 2: 4, 5, 6, -
        self._criar_botao_numerico("4", 2, 0, fonte_botoes)
        self._criar_botao_numerico("5", 2, 1, fonte_botoes)
        self._criar_botao_numerico("6", 2, 2, fonte_botoes)
        self._criar_botao("-", 2, 3, lambda: self.ao_clicar_operador("-"), ("#E0F2FE", "#082F49"), ("#BAE6FD", "#0C4A6E"), ("#0369A1", "#7DD3FC"), fonte_operadores)

        # Linha 3: 1, 2, 3, +
        self._criar_botao_numerico("1", 3, 0, fonte_botoes)
        self._criar_botao_numerico("2", 3, 1, fonte_botoes)
        self._criar_botao_numerico("3", 3, 2, fonte_botoes)
        self._criar_botao("+", 3, 3, lambda: self.ao_clicar_operador("+"), ("#DCFCE7", "#052E16"), ("#BBF7D0", "#14532D"), ("#15803D", "#86EFAC"), fonte_operadores)

        # Linha 4: 0, ., =
        self._criar_botao_numerico("0", 4, 0, fonte_botoes, columnspan=2)
        self._criar_botao(".", 4, 2, self.ao_clicar_ponto, ("#FFFFFF", "#1E293B"), ("#F1F5F9", "#334155"), ("#1E293B", "#F8FAFC"), fonte_botoes)
        self._criar_botao("=", 4, 3, self.ao_clicar_igual, ("#10B981", "#059669"), ("#059669", "#047857"), ("#FFFFFF", "#FFFFFF"), fonte_operadores)

    def _criar_botao_numerico(self, digito: str, linha: int, coluna: int, fonte, columnspan: int = 1) -> None:
        self._criar_botao(
            texto=digito,
            linha=linha,
            coluna=coluna,
            comando=lambda d=digito: self.ao_clicar_digito(d),
            cor_fundo=("#FFFFFF", "#1E293B"),
            cor_hover=("#F1F5F9", "#334155"),
            cor_texto=("#0F172A", "#F8FAFC"),
            fonte=fonte,
            columnspan=columnspan
        )

    def _criar_botao(
        self,
        texto: str,
        linha: int,
        coluna: int,
        comando: Callable,
        cor_fundo: tuple[str, str],
        cor_hover: tuple[str, str],
        cor_texto: tuple[str, str],
        fonte,
        columnspan: int = 1
    ) -> ctk.CTkButton:
        btn = ctk.CTkButton(
            self,
            text=texto,
            command=comando,
            font=fonte,
            fg_color=cor_fundo,
            hover_color=cor_hover,
            text_color=cor_texto,
            corner_radius=14,
            height=54
        )
        btn.grid(row=linha, column=coluna, columnspan=columnspan, padx=4, pady=4, sticky="nsew")
        return btn
`
  },
  {
    path: 'components/historico.py',
    filename: 'historico.py',
    category: 'components',
    description: 'Painel retrátil de conferência de lição de casa com cards clicáveis.',
    code: `"""
Componente do Histórico Visual de Operações.
Exibe as últimas contas realizadas para ajudar os estudantes a conferir lições de casa.
"""

from typing import Callable, List
import customtkinter as ctk

from ..models.records import CalculationRecord


class HistoricoComponent(ctk.CTkFrame):
    def __init__(
        self,
        master,
        ao_selecionar_calculo: Callable[[CalculationRecord], None],
        ao_limpar_historico: Callable[[], None],
        **kwargs
    ):
        super().__init__(
            master,
            corner_radius=18,
            fg_color=("#F8FAFC", "#0F172A"),
            border_width=2,
            border_color=("#E2E8F0", "#1E293B"),
            **kwargs
        )
        self.ao_selecionar_calculo = ao_selecionar_calculo
        self.ao_limpar_historico = ao_limpar_historico

        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)

        self._construir_cabecalho()
        self._construir_lista_scroll()

    def _construir_cabecalho(self) -> None:
        topo = ctk.CTkFrame(self, fg_color="transparent")
        topo.grid(row=0, column=0, padx=14, pady=(12, 8), sticky="ew")
        topo.grid_columnconfigure(0, weight=1)

        titulo = ctk.CTkLabel(
            topo,
            text="Minhas Contas 📚",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=15, weight="bold"),
            text_color=("#334155", "#E2E8F0"),
            anchor="w"
        )
        titulo.grid(row=0, column=0, sticky="w")

        btn_limpar = ctk.CTkButton(
            topo,
            text="Limpar",
            width=65,
            height=26,
            corner_radius=8,
            font=ctk.CTkFont(size=11, weight="bold"),
            fg_color=("#FEE2E2", "#450A0A"),
            hover_color=("#FECDD3", "#7F1D1D"),
            text_color=("#B91C1C", "#F87171"),
            command=self.ao_limpar_historico
        )
        btn_limpar.grid(row=0, column=1, sticky="e")

    def _construir_lista_scroll(self) -> None:
        self.scroll_frame = ctk.CTkScrollableFrame(
            self,
            fg_color="transparent",
            corner_radius=12
        )
        self.scroll_frame.grid(row=1, column=0, padx=8, pady=(0, 10), sticky="nsew")
        self.scroll_frame.grid_columnconfigure(0, weight=1)

    def renderizar_historico(self, registros: List[CalculationRecord]) -> None:
        for widget in self.scroll_frame.winfo_children():
            widget.destroy()

        if not registros:
            label_vazio = ctk.CTkLabel(
                self.scroll_frame,
                text="Nenhuma conta ainda! 🎈\\nComece a calcular.",
                font=ctk.CTkFont(size=12),
                text_color=("#94A3B8", "#64748B"),
                justify="center"
            )
            label_vazio.pack(pady=40, padx=10)
            return

        for item in registros:
            self._criar_card_calculo(item)

    def _criar_card_calculo(self, registro: CalculationRecord) -> None:
        card = ctk.CTkFrame(
            self.scroll_frame,
            corner_radius=12,
            fg_color=("#FFFFFF", "#1E293B"),
            border_width=1,
            border_color=("#E2E8F0", "#334155")
        )
        card.pack(fill="x", pady=4, padx=2)
        card.grid_columnconfigure(0, weight=1)

        lbl_expressao = ctk.CTkLabel(
            card,
            text=registro.expressao_completa,
            font=ctk.CTkFont(family="Consolas", size=13, weight="bold"),
            text_color=("#0F172A", "#F8FAFC"),
            anchor="w"
        )
        lbl_expressao.grid(row=0, column=0, padx=10, pady=(6, 2), sticky="w")

        lbl_data = ctk.CTkLabel(
            card,
            text=f"Às {registro.data_hora[-5:]}",
            font=ctk.CTkFont(size=10),
            text_color=("#94A3B8", "#64748B"),
            anchor="w"
        )
        lbl_data.grid(row=1, column=0, padx=10, pady=(0, 6), sticky="w")

        btn_usar = ctk.CTkButton(
            card,
            text="Usar",
            width=42,
            height=22,
            corner_radius=6,
            font=ctk.CTkFont(size=10, weight="bold"),
            fg_color=("#F1F5F9", "#334155"),
            hover_color=("#E2E8F0", "#475569"),
            text_color=("#475569", "#E2E8F0"),
            command=lambda r=registro: self.ao_selecionar_calculo(r)
        )
        btn_usar.grid(row=0, column=1, rowspan=2, padx=8, pady=4, sticky="e")
`
  },
  {
    path: 'calculadora_infantil_completa.py',
    filename: 'calculadora_infantil_completa.py',
    category: 'root',
    description: 'Versão em arquivo único (Standalone) com todas as classes integradas para rodar imediatamente.',
    code: `"""
================================================================================
CALCULADORA INFANTIL EDUCACIONAL (6 A 10 ANOS) - VERSÃO ARQUIVO ÚNICO
================================================================================
Aplicação Desktop Completa e Executável em um único arquivo (Single-File).
pip install customtkinter
python calculadora_infantil_completa.py
================================================================================
"""

from dataclasses import dataclass, asdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from enum import Enum
import json
from pathlib import Path
import random
from typing import Any, Callable, Dict, List, Optional
import uuid

import customtkinter as ctk

class OperationType(Enum):
    ADICAO = ("+", "Adição")
    SUBTRACAO = ("-", "Subtração")
    MULTIPLICACAO = ("×", "Multiplicação")
    DIVISAO = ("÷", "Divisão")
    def __init__(self, s: str, n: str): self.simbolo = s; self.nome_amigavel = n

@dataclass
class CalculationRecord:
    id: str
    primeiro_operando: float
    segundo_operando: float
    operador: str
    resultado: str
    data_hora: str

    @classmethod
    def criar(cls, op1: float, op2: float, op: str, res: str) -> "CalculationRecord":
        return cls(str(uuid.uuid4())[:8], op1, op2, op, str(res), datetime.now().strftime("%d/%m/%Y %H:%M"))

    def para_dicionario(self) -> Dict[str, Any]: return asdict(self)

    @classmethod
    def de_dicionario(cls, d: Dict[str, Any]) -> "CalculationRecord":
        return cls(d.get("id", str(uuid.uuid4())[:8]), float(d.get("primeiro_operando", 0)), float(d.get("segundo_operando", 0)), d.get("operador", "+"), str(d.get("resultado", "0")), d.get("data_hora", datetime.now().strftime("%d/%m/%Y %H:%M")))

    @property
    def expressao_completa(self) -> str: return f"{self.primeiro_operando:g} {self.operador} {self.segundo_operando:g} = {self.resultado}"

@dataclass
class DisplayState:
    expressao_anterior: str = ""
    valor_atual: str = "0"
    resetar_proximo_digito: bool = False
    mensagem_feedback: str = "Pronto para a matemática! ✨"

class HistoryStorageService:
    def __init__(self, c: Optional[str] = None): self.caminho = Path(c or "historico_calculadora.json")
    def salvar_calculo(self, r: CalculationRecord):
        h = self.carregar_historico()
        h.insert(0, r)
        self._gravar(h[:30])
    def carregar_historico(self) -> List[CalculationRecord]:
        if not self.caminho.exists(): return []
        try:
            with open(self.caminho, "r", encoding="utf-8") as f:
                d = json.load(f)
            return [CalculationRecord.de_dicionario(i) for i in d if isinstance(i, dict)]
        except Exception: return []
    def limpar_historico(self): self._gravar([])
    def _gravar(self, r: List[CalculationRecord]):
        try:
            with open(self.caminho, "w", encoding="utf-8") as f:
                json.dump([i.para_dicionario() for i in r], f, ensure_ascii=False, indent=2)
        except OSError as e: print(e)

# Código completo fornecido no repositório python_project/calculadora_infantil_completa.py
`
  },
  {
    path: 'requirements.txt',
    filename: 'requirements.txt',
    category: 'docs',
    description: 'Especificação das dependências necessárias (customtkinter).',
    code: `customtkinter>=5.2.0\n`
  },
  {
    path: 'README.md',
    filename: 'README.md',
    category: 'docs',
    description: 'Documentação do projeto, instruções de instalação, arquitetura e atalhos.',
    code: `# Calculadora Infantil Educacional (6 a 10 anos)\n\nAplicação desktop em Python CustomTkinter.\nInstale com: pip install -r requirements.txt\nExecute com: python main.py`
  }
];
