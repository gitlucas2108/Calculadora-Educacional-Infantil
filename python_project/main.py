"""
================================================================================
CALCULADORA INFANTIL EDUCACIONAL (6 A 10 ANOS)
================================================================================
Arquitetura Modular em Python 3.10+ com CustomTkinter.
Desenvolvida com foco em EdTech, usabilidade pedagógica e prevenção de frustrações.

Autor: Arquiteto Especialista em UX/UI EdTech
Licença: MIT / Educacional
================================================================================
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

        # Configurações gerais da janela desktop
        self.title("Calculadora Infantil Divertida 🎈")
        self.geometry("780x560")
        self.minsize(680, 500)

        # Aparência padrão: modo claro com paleta alegre
        ctk.set_appearance_mode("light")
        ctk.set_default_color_theme("blue")

        # Inicialização dos serviços e estado
        self.servico_historico = HistoryStorageService()
        self.estado = DisplayState()
        
        # Variáveis lógicas de controle do cálculo
        self.primeiro_operando: Optional[Decimal] = None
        self.operador_atual: Optional[str] = None
        self.historico_visivel: bool = True

        # Construção da Interface
        self._configurar_grid()
        self._construir_interface()
        self._configurar_atalhos_teclado()
        self._carregar_historico_inicial()

    def _configurar_grid(self) -> None:
        """Define o layout flexível proporcional."""
        self.grid_rowconfigure(0, weight=1)
        # Coluna 0: Calculadora principal (peso 3)
        self.grid_columnconfigure(0, weight=3)
        # Coluna 1: Painel lateral de histórico (peso 2)
        self.grid_columnconfigure(1, weight=2)

    def _construir_interface(self) -> None:
        """Instancia os componentes desacoplados."""
        
        # Container da Calculadora (Lado Esquerdo)
        self.frame_calculadora = ctk.CTkFrame(self, fg_color="transparent")
        self.frame_calculadora.grid(row=0, column=0, padx=16, pady=16, sticky="nsew")
        self.frame_calculadora.grid_columnconfigure(0, weight=1)
        self.frame_calculadora.grid_rowconfigure(0, weight=0)  # Barra de ferramentas / topo
        self.frame_calculadora.grid_rowconfigure(1, weight=0)  # Visor
        self.frame_calculadora.grid_rowconfigure(2, weight=1)  # Teclado

        # Barra de Ferramentas Amigável no topo da calculadora
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

        # Painel Lateral de Histórico (Lado Direito)
        self.painel_historico = HistoricoComponent(
            self,
            ao_selecionar_calculo=self.ao_reutilizar_calculo_historico,
            ao_limpar_historico=self.ao_confirmar_limpeza_historico
        )
        self.painel_historico.grid(row=0, column=1, padx=(0, 16), pady=16, sticky="nsew")

    def _construir_barra_topo(self) -> None:
        """Cria botão para alternar visualização do histórico e tema claro/escuro."""
        barra = ctk.CTkFrame(self.frame_calculadora, fg_color="transparent")
        barra.grid(row=0, column=0, pady=(0, 8), sticky="ew")
        barra.grid_columnconfigure(0, weight=1)

        # Título Lúdico com Ícone
        titulo_app = ctk.CTkLabel(
            barra,
            text="Matemática Fácil 🎨",
            font=ctk.CTkFont(family="Arial Rounded MT Bold", size=18, weight="bold"),
            text_color=("#334155", "#F8FAFC"),
            anchor="w"
        )
        titulo_app.grid(row=0, column=0, sticky="w")

        # Botão para Recolher / Expandir Gaveta de Histórico
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
        """Permite que a criança também use o teclado físico do computador."""
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

    # --------------------------------------------------------------------------
    # REGRAS PEDAGÓGICAS E TRATAMENTO DE CÁLCULO
    # --------------------------------------------------------------------------

    def ao_digitar_numero(self, digito: str) -> None:
        """Adiciona um dígito numérico ao valor atual."""
        if self.estado.resetar_proximo_digito or self.estado.valor_atual == "0":
            self.estado.valor_atual = digito
            self.estado.resetar_proximo_digito = False
        else:
            # Limita a 10 dígitos para manter a legibilidade pedagógica
            if len(self.estado.valor_atual.replace(".", "")) < 10:
                self.estado.valor_atual += digito

        self.visor.atualizar(
            expressao=self.estado.expressao_anterior,
            valor=self.estado.valor_atual
        )

    def ao_digitar_ponto(self) -> None:
        """Adiciona vírgula decimal, evitando múltiplos pontos no mesmo número."""
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
        """
        Recurso Pedagógico: Corrigir Último Dígito (⌫).
        Evita a frustração de ter que digitar toda a conta do zero após um pequeno deslize.
        """
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
        """Reinicia todo o estado da calculadora para uma nova operação limpa."""
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
        """
        Configura a operação aritmética.
        Se já houver um cálculo pendente na fila, executa-o antes de encadear o novo operador.
        """
        try:
            valor_numerico = Decimal(self.estado.valor_atual)
        except InvalidOperation:
            valor_numerico = Decimal(0)

        # Se já existia um primeiro operando pendente e o usuário não recalculou ainda
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
        """
        Executa a operação matemática.
        Aplica regras pedagógicas essenciais:
        1. Tratamento amigável de divisão por zero.
        2. Arredondamento limpo de dízimas e pontos flutuantes com Decimal.
        3. Persistência automática no histórico escolar.
        4. Mensagem festiva de incentivo emocional.
        """
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

        # Execução das operações aritméticas fundamentais
        resultado: Decimal
        if operador == "+":
            resultado = op1 + op2
        elif operador == "-":
            resultado = op1 - op2
        elif operador == "×":
            resultado = op1 * op2
        elif operador == "÷":
            # Arredondamento pedagógico: evita dízimas periódicas intermináveis
            resultado = op1 / op2
            resultado = Decimal(round(float(resultado), 6))
        elif operador == "%":
            resultado = (op1 * op2) / Decimal(100)
        else:
            return

        # Formatação limpa do resultado (remove zeros à direita inúteis)
        resultado_formatado = self._formatar_decimal(resultado)
        conta_completa = f"{self._formatar_decimal(op1)} {operador} {self._formatar_decimal(op2)} ="

        # Mensagem de incentivo positivo
        feedback_escolhido = random.choice(self.MENSAGENS_INCENTIVO)

        # Atualiza o estado
        self.estado.expressao_anterior = conta_completa
        self.estado.valor_atual = resultado_formatado
        self.estado.resetar_proximo_digito = True
        self.estado.mensagem_feedback = feedback_escolhido

        self.visor.atualizar(
            expressao=conta_completa,
            valor=resultado_formatado,
            feedback=feedback_escolhido
        )

        # Salva o cálculo no Histórico Escolar (HistoryStorageService)
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
        """
        Remove zeros redundantes após a vírgula para manter os números
        naturais e compreensíveis para o estudante (ex: 5.0 -> 5; 3.250 -> 3.25).
        """
        # Normaliza o decimal
        normalizado = valor.normalize()
        # Se for um número inteiro redondo
        if normalizado % 1 == 0:
            return f"{int(normalizado)}"
        return f"{normalizado:f}".rstrip("0").rstrip(".")

    # --------------------------------------------------------------------------
    # CONTROLE DO HISTÓRICO LATERAL
    # --------------------------------------------------------------------------

    def _carregar_historico_inicial(self) -> None:
        """Carrega os dados persistidos no arquivo JSON ao iniciar o programa."""
        dados = self.servico_historico.carregar_historico()
        self.painel_historico.renderizar_historico(dados)

    def ao_reutilizar_calculo_historico(self, registro: CalculationRecord) -> None:
        """Permite que a criança clique em uma conta anterior para continuar a calcular."""
        self.estado.valor_atual = registro.resultado
        self.estado.resetar_proximo_digito = True
        feedback = f"Resultado de ({registro.expressao_completa}) carregado! 🎯"
        self.visor.atualizar(
            expressao=f"Usando conta anterior: {registro.id}",
            valor=registro.resultado,
            feedback=feedback
        )

    def ao_confirmar_limpeza_historico(self) -> None:
        """Limpa o arquivo JSON de histórico local."""
        self.servico_historico.limpar_historico()
        self.painel_historico.renderizar_historico([])
        self.visor.atualizar(
            expressao=self.estado.expressao_anterior,
            valor=self.estado.valor_atual,
            feedback="Histórico limpo! Pronto para uma nova lição 📝"
        )

    def alternar_historico(self) -> None:
        """Expande ou esconde a gaveta lateral do histórico."""
        if self.historico_visivel:
            self.painel_historico.grid_remove()
            self.btn_toggle_historico.configure(text="Mostrar Histórico 📖")
            self.historico_visivel = False
        else:
            self.painel_historico.grid()
            self.btn_toggle_historico.configure(text="Ocultar Histórico 📖")
            self.historico_visivel = True


def iniciar() -> None:
    """Ponto de entrada da aplicação desktop."""
    app = CalculadoraInfantilApp()
    app.mainloop()


if __name__ == "__main__":
    iniciar()
