import numpy as np
from sklearn.cluster import KMeans

# ////////////////////////////////////////////////////////////
# K-means clustering using scikit-learn ///////////////////////
# ////////////////////////////////////////////////////////////
# Clusters audio samples using K-means algorithm and returns centroids

# Default number of iterations per update count for K-means convergence
# This multiplier ensures adequate convergence while maintaining reasonable performance
KMEANS_ITERATIONS_MULTIPLIER = 100


def kmeans(sleepdelay, centroidcount, vqupdatecount, stftsamples_normalized, stftsamples_normalized2, nonquietsamples):
    """
    Perform K-means clustering on normalized STFT samples.

    Args:
        sleepdelay: Legacy parameter (unused with scikit-learn, kept for API compatibility)
        centroidcount: Number of clusters (centroids) to create
        vqupdatecount: Legacy parameter (unused with scikit-learn, kept for API compatibility)
        stftsamples_normalized: Normalized STFT samples from left channel
        stftsamples_normalized2: Normalized STFT samples from right channel
        nonquietsamples: Indices of samples that are not quiet/silent

    Returns:
        List of centroids, each centroid is a list of frequency values
    """
    # Convert to numpy arrays for efficient processing
    samples_array = np.array(stftsamples_normalized)
    samples_array2 = np.array(stftsamples_normalized2)

    # Create combined training data from non-quiet samples of both channels
    # Randomly select from left or right channel as in original implementation
    training_indices = np.array(nonquietsamples)
    np.random.seed(42)  # For reproducibility
    channel_selection = np.random.randint(0, 2, len(training_indices))

    training_data = []
    for i, idx in enumerate(training_indices):
        if channel_selection[i] == 0:
            training_data.append(samples_array[idx])
        else:
            training_data.append(samples_array2[idx])

    training_data = np.array(training_data)

    # Downsample for efficiency (as in original implementation)
    stftsamples_normalized_downsized = samples_array[::4]

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

    print('kmeans clustering complete')

    # Return centroids as list of lists (matching original interface)
    return kmeans_model.cluster_centers_.tolist()


# end
