"""
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
        """Converte um caractere/símbolo (ex: '+', '*', 'x', '/') no enum correspondente."""
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
