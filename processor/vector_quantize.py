import math
from multiprocessing import Process, Manager
from time import sleep
from worker_vector_quantize import worker_vector_quantize

# ////////////////////////////////////////////////////////////
# vector quantization ////////////////////////////////////////
# ////////////////////////////////////////////////////////////
# create vq array - go through each sample and assign it vq index

def vector_quantize(sleepdelay, stftsamples_normalized, centroidcount, centroids):
    manager = Manager()
    return_dict = manager.dict()
    jobs = []


    # do these in chunks
    # process all chunks
    #chunklen = 250
    #chunkcount = len(stftsamples_normalized) / chunklen
    #for i in math.ceil(chunkcount):
        #set delta
        #if last
        #process chunk
    #    print i

    for i in range(len(stftsamples_normalized)):
        p = Process(target=worker_vector_quantize, args=(i, centroidcount, stftsamples_normalized, centroids, return_dict))
        jobs.append(p)
        sleep(sleepdelay) #0.1
        p.start()

    # join jobs
    for proc in jobs:
        proc.join()

    return return_dict.values()





'''for i in range(len(stftsamples)):
    distances = []
    for j in range(len(centroids)):
        distance = 0
        for k in range(len(centroids[0])):
            dist = math.log10(stftsamples_normalized[i][k]) - math.log10(centroids[j][k])
            distance += pow(abs(dist), 2)
        distances.append(distance)
    print(filename, 'kmeans vq assign', i, '/', len(stftsamples))

    smallest = distances.index(min(distances))
    stftvqarray.append(smallest)'''





# end
