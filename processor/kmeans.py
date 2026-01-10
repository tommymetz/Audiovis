from multiprocessing import Process, Manager
from time import sleep
from random import randint
from worker_kmeans_assign import worker_kmeans_assign

# ////////////////////////////////////////////////////////////
# vector quantization ////////////////////////////////////////
# ////////////////////////////////////////////////////////////
# create vq array - go through each sample and assign it vq index

def kmeans(sleepdelay, centroidcount, vqupdatecount, stftsamples_normalized,stftsamples_normalized2, nonquietsamples):
    centroids = []

    #initialize centroids with nothing in them
    for i in range(centroidcount):
        stft = [0] * len(stftsamples_normalized[0])
        centroids.append(stft)

    #allquietsamples = False
    #if len(nonquietsamples) > 0:

    #randomly initialize centroids - choose randomly from chunks
    for i in range(centroidcount):
        rand = randint(0, len(nonquietsamples)-1)
        randlr = randint(0,1)
        stft = []
        for j in range(len(stftsamples_normalized[0])):
            if randlr == 0:
                stft.append(stftsamples_normalized[nonquietsamples[rand]][j])
            else:
                stft.append(stftsamples_normalized2[nonquietsamples[rand]][j])

        #centroids.append(stft)
        centroids[i] = stft

        #plt.plot(centroids[i])
        #plt.show()

    # assign centroid 0 to noise bucket (muted)?

    #make a downsized copy
    stftsamples_normalized_downsized = stftsamples_normalized[0::4]

    # repeat from here until converged - when centroids don't move much anymore
    centroidassignments = [0] * len(stftsamples_normalized_downsized)
    for i in range(vqupdatecount):

        differencesum = 0

        # //////////////////////////////////////////////////////////////
        # ASSIGN SAMPLES////////////////////////////////////////////////
        # //////////////////////////////////////////////////////////////
        #if __name__ == '__main__':
        manager = Manager()
        return_dict = manager.dict()
        jobs = []

        # process all chunks
        for i in range(len(stftsamples_normalized_downsized)):
            p = Process(target=worker_kmeans_assign, args=(i, centroidcount, stftsamples_normalized_downsized, centroids, return_dict))
            jobs.append(p)
            sleep(sleepdelay) #0.05
            p.start()

        # join jobs
        for proc in jobs:
            proc.join()

        centroidassignments = return_dict.values()
        print('assign-samples')

        #assign samples to a centroid
        '''for j in range(len(stftsamples_normalized_downsized)):

            #get distances from this sample point to all centroids
            distances = []
            for k in range(centroidcount):
                distance = 0
                for l in range(len(stftsamples_normalized_downsized[0])):
                    dist = math.log10(stftsamples_normalized_downsized[j][l]) - math.log10(centroids[k][l])
                    distance += pow(abs(dist), 2)
                distances.append(distance)

            #find closest centroid to this sample point and assign it
            centroidindex = distances.index(min(distances))
            centroidassignments[j] = centroidindex
            #print 'distances', i, distances[centroidassignments[j]]
            print(filename, 'kmeans assign', j, '/', len(stftsamples_normalized_downsized))'''


        # //////////////////////////////////////////////////////////////
        # UPDATE CENTROIDS//////////////////////////////////////////////
        # //////////////////////////////////////////////////////////////
        '''if __name__ == '__main__':
            manager = Manager()
            return_dict = manager.dict()
            jobs = []

            # process all chunks
            for i in range(len(stftsamples_normalized_downsized)):
                p = Process(target=worker_kmeans, args=('update-centroids', i, centroidcount, stftsamples_normalized_downsized, centroids, centroidassignments, differencesum, return_dict))
                jobs.append(p)
                sleep(0.05) #2.25
                p.start()

            # join jobs
            for proc in jobs:
                proc.join()

        centroids = return_dict.values()'''
        for j in range(centroidcount):

            #find samples that are assigned to this centroid and sum values
            sums = [0] * len(stftsamples_normalized_downsized[0])
            assignmentcount = 0
            for k in range(len(stftsamples_normalized_downsized)):
                if centroidassignments[k] == j:
                    for l in range(len(stftsamples_normalized_downsized[0])):
                        sums[l] += stftsamples_normalized_downsized[k][l]
                    assignmentcount += 1

            #find the mean of the assigned samples
            newcentroid = [0] * len(stftsamples_normalized_downsized[0])
            for k in range(len(stftsamples_normalized_downsized[0])):
                if assignmentcount != 0:
                    newcentroid[k] = sums[k] / float(assignmentcount)

            #calculate the difference between old centroid and new one
            difference = 0
            for k in range(len(stftsamples_normalized_downsized[0])):
                difference += newcentroid[k] - centroids[j][k]
            differencesum += difference

            #assign centroid to the mean
            for k in range(len(stftsamples_normalized_downsized[0])):
                if assignmentcount != 0:
                    centroids[j][k] = newcentroid[k]

            print('kmeans update', j, '/', centroidcount)

        #print 'diffsum', i, differencesum
        return centroids

        #plt.figure(figsize=(18, 10)) # create figure to plot
        #plt.yscale('log', nonposy='clip')
        #plt.xscale('log', nonposx='clip')
        #for j in range(centroidcount):
        #    plt.plot(centroids[j])
        #plt.show()










# end
