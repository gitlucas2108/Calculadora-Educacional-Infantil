"""
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
    
    Campos:
        id: Identificador único universal (UUID4) para rastreabilidade.
        primeiro_operando: Primeiro número da conta (ex: 5).
        segundo_operando: Segundo número da conta (ex: 3).
        operador: Símbolo da operação matemática ('+', '-', '×', '÷').
        resultado: Valor obtido ou mensagem amigável no caso de restrição pedagógica.
        data_hora: Timestamp legível da realização (ex: '27/10/2026 13:45').
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
        """Método de fábrica para instanciar um novo registro com ID e hora atuais."""
        timestamp_atual = datetime.now().strftime("%d/%m/%Y %H:%M")
        
        # Formatação amigável do resultado (remove casas decimais se for inteiro)
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
        """Converte a dataclass em dicionário para persistência JSON limpa."""
        return asdict(self)

    @classmethod
    def de_dicionario(cls, dados: Dict[str, Any]) -> "CalculationRecord":
        """Reconstitui a instância de CalculationRecord a partir de dados em dicionário."""
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
        """Retorna a conta completa formatada (ex: '5 + 3 = 8')."""
        op1 = f"{self.primeiro_operando:g}"
        op2 = f"{self.segundo_operando:g}"
        return f"{op1} {self.operador} {op2} = {self.resultado}"


@dataclass
class DisplayState:
    """
    Representa o estado visual do visor da calculadora.
    
    Campos:
        expressao_anterior: Linha superior com a conta em andamento (ex: '12 + ').
        valor_atual: Linha inferior principal com o número digitado ou resultado ('5').
        resetar_proximo_digito: Booleano indicando se o próximo clique numérico substitui
                                o visor (usado após apertar '=' ou um operador).
        mensagem_feedback: Texto lúdico motivador ou alerta amigável pedagógico.
    """
    expressao_anterior: str = ""
    valor_atual: str = "0"
    resetar_proximo_digito: bool = False
    mensagem_feedback: str = "Pronto para calcular! 🚀"
