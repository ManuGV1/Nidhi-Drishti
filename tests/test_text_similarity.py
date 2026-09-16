"""
NIDHIDRISHTI — Unit Tests for Text Similarity & Batch Protection
"""

import pytest
from ml.text_similarity import TextSimilarityAnalyzer, evaluate_description_context

def test_text_similarity_fitting():
    analyzer = TextSimilarityAnalyzer()
    analyzer.fit(["Installation of Solar Streetlights", "Construction of Community Hall", "Installation of Handpump"])
    assert analyzer.is_fitted == True

    results = analyzer.find_similar_works("Installation of Solar Lights", top_n=2, threshold=0.3)
    assert len(results) >= 1
    assert "Streetlights" in results[0]["title"]

def test_batch_recommendation_protection():
    # Same constituency batch recommendation -> Protected against high anomaly score
    res_batch = evaluate_description_context(
        work_title="Installation of LED Streetlight",
        constituency_name="Varanasi",
        recommended_date=None,
        similar_works=[{"title": "Installation of LED Streetlight"}, {"title": "Installation of LED Streetlight"}],
        same_constituency_count=5,
        diff_constituency_count=0
    )
    assert res_batch["is_batch_recommendation"] == True
    assert res_batch["anomaly_detected"] == False
    assert res_batch["reason_code"] == "BATCH_RECOMMENDATION"

def test_cross_region_duplicate_signal():
    # Identical title across different constituencies -> Trigger investigation signal
    res_cross = evaluate_description_context(
        work_title="Unique Specialized Community Library Scheme",
        constituency_name="Varanasi",
        recommended_date=None,
        similar_works=[{"title": "Unique Specialized Community Library Scheme"}],
        same_constituency_count=0,
        diff_constituency_count=4
    )
    assert res_cross["is_batch_recommendation"] == False
    assert res_cross["anomaly_detected"] == True
    assert res_cross["reason_code"] == "SIMILAR_DESCRIPTION"
