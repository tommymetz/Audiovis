from multiprocessing import Process, Manager
from time import sleep

from worker_processor import worker_processor

# ////////////////////////////////////////////////////////////
# vector quantization ////////////////////////////////////////
# ////////////////////////////////////////////////////////////
# create vq array - go through each sample and assign it vq index

def analysis(filename, sleepdelay, fs, fps, x, x2):

    totallen = len(x)
    chunkseconds = 2 #seconds

    chunklen = fs*chunkseconds
    chunkcount = totallen / chunklen
    lastlen = totallen - (chunkcount*chunklen)

    # sfft multiprocessing - process x frames in chunks on different processes
    #if __name__ == '__main__':
    manager = Manager()
    return_dict_stft = manager.dict()
    return_dict_stft2 = manager.dict()
    return_dict_harmonic = manager.dict()
    return_dict_resid = manager.dict()
    return_dict_volume = manager.dict()
    return_dict_balance = manager.dict()
    return_dict_width = manager.dict()
    jobs = []

    # process all chunks
    for i in range(chunkcount):
    #for i in range(1):
        p = Process(target=worker_processor, args=(filename, fs, fps, x, x2, i, chunkcount, chunklen, totallen, return_dict_stft, return_dict_stft2, return_dict_harmonic, return_dict_resid, return_dict_volume, return_dict_balance, return_dict_width))
        jobs.append(p)
        sleep(sleepdelay) #1.75
        p.start()

    # process last bit
    if lastlen > 0:
        p = Process(target=worker_processor, args=(filename, fs, fps, x, x2, i, chunkcount, chunklen, totallen, return_dict_stft, return_dict_stft2, return_dict_harmonic, return_dict_resid, return_dict_volume, return_dict_balance, return_dict_width))
        jobs.append(p)
        p.start()

    # join jobs
    for proc in jobs:
        proc.join()


    # //////////////////////////////////////////////////////////////////////
    # DATA PREPERATION//////////////////////////////////////////////////////
    # //////////////////////////////////////////////////////////////////////

    # get chunks
    stftchunks = return_dict_stft.values()
    stftchunks2 = return_dict_stft2.values()
    harmonicchunks = return_dict_harmonic.values()
    #residchunks = return_dict_resid.values()
    volumechunks = return_dict_volume.values()
    balancechunks = return_dict_balance.values()
    widthchuncks = return_dict_width.values()

    # convert stft chunks into single 2x multi-dim array
    stftsamples = []
    stftsamples2 = []
    volumes = []
    balances = []
    widths = []
    for i in range(len(stftchunks)):
        stftsamples.extend(stftchunks[i])
        stftsamples2.extend(stftchunks2[i])
        volumes.extend(volumechunks[i])
        balances.extend(balancechunks[i])
        widths.extend(widthchuncks[i])

    # convert hpr chunks into single multi-dim array
    harmonicsamples = []
    #residsamples = []
    for i in range(len(harmonicchunks)):
        harmonicsamples.extend(harmonicchunks[i])
        #residsamples.extend(residchunks[i])

    #normalize stftsamples
    stftsamples_normalized = []
    stftsamples_normalized2 = []
    gains = []
    gains2 = []
    maximums = []
    maximums2 = []
    #gains array so easier to calculate in js?
    for i in range(len(stftsamples)):

        #find maximum and calculate gain
        maximum = 0
        maximum2 = 0
        for j in range(len(stftsamples[i])):
            if stftsamples[i][j] > maximum:
                maximum = stftsamples[i][j]
            if stftsamples2[i][j] > maximum2:
                maximum2 = stftsamples2[i][j]
        gain = 1/maximum
        gain2 = 1/maximum
        gains.append(gain)
        gains2.append(gain2)
        maximums.append(maximum)
        maximums2.append(maximum2)

        #normalize values by mutiplying by gain
        normalized = []
        normalized2 = []
        for j in range(len(stftsamples[i])):
            normalized.append(stftsamples[i][j] * (gain * 1))
            normalized2.append(stftsamples2[i][j] * (gain2 * 1))

        #append it to the array
        stftsamples_normalized.append(normalized)
        stftsamples_normalized2.append(normalized2)


    #make list of samples that aren't noise to choose from
    nonquietsamples = []
    for i in range(len(volumes)):
        if volumes[i] >= 0.0001:
            nonquietsamples.append(i)

    #print len(maximums)
    #for i in range(len(gains)):
    #    print gains[i], volumes[i], maximums[i]
    #quit()


    return stftsamples_normalized, stftsamples_normalized2, harmonicsamples, harmonicchunks, volumes, balances, widths, nonquietsamples






    '''off = False
    if off:
        totallen = len(x)
        chunkseconds = 2 #seconds
        fps = 24
        chunklen = fs*chunkseconds
        chunkcount = totallen / chunklen
        lastlen = totallen - (chunkcount*chunklen)

        # sfft multiprocessing - process x frames in chunks on different processes
        #if __name__ == '__main__':
        manager = Manager()
        return_dict_stft = manager.dict()
        return_dict_stft2 = manager.dict()
        return_dict_harmonic = manager.dict()
        return_dict_resid = manager.dict()
        return_dict_volume = manager.dict()
        return_dict_balance = manager.dict()
        return_dict_width = manager.dict()
        jobs = []

        # process all chunks
        #for i in range(chunkcount):
        for i in range(1):
            p = Process(target=worker_processor, args=(filename, fs, fps, x, x2, i, chunkcount, chunklen, totallen, return_dict_stft, return_dict_stft2, return_dict_harmonic, return_dict_resid, return_dict_volume, return_dict_balance, return_dict_width))
            jobs.append(p)
            sleep(1.75) #1.75
            p.start()

        # process last bit
        if lastlen > 0:
            p = Process(target=worker_processor, args=(filename, fs, fps, x, x2, i, chunkcount, chunklen, totallen, return_dict_stft, return_dict_stft2, return_dict_harmonic, return_dict_resid, return_dict_volume, return_dict_balance, return_dict_width))
            jobs.append(p)
            p.start()

        # join jobs
        for proc in jobs:
            proc.join()


        # //////////////////////////////////////////////////////////////////////
        # DATA PREPERATION//////////////////////////////////////////////////////
        # //////////////////////////////////////////////////////////////////////

        # get chunks
        stftchunks = return_dict_stft.values()
        stftchunks2 = return_dict_stft2.values()
        harmonicchunks = return_dict_harmonic.values()
        #residchunks = return_dict_resid.values()
        volumechunks = return_dict_volume.values()
        balancechunks = return_dict_balance.values()
        widthchuncks = return_dict_width.values()

        # convert stft chunks into single 2x multi-dim array
        stftsamples = []
        stftsamples2 = []
        volumes = []
        balances = []
        widths = []
        for i in range(len(stftchunks)):
            stftsamples.extend(stftchunks[i])
            stftsamples2.extend(stftchunks2[i])
            volumes.extend(volumechunks[i])
            balances.extend(balancechunks[i])
            widths.extend(widthchuncks[i])

        # convert hpr chunks into single multi-dim array
        harmonicsamples = []
        #residsamples = []
        for i in range(len(harmonicchunks)):
            harmonicsamples.extend(harmonicchunks[i])
            #residsamples.extend(residchunks[i])

        #normalize stftsamples
        stftsamples_normalized = []
        stftsamples_normalized2 = []
        gains = []
        gains2 = []
        maximums = []
        maximums2 = []
        #gains array so easier to calculate in js?
        for i in range(len(stftsamples)):

            #find maximum and calculate gain
            maximum = 0
            maximum2 = 0
            for j in range(len(stftsamples[i])):
                if stftsamples[i][j] > maximum:
                    maximum = stftsamples[i][j]
                if stftsamples2[i][j] > maximum2:
                    maximum2 = stftsamples2[i][j]
            gain = 1/maximum
            gain2 = 1/maximum
            gains.append(gain)
            gains2.append(gain2)
            maximums.append(maximum)
            maximums2.append(maximum2)

            #normalize values by mutiplying by gain
            normalized = []
            normalized2 = []
            for j in range(len(stftsamples[i])):
                normalized.append(stftsamples[i][j] * (gain * 1))
                normalized2.append(stftsamples2[i][j] * (gain2 * 1))

            #append it to the array
            stftsamples_normalized.append(normalized)
            stftsamples_normalized2.append(normalized2)


        #make list of samples that aren't noise to choose from
        nonquietsamples = []
        for i in range(len(volumes)):
            if volumes[i] >= 0.001:
                nonquietsamples.append(i)

        #print len(maximums)
        #for i in range(len(gains)):
        #    print gains[i], volumes[i], maximums[i]
        #quit()
    '''







# end
