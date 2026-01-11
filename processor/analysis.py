from worker_processor import worker_processor

# ////////////////////////////////////////////////////////////
# audio analysis /////////////////////////////////////////////
# ////////////////////////////////////////////////////////////
# Analyze audio samples and extract features

def analysis(filename, fs, fps, x, x2):

    totallen = len(x)
    chunkseconds = 2 #seconds

    chunklen = fs*chunkseconds
    chunkcount = totallen // chunklen
    lastlen = totallen - (chunkcount*chunklen)

    # Initialize result dictionaries
    return_dict_stft = {}
    return_dict_stft2 = {}
    return_dict_harmonic = {}
    return_dict_resid = {}
    return_dict_volume = {}
    return_dict_balance = {}
    return_dict_width = {}

    # Process all chunks sequentially
    for i in range(chunkcount):
        worker_processor(filename, fs, fps, x, x2, i, chunkcount, chunklen, totallen, 
                        return_dict_stft, return_dict_stft2, return_dict_harmonic, 
                        return_dict_resid, return_dict_volume, return_dict_balance, return_dict_width)

    # Process last bit
    if lastlen > 0:
        worker_processor(filename, fs, fps, x, x2, chunkcount, chunkcount, chunklen, totallen, 
                        return_dict_stft, return_dict_stft2, return_dict_harmonic, 
                        return_dict_resid, return_dict_volume, return_dict_balance, return_dict_width)


    # //////////////////////////////////////////////////////////////////////
    # DATA PREPERATION//////////////////////////////////////////////////////
    # //////////////////////////////////////////////////////////////////////

    # get chunks
    stftchunks = list(return_dict_stft.values())
    stftchunks2 = list(return_dict_stft2.values())
    harmonicchunks = list(return_dict_harmonic.values())
    #residchunks = return_dict_resid.values()
    volumechunks = list(return_dict_volume.values())
    balancechunks = list(return_dict_balance.values())
    widthchuncks = list(return_dict_width.values())

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


# end
