"""
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
    
    Características pedagógicas e de robustez:
    1. Mantém no máximo 30 registros mais recentes para evitar poluição visual e lentidão.
    2. Cria o arquivo automaticamente se não existir.
    3. Protege a aplicação contra crashes caso o arquivo JSON seja alterado ou corrompido externamente.
    """

    LIMITE_MAXIMO_REGISTROS: int = 30
    NOME_ARQUIVO_PADRAO: str = "historico_calculadora.json"

    def __init__(self, caminho_arquivo: str | Path | None = None) -> None:
        """
        Inicializa o serviço de histórico.
        Se nenhum caminho for fornecido, usa o diretório de execução atual.
        """
        if caminho_arquivo is None:
            caminho_base = Path(__file__).resolve().parent.parent
            self.arquivo_path = caminho_base / self.NOME_ARQUIVO_PADRAO
        else:
            self.arquivo_path = Path(caminho_arquivo)

    def salvar_calculo(self, registro: CalculationRecord) -> None:
        """
        Adiciona uma nova conta ao topo do histórico e persiste no disco.
        Aplica a regra pedagógica do limite de 30 cálculos para manter a lista ágil e focada.
        """
        historico = self.carregar_historico()
        
        # Insere a operação mais recente no início (ordem cronológica decrescente)
        historico.insert(0, registro)

        # Trunca para manter apenas os 30 registros mais relevantes
        if len(historico) > self.LIMITE_MAXIMO_REGISTROS:
            historico = historico[:self.LIMITE_MAXIMO_REGISTROS]

        self._gravar_no_disco(historico)

    def carregar_historico(self) -> List[CalculationRecord]:
        """
        Lê e desserializa a lista de operações salvas.
        Retorna uma lista vazia caso o arquivo ainda não exista ou contenha formato inválido.
        """
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
            # Pedagogia preventiva: Erro de leitura não deve quebrar a experiência da criança!
            # Registramos silent failback iniciando nova lista
            print(f"[Aviso Pedagógico]: Não foi possível ler o histórico ({erro}). Iniciando lista limpa.")
            return []

    def limpar_historico(self) -> None:
        """
        Apaga todos os registros salvos, permitindo que a criança reinicie uma nova lição de casa.
        """
        self._gravar_no_disco([])

    def _gravar_no_disco(self, registros: List[CalculationRecord]) -> None:
        """
        Grava a lista de registros serializados em formato JSON legível (identação 2).
        """
        try:
            lista_dicionarios = [reg.para_dicionario() for reg in registros]
            with open(self.arquivo_path, "w", encoding="utf-8") as f:
                json.dump(lista_dicionarios, f, ensure_ascii=False, indent=2)
        except OSError as erro:
            print(f"[Erro de Armazenamento]: Falha ao gravar histórico no disco: {erro}")
