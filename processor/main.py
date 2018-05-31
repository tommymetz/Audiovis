import os
import sys
import math
from random import randint
from decimal import Decimal
from subprocess import check_output
from multiprocessing import Process, Manager
from time import sleep
import json
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import get_window
#toolsdir = '/Users/tometz/Documents/MachineLearningStuff/SignalProcessingForMusicApplications/sms-tools/software/models/'
toolsdir = '/Users/tometz/Documents/Audio/TomWav/_audiovis/processor/processor/'
sys.path.insert(0, toolsdir)
import utilFunctions as UF

from analysis import analysis
from worker_processor import worker_processor

from kmeans import kmeans
#from worker_kmeans_assign import worker_kmeans_assign

from vector_quantize import vector_quantize
#from worker_vector_quantize import worker_vector_quantize

# get all files with .wav extention
thename = 'Horizon'
TheFolder = '/Users/tometz/Documents/Audio/TomWav/_audiovis/public/content/' + thename + '/'
masterfile = thename + '.wav'
masterfilestring = masterfile
if masterfile.endswith('.wav'):
    masterfilestring = masterfile[:-4]

startingpos = 0 #seconds 92, 95
writemp3 = True
audiofiles = []
files = [f for f in os.listdir(TheFolder) if os.path.isfile(TheFolder + f)]
count = 0
limit = 100
skipcount = 10
for i in files:
    if i.endswith('.wav'):
        if i != masterfile:
            if count < limit:
                if i.startswith(masterfilestring): #if not i.endswith('.l.wav') and not i.endswith('.r.wav') and i.endswith('.wav'):
                    audiofiles.append(i)
                    count += 1

# save list of audio files to json file
data = []
data.append({
    'mp3file': masterfile[:-4] + '.mp3',
    'audiofiles':audiofiles
})
with open(TheFolder + '_analysis_files.json', 'w') as outfile:
    json.dump(data, outfile)

audiofiles = audiofiles[skipcount:]
print audiofiles
#quit()

# create trimmed version of master file
editfile = TheFolder + masterfilestring + '_edit.wav'
soxcommand = ['sox', TheFolder + masterfile, editfile, 'trim', str(startingpos)]
if writemp3:
    outleft = check_output(soxcommand)

# create mp3 - lame -b128 sample.wav sample.mp3
mp3file = masterfile
if mp3file.endswith('.wav'):
    mp3file = mp3file[:-4]
mp3file = TheFolder + mp3file + '.mp3'
lamecommand = ['lame', editfile, mp3file]
if writemp3:
    outleft = check_output(lamecommand)

# delete edit file
os.remove(editfile)

# ////////////////////////////////////////////////////////////
# iterator ///////////////////////////////////////////////////
# ////////////////////////////////////////////////////////////
def iterator():
    for filename in audiofiles:

        # seperate stereo files int left and right wav files
        fileleft = '_Split_' + filename + '.l.wav'
        fileright = '_Split_' + filename + '.r.wav'
        soxleft = ['sox', TheFolder + filename, TheFolder + fileleft, 'remix', '1']
        soxright = ['sox', TheFolder + filename, TheFolder + fileright, 'remix', '2']
        outleft = check_output(soxleft)
        outright = check_output(soxright)

        # read the files
        fs, x = UF.wavread(TheFolder + fileleft)
        fs, x2 = UF.wavread(TheFolder + fileright)

        # delete split files
        os.remove(TheFolder + fileleft)
        os.remove(TheFolder + fileright)

        #remove until starting point
        delta = startingpos * fs
        x = x[delta:len(x)]
        x2 = x2[delta:len(x2)]

        fps = 24

        # //////////////////////////////////////////////////////////////////////
        # ANALYSIS + KMEANS + VECTOR QUANTIZATION///////////////////////////////
        # //////////////////////////////////////////////////////////////////////
        #2 cores, 4 threads

        sleepdelay = 1.5 #0.8, 1.75
        stftsamples_normalized, stftsamples_normalized2, harmonicsamples, harmonicchunks, volumes, balances, widths, nonquietsamples = analysis(filename, sleepdelay, fs, fps, x, x2)

        allquietsamples = False
        if len(nonquietsamples) > 0:

            #K-Means
            centroidcount = 24 #100
            vqupdatecount = 1 #2
            sleepdelay = 0.04 #0.01
            centroids = kmeans(sleepdelay, centroidcount, vqupdatecount, stftsamples_normalized, stftsamples_normalized2, nonquietsamples)

            #Vector Quantization
            sleepdelay = 0.06 #0.03
            stftvqarray = vector_quantize(sleepdelay, stftsamples_normalized, centroidcount, centroids)

        else:
            print 'all quite samples'
            allquietsamples = True
            #sys.exit('all quiet samples')

        # //////////////////////////////////////////////////////////////////////
        # PREPARE FOR EXPORT////////////////////////////////////////////////////
        # //////////////////////////////////////////////////////////////////////
        if not allquietsamples:
            maxvolume = max(volumes)
            maxbalance = max(balances, key=abs)
            maxwidth = max(widths)

            # map logorithmic values to a scale between 0 and 255
            multiplyer = 65535 #int16=65535, 8bit=255
            for i in range(len(volumes)):
                volumes[i] = int(round(float(volumes[i])/maxvolume * multiplyer))
                balances[i] = int(round(balances[i] * (multiplyer/2)) + (multiplyer/2))
                widths[i] = int(round(float(widths[i])/maxwidth * multiplyer))
                #for j in range(len(stftsamples[0])):
                    #stftsamples[i][j] = int(round(stftsamples[i][j] * 65536)) #65536, 2147483647

            # map logorithmic values to a scale between 0 and 255
            for i in range(centroidcount):
                for j in range(len(centroids[0])):

                    #scaled = math.log(centroids[i][j]) #math.log(centroids[i][j], 0.5) * centroids[i][j] * multiplyer * 2
                    #print scaled, centroids[i][j]
                    centroids[i][j] = int(round(centroids[i][j] * multiplyer))
                    #centroids[i][j] = int(round(scaled))

            # flatten clusters
            flat_stft_clusters = [x for sublist in centroids for x in sublist]

            #plt.plot(centroids[0])
            #plt.yscale('log')
            #plt.show()

            # //////////////////////////////////////////////////////////////////////
            # HM ///////////////////////////////////////////////////////////////////
            # //////////////////////////////////////////////////////////////////////
            nH = len(harmonicchunks[0][0][0])

            # map values
            minf0=30
            maxf0=3000#2000
            for i in range(len(harmonicsamples)):
                for j in range(len(harmonicsamples[0][0])):
                    value = float(harmonicsamples[i][0][j]) / maxf0
                    harmonicsamples[i][0][j] = int(round(value * multiplyer)) #frequency
                    #print 'value', value
                    #harmonicsamples[i][1][j] = int(round(harmonicsamples[i][1][j] * multiplyer)) #magnetude

            # make hfreq and hmag back to back in single array
            harmonicsamplessinglearray = []
            for i in range(len(harmonicsamples)):
                harmonicsamplessinglearray.append(harmonicsamples[i][0][0])
                #harmonicsamplessinglearray.extend(harmonicsamples[i][0]) #frequency
                #harmonicsamplessinglearray.extend(harmonicsamples[i][1]) #magnetude

            #print 'harmonicsamplessinglearray', harmonicsamplessinglearray
            #plt.plot(harmonicsamplessinglearray)
            #plt.show()

            # make pitch array for now
            #pitches = []
            #for i in range(len(harmonicsamples)):
            #    pitches.append(int(round(harmonicsamples[i][0][0])))


        # ////////////////////////////////////
        # EXPORT//////////////////////////////
        # ////////////////////////////////////
        # save structure and track info into json file
        '''
        volume                      LEN x 1
        balance                     LEN x 1
        width                       LEN x 1
        centroids                   CENTROIDCOUNT x FFTSIZE
        centroid_indexes            LEN x 1
        pitch                       LEN x 2
        '''
        data = {}
        if not allquietsamples:
            length = len(stftsamples_normalized)
            data['structure'] = {
                0:{'volume':[length, 1]},
                1:{'balance':[length, 1]},
                2:{'width':[length, 1]},
                3:{'centroids':[centroidcount, len(centroids[0])]},
                4:{'centroid_indexes':[length, 1]},
                5:{'pitch':[length, 1]},
            }
            data['track'] = {
                'filename':filename,
                'fs':fs,
                'fps':fps,
                'byte_num_range':multiplyer,
                'stft_size': len(stftsamples_normalized[0]),
                'maxvolume':maxvolume,
                'allquietsamples':allquietsamples,
                'pitchmin':minf0,
                'pitchmax':maxf0
            }
        else:
            data['track'] = {
                'allquietsamples':allquietsamples
            }

        with open(TheFolder + filename+'_analysis.json', 'w') as outfile:
            json.dump(data, outfile, sort_keys=True)

        # compile data byte array and write to file
        if not allquietsamples:
            combined_lists = volumes + balances + widths + flat_stft_clusters + stftvqarray + harmonicsamplessinglearray
            fileobj = open(TheFolder + filename + '_analysis.data', mode='wb')
            off = np.array(combined_lists, dtype=np.uint16)
            off.tofile(fileobj)
            fileobj.close()



        # save flattened data to binary file
        #flat = [x for sublist in stftsamples for x in sublist]
        #fileobj = open(TheFolder + filename+'_analysis_stft', mode='wb')
        #off = np.array(flat+flat_stft_clusters, dtype=np.int16) #float32
        #off.tofile(fileobj)
        #fileobj.close()

        # save flattened data to binary file
        #fileobj = open(TheFolder + filename+'_analysis_harmonic', mode='wb')
        #off = np.array(harmonicsamplessinglearray, dtype=np.int16) #float32
        #off.tofile(fileobj)
        #fileobj.close()

    return

# run iterator
iterator()













'''centroidcount =48 #100
vqupdatecount = 2 #2
centroids = []

#initialize centroids with nothing in them
for i in range(centroidcount):
    stft = [0] * len(stftsamples_normalized[0])
    centroids.append(stft)

allquietsamples = False
if len(nonquietsamples) > 0:

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
        if __name__ == '__main__':
            manager = Manager()
            return_dict = manager.dict()
            jobs = []

            # process all chunks
            for i in range(len(stftsamples_normalized_downsized)):
                p = Process(target=worker_kmeans_assign, args=(i, centroidcount, stftsamples_normalized_downsized, centroids, return_dict))
                jobs.append(p)
                sleep(0.05) #0.1
                p.start()

            # join jobs
            for proc in jobs:
                proc.join()

        centroidassignments = return_dict.values()
        print 'assign-samples'


        #assign samples to a centroid
        for j in range(len(stftsamples_normalized_downsized)):

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
            print filename, 'kmeans assign', j, '/', len(stftsamples_normalized_downsized)



        if __name__ == '__main__':
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

        centroids = return_dict.values()

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

            print filename, 'kmeans update', j, '/', centroidcount'''

        #print 'diffsum', i, differencesum

        #plt.figure(figsize=(18, 10)) # create figure to plot
        #plt.yscale('log', nonposy='clip')
        #plt.xscale('log', nonposx='clip')
        #for j in range(centroidcount):
        #    plt.plot(centroids[j])
        #plt.show()

# end
