# 🎈 Calculadora Infantil Educacional (6 a 10 anos)

Uma aplicação desktop moderna, acolhedora e desenvolvida sob medida para estudantes do Ensino Fundamental I (6 a 10 anos), com foco pedagógico, prevenção de erros frustrantes e reforço positivo.

---

## 🌟 Recursos Pedagógicos & Diferenciais EdTech

1. **Tratamento Acolhedor de Divisão por Zero**:
   - Em vez de travar o programa ou assustar a criança com `ZeroDivisionError`, a aplicação exibe uma simpática mensagem: *"Não é possível dividir por zero! 🍰"*.
2. **Histórico Visual com Reutilização**:
   - Gaveta lateral que armazena até 30 contas com data/hora, permitindo conferir a lição de casa e clicar em *"Usar"* para aproveitar o resultado no próximo cálculo.
3. **Visor de Dupla Linha**:
   - Linha superior com a conta sendo montada (ex: `12 × 4 =`) e linha inferior com tipografia grande e legível.
4. **Apagar Último Dígito (`⌫`) & Limpar (`C`)**:
   - Correção cirúrgica de dígitos digitados por engano sem obrigar a criança a recomeçar a conta do zero.
5. **Feedbacks Positivos**:
   - Mensagens lúdicas e motivadoras a cada resultado concluído (*"Muito bem! Continue assim! 🌟"*, *"Você é fera! 🎉"*, etc.).
6. **Paleta Pastel Suave**:
   - Botões numéricos neutros, operadores com cores suaves distintas (Adição: menta, Subtração: céu, Multiplicação: lavanda, Divisão: pêssego) e botão igual destacado em verde alegre.

---

## 📂 Estrutura de Diretórios Recomendada

```text
calculadora_infantil/
│
├── models/
│   ├── __init__.py
│   ├── enums.py            # OperationType (Enum com símbolos e nomes amigáveis)
│   └── records.py          # CalculationRecord e DisplayState (Dataclasses tipadas)
│
├── services/
│   ├── __init__.py
│   └── history_service.py  # HistoryStorageService (JSON com limite de 30 registros)
│
├── components/
│   ├── __init__.py
│   ├── visor.py            # VisorComponent (dupla linha e feedback lúdico)
│   ├── teclado.py          # TecladoComponent (grid com pesos proporcionais)
│   └── historico.py        # HistoricoComponent (painel retrátil com cards)
│
├── main.py                 # Controlador principal (CalculadoraInfantilApp)
├── calculadora_infantil_completa.py  # Versão completa em arquivo único (opcional)
├── historico_calculadora.json        # Arquivo de persistência local automático
├── requirements.txt        # Dependências (customtkinter)
└── README.md               # Documentação completa
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- **Python 3.10 ou superior** instalado no seu computador.
  - Verifique com: `python --version` ou `python3 --version`.

### 2. Instalação das dependências
Abra o terminal no diretório do projeto e execute:

```bash
pip install -r requirements.txt
```
*(Ou diretamente: `pip install customtkinter`)*

### 3. Executando a Aplicação Modular
```bash
python main.py
```

### 4. Executando a Versão em Arquivo Único (Standalone)
Se preferir rodar sem pastas:
```bash
python calculadora_infantil_completa.py
```

---

## ⌨️ Atalhos de Teclado Suportados

- **0 a 9**: Digita números
- **+ , - , * , /**: Seleciona as operações aritméticas
- **. ou ,**: Ponto decimal
- **Enter ou Return**: Calcula o resultado (`=`)
- **Backspace**: Corrige o último dígito digitado (`⌫`)
- **Escape**: Limpa tudo (`C`)
