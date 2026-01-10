import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import get_window
from smstools.models import stft as STFT
from smstools.models import hprModel as HPR
from smstools.models import sineModel as SM
from smstools.models import harmonicModel as HM

# ////////////////////////////////////////////////////////////
# processor //////////////////////////////////////////////////
# ////////////////////////////////////////////////////////////

# this function analyses a chunck of audio using a specified model
# can display a graph of the model
# returns the raw results

def processor(fs, xchunk, analysis, plot):

    # TheSFFT ////////////////////////////
    if analysis == 'TheSTFT':
        """
    	Analysis of a sound using the short-time Fourier transform
    	x: input array sound, w: analysis window, N: FFT size, H: hop size
    	returns xmX, xpX: magnitude and phase spectra
    	"""
        # 'hann' is the scipy name for Hanning window (scipy >= 1.1 deprecated 'hanning')
        window = 'hann'
        M = 2048    # window size 512, 1024, 2048, 4096
        N = 2048    # fft size
        H = 512     # hop
        w = get_window(window, M)
        mX, pX = STFT.stftAnal(xchunk, w, N, H)

        #plot
        if plot is True:
            y = STFT.stftSynth(mX, pX, M, H)

            plt.figure(figsize=(12, 9)) # create figure to plot
            maxplotfreq = 10000.0 # frequency range to plot

            # input sound
            plt.subplot(4,1,1)
            plt.plot(np.arange(xchunk.size)/float(fs), xchunk)
            plt.axis([0, xchunk.size/float(fs), min(xchunk), max(xchunk)])
            plt.ylabel('amplitude')
            plt.xlabel('time (sec)')
            plt.title('input sound: x')

            # magnitude spectrogram
            plt.subplot(4,1,2)
            numFrames = int(mX[:,0].size)
            frmTime = H*np.arange(numFrames)/float(fs)
            binFreq = fs*np.arange(N*maxplotfreq/fs)/N
            plt.pcolormesh(frmTime, binFreq, np.transpose(mX[:,:N*maxplotfreq/fs+1]))
            plt.xlabel('time (sec)')
            plt.ylabel('frequency (Hz)')
            plt.title('magnitude spectrogram')
            plt.autoscale(tight=True)

            # phase spectrogram
            '''
            plt.subplot(4,1,3)
            numFrames = int(pX[:,0].size)
            frmTime = H*np.arange(numFrames)/float(fs)
            binFreq = fs*np.arange(N*maxplotfreq/fs)/N
            plt.pcolormesh(frmTime, binFreq, np.transpose(np.diff(pX[:,:N*maxplotfreq/fs+1],axis=1)))
            plt.xlabel('time (sec)')
            plt.ylabel('frequency (Hz)')
            plt.title('phase spectrogram (derivative)')
            plt.autoscale(tight=True)

            # output sound
            plt.subplot(4,1,4)
            plt.plot(np.arange(y.size)/float(fs), y)
            plt.axis([0, y.size/float(fs), min(y), max(y)])
            plt.ylabel('amplitude')
            plt.xlabel('time (sec)')
            #plt.title('output sound: y')
            '''

            plt.tight_layout()
            plt.show()

        return [mX.tolist()] #pX.tolist()

    # TheSM //////////////////////////////
    if analysis == 'TheSM':
        """
    	Analysis of a sound using the sinusoidal model with sine tracking
    	x: input array sound, w: analysis window, N: size of complex spectrum, H: hop-size, t: threshold in negative dB
    	maxnSines: maximum number of sines per frame, minSineDur: minimum duration of sines in seconds
    	freqDevOffset: minimum frequency deviation at 0Hz, freqDevSlope: slope increase of minimum frequency deviation
    	returns xtfreq, xtmag, xtphase: frequencies, magnitudes and phases of sinusoidal tracks
    	"""
        window='hamming'
        M=2001
        N=2048
        t=-80
        minSineDur=0.02
        maxnSines=150 #150
        freqDevOffset=10
        freqDevSlope=0.001
        Ns = 512
        H = 128
        w = get_window(window, M)
        tfreq, tmag, tphase = SM.sineModelAnal(xchunk, fs, w, N, H, t, maxnSines, minSineDur, freqDevOffset, freqDevSlope)

        if plot is True:
            y = SM.sineModelSynth(tfreq, tmag, tphase, Ns, H, fs)

            # create figure to show plots
            plt.figure(figsize=(12, 9))

            # frequency range to plot
            maxplotfreq = 5000.0

            # plot the input sound
            plt.subplot(3,1,1)
            plt.plot(np.arange(xchunk.size)/float(fs), xchunk)
            plt.axis([0, xchunk.size/float(fs), min(xchunk), max(xchunk)])
            plt.ylabel('amplitude')
            plt.xlabel('time (sec)')
            plt.title('input sound: x')

            # plot the sinusoidal frequencies
            plt.subplot(3,1,2)
            if (tfreq.shape[1] > 0):
                numFrames = tfreq.shape[0]
                frmTime = H*np.arange(numFrames)/float(fs)
                tfreq[tfreq<=0] = np.nan
                plt.plot(frmTime, tfreq)
                plt.axis([0, xchunk.size/float(fs), 0, maxplotfreq])
                plt.title('frequencies of sinusoidal tracks')

            # plot the output sound
            plt.subplot(3,1,3)
            plt.plot(np.arange(y.size)/float(fs), y)
            plt.axis([0, y.size/float(fs), min(y), max(y)])
            plt.ylabel('amplitude')
            plt.xlabel('time (sec)')
            plt.title('output sound: y')

            plt.tight_layout()
            plt.show()

        return [tfreq.tolist(), tmag.tolist(), tphase.tolist()]

    # TheF0 //////////////////////////////
    if analysis == 'TheF0':
        """
    	Fundamental frequency detection of a sound using twm algorithm
    	x: input sound; fs: sampling rate; w: analysis window;
    	N: FFT size; t: threshold in negative dB,
    	minf0: minimum f0 frequency in Hz, maxf0: maximim f0 frequency in Hz,
    	f0et: error threshold in the f0 detection (ex: 5),
    	returns f0: fundamental frequency
    	"""
        M=1024
        N=1024
        H = 128
        t=-90
        minf0=130
        maxf0=5000
        f0et=7
        window='blackman'
        w = get_window(window, M)
        f0 = HM.f0Detection(xchunk, fs, w, N, H, t, minf0, maxf0, f0et)

        if plot is True:
            #mXr, pXr = STFT.stftAnal(xchunk, w, N, H)

            plt.figure(figsize=(12, 9)) # create figure to plot
            maxplotfreq = 4000.0 # frequency range to plot

            # input sound
            '''plt.subplot(4,1,1)
            plt.plot(np.arange(xchunk.size)/float(fs), xchunk)
            plt.axis([0, xchunk.size/float(fs), min(xchunk), max(xchunk)])
            plt.ylabel('amplitude')
            plt.xlabel('time (sec)')
            plt.title('input sound: x')'''

            # plot the magnitude spectrogram of residual
            '''plt.subplot(3,1,2)
            maxplotbin = int(N*maxplotfreq/fs)
            numFrames = int(mXr[:,0].size)
            frmTime = H*np.arange(numFrames)/float(fs)
            binFreq = np.arange(maxplotbin+1)*float(fs)/N
            plt.pcolormesh(frmTime, binFreq, np.transpose(mXr[:,:maxplotbin+1]))
            plt.autoscale(tight=True)'''

            # plot the f0 frequencies
            #plt.subplot(3,1,2)
            if (f0.size > 0):
                numFrames = f0.size
                frmTime = H*np.arange(numFrames)/float(fs)
                plt.plot(frmTime, f0)
                plt.axis([0, xchunk.size/float(fs), 0, maxplotfreq])
                plt.title('frequencies of f0')

            plt.tight_layout()
            plt.show()


        return [f0.tolist()]


    # TheHM //////////////////////////////
    if analysis == 'TheHM':
        """
    	Analysis of a sound using the sinusoidal harmonic model
    	x: input sound; fs: sampling rate, w: analysis window; N: FFT size (minimum 512); t: threshold in negative dB,
    	nH: maximum number of harmonics;  minf0: minimum f0 frequency in Hz,
    	maxf0: maximim f0 frequency in Hz; f0et: error threshold in the f0 detection (ex: 5),
    	harmDevSlope: slope of harmonic deviation; minSineDur: minimum length of harmonics
    	returns xhfreq, xhmag, xhphase: harmonic frequencies, magnitudes and phases
    	"""
        window='blackman'
        M=2048 #1201, 4096
        N=2048 #2048, 4096
        t=-90 #-90
        minSineDur=0.1 #0.1
        nH=10 #100
        minf0=30 #130
        maxf0=3000 #300
        f0et=7 #7
        harmDevSlope=0.01 #0.01
        H = 128 #128
        w = get_window(window, M)
        hfreq, hmag, hphase = HM.harmonicModelAnal(xchunk, fs, w, N, H, t, nH, minf0, maxf0, f0et, harmDevSlope, minSineDur)

        if plot is True:
            Ns = 512 #512
            y = SM.sineModelSynth(hfreq, hmag, hphase, Ns, H, fs)

            # create figure to show plots
            plt.figure(figsize=(12, 9))

            # frequency range to plot
            maxplotfreq = 2000.0

            # plot the input sound
            plt.subplot(3,1,1)
            plt.plot(np.arange(xchunk.size)/float(fs), xchunk)
            plt.axis([0, xchunk.size/float(fs), min(xchunk), max(xchunk)])
            plt.ylabel('amplitude')
            plt.xlabel('time (sec)')
            plt.title('input sound: x')

            # plot the harmonic frequencies
            plt.subplot(3,1,2)
            if (hfreq.shape[1] > 0):
                numFrames = hfreq.shape[0]
                frmTime = H*np.arange(numFrames)/float(fs)
                hfreq[hfreq<=0] = np.nan
                plt.plot(frmTime, hfreq)
                plt.axis([0, xchunk.size/float(fs), 0, maxplotfreq])
                plt.title('frequencies of harmonic tracks')

            # plot the output sound
            plt.subplot(3,1,3)
            plt.plot(np.arange(y.size)/float(fs), y)
            plt.axis([0, y.size/float(fs), min(y), max(y)])
            plt.ylabel('amplitude')
            plt.xlabel('time (sec)')
            plt.title('output sound: y')

            plt.tight_layout()
            plt.show()

        return [hfreq.tolist(), hmag.tolist(), hphase.tolist()]

    # TheHPR /////////////////////////////
    if analysis == 'TheHPR':
        """Analysis of a sound using the harmonic plus residual model
    	x: input sound, fs: sampling rate, w: analysis window; N: FFT size, t: threshold in negative dB,
    	minSineDur: minimum duration of sinusoidal tracks
    	nH: maximum number of harmonics; minf0: minimum fundamental frequency in sound
    	maxf0: maximum fundamental frequency in sound; f0et: maximum error accepted in f0 detection algorithm
    	harmDevSlope: allowed deviation of harmonic tracks, higher harmonics have higher allowed deviation
    	returns hfreq, hmag, hphase: harmonic frequencies, magnitude and phases; xr: residual signal
    	"""
        window='blackman'
        M=2048 #601
        N=2048
        t=-100
        minSineDur=0.1
        nH=48 #100
        minf0=30 #350
        maxf0=700
        f0et=5
        harmDevSlope=0.01
        #Ns = 512 #512
        H = 128 #128
        w = get_window(window, M)
        hfreq, hmag, hphase, xr = HPR.hprModelAnal(xchunk, fs, w, N, H, t, minSineDur, nH, minf0, maxf0, f0et, harmDevSlope)

        M = 1024
        N = 1024
        H = 512
        w = get_window(window, M)
        mXr, pXr = STFT.stftAnal(xr, w, N, H)

        if plot is True:
            M = 2048
            N = 2048
            H = 128
            w = get_window(window, M)
            mXr, pXr = STFT.stftAnal(xr, w, N, H)
            y, yh = HPR.hprModelSynth(hfreq, hmag, hphase, xr, Ns, H, fs)

            # create figure to plot
            plt.figure(figsize=(12, 9))

            # frequency range to plot
            maxplotfreq = 5000.0

            # plot the input sound
            plt.subplot(3,1,1)
            plt.plot(np.arange(xchunk.size)/float(fs), xchunk)
            plt.axis([0, xchunk.size/float(fs), min(xchunk), max(xchunk)])
            plt.ylabel('amplitude')
            plt.xlabel('time (sec)')
            plt.title('input sound: x')

            # plot the magnitude spectrogram of residual
            plt.subplot(3,1,2)
            maxplotbin = int(N*maxplotfreq/fs)
            numFrames = int(mXr[:,0].size)
            frmTime = H*np.arange(numFrames)/float(fs)
            binFreq = np.arange(maxplotbin+1)*float(fs)/N
            plt.pcolormesh(frmTime, binFreq, np.transpose(mXr[:,:maxplotbin+1]))
            plt.autoscale(tight=True)

            # plot harmonic frequencies on residual spectrogram
            if (hfreq.shape[1] > 0):
                harms = hfreq*np.less(hfreq,maxplotfreq)
                harms[harms==0] = np.nan
                numFrames = int(harms[:,0].size)
                frmTime = H*np.arange(numFrames)/float(fs)
                plt.plot(frmTime, harms, color='k', ms=3, alpha=1)
                plt.xlabel('time(s)')
                plt.ylabel('frequency(Hz)')
                plt.autoscale(tight=True)
                plt.title('harmonics + residual spectrogram')

            # plot the output sound
            plt.subplot(3,1,3)
            plt.plot(np.arange(y.size)/float(fs), y)
            plt.axis([0, y.size/float(fs), min(y), max(y)])
            plt.ylabel('amplitude')
            plt.xlabel('time (sec)')
            plt.title('output sound: y')

            plt.tight_layout()
            plt.show()

        return [hfreq.tolist(), hmag.tolist(), hphase.tolist(), mXr.tolist(), pXr.tolist()]
