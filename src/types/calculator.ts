export type OperationSymbol = '+' | '-' | '×' | '÷' | '%';

export interface CalculationRecord {
  id: string;
  primeiro_operando: number;
  segundo_operando: number;
  operador: string;
  resultado: string;
  data_hora: string;
}

export interface DisplayState {
  expressao_anterior: string;
  valor_atual: string;
  resetar_proximo_digito: boolean;
  mensagem_feedback: string;
}

export type VisualCounterTheme = 'apples' | 'stars' | 'cakes' | 'balloons';
