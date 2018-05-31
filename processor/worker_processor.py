import math
from processor import processor

# ////////////////////////////////////////////////////////////
# chunk worker////////////////////////////////////////////////
# ////////////////////////////////////////////////////////////

# this function is given a chunk of audio to process
# it iterates over results and quantizes the chuncks to X frames per second.
# it can display graphs of the lower processes.
# it prepares the data to be returned.

def worker_processor(filename, fs, fps, x, x2, i, chunkcount, chunklen, totallen, return_dict_stft, return_dict_stft2, return_dict_harmonic, return_dict_resid, return_dict_volume, return_dict_balance, return_dict_width):
    origi = i
    chunkdelta = i * chunklen

    # get this chunk of audio
    xchunk = x[chunkdelta:chunklen+chunkdelta]
    xchunk2 = x2[chunkdelta:chunklen+chunkdelta]

    # /////////////////////////////////////////////////////////////////////////
    # STFT Analysis ///////////////////////////////////////////////////////////
    # /////////////////////////////////////////////////////////////////////////
    P = 'TheSTFT'
    result = processor(fs, xchunk, P, False)
    result2 = processor(fs, xchunk2, P, False)

    # stft - calculate parameters
    numframes = len(result[0])
    analysislen = len(result[0][0]) - 1

    hopsize = 512
    fftsizeratio = float(analysislen)/hopsize
    framelen = float(fs)/fps * fftsizeratio
    ratio = float(framelen)/analysislen
    #print 'stft', 'numframes', numframes, 'analysislen', analysislen, 'framelen', framelen, 'ratio', ratio

    # stft - iterate over frames and average down to 24fps
    stftsamples = []
    stftsamples2 = []
    volume = []
    balance = []
    width = []
    rprev = 0
    frameindex = 0
    delta = 0;
    for i in range(numframes):
        r = i % ratio
        if r < rprev or i == numframes - 1:

            # find stft peaks
            maximum = [-1000.0] * analysislen
            maximum2 = [-1000.0] * analysislen
            for j in range(delta):
                for k in range(analysislen):
                    if result[0][i-j][k] > maximum[k]:
                        maximum[k] = result[0][i-j][k]
                    if result2[0][i-j][k] > maximum2[k]:
                        maximum2[k] = result2[0][i-j][k]

            # convert stft and find volume
            sums = 0;
            sums2 = 0;
            for j in range(analysislen):

                # convert to positive amplitude - http://www.mogami.com/e/cad/db.html
                maximum[j] = math.pow(10, maximum[j] / 10) #was  / 20
                maximum2[j] = math.pow(10, maximum2[j] / 10)

                # sum the spectrum to find the volume
                sums += maximum[j]
                sums2 += maximum2[j]

            # calculate pan - take the difference between the left and right
            pan = sums2 - sums

            # average merge left and right stfts
            maximummerged = []
            for j in range(analysislen):
                maximummerged.append((maximum[j] + maximum2[j]) / 2)

            # calculate width
            thewidth = 0
            for j in range(delta):
                for k in range(analysislen):
                    thewidth += result[0][i-j][k] - result2[0][i-j][k]
            thewidth = abs(thewidth)/analysislen

            # find loudest volume from left/right channel
            thevolume = sums
            if sums < sums2:
                thevolume = sums2

            # turnaround
            stftsamples.append(maximum) #maximummerged
            stftsamples2.append(maximum2)
            volume.append(thevolume) #sums
            balance.append(pan)
            width.append(thewidth)
            frameindex += 1
            delta = 0

        rprev = r
        delta += 1

    # /////////////////////////////////////////////////////////////////////////
    # HPR Analysis ////////////////////////////////////////////////////////////
    # /////////////////////////////////////////////////////////////////////////
    P = 'TheHM' #TheHPR
    HMresult = processor(fs, xchunk, P, False) #hfreq, hmag, hphase, mXr, pXr
    HMresult2 = processor(fs, xchunk2, P, False)

    # hfreq - calculate parameters
    numframes = len(HMresult[0])
    nH = len(HMresult[0][0])
    analysislen = float(chunklen) / numframes

    hopsize = 128
    fftsizeratio = float(analysislen)/hopsize
    framelen = float(fs)/fps * fftsizeratio
    #framelen = float(fs)/fps
    ratio = float(framelen)/analysislen
    #print 'hm', 'numframes', numframes, 'analysislen', analysislen, 'framelen', framelen, 'ratio', ratio

    # hfreq - iterate over frames and average down to 24fps
    harmonicsamples = []
    rprev = 0
    frameindex = 0
    delta = 0;
    for i in range(numframes):
        r = i % ratio
        if r < rprev or i == numframes - 1:

            # sum delta arrays for averaging
            hfreqaverages = [0.0] * nH
            hfreqaverages2 = [0.0] * nH
            hmagaverages = [0.0] * nH
            hmagaverages2 = [0.0] * nH
            for j in range(delta):
                for k in range(nH):
                    hfreqaverages[k] += HMresult[0][i-j][k]
                    hfreqaverages2[k] += HMresult2[0][i-j][k]
                    hmagaverages[k] += HMresult[1][i-j][k]
                    hmagaverages2[k] += HMresult2[1][i-j][k]

            # find average and volume
            for j in range(nH):
                hfreqaverages[j] = int(round(hfreqaverages[j] / delta))
                hfreqaverages2[j] = int(round(hfreqaverages2[j] / delta))
                hmagaverages[j] = hmagaverages[j] / delta
                hmagaverages2[j] = hmagaverages2[j] / delta

                # convert to positive amplitude - voltage ratio from dB is V2/V1 = 10^(A/20)
                hmagaverages[j] = math.pow(10, hmagaverages[j] / 20)
                hmagaverages2[j] = math.pow(10, hmagaverages2[j] / 20)

            # average left and right
            hfreqaveragesmerged = []
            hmagaveragesmerged = []
            for j in range(nH):
                hfreqaveragesmerged.append((hfreqaverages[j] + hfreqaverages2[j]) / 2)
                hmagaveragesmerged.append((hmagaverages[j] + hmagaverages2[j]) / 2)

            # turnaround
            harmonicsamples.append([hfreqaveragesmerged,hmagaveragesmerged])
            frameindex += 1
            delta = 0

        rprev = r
        delta += 1

    # residual - calculate parameters
    '''numframes = len(HMresult[3])
    analysislen = len(HMresult[3][0]) - 1
    framelen = float(fs)/fps
    ratio = float(framelen)/analysislen

    # residual - iterate over frames and average down to 24fps
    residsamples = []
    rprev = 0
    frameindex = 0
    delta = 0;
    for i in range(numframes):
        r = i % ratio
        if r < rprev or i == numframes - 1:

            # find peaks
            peaks = [-1000.0] * analysislen
            peaks2 = [-1000.0] * analysislen
            for j in range(delta):
                for k in range(analysislen):
                    if HMresult[3][i-j][k] > peaks[k]:
                        peaks[k] = HMresult[3][i-j][k]
                    if HMresult2[3][i-j][k] > peaks2[k]:
                        peaks2[k] = HMresult2[3][i-j][k]

            # convert and find volume
            sums = 0;
            sums2 = 0;
            for j in range(analysislen):

                # convert to positive amplitude - voltage ratio from dB is V2/V1 = 10^(A/20)
                peaks[j] = math.pow(10, peaks[j] / 20)
                peaks2[j] = math.pow(10, peaks2[j] / 20)

                # sum the spectrum to find the volume
                sums += peaks[j]
                sums2 += peaks2[j]

            residsamples.append(peaks)
            frameindex += 1
            delta = 0

        rprev = r
        delta += 1
    '''

    # return dictionaries
    #print 'len', len(stftsamples)
    return_dict_stft[origi] = stftsamples
    return_dict_stft2[origi] = stftsamples2
    return_dict_harmonic[origi] = harmonicsamples
    #return_dict_resid[origi] = residsamples
    return_dict_volume[origi] = volume
    return_dict_balance[origi] = balance
    return_dict_width[origi] = width
    print filename, 'worker', origi, '/', chunkcount
    #print('stftsamples', stftsamples[0][0]);
    #plt.plot(stftsamples[0])
    #plt.yscale('log')
    #plt.show()















        #was at top of the stft iteration loop
            # sum delta arrays for averaging
            #averages = [0.0] * analysislen
            #averages2 = [0.0] * analysislen
            #for j in range(delta):
            #    for k in range(analysislen):
            #        averages[k] += result[0][i-j][k]
            #        averages2[k] += result2[0][i-j][k]

            # find average and volume
            #thesum = 0;
            #thesum2 = 0;
            #for j in range(analysislen):
            #    averages[j] = averages[j] / delta
            #    averages2[j] = averages2[j] / delta

                # convert to positive amplitude and round decimal places
            #    averages[j] = math.pow(10, averages[j] / 20)
            #    averages2[j] = math.pow(10, averages2[j] / 20)

            #    thesum += averages[j]
            #    thesum2 += averages2[j]
