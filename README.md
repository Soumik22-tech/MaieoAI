# 🧠 MindMesh

![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

> **Multi-LLM debate framework that stress-tests answers through adversarial reasoning**

```text
Query 
  │
  ▼
🤖 Proposer (Groq) ──► 👿 Challenger (Google)
  │                          │
  └─────────► ⚖️ Arbitrator (OpenRouter) ◄────┘
                     │
                     ▼
             ✨ Synthesizer (Google)
                     │
                     ▼
               Final Answer
```

## Why MindMesh?

- **Eliminates Hallucinations**: By forcing a second LLM to aggressively challenge the first LLM's claims, factual errors and hallucinated details are caught before they reach the user.
- **Reduces Bias & Blind Spots**: A single LLM often falls into predictable patterns or presents one-sided views. Adversarial reasoning surfaces counterarguments and edge cases automatically.
- **Synthesized Nuance**: Instead of choosing one model's answer over another, MindMesh extracts the strongest points from both sides of the debate, producing a comprehensive, heavily-vetted final answer.

## How It Works

**1. The Proposer (powered by Groq)**
The Proposer receives your initial query and acts as an expert analyst. It generates the best possible initial answer, completely unaware that it will be scrutinized. It also assigns a confidence score to its response and provides reasoning for that score.

**2. The Challenger (powered by Google / Gemma)**
The Challenger acts as a rigorous devil's advocate. It reads the Proposer's answer and aggressively hunts for flaws, untested assumptions, and logical gaps. It outputs a bulleted list of weaknesses, a potential counterargument, and a severity score indicating how badly the original answer is flawed.

**3. The Arbitrator (powered by OpenRouter / DeepSeek)**
The Arbitrator serves as the impartial judge. It reviews the original query, the Proposer's answer, and the Challenger's critique. It evaluates both sides fairly, assigns performance scores, delivers a final verdict (Proposer Wins, Challenger Wins, or Tie), and lists the strongest key points that must be included in the final synthesis.

**4. The Synthesizer (powered by Google / Gemini)**
The Synthesizer is the master writer. Taking the entire debate history and the Arbitrator's key points, it crafts the single best possible answer to the original query. It ignores the mechanics of the debate itself and simply delivers a clear, thorough, and highly-nuanced response.

## Quickstart

Get MindMesh running locally with the new Web UI in under 2 minutes.

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/mindmesh.git
cd mindmesh

# 2. Install the package and its dependencies
pip install -e .

# 3. Setup your environment variables
cp .env.example .env
```

Open the `.env` file and fill in your API keys for the providers. See the [Free API Keys](#free-api-keys) section below for signup links.

**Running the Local API and Web Interface:**

Step 1: Start the API server
```bash
python -m mindmesh.api
```

Step 2: Open the frontend in your browser
Simply open `frontend/index.html` in your web browser to access the MindMesh Debate UI.

## Free API Keys

MindMesh leverages the best free tiers across the AI ecosystem so you can run debates at zero cost.

| Provider | Model | Free Tier Limits | Signup URL |
|----------|-------|------------------|------------|
| **Groq** | Llama 3.3 70B | Very generous (high RPM) | [console.groq.com](https://console.groq.com/keys) |
| **Google** | Gemma 4 31B / Gemini 2.5 | 15 RPM / 1M tokens/min | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **OpenRouter** | DeepSeek R1 (Free) | Unlimited free endpoints | [openrouter.ai](https://openrouter.ai/keys) |

## Example Output

```text
╭────────────────────────────────────────────────────────────────────────╮
│ Query                                                                  │
╰────────────────────────────────────────────────────────────────────────╯
Is AI regulation going to stifle open-source innovation?

Proposer's Answer:
No, AI regulation will not inherently stifle open-source innovation. In fact, clear 
guidelines can provide a stable environment for developers. By establishing safety 
benchmarks, open-source communities can build trust with enterprises and the public...
Confidence ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 85%

Challenger's Identified Weaknesses:
• The answer naively assumes regulatory compliance costs are low. Open-source 
  maintainers cannot afford million-dollar safety audits.
• It ignores the EU AI Act's initial draft which almost banned general-purpose 
  open-source models entirely.
• It creates a false equivalence between enterprise trust and open-source velocity.

Arbitrator's Verdict:
Result: CHALLENGER_WINS
Proposer Score ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 40%
Challenger Score ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 90%

╭────────────────────────────────────────────────────────────────────────╮
│ Final Synthesized Answer                                               │
╰────────────────────────────────────────────────────────────────────────╯
The impact of AI regulation on open-source innovation is highly dependent on how 
legislation is drafted. While the Proposer correctly notes that clear safety 
benchmarks can foster enterprise adoption and public trust, there is a severe risk 
that regulatory burdens will disproportionately harm open-source communities.

As highlighted by critical counterarguments, open-source maintainers lack the 
financial resources of massive tech conglomerates to perform rigorous, mandated 
safety audits. For example, early drafts of the EU AI Act threatened to inadvertently 
criminalize the distribution of general-purpose open-source weights. Therefore, 
unless regulations explicitly carve out safe harbors for open-source research and 
calibrate compliance costs to organization size, heavy-handed regulation will likely 
stifle open-source innovation in favor of regulatory capture by incumbent tech giants.
```

## Supported Providers

| Provider ID | SDK Used | Configured Models |
|-------------|----------|-------------------|
| `groq` | `openai` | `llama-3.3-70b-versatile` |
| `google` | `google-generativeai` | `gemma-4-31b-it`, `gemini-2.5-flash-preview-04-17` |
| `openrouter`| `openai` | `deepseek/deepseek-r1:free` |

## Roadmap

- [ ] **Multi-Round Debates:** Allow the Proposer to counter the Challenger before Arbitration.
- [ ] **Web UI:** A clean Next.js/React frontend to visualize the debate tree in real-time.
- [ ] **Benchmarking Mode:** Run MindMesh against standard datasets (MMLU, GSM8K) to measure accuracy gains over single models.
- [ ] **RAG Integration:** Allow agents to search the web or vector databases to cite real sources during the debate.
- [ ] **Discord Bot:** Bring MindMesh debates directly to your community servers.

## Contributing

Pull requests are welcome! If you're adding a new LLM provider, please ensure you update `core/router.py` and test it thoroughly.

## License

This project is licensed under the MIT License - see the LICENSE file for details.




.\.venv\Scripts\activate

python -m mindmesh.api