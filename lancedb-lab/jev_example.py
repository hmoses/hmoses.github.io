"""Optional hosted Jev reranking lab (requires a TypeSafe API key).

This is a real LanceDB/TypeSafe integration, not the browser illustration.
See docs/jev-reranking.html for prerequisites and limitations.
"""
from __future__ import annotations

import os
import tempfile

from example import QUERY_VECTORS, create_table

QUESTION = "How can I diagnose vector dimension errors in LanceDB?"
CANDIDATES = 8
TOP_K = 3


def compare_rankings(baseline: list[dict], reranked: list[dict], *, top_k: int = TOP_K) -> list[dict]:
    """Compare reranked results with the original candidate ordering."""
    original_rank = {row["id"]: i for i, row in enumerate(baseline, 1)}
    return [
        {
            "id": row["id"],
            "title": row["title"],
            "retrieval_rank": original_rank.get(row["id"]),
            "rerank_rank": i,
            "relevance_score": row.get("_relevance_score"),
        }
        for i, row in enumerate(reranked[:top_k], 1)
    ]


def main() -> None:
    key = os.environ.get("TYPESAFE_API_KEY", "").strip()
    if not key:
        raise SystemExit("Set TYPESAFE_API_KEY before running; see docs/jev-reranking.html.")

    # Requires a LanceDB version containing the native integration.
    from lancedb.rerankers import TypeSafeReranker

    reranker = TypeSafeReranker(
        model_name="jev-1.13.0",
        column="text",
        api_key=key,
        instructions="Is the document relevant to the query?",
        criteria={
            "true": "The document helps answer at least part of the query.",
            "false": "The document is unrelated or only shares keywords with it.",
        },
        batch_size=40,
        max_concurrency=4,
    )
    with tempfile.TemporaryDirectory(prefix="lancedb-jev-lab-") as folder:
        table = create_table(folder)
        query_vector = QUERY_VECTORS["vector"]
        baseline = (
            table.search(query_vector)
            .distance_type("cosine")
            .limit(CANDIDATES)
            .to_list()
        )
        reranked = (
            table.search(query_vector)
            .distance_type("cosine")
            .limit(CANDIDATES)
            .rerank(reranker, QUESTION)
            .to_list()
        )
        print("Question:", QUESTION)
        print("\nVector baseline (lowest distance first)")
        for row in baseline[:TOP_K]:
            print(f'  {row["title"]}: cosine distance={row["_distance"]:.4f}')
        print("\nJev results (highest relevance first)")
        for row in compare_rankings(baseline, reranked):
            score = row["relevance_score"]
            score_str = "unavailable" if score is None else f"{float(score):.3f}"
            print(f'  {row["title"]}: Jev={score_str}; previous rank={row["retrieval_rank"]}')


if __name__ == "__main__":
    main()
