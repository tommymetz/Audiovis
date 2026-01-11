import numpy as np
from scipy.spatial.distance import cdist

# ////////////////////////////////////////////////////////////
# vector quantization using numpy/scipy ////////////////////////
# ////////////////////////////////////////////////////////////
# Assign each sample to its nearest centroid


def vector_quantize(stftsamples_normalized, centroidcount, centroids):
    """
    Assign each sample to its nearest centroid using Euclidean distance.

    Args:
        stftsamples_normalized: Normalized STFT samples to quantize
        centroidcount: Number of centroids (unused but kept for API compatibility)
        centroids: List of centroid vectors from kmeans clustering

    Returns:
        List of cluster assignments (one index per sample)
    """
    # Convert to numpy arrays
    samples_array = np.array(stftsamples_normalized)
    centroids_array = np.array(centroids)

    # Compute pairwise Euclidean distances between samples and centroids
    # distances shape: (num_samples, num_centroids)
    distances = cdist(samples_array, centroids_array, metric='euclidean')

    # Assign each sample to the nearest centroid (smallest distance)
    assignments = np.argmin(distances, axis=1)

    print('vector_quantize complete:', len(samples_array), 'samples assigned')

    return assignments.tolist()


# end
