# ⚡ EV Charge Simulator

Simulador de carregamento de veículos elétricos / EV charging simulator.

Feito para responder à pergunta mais comum: **"quantos kWh preciso para carregar até 80%?"** — com bónus de **tempo** e **custo** de carregamento e conversões **kWh ↔ %**.

## Funcionalidades
- 🔋 **Até 80%** (`default`): tamanho da bateria + carga atual → kWh necessários, tempo e custo até 80%.
- ⏱ **Tempo & Custo**: simulação completa de `atual → objetivo` com potência do carregador, eficiência e preço por kWh.
- 🔄 **Conversões kWh ↔ %**: converter entre energia e percentagem da bateria.
- 🌍 Multi-idioma: **Português** 🇵🇹 / **English** 🇬🇧.
- 💱 Moeda: **€ Euro / £ Libra / $ Dólar**.

## Stack
Site **100% estático** — `HTML + CSS + JavaScript` puro, sem dependências, sem backend. Corre 100% no navegador; nenhum dado é enviado.

## Como correr localmente
Basta abrir o `index.html` no browser, ou:
```bash
# com Python
python -m http.server 8080
```

## Deploy no Netlify
1. Carregue o conteúdo desta pasta para um repositório Git (GitHub/GitLab) ou arraste a pasta em [app.netlify.com/drop](https://app.netlify.com/drop).
2. No Netlify: **Add new site → Import from Git** (ou drag & drop).
3. **Build command**: deixar em branco · **Publish directory**: `./` (ou `.` com `netlify.toml` já configurado).
4. O `netlify.toml` incluído já define o build e os headers de cache.

> Alternativa CLI: `netlify deploy --prod`

## Cálculos
- **Energia (kWh) = bateria(kWh) × (alvo − atual)/100**
- **Tempo (h) = energia / potência** (± eficiência no separador “Tempo & Custo”)
- **Custo = energia × preço por kWh**

> Valores estimativos — a potência real de carga varia com o estado da bateria e o ponto de carga.