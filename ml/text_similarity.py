"""
NIDHIDRISHTI — Text Similarity & Description Clustering Module
Uses TF-IDF vectorization and cosine similarity to find duplicate/similar descriptions.
Protects legitimate batch recommendations against false positives.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class TextSimilarityAnalyzer:
    """TF-IDF based description similarity & cluster analysis."""

    def __init__(self, max_features: int = 5000):
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            stop_words="english",
            ngram_range=(1, 2)
        )
        self.tfidf_matrix = None
        self.titles: List[str] = []
        self.is_fitted = False

    def fit(self, titles: List[str]):
        """Fit vectorizer on a corpus of work titles."""
        clean_titles = [str(t) if pd.notna(t) else "" for t in titles]
        self.titles = clean_titles
        if len(clean_titles) > 0 and any(len(t) > 0 for t in clean_titles):
            self.tfidf_matrix = self.vectorizer.fit_transform(clean_titles)
            self.is_fitted = True

    def find_similar_works(self, target_title: str, top_n: int = 5, threshold: float = 0.75) -> List[Dict[str, Any]]:
        """Finds top N similar titles in fitted corpus above similarity threshold."""
        if not self.is_fitted or not target_title:
            return []

        target_vec = self.vectorizer.transform([target_title])
        sim_scores = cosine_similarity(target_vec, self.tfidf_matrix)[0]

        # Filter above threshold (excluding 1.0 exact self match if querying same list)
        matched_indices = np.where(sim_scores >= threshold)[0]

        results = []
        for idx in matched_indices:
            score = float(sim_scores[idx])
            results.append({
                "corpus_index": int(idx),
                "title": self.titles[idx],
                "similarity": round(score, 3)
            })

        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_n]

def evaluate_description_context(
    work_title: str,
    constituency_name: str,
    recommended_date: Any,
    similar_works: List[Dict[str, Any]],
    same_constituency_count: int,
    diff_constituency_count: int
) -> Dict[str, Any]:
    """
    Evaluates description similarity signal in context.
    Legitimate batch recommendations (same constituency, same date) receive low anomaly weight.
    Cross-constituency or cross-region identical descriptions receive investigation signal.
    """
    total_duplicates = len(similar_works) if similar_works else (same_constituency_count + diff_constituency_count)
    if total_duplicates < 1:
        return {
            "duplicate_count": total_duplicates,
            "same_constituency_count": same_constituency_count,
            "diff_constituency_count": diff_constituency_count,
            "text_anomaly_score": 0.0,
            "is_batch_recommendation": False,
            "anomaly_detected": False,
            "reason_code": "UNIQUE_DESCRIPTION"
        }

    # Batch check: If most duplicates are in same constituency/date -> Legitimate Batch
    is_batch = same_constituency_count >= diff_constituency_count

    if is_batch:
        # Legitimate batch recommendation (e.g., streetlights, handpumps)
        text_anomaly_score = min(20.0, total_duplicates * 2.0)
        reason_code = "BATCH_RECOMMENDATION"
        anomaly_detected = False
    else:
        # Cross-region duplicate recommendation signal
        text_anomaly_score = min(100.0, diff_constituency_count * 25.0)
        reason_code = "SIMILAR_DESCRIPTION"
        anomaly_detected = text_anomaly_score >= 40.0

    return {
        "duplicate_count": total_duplicates,
        "same_constituency_count": same_constituency_count,
        "diff_constituency_count": diff_constituency_count,
        "text_anomaly_score": round(text_anomaly_score, 2),
        "is_batch_recommendation": is_batch,
        "anomaly_detected": anomaly_detected,
        "reason_code": reason_code
    }
