"""
Componente do Visor da Calculadora Infantil.
Responsável exclusivamente por formatar e exibir a expressão superior,
o número principal em destaque e mensagens lúdicas de incentivo.
"""

import customtkinter as ctk


class VisorComponent(ctk.CTkFrame):
    """
    Visor moderno de duas linhas com cartaz de incentivo lúdico.
    Projetado para facilitar a visualização por crianças de 6 a 10 anos.
    """

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

        # 1. Faixa de Incentivo / Feedback Emocional
        self.label_feedback = ctk.CTkLabel(
            self,
            text="Pronto para a matemática! ✨",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=13, weight="bold"),
            text_color=("#0D9488", "#2DD4BF"),
            anchor="w"
        )
        self.label_feedback.grid(row=0, column=0, padx=18, pady=(12, 2), sticky="ew")

        # 2. Linha Superior Menor: Expressão em montagem (ex: '7 × 8')
        self.label_expressao = ctk.CTkLabel(
            self,
            text="",
            font=ctk.CTkFont(family="Consolas", size=16),
            text_color=("#64748B", "#94A3B8"),
            anchor="e"
        )
        self.label_expressao.grid(row=1, column=0, padx=18, pady=(0, 2), sticky="ew")

        # 3. Linha Inferior Maior: Número atual / Resultado destacado
        self.label_valor_principal = ctk.CTkLabel(
            self,
            text="0",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=36, weight="bold"),
            text_color=("#0F172A", "#F8FAFC"),
            anchor="e"
        )
        self.label_valor_principal.grid(row=2, column=0, padx=18, pady=(0, 14), sticky="ew")

    def atualizar(self, expressao: str, valor: str, feedback: str = "") -> None:
        """
        Atualiza os campos do visor de maneira segura.
        
        Args:
            expressao: Conta anterior ou em montagem.
            valor: Número sendo digitado ou resultado final.
            feedback: Mensagem de incentivo opcional.
        """
        self.label_expressao.configure(text=expressao)
        
        # Formata o valor principal para não estourar o visor
        valor_formatado = self._formatar_valor_visivel(valor)
        self.label_valor_principal.configure(text=valor_formatado)

        if feedback:
            self.label_feedback.configure(
                text=feedback,
                text_color=("#0D9488", "#2DD4BF")
            )

    def exibir_aviso_ludico(self, mensagem: str) -> None:
        """
        Exibe avisos carinhosos (ex: divisão por zero ou limites).
        Altera a cor do feedback temporariamente para alertar a criança com simpatia.
        """
        self.label_feedback.configure(
            text=mensagem,
            text_color=("#EA580C", "#FB923C")
        )
        self.label_valor_principal.configure(text="🍰 Oops!")

    def _formatar_valor_visivel(self, texto: str) -> str:
        """
        Ajusta textos muito longos para caber harmonicamente no visor infantil.
        """
        if len(texto) > 14:
            # Se for decimal longo, trunca suavemente
            if "." in texto:
                partes = texto.split(".")
                inteiro = partes[0]
                decimal = partes[1][:4]
                return f"{inteiro}.{decimal}..."
            return texto[:14] + "..."
        return texto
