"""Offline unit tests: these do not contact TypeSafe or require an API key."""
from jev_example import compare_rankings


def test_reranking_can_change_order():
    original = [{"id": "a", "title": "A"}, {"id": "b", "title": "B"}]
    reranked = [
        {"id": "b", "title": "B", "_relevance_score": 0.91},
        {"id": "a", "title": "A", "_relevance_score": 0.42},
    ]
    result = compare_rankings(original, reranked)
    assert [(row["id"], row["retrieval_rank"], row["rerank_rank"]) for row in result] == [
        ("b", 2, 1), ("a", 1, 2),
    ]
    assert result[0]["relevance_score"] == 0.91


def test_top_k_is_applied_after_reranking():
    original = [{"id": "a", "title": "A"}, {"id": "b", "title": "B"}]
    assert len(compare_rankings(original, original[::-1], top_k=1)) == 1
