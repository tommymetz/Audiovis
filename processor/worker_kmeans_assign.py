import math
from processor import processor

# ////////////////////////////////////////////////////////////
# kmeans worker////////////////////////////////////////////////
# ////////////////////////////////////////////////////////////

# this function is given a chunk of audio to process
# it performs a kmeans algorithm to vector quantize the data X number of clusters

def worker_kmeans_assign(j, centroidcount, stftsamples_normalized, centroids, return_dict):

    #get distances from this sample point to all centroids
    distances = []
    for k in range(centroidcount):
        distance = 0
        for l in range(len(stftsamples_normalized[0])):
            dist = math.log10(stftsamples_normalized[j][l]) - math.log10(centroids[k][l])
            distance += pow(abs(dist), 2)
        distances.append(distance)

    #find closest centroid to this sample point and assign it
    return_dict[j] = distances.index(min(distances))

    print 'worker_kmeans_assign', j, '/', len(stftsamples_normalized)










# end
