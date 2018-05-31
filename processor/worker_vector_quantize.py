import math
from processor import processor

# ////////////////////////////////////////////////////////////
# kmeans worker////////////////////////////////////////////////
# ////////////////////////////////////////////////////////////

# this function is given a chunk of audio to process
# it performs a kmeans algorithm to vector quantize the data X number of clusters

def worker_vector_quantize(i, centroidcount, stftsamples_normalized, centroids, return_dict):

    distances = []
    for j in range(len(centroids)):
        distance = 0
        for k in range(len(centroids[0])):
            dist = math.log10(stftsamples_normalized[i][k]) - math.log10(centroids[j][k])
            distance += pow(abs(dist), 2)
        distances.append(distance)

    smallest = distances.index(min(distances))
    return_dict[i] = smallest

    print 'worker_vector_quantize', i, '/', len(stftsamples_normalized)










# end
