import numpy as np
from sklearn.cluster import KMeans

# ////////////////////////////////////////////////////////////
# vector quantization using scikit-learn //////////////////////
# ////////////////////////////////////////////////////////////
# Assign each sample to its nearest centroid


def vector_quantize(sleepdelay, stftsamples_normalized, centroidcount, centroids):
    """
    Assign each sample to its nearest centroid using KMeans prediction.

    Args:
        sleepdelay: Legacy parameter (unused with scikit-learn, kept for API compatibility)
        stftsamples_normalized: Normalized STFT samples to quantize
        centroidcount: Number of centroids
        centroids: List of centroid vectors from kmeans clustering

    Returns:
        List of cluster assignments (one index per sample)
    """
    # Convert to numpy arrays
    samples_array = np.array(stftsamples_normalized)
    centroids_array = np.array(centroids)

    # Create a KMeans instance and set the pre-computed centroids
    kmeans_model = KMeans(n_clusters=centroidcount, n_init=1, max_iter=1)
    # Trick: fit on centroids themselves to initialize, then reassign cluster_centers_
    kmeans_model.fit(centroids_array)
    kmeans_model.cluster_centers_ = centroids_array

    # Predict cluster assignments for all samples
    assignments = kmeans_model.predict(samples_array)

    print('vector_quantize complete:', len(samples_array), 'samples assigned')

    return assignments.tolist()


# end
