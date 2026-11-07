# LanceDB Developer Lab — Independent Documentation Engineering Portfolio

An interactive GitHub Pages lab with linked developer documentation, real LanceDB Embedded Python, and behavioral tests. Created by Harold Moses II for a Senior Documentation Engineer portfolio.

**Live lab:** https://hmoses.github.io/lancedb-lab/  
**Developer docs:** https://hmoses.github.io/lancedb-lab/docs/  
**Architecture:** https://hmoses.github.io/lancedb-lab/docs/architecture.html  
**Agent-ready docs:** https://hmoses.github.io/lancedb-lab/docs/agent-readiness.html  
**Portfolio:** https://hmoses.github.io/lancedb-documentation-engineering/

## Run the Python implementation

```sh
cd lancedb-lab
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python example.py --intent vector --limit 3
python example.py --intent agent --category agents --limit 2
python -m pytest -q tests
```

Python 3.11+ recommended. Windows PowerShell activation: `.venv\Scripts\Activate.ps1`.

## What's real, and what's simulated?

- **Real:** `example.py` uses LanceDB Embedded to create a local database, insert fixed 4D numeric vectors, search with cosine distance, filter by metadata, and return results. No API key.
- **Simulated:** `assets/lab.js` demonstrates cosine ranking and metadata filtering against the same fixtures in the browser. It does not run the LanceDB SDK or an embedding model.
- **Automated:** `tests/test_example.py` checks ingestion, row count, result ranking, category filtering, and validation. `.github/workflows/lancedb-lab-ci.yml` attempts the same checks on qualifying pushes and PRs. Confirm execution in the Actions tab.

The example vectors are deliberately hand-authored. They are *not* text embeddings or a benchmark of retrieval quality. Production indexing, performance, and LanceDB Enterprise are outside the scope of this small educational sample.

## Structure

```text
lancedb-lab/
├── index.html                  # Interactive GitHub Pages explorer
├── assets/
│   ├── theme.css               # Brand-inspired responsive visual system
│   └── lab.js                  # Browser-only deterministic simulation
├── docs/
│   ├── index.html              # Installation, querying, tests, troubleshooting
│   ├── architecture.html       # Data/flow/quality contract
│   └── agent-readiness.html    # Reproducible AI-agent evaluation task
├── example.py                  # Real LanceDB Embedded example
├── tests/
│   └── test_example.py
├── requirements.txt
└── README.md
```

## Documentation engineering rationale

- Developers can copy a complete example and verify it.
- Pages link directly to the source code and the official API references.
- Synthetic data makes tests deterministic and avoids private data.
- Testable output properties help detect documentation drift.
- Agent task contracts make inputs, constraints, verification commands, and required evidence explicit.

## Related official sources

- [LanceDB quickstart](https://docs.lancedb.com/quickstart)
- [Vector search](https://docs.lancedb.com/search/vector-search)
- [Metadata filtering](https://docs.lancedb.com/search/filtering)
- [LanceDB documentation repository](https://github.com/lancedb/docs)

## Disclaimer

This project is an independent job-application portfolio and educational demonstration. It is **not affiliated with, sponsored by, or endorsed by LanceDB**. The visual design is inspired by the company's public identity, not an official brand template.
