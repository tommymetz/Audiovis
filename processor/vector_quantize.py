"""
Vector quantization module for audio visualization.

This module assigns audio spectral samples to their nearest cluster centroids
using Euclidean distance. Vector quantization is used to compress the audio
visualization data by representing each frame with an index into a codebook
of centroids rather than storing the full spectral data.

The process:
1. Takes normalized STFT samples and pre-computed centroids from K-means
2. Computes Euclidean distance from each sample to all centroids
3. Assigns each sample to the nearest centroid
4. Returns array of centroid indices for efficient storage and rendering

Example usage:
    assignments = vector_quantize(stft_samples, 24, centroids)
"""
from __future__ import annotations

import numpy as np
from numpy.typing import NDArray
from scipy.spatial.distance import cdist


def vector_quantize(
    stftsamples_normalized: list[list[float]],
    centroidcount: int,
    centroids: list[list[float]]
) -> list[int]:
    """
    Assign each sample to its nearest centroid using Euclidean distance.
    
    Performs vector quantization by computing the distance from each spectral
    sample to all centroids and assigning the sample to the closest one.
    This allows the visualization to use compact centroid indices instead
    of full spectral data for each frame.
    
    Args:
        stftsamples_normalized: Normalized STFT samples to quantize.
                               Each sample is a list of frequency bin values.
        centroidcount: Number of centroids (unused but kept for API compatibility
                      with the original interface). The actual centroid count
                      is determined by the length of the centroids list.
        centroids: List of centroid vectors from K-means clustering.
                  Each centroid has the same dimensionality as the samples.
    
    Returns:
        List of cluster assignments, one integer index per sample.
        Each index corresponds to the nearest centroid in the centroids list.
    
    Raises:
        ValueError: If samples or centroids are empty.
    
    Example:
        >>> samples = [[0.1, 0.2], [0.8, 0.9], [0.15, 0.25]]
        >>> centroids = [[0.1, 0.2], [0.8, 0.85]]
        >>> assignments = vector_quantize(samples, 2, centroids)
        >>> assignments
        [0, 1, 0]  # First and third samples assigned to centroid 0
    """
    if not stftsamples_normalized:
        raise ValueError("stftsamples_normalized cannot be empty")
    
    if not centroids:
        raise ValueError("centroids cannot be empty")
    
    # Convert to numpy arrays for efficient computation
    samples_array: NDArray[np.float64] = np.array(stftsamples_normalized)
    centroids_array: NDArray[np.float64] = np.array(centroids)
    
    # Compute pairwise Euclidean distances between samples and centroids
    # distances shape: (num_samples, num_centroids)
    distances: NDArray[np.float64] = cdist(
        samples_array,
        centroids_array,
        metric='euclidean'
    )
    
    # Assign each sample to the nearest centroid (smallest distance)
    assignments: NDArray[np.int64] = np.argmin(distances, axis=1)
    
    print(f"vector_quantize complete: {len(samples_array)} samples assigned to {len(centroids)} centroids")
    
    return assignments.tolist()
