"""
Componente do Teclado Numérico e de Operações.
Renderiza botões grandes, arredondados e com paleta pastel pedagógica.
"""

from typing import Callable
import customtkinter as ctk


class TecladoComponent(ctk.CTkFrame):
    """
    Teclado responsivo em grid com botões táteis e espaçados.
    
    Cores da Paleta Pastel Pedagógica:
    - Dígitos (0-9): Neutro suave (#F8FAFC / #F1F5F9)
    - Adição (+): Menta Suave (#DCFCE7 / texto #166534)
    - Subtração (-): Céu Claro (#E0F2FE / texto #075985)
    - Multiplicação (×): Lavanda Suave (#F3E8FF / texto #6B21A8)
    - Divisão (÷): Pêssego Pastel (#FFEDD5 / texto #9A3412)
    - Limpar (C): Rosa Acolhedor (#FFE4E6 / texto #9F1239)
    - Apagar (⌫): Âmbar Pastel (#FEF3C7 / texto #92400E)
    - Resultado (=): Esmeralda Alegre (#10B981 / texto #FFFFFF)
    """

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

        # Configura as 4 colunas com pesos proporcionais iguais
        for col in range(4):
            self.grid_columnconfigure(col, weight=1, uniform="col")

        # Configura as 5 linhas com pesos iguais
        for lin in range(5):
            self.grid_rowconfigure(lin, weight=1, uniform="row")

        self._construir_botoes()

    def _construir_botoes(self) -> None:
        """Monta a grade de botões da calculadora."""
        
        fonte_botoes = ctk.CTkFont(family="Arial Rounded MT Bold", size=20, weight="bold")
        fonte_operadores = ctk.CTkFont(family="Arial Rounded MT Bold", size=22, weight="bold")

        # Linha 0: Ações Especiais e Divisão
        self._criar_botao(
            texto="C",
            linha=0, coluna=0,
            comando=self.ao_clicar_limpar,
            cor_fundo=("#FFE4E6", "#4C0519"),
            cor_hover=("#FECDD3", "#881337"),
            cor_texto=("#BE123C", "#FDA4AF"),
            fonte=fonte_botoes
        )
        self._criar_botao(
            texto="⌫",
            linha=0, coluna=1,
            comando=self.ao_clicar_apagar,
            cor_fundo=("#FEF3C7", "#451A03"),
            cor_hover=("#FDE68A", "#78350F"),
            cor_texto=("#B45309", "#FCD34D"),
            fonte=fonte_botoes
        )
        self._criar_botao(
            texto="%",
            linha=0, coluna=2,
            comando=lambda: self.ao_clicar_operador("%"),
            cor_fundo=("#F1F5F9", "#334155"),
            cor_hover=("#E2E8F0", "#475569"),
            cor_texto=("#475569", "#E2E8F0"),
            fonte=fonte_botoes
        )
        self._criar_botao(
            texto="÷",
            linha=0, coluna=3,
            comando=lambda: self.ao_clicar_operador("÷"),
            cor_fundo=("#FFEDD5", "#431407"),
            cor_hover=("#FED7AA", "#7C2D12"),
            cor_texto=("#C2410C", "#FDBA74"),
            fonte=fonte_operadores
        )

        # Linha 1: 7, 8, 9 e Multiplicação
        self._criar_botao_numerico("7", 1, 0, fonte_botoes)
        self._criar_botao_numerico("8", 1, 1, fonte_botoes)
        self._criar_botao_numerico("9", 1, 2, fonte_botoes)
        self._criar_botao(
            texto="×",
            linha=1, coluna=3,
            comando=lambda: self.ao_clicar_operador("×"),
            cor_fundo=("#F3E8FF", "#3B0764"),
            cor_hover=("#E9D5FF", "#581C87"),
            cor_texto=("#7E22CE", "#D8B4FE"),
            fonte=fonte_operadores
        )

        # Linha 2: 4, 5, 6 e Subtração
        self._criar_botao_numerico("4", 2, 0, fonte_botoes)
        self._criar_botao_numerico("5", 2, 1, fonte_botoes)
        self._criar_botao_numerico("6", 2, 2, fonte_botoes)
        self._criar_botao(
            texto="-",
            linha=2, coluna=3,
            comando=lambda: self.ao_clicar_operador("-"),
            cor_fundo=("#E0F2FE", "#082F49"),
            cor_hover=("#BAE6FD", "#0C4A6E"),
            cor_texto=("#0369A1", "#7DD3FC"),
            fonte=fonte_operadores
        )

        # Linha 3: 1, 2, 3 e Adição
        self._criar_botao_numerico("1", 3, 0, fonte_botoes)
        self._criar_botao_numerico("2", 3, 1, fonte_botoes)
        self._criar_botao_numerico("3", 3, 2, fonte_botoes)
        self._criar_botao(
            texto="+",
            linha=3, coluna=3,
            comando=lambda: self.ao_clicar_operador("+"),
            cor_fundo=("#DCFCE7", "#052E16"),
            cor_hover=("#BBF7D0", "#14532D"),
            cor_texto=("#15803D", "#86EFAC"),
            fonte=fonte_operadores
        )

        # Linha 4: 0, Ponto e Igual (com destaque especial)
        self._criar_botao_numerico("0", 4, 0, fonte_botoes, columnspan=2)
        self._criar_botao(
            texto=".",
            linha=4, coluna=2,
            comando=self.ao_clicar_ponto,
            cor_fundo=("#FFFFFF", "#1E293B"),
            cor_hover=("#F1F5F9", "#334155"),
            cor_texto=("#1E293B", "#F8FAFC"),
            fonte=fonte_botoes
        )
        self._criar_botao(
            texto="=",
            linha=4, coluna=3,
            comando=self.ao_clicar_igual,
            cor_fundo=("#10B981", "#059669"),
            cor_hover=("#059669", "#047857"),
            cor_texto=("#FFFFFF", "#FFFFFF"),
            fonte=fonte_operadores
        )

    def _criar_botao_numerico(self, digito: str, linha: int, coluna: int, fonte, columnspan: int = 1) -> None:
        """Cria botão numérico padrão com tom neutro e agradável."""
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
        """Fábrica de botões arredondados e táteis."""
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
