"""LanceDB Embedded documentation lab: deterministic records and tested queries.

No API key, embedding service, or external dataset is required.
Requires the Python lancedb package; see requirements.txt.
This is an independent educational example, not official LanceDB code.
"""
from __future__ import annotations

import argparse
import tempfile
from pathlib import Path

import lancedb

RECORDS = [
    {"id": "doc-01", "title": "Connect to a local LanceDB database", "category": "python", "text": "Use lancedb.connect with a local filesystem path.", "vector": [0.85, 0.12, 0.14, 0.18]},
    {"id": "doc-02", "title": "Create and ingest a table", "category": "python", "text": "Add typed records with four-dimensional sample vectors.", "vector": [0.84, 0.18, 0.15, 0.76]},
    {"id": "doc-03", "title": "Run a nearest-neighbor query", "category": "search", "text": "Search for similar vectors with an explicit distance metric.", "vector": [0.11, 0.97, 0.12, 0.19]},
    {"id": "doc-04", "title": "Filter rows before vector search", "category": "search", "text": "Restrict candidate rows with a metadata predicate.", "vector": [0.16, 0.92, 0.15, 0.45]},
    {"id": "doc-05", "title": "Build clear agent instructions", "category": "agents", "text": "Provide exact commands, expected outputs, and recovery steps.", "vector": [0.20, 0.26, 0.96, 0.18]},
    {"id": "doc-06", "title": "Validate examples with pytest", "category": "operations", "text": "Test end-to-end examples to detect documentation drift.", "vector": [0.35, 0.22, 0.76, 0.78]},
    {"id": "doc-07", "title": "Document common query failures", "category": "operations", "text": "Explain vector dimension and filter predicate mistakes.", "vector": [0.41, 0.79, 0.58, 0.12]},
    {"id": "doc-08", "title": "Version documentation against APIs", "category": "agents", "text": "Make API assumptions explicit and link to references.", "vector": [0.11, 0.37, 0.94, 0.47]},
]

QUERY_VECTORS = {
    "vector": [0.10, 0.99, 0.11, 0.15],
    "filter": [0.16, 0.90, 0.19, 0.55],
    "agent": [0.18, 0.30, 0.95, 0.20],
    "ingest": [0.89, 0.18, 0.15, 0.72],
}
CATEGORIES = {"python", "search", "agents", "operations"}


def create_table(directory: str | Path):
    """Build a new, repeatable local LanceDB table from the fixture."""
    db = lancedb.connect(str(directory))
    return db.create_table("doc_chunks", data=RECORDS, mode="overwrite")


def search_docs(table, *, intent: str = "vector", category: str | None = None, limit: int = 3) -> list[dict]:
    """Search with cosine distance, optionally prefiltering by metadata.

    A caller-supplied category must match a known value; never interpolate
    arbitrary user input into a SQL predicate.
    """
    if intent not in QUERY_VECTORS:
        raise ValueError(f"Unknown intent {intent!r}; choose from {sorted(QUERY_VECTORS)}")
    if category is not None and category not in CATEGORIES:
        raise ValueError(f"Unknown category {category!r}; choose from {sorted(CATEGORIES)}")
    if not 1 <= limit <= 8:
        raise ValueError("limit must be between 1 and 8")

    query = table.search(QUERY_VECTORS[intent]).distance_type("cosine")
    if category is not None:
        query = query.where(f"category = '{category}'")
    return query.limit(limit).to_list()


def main() -> None:
    parser = argparse.ArgumentParser(description="Run an isolated LanceDB query with deterministic sample vectors")
    parser.add_argument("--intent", choices=sorted(QUERY_VECTORS), default="vector")
    parser.add_argument("--category", choices=sorted(CATEGORIES), default=None)
    parser.add_argument("--limit", type=int, default=3)
    args = parser.parse_args()

    # A temporary directory keeps a demo run reproducible and avoids
    # accumulating databases in the working directory.
    with tempfile.TemporaryDirectory(prefix="lancedb-doc-lab-") as temp_dir:
        table = create_table(temp_dir)
        for row in search_docs(table, intent=args.intent, category=args.category, limit=args.limit):
            print(f'{row["id"]}: {row["title"]} | category={row["category"]} | cosine distance={row["_distance"]:.4f}')


if __name__ == "__main__":
    main()
