"""Behavioral checks for real LanceDB Embedded, not the browser mock."""
from __future__ import annotations

import pytest

from example import CATEGORIES, QUERY_VECTORS, RECORDS, create_table, search_docs


@pytest.fixture()
def table(tmp_path):
    """Every test gets a clean, local, isolated LanceDB database."""
    return create_table(tmp_path / "example.lance")


def test_fixture_contract():
    assert len(RECORDS) == 8
    assert len({row["id"] for row in RECORDS}) == 8
    assert all(len(row["vector"]) == 4 for row in RECORDS)
    assert all(len(vector) == 4 for vector in QUERY_VECTORS.values())
    assert {row["category"] for row in RECORDS} == CATEGORIES


def test_create_table_ingests_expected_records(table):
    assert table.count_rows() == 8


def test_search_returns_nearest_neighbors(table):
    found = search_docs(table, intent="vector", limit=3)
    assert len(found) == 3
    assert all("id" in row and "_distance" in row for row in found)
    assert found[0]["id"] == "doc-03"
    distances = [row["_distance"] for row in found]
    assert distances == sorted(distances)


def test_filtered_search_only_returns_matching_category(table):
    found = search_docs(table, intent="agent", category="agents", limit=2)
    assert len(found) == 2
    assert {row["category"] for row in found} == {"agents"}
    assert found[0]["id"] == "doc-05"


def test_filtered_search_to_search_category(table):
    found = search_docs(table, intent="filter", category="search", limit=3)
    assert len(found) == 2
    assert all(row["category"] == "search" for row in found)


@pytest.mark.parametrize(
    "options",
    [
        {"intent": "undefined"},
        {"category": "unsafe' OR 1=1 --"},
        {"limit": 0},
        {"limit": 9},
    ],
)
def test_rejects_invalid_options(table, options):
    with pytest.raises(ValueError):
        search_docs(table, **options)


def test_add_record_changes_row_count(table):
    table.add([
        {
            "id": "doc-09",
            "title": "New test document",
            "category": "python",
            "text": "A record added during a test.",
            "vector": [0.77, 0.12, 0.15, 0.10],
        }
    ])
    assert table.count_rows() == 9
