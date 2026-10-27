"""
Componente do Histórico Visual de Operações.
Exibe as últimas contas realizadas para ajudar os estudantes a conferir lições de casa.
"""

from typing import Callable, List
import customtkinter as ctk

from ..models.records import CalculationRecord


class HistoricoComponent(ctk.CTkFrame):
    """
    Painel lateral scrollável que lista os cálculos recentes de forma lúdica.
    """

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
        """Cria o topo do histórico com título e botão de lixeira amigável."""
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
        """Área rolável onde cada cálculo aparece como um card amigável."""
        self.scroll_frame = ctk.CTkScrollableFrame(
            self,
            fg_color="transparent",
            corner_radius=12
        )
        self.scroll_frame.grid(row=1, column=0, padx=8, pady=(0, 10), sticky="nsew")
        self.scroll_frame.grid_columnconfigure(0, weight=1)

    def renderizar_historico(self, registros: List[CalculationRecord]) -> None:
        """
        Re-renderiza os cartões de histórico com a lista atualizada.
        """
        # Limpa widgets anteriores
        for widget in self.scroll_frame.winfo_children():
            widget.destroy()

        if not registros:
            label_vazio = ctk.CTkLabel(
                self.scroll_frame,
                text="Nenhuma conta ainda! 🎈\nComece a calcular.",
                font=ctk.CTkFont(size=12),
                text_color=("#94A3B8", "#64748B"),
                justify="center"
            )
            label_vazio.pack(pady=40, padx=10)
            return

        # Renderiza cada cálculo como um item clicável
        for item in registros:
            self._criar_card_calculo(item)

    def _criar_card_calculo(self, registro: CalculationRecord) -> None:
        """Cria um card individual com o cálculo e horário formatado."""
        card = ctk.CTkFrame(
            self.scroll_frame,
            corner_radius=12,
            fg_color=("#FFFFFF", "#1E293B"),
            border_width=1,
            border_color=("#E2E8F0", "#334155")
        )
        card.pack(fill="x", pady=4, padx=2)
        card.grid_columnconfigure(0, weight=1)

        # Expressão e Resultado (ex: 5 + 3 = 8)
        lbl_expressao = ctk.CTkLabel(
            card,
            text=registro.expressao_completa,
            font=ctk.CTkFont(family="Consolas", size=13, weight="bold"),
            text_color=("#0F172A", "#F8FAFC"),
            anchor="w"
        )
        lbl_expressao.grid(row=0, column=0, padx=10, pady=(6, 2), sticky="w")

        # Rodapé do card: Hora e dica de clique
        lbl_data = ctk.CTkLabel(
            card,
            text=f"Às {registro.data_hora[-5:]}",
            font=ctk.CTkFont(size=10),
            text_color=("#94A3B8", "#64748B"),
            anchor="w"
        )
        lbl_data.grid(row=1, column=0, padx=10, pady=(0, 6), sticky="w")

        # Botão discreto para reusar o resultado no visor
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
