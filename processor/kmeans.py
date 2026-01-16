"""
K-means clustering module for audio visualization.

This module provides K-means clustering functionality using scikit-learn to group
similar audio spectral samples together. The clustering is used to reduce the
complexity of audio visualization data by representing groups of similar spectral
frames with their centroids.

The K-means algorithm:
1. Takes normalized STFT (Short-Time Fourier Transform) samples from stereo audio
2. Combines non-quiet samples from both channels as training data
3. Downsamples for efficiency (every 4th sample)
4. Clusters samples into centroidcount groups
5. Returns centroids representing the spectral "fingerprints" of the audio

Example usage:
    centroids = kmeans(24, 1, stft_left, stft_right, non_quiet_indices)
"""
from __future__ import annotations

import numpy as np
from numpy.typing import NDArray
from sklearn.cluster import KMeans


# Default number of iterations per update count for K-means convergence
# This multiplier ensures adequate convergence while maintaining reasonable performance
KMEANS_ITERATIONS_MULTIPLIER: int = 100


def kmeans(
    centroidcount: int,
    vqupdatecount: int,
    stftsamples_normalized: list[list[float]],
    stftsamples_normalized2: list[list[float]],
    nonquietsamples: list[int]
) -> list[list[float]]:
    """
    Perform K-means clustering on normalized STFT samples.
    
    Uses scikit-learn's KMeans implementation with k-means++ initialization
    for better clustering results. The algorithm clusters spectral frames
    to identify common "spectral fingerprints" in the audio.
    
    Args:
        centroidcount: Number of clusters (centroids) to create. Typically 24
                      for audio visualization, representing different spectral
                      characteristics in the audio.
        vqupdatecount: Number of update iterations for K-means convergence.
                      Higher values produce better results but take longer.
                      Multiplied by KMEANS_ITERATIONS_MULTIPLIER for actual iterations.
        stftsamples_normalized: Normalized STFT samples from left channel.
                               Each sample is a list of frequency bin values.
        stftsamples_normalized2: Normalized STFT samples from right channel.
                                Same structure as left channel samples.
        nonquietsamples: Indices of samples that are not quiet/silent.
                        Used to filter out noise when selecting training data.
    
    Returns:
        List of centroids, where each centroid is a list of frequency bin values.
        The length matches centroidcount, and each centroid has the same
        dimensionality as the input STFT samples.
    
    Raises:
        ValueError: If centroidcount is larger than the number of samples.
    
    Example:
        >>> stft_left = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], ...]
        >>> stft_right = [[0.15, 0.25, 0.35], [0.45, 0.55, 0.65], ...]
        >>> non_quiet = [0, 1, 5, 10, 15]
        >>> centroids = kmeans(4, 1, stft_left, stft_right, non_quiet)
        >>> len(centroids)
        4
    """
    if not stftsamples_normalized:
        raise ValueError("stftsamples_normalized cannot be empty")
    
    if centroidcount <= 0:
        raise ValueError(f"centroidcount must be positive, got {centroidcount}")
    
    # Convert to numpy arrays for efficient processing
    samples_array: NDArray[np.float64] = np.array(stftsamples_normalized)
    samples_array2: NDArray[np.float64] = np.array(stftsamples_normalized2)
    
    # Create combined training data from non-quiet samples of both channels
    # Randomly select from left or right channel as in original implementation
    training_indices: NDArray[np.int64] = np.array(nonquietsamples)
    np.random.seed(42)  # For reproducibility
    channel_selection: NDArray[np.int64] = np.random.randint(0, 2, len(training_indices))
    
    training_data: list[NDArray[np.float64]] = []
    for i, idx in enumerate(training_indices):
        if channel_selection[i] == 0:
            training_data.append(samples_array[idx])
        else:
            training_data.append(samples_array2[idx])
    
    training_data_array: NDArray[np.float64] = np.array(training_data)
    
    # Downsample for efficiency (as in original implementation)
    # Takes every 4th sample to reduce computation time
    stftsamples_normalized_downsized: NDArray[np.float64] = samples_array[::4]
    
    # Validate we have enough samples for the requested number of centroids
    n_samples = len(stftsamples_normalized_downsized)
    if centroidcount > n_samples:
        raise ValueError(
            f"centroidcount ({centroidcount}) cannot be larger than "
            f"number of samples ({n_samples})"
        )
    
    # Initialize and fit KMeans
    # Using 'k-means++' for smarter initialization (better than random)
    # max_iter controls convergence iterations
    kmeans_model = KMeans(
        n_clusters=centroidcount,
        init='k-means++',
        n_init=1,  # Single initialization (original used 1 iteration)
        max_iter=vqupdatecount * KMEANS_ITERATIONS_MULTIPLIER,
        random_state=42
    )
    
    # Fit on downsampled data
    kmeans_model.fit(stftsamples_normalized_downsized)
    
    print(f"kmeans clustering complete: {centroidcount} centroids created")
    
    # Return centroids as list of lists (matching original interface)
    return kmeans_model.cluster_centers_.tolist()
