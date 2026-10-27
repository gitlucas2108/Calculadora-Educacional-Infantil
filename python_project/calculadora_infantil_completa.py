"""
================================================================================
CALCULADORA INFANTIL EDUCACIONAL (6 A 10 ANOS) - VERSÃO ARQUIVO ÚNICO
================================================================================
Aplicação Desktop Completa e Executável em um único arquivo (Single-File).
Contém todos os Modelos, Serviços, Componentes Visuais e Controlador.

Como executar:
  1. Instale a biblioteca visual:
     pip install customtkinter

  2. Execute o arquivo:
     python calculadora_infantil_completa.py

Desenvolvido para Ensino Fundamental 1 com paleta pastel e prevenção de frustrações.
================================================================================
"""

from dataclasses import dataclass, asdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from enum import Enum
import json
from pathlib import Path
import random
import sys
from typing import Any, Callable, Dict, List, Optional
import uuid

import customtkinter as ctk


# ==============================================================================
# 1. MODELOS DE DADOS E ENUMS (models/)
# ==============================================================================

class OperationType(Enum):
    """As 4 operações aritméticas fundamentais com símbolos visuais."""
    ADICAO = ("+", "Adição")
    SUBTRACAO = ("-", "Subtração")
    MULTIPLICACAO = ("×", "Multiplicação")
    DIVISAO = ("÷", "Divisão")

    def __init__(self, simbolo: str, nome_amigavel: str):
        self.simbolo = simbolo
        self.nome_amigavel = nome_amigavel


@dataclass
class CalculationRecord:
    """Registro individual imutável de um cálculo realizado para o histórico."""
    id: str
    primeiro_operando: float
    segundo_operando: float
    operador: str
    resultado: str
    data_hora: str

    @classmethod
    def criar(cls, primeiro: float, segundo: float, operador: str, resultado: str) -> "CalculationRecord":
        return cls(
            id=str(uuid.uuid4())[:8],
            primeiro_operando=primeiro,
            segundo_operando=segundo,
            operador=operador,
            resultado=str(resultado),
            data_hora=datetime.now().strftime("%d/%m/%Y %H:%M"),
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
    """Estado do visor da calculadora."""
    expressao_anterior: str = ""
    valor_atual: str = "0"
    resetar_proximo_digito: bool = False
    mensagem_feedback: str = "Pronto para a matemática! ✨"


# ==============================================================================
# 2. SERVIÇO DE ARMAZENAMENTO LOCAL (services/)
# ==============================================================================

class HistoryStorageService:
    """
    Gerencia a persistência de até 30 registros no arquivo historico_calculadora.json.
    """
    LIMITE_MAXIMO: int = 30
    ARQUIVO_PADRAO: str = "historico_calculadora.json"

    def __init__(self, caminho_arquivo: Optional[str] = None):
        self.caminho = Path(caminho_arquivo or self.ARQUIVO_PADRAO)

    def salvar_calculo(self, registro: CalculationRecord) -> None:
        historico = self.carregar_historico()
        historico.insert(0, registro)
        if len(historico) > self.LIMITE_MAXIMO:
            historico = historico[:self.LIMITE_MAXIMO]
        self._gravar(historico)

    def carregar_historico(self) -> List[CalculationRecord]:
        if not self.caminho.exists():
            return []
        try:
            with open(self.caminho, "r", encoding="utf-8") as f:
                dados = json.load(f)
            if not isinstance(dados, list):
                return []
            return [CalculationRecord.de_dicionario(d) for d in dados if isinstance(d, dict)]
        except Exception:
            return []

    def limpar_historico(self) -> None:
        self._gravar([])

    def _gravar(self, registros: List[CalculationRecord]) -> None:
        try:
            with open(self.caminho, "w", encoding="utf-8") as f:
                json.dump([r.para_dicionario() for r in registros], f, ensure_ascii=False, indent=2)
        except OSError as e:
            print(f"Erro ao salvar arquivo de histórico: {e}")


# ==============================================================================
# 3. COMPONENTES VISUAIS (components/)
# ==============================================================================

class VisorComponent(ctk.CTkFrame):
    """Visor duplo com frase de incentivo pedagógico."""

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

        self.lbl_feedback = ctk.CTkLabel(
            self,
            text="Pronto para a matemática! ✨",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=13, weight="bold"),
            text_color=("#0D9488", "#2DD4BF"),
            anchor="w"
        )
        self.lbl_feedback.grid(row=0, column=0, padx=18, pady=(12, 2), sticky="ew")

        self.lbl_expressao = ctk.CTkLabel(
            self,
            text="",
            font=ctk.CTkFont(family="Consolas", size=16),
            text_color=("#64748B", "#94A3B8"),
            anchor="e"
        )
        self.lbl_expressao.grid(row=1, column=0, padx=18, pady=(0, 2), sticky="ew")

        self.lbl_valor = ctk.CTkLabel(
            self,
            text="0",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=36, weight="bold"),
            text_color=("#0F172A", "#F8FAFC"),
            anchor="e"
        )
        self.lbl_valor.grid(row=2, column=0, padx=18, pady=(0, 14), sticky="ew")

    def atualizar(self, expressao: str, valor: str, feedback: str = "") -> None:
        self.lbl_expressao.configure(text=expressao)
        self.lbl_valor.configure(text=self._formatar_valor(valor))
        if feedback:
            self.lbl_feedback.configure(text=feedback, text_color=("#0D9488", "#2DD4BF"))

    def exibir_aviso_ludico(self, mensagem: str) -> None:
        """Alerta de divisão por zero ou limites de forma acolhedora."""
        self.lbl_feedback.configure(text=mensagem, text_color=("#EA580C", "#FB923C"))
        self.lbl_valor.configure(text="🍰 Ops!")

    def _formatar_valor(self, texto: str) -> str:
        if len(texto) > 14:
            if "." in texto:
                partes = texto.split(".")
                return f"{partes[0]}.{partes[1][:4]}..."
            return texto[:14] + "..."
        return texto


class TecladoComponent(ctk.CTkFrame):
    """Teclado em grid responsivo com cores pastéis lúdicas."""

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

        self._montar_teclas()

    def _montar_teclas(self) -> None:
        f_btn = ctk.CTkFont(family="Arial Rounded MT Bold", size=20, weight="bold")
        f_op = ctk.CTkFont(family="Arial Rounded MT Bold", size=22, weight="bold")

        # Linha 0: C, ⌫, %, ÷
        self._btn("C", 0, 0, self.ao_clicar_limpar, ("#FFE4E6", "#4C0519"), ("#FECDD3", "#881337"), ("#BE123C", "#FDA4AF"), f_btn)
        self._btn("⌫", 0, 1, self.ao_clicar_apagar, ("#FEF3C7", "#451A03"), ("#FDE68A", "#78350F"), ("#B45309", "#FCD34D"), f_btn)
        self._btn("%", 0, 2, lambda: self.ao_clicar_operador("%"), ("#F1F5F9", "#334155"), ("#E2E8F0", "#475569"), ("#475569", "#E2E8F0"), f_btn)
        self._btn("÷", 0, 3, lambda: self.ao_clicar_operador("÷"), ("#FFEDD5", "#431407"), ("#FED7AA", "#7C2D12"), ("#C2410C", "#FDBA74"), f_op)

        # Linha 1: 7, 8, 9, ×
        self._btn_num("7", 1, 0, f_btn)
        self._btn_num("8", 1, 1, f_btn)
        self._btn_num("9", 1, 2, f_btn)
        self._btn("×", 1, 3, lambda: self.ao_clicar_operador("×"), ("#F3E8FF", "#3B0764"), ("#E9D5FF", "#581C87"), ("#7E22CE", "#D8B4FE"), f_op)

        # Linha 2: 4, 5, 6, -
        self._btn_num("4", 2, 0, f_btn)
        self._btn_num("5", 2, 1, f_btn)
        self._btn_num("6", 2, 2, f_btn)
        self._btn("-", 2, 3, lambda: self.ao_clicar_operador("-"), ("#E0F2FE", "#082F49"), ("#BAE6FD", "#0C4A6E"), ("#0369A1", "#7DD3FC"), f_op)

        # Linha 3: 1, 2, 3, +
        self._btn_num("1", 3, 0, f_btn)
        self._btn_num("2", 3, 1, f_btn)
        self._btn_num("3", 3, 2, f_btn)
        self._btn("+", 3, 3, lambda: self.ao_clicar_operador("+"), ("#DCFCE7", "#052E16"), ("#BBF7D0", "#14532D"), ("#15803D", "#86EFAC"), f_op)

        # Linha 4: 0 (span 2), ., =
        self._btn_num("0", 4, 0, f_btn, span=2)
        self._btn(".", 4, 2, self.ao_clicar_ponto, ("#FFFFFF", "#1E293B"), ("#F1F5F9", "#334155"), ("#1E293B", "#F8FAFC"), f_btn)
        self._btn("=", 4, 3, self.ao_clicar_igual, ("#10B981", "#059669"), ("#059669", "#047857"), ("#FFFFFF", "#FFFFFF"), f_op)

    def _btn_num(self, digito: str, r: int, c: int, fonte, span: int = 1):
        self._btn(
            texto=digito, linha=r, coluna=c,
            comando=lambda d=digito: self.ao_clicar_digito(d),
            bg=("#FFFFFF", "#1E293B"), hover=("#F1F5F9", "#334155"), fg=("#0F172A", "#F8FAFC"),
            fonte=fonte, span=span
        )

    def _btn(self, texto: str, linha: int, coluna: int, comando: Callable, bg, hover, fg, fonte, span: int = 1):
        btn = ctk.CTkButton(
            self, text=texto, command=comando, font=fonte,
            fg_color=bg, hover_color=hover, text_color=fg,
            corner_radius=14, height=54
        )
        btn.grid(row=linha, column=coluna, columnspan=span, padx=4, pady=4, sticky="nsew")


class HistoricoComponent(ctk.CTkFrame):
    """Painel de conferência de deveres escolares."""

    def __init__(self, master, ao_selecionar: Callable[[CalculationRecord], None], ao_limpar: Callable[[], None], **kwargs):
        super().__init__(
            master,
            corner_radius=18,
            fg_color=("#F8FAFC", "#0F172A"),
            border_width=2,
            border_color=("#E2E8F0", "#1E293B"),
            **kwargs
        )
        self.ao_selecionar = ao_selecionar
        self.ao_limpar = ao_limpar

        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure(0, weight=1)

        # Cabeçalho
        topo = ctk.CTkFrame(self, fg_color="transparent")
        topo.grid(row=0, column=0, padx=14, pady=(12, 8), sticky="ew")
        topo.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            topo, text="Minhas Contas 📚",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=15, weight="bold"),
            text_color=("#334155", "#E2E8F0")
        ).grid(row=0, column=0, sticky="w")

        ctk.CTkButton(
            topo, text="Limpar", width=65, height=26, corner_radius=8,
            font=ctk.CTkFont(size=11, weight="bold"),
            fg_color=("#FEE2E2", "#450A0A"), hover_color=("#FECDD3", "#7F1D1D"),
            text_color=("#B91C1C", "#F87171"), command=self.ao_limpar
        ).grid(row=0, column=1, sticky="e")

        self.scroll = ctk.CTkScrollableFrame(self, fg_color="transparent", corner_radius=12)
        self.scroll.grid(row=1, column=0, padx=8, pady=(0, 10), sticky="nsew")
        self.scroll.grid_columnconfigure(0, weight=1)

    def renderizar(self, registros: List[CalculationRecord]) -> None:
        for w in self.scroll.winfo_children():
            w.destroy()

        if not registros:
            ctk.CTkLabel(
                self.scroll, text="Nenhuma conta ainda! 🎈\nComece a calcular.",
                font=ctk.CTkFont(size=12), text_color=("#94A3B8", "#64748B"), justify="center"
            ).pack(pady=40, padx=10)
            return

        for r in registros:
            card = ctk.CTkFrame(self.scroll, corner_radius=12, fg_color=("#FFFFFF", "#1E293B"), border_width=1, border_color=("#E2E8F0", "#334155"))
            card.pack(fill="x", pady=4, padx=2)
            card.grid_columnconfigure(0, weight=1)

            ctk.CTkLabel(card, text=r.expressao_completa, font=ctk.CTkFont(family="Consolas", size=13, weight="bold"), text_color=("#0F172A", "#F8FAFC")).grid(row=0, column=0, padx=10, pady=(6, 2), sticky="w")
            ctk.CTkLabel(card, text=f"Às {r.data_hora[-5:]}", font=ctk.CTkFont(size=10), text_color=("#94A3B8", "#64748B")).grid(row=1, column=0, padx=10, pady=(0, 6), sticky="w")

            ctk.CTkButton(
                card, text="Usar", width=42, height=22, corner_radius=6,
                font=ctk.CTkFont(size=10, weight="bold"),
                fg_color=("#F1F5F9", "#334155"), hover_color=("#E2E8F0", "#475569"),
                text_color=("#475569", "#E2E8F0"), command=lambda reg=r: self.ao_selecionar(reg)
            ).grid(row=0, column=1, rowspan=2, padx=8, pady=4, sticky="e")


# ==============================================================================
# 4. APLICAÇÃO PRINCIPAL (Controller)
# ==============================================================================

class CalculadoraInfantilApp(ctk.CTk):
    """Controlador que amarra Modelos, Visor, Teclado e Histórico."""

    INCENTIVOS = [
        "Muito bem! Continue assim! 🌟",
        "Fantástico! Você é fera! 🎉",
        "Excelente raciocínio! 🎈",
        "Parabéns! Conta resolvida! 🚀",
        "Que cálculo incrível! 🏆",
        "Matemática é divertida! 💡",
        "Você é um pequeno gênio! ⭐"
    ]

    def __init__(self):
        super().__init__()
        self.title("Calculadora Infantil Divertida 🎈")
        self.geometry("780x560")
        self.minsize(680, 500)

        ctk.set_appearance_mode("light")
        ctk.set_default_color_theme("blue")

        self.storage = HistoryStorageService()
        self.estado = DisplayState()
        self.primeiro_operando: Optional[Decimal] = None
        self.operador_atual: Optional[str] = None
        self.historico_visivel: bool = True

        self._iniciar_layout()
        self._atalhos()
        self.painel_historico.renderizar(self.storage.carregar_historico())

    def _iniciar_layout(self):
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=3)
        self.grid_columnconfigure(1, weight=2)

        # Calculadora
        box_calc = ctk.CTkFrame(self, fg_color="transparent")
        box_calc.grid(row=0, column=0, padx=16, pady=16, sticky="nsew")
        box_calc.grid_columnconfigure(0, weight=1)
        box_calc.grid_rowconfigure(0, weight=0)
        box_calc.grid_rowconfigure(1, weight=0)
        box_calc.grid_rowconfigure(2, weight=1)

        # Topo
        topo = ctk.CTkFrame(box_calc, fg_color="transparent")
        topo.grid(row=0, column=0, pady=(0, 8), sticky="ew")
        topo.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(topo, text="Matemática Fácil 🎨", font=ctk.CTkFont(family="Arial Rounded MT Bold", size=18, weight="bold"), text_color=("#334155", "#F8FAFC")).grid(row=0, column=0, sticky="w")
        self.btn_hist = ctk.CTkButton(
            topo, text="Ocultar Histórico 📖", width=135, height=28, corner_radius=10,
            font=ctk.CTkFont(size=11, weight="bold"),
            fg_color=("#E0F2FE", "#0C4A6E"), hover_color=("#BAE6FD", "#075985"), text_color=("#0369A1", "#BAE6FD"),
            command=self.toggle_historico
        )
        self.btn_hist.grid(row=0, column=1, sticky="e")

        # Visor
        self.visor = VisorComponent(box_calc)
        self.visor.grid(row=1, column=0, pady=(0, 14), sticky="nsew")

        # Teclado
        self.teclado = TecladoComponent(
            box_calc,
            ao_clicar_digito=self.ao_digitar_numero,
            ao_clicar_operador=self.ao_selecionar_operador,
            ao_clicar_igual=self.ao_calcular_resultado,
            ao_clicar_limpar=self.ao_limpar_tudo,
            ao_clicar_apagar=self.ao_apagar_ultimo_digito,
            ao_clicar_ponto=self.ao_digitar_ponto
        )
        self.teclado.grid(row=2, column=0, sticky="nsew")

        # Painel Histórico
        self.painel_historico = HistoricoComponent(
            self,
            ao_selecionar=self.ao_reutilizar_historico,
            ao_limpar=self.ao_limpar_historico
        )
        self.painel_historico.grid(row=0, column=1, padx=(0, 16), pady=16, sticky="nsew")

    def _atalhos(self):
        for i in range(10):
            self.bind(str(i), lambda e, d=str(i): self.ao_digitar_numero(d))
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

    def ao_digitar_numero(self, d: str):
        if self.estado.resetar_proximo_digito or self.estado.valor_atual == "0":
            self.estado.valor_atual = d
            self.estado.resetar_proximo_digito = False
        else:
            if len(self.estado.valor_atual.replace(".", "")) < 10:
                self.estado.valor_atual += d
        self.visor.atualizar(self.estado.expressao_anterior, self.estado.valor_atual)

    def ao_digitar_ponto(self):
        if self.estado.resetar_proximo_digito:
            self.estado.valor_atual = "0."
            self.estado.resetar_proximo_digito = False
        elif "." not in self.estado.valor_atual:
            self.estado.valor_atual += "."
        self.visor.atualizar(self.estado.expressao_anterior, self.estado.valor_atual)

    def ao_apagar_ultimo_digito(self):
        if self.estado.resetar_proximo_digito:
            return
        if len(self.estado.valor_atual) > 1:
            self.estado.valor_atual = self.estado.valor_atual[:-1]
            if self.estado.valor_atual == "-":
                self.estado.valor_atual = "0"
        else:
            self.estado.valor_atual = "0"
        self.visor.atualizar(self.estado.expressao_anterior, self.estado.valor_atual)

    def ao_limpar_tudo(self):
        self.estado = DisplayState(mensagem_feedback="Tudo limpo! Comece de novo 🎈")
        self.primeiro_operando = None
        self.operador_atual = None
        self.visor.atualizar("", "0", self.estado.mensagem_feedback)

    def ao_selecionar_operador(self, op: str):
        try:
            val = Decimal(self.estado.valor_atual)
        except InvalidOperation:
            val = Decimal(0)

        if self.primeiro_operando is not None and self.operador_atual and not self.estado.resetar_proximo_digito:
            self.ao_calcular_resultado(auto=True)
            self.primeiro_operando = Decimal(self.estado.valor_atual)
        else:
            self.primeiro_operando = val

        self.operador_atual = op
        self.estado.expressao_anterior = f"{self._fmt(self.primeiro_operando)} {op}"
        self.estado.resetar_proximo_digito = True
        self.visor.atualizar(self.estado.expressao_anterior, self.estado.valor_atual)

    def ao_calcular_resultado(self, auto: bool = False):
        if self.primeiro_operando is None or self.operador_atual is None:
            return
        try:
            op2 = Decimal(self.estado.valor_atual)
        except InvalidOperation:
            op2 = Decimal(0)

        op1 = self.primeiro_operando
        op = self.operador_atual

        # Divisão por zero amigável para crianças!
        if op == "÷" and op2 == Decimal(0):
            self.visor.exibir_aviso_ludico("Não é possível dividir por zero! 🍰")
            self.estado.expressao_anterior = f"{self._fmt(op1)} ÷ 0 ="
            self.estado.resetar_proximo_digito = True
            self.primeiro_operando = None
            self.operador_atual = None
            return

        # Cálculo
        if op == "+": res = op1 + op2
        elif op == "-": res = op1 - op2
        elif op == "×": res = op1 * op2
        elif op == "÷": res = Decimal(round(float(op1 / op2), 6))
        elif op == "%": res = (op1 * op2) / Decimal(100)
        else: return

        res_str = self._fmt(res)
        conta = f"{self._fmt(op1)} {op} {self._fmt(op2)} ="
        elogio = random.choice(self.INCENTIVOS)

        self.estado.expressao_anterior = conta
        self.estado.valor_atual = res_str
        self.estado.resetar_proximo_digito = True
        self.visor.atualizar(conta, res_str, elogio)

        rec = CalculationRecord.criar(float(op1), float(op2), op, res_str)
        self.storage.salvar_calculo(rec)
        self.painel_historico.renderizar(self.storage.carregar_historico())

        if not auto:
            self.primeiro_operando = None
            self.operador_atual = None

    def _fmt(self, val: Decimal) -> str:
        norm = val.normalize()
        if norm % 1 == 0:
            return f"{int(norm)}"
        return f"{norm:f}".rstrip("0").rstrip(".")

    def ao_reutilizar_historico(self, reg: CalculationRecord):
        self.estado.valor_atual = reg.resultado
        self.estado.resetar_proximo_digito = True
        self.visor.atualizar(f"Reutilizando: {reg.expressao_completa}", reg.resultado, "Resultado pronto! 🎯")

    def ao_limpar_historico(self):
        self.storage.limpar_historico()
        self.painel_historico.renderizar([])
        self.visor.atualizar(self.estado.expressao_anterior, self.estado.valor_atual, "Histórico limpo! 📝")

    def toggle_historico(self):
        if self.historico_visivel:
            self.painel_historico.grid_remove()
            self.btn_hist.configure(text="Mostrar Histórico 📖")
            self.historico_visivel = False
        else:
            self.painel_historico.grid()
            self.btn_hist.configure(text="Ocultar Histórico 📖")
            self.historico_visivel = True


if __name__ == "__main__":
    app = CalculadoraInfantilApp()
    app.mainloop()
