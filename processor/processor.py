"""
Audio analysis processor module using sms-tools.

This module provides spectral and harmonic analysis functions for audio
visualization using various models from the sms-tools library:

- STFT (Short-Time Fourier Transform): Time-frequency representation
- SM (Sinusoidal Model): Tracks individual sinusoidal components
- F0 (Fundamental Frequency): Detects pitch/fundamental frequency
- HM (Harmonic Model): Tracks harmonic partials of pitched sounds
- HPR (Harmonic Plus Residual): Separates harmonics from noise

Each analysis model extracts different features useful for audio visualization:
- STFT provides overall spectral content (magnitude and phase)
- Harmonic models track pitched content and overtones
- Residual analysis captures noise and transients

Example usage:
    from processor import processor
    result = processor(44100, audio_chunk, 'TheSTFT', plot=False)
"""
from __future__ import annotations

from typing import Any, Literal

import matplotlib.pyplot as plt
import numpy as np
from numpy.typing import NDArray
from scipy.signal import get_window
from smstools.models import harmonicModel as HM
from smstools.models import hprModel as HPR
from smstools.models import sineModel as SM
from smstools.models import stft as STFT


# Type for analysis method selection
AnalysisType = Literal['TheSTFT', 'TheSM', 'TheF0', 'TheHM', 'TheHPR']


def processor(
    fs: int,
    xchunk: NDArray[np.float64],
    analysis: AnalysisType,
    plot: bool
) -> list[list[float]]:
    """
    Analyze a chunk of audio using a specified spectral model.
    
    Performs spectral analysis on an audio chunk using one of several models
    from the sms-tools library. Each model extracts different features
    useful for audio visualization.
    
    Args:
        fs: Sample rate of the audio in Hz (e.g., 44100).
        xchunk: Audio samples as numpy array.
        analysis: Analysis method to use:
                 - 'TheSTFT': Short-Time Fourier Transform (magnitude/phase)
                 - 'TheSM': Sinusoidal Model (tracks sine partials)
                 - 'TheF0': Fundamental frequency detection
                 - 'TheHM': Harmonic Model (tracks harmonics)
                 - 'TheHPR': Harmonic Plus Residual (harmonics + noise)
        plot: If True, display matplotlib plots of the analysis results.
    
    Returns:
        List of analysis results, structure depends on analysis type:
        - TheSTFT: [mX] where mX is magnitude spectrogram
        - TheSM: [tfreq, tmag, tphase] - sine track frequencies, magnitudes, phases
        - TheF0: [f0] - fundamental frequency over time
        - TheHM: [hfreq, hmag, hphase] - harmonic frequencies, magnitudes, phases
        - TheHPR: [hfreq, hmag, hphase, mXr, pXr] - harmonics + residual spectrogram
    
    Raises:
        ValueError: If analysis type is not recognized.
    
    Example:
        >>> fs = 44100
        >>> audio = np.sin(2 * np.pi * 440 * np.arange(44100) / fs)
        >>> result = processor(fs, audio, 'TheSTFT', plot=False)
        >>> len(result[0])  # Number of STFT frames
        86
    """
    # Short-Time Fourier Transform Analysis
    if analysis == 'TheSTFT':
        return _analyze_stft(fs, xchunk, plot)
    
    # Sinusoidal Model Analysis
    if analysis == 'TheSM':
        return _analyze_sinusoidal(fs, xchunk, plot)
    
    # Fundamental Frequency Detection
    if analysis == 'TheF0':
        return _analyze_f0(fs, xchunk, plot)
    
    # Harmonic Model Analysis
    if analysis == 'TheHM':
        return _analyze_harmonic(fs, xchunk, plot)
    
    # Harmonic Plus Residual Analysis
    if analysis == 'TheHPR':
        return _analyze_hpr(fs, xchunk, plot)
    
    raise ValueError(f"Unknown analysis type: {analysis}")


def _analyze_stft(
    fs: int,
    xchunk: NDArray[np.float64],
    plot: bool
) -> list[list[float]]:
    """
    Short-Time Fourier Transform analysis.
    
    Computes the STFT of the audio to get time-varying spectral content.
    Returns magnitude spectrogram which shows how the frequency content
    changes over time.
    
    Algorithm:
    1. Apply Hanning window to overlapping frames
    2. Compute FFT of each windowed frame
    3. Extract magnitude spectrum (in dB)
    
    Args:
        fs: Sample rate in Hz.
        xchunk: Audio samples.
        plot: Whether to display visualization.
    
    Returns:
        [mX] where mX is the magnitude spectrogram (frames x frequency bins).
    """
    # 'hann' is the scipy name for Hanning window (scipy >= 1.1 deprecated 'hanning')
    window: str = 'hann'
    M: int = 2048      # Window size: affects frequency resolution
    N: int = 2048      # FFT size: zero-padded if > M
    H: int = 512       # Hop size: affects time resolution
    w: NDArray[np.float64] = get_window(window, M)
    mX, pX = STFT.stftAnal(xchunk, w, N, H)
    
    if plot:
        y = STFT.stftSynth(mX, pX, M, H)
        _plot_stft(fs, xchunk, mX, N, H, y)
    
    return [mX.tolist()]


def _analyze_sinusoidal(
    fs: int,
    xchunk: NDArray[np.float64],
    plot: bool
) -> list[list[float]]:
    """
    Sinusoidal Model analysis with sine tracking.
    
    Tracks individual sinusoidal components (partials) through time.
    Useful for tracking melodic content and individual tones.
    
    Algorithm:
    1. Compute STFT of audio
    2. Find spectral peaks in each frame
    3. Connect peaks across frames using frequency deviation constraints
    4. Track continuous sinusoidal trajectories
    
    Args:
        fs: Sample rate in Hz.
        xchunk: Audio samples.
        plot: Whether to display visualization.
    
    Returns:
        [tfreq, tmag, tphase] - tracked frequencies, magnitudes, and phases.
    """
    window: str = 'hamming'
    M: int = 2001           # Window size
    N: int = 2048           # FFT size
    t: int = -80            # Threshold in negative dB for peak detection
    minSineDur: float = 0.02  # Minimum duration of sines in seconds
    maxnSines: int = 150    # Maximum number of sines per frame
    freqDevOffset: int = 10  # Minimum frequency deviation at 0Hz
    freqDevSlope: float = 0.001  # Slope increase of min freq deviation
    Ns: int = 512           # Synthesis FFT size
    H: int = 128            # Hop size
    w: NDArray[np.float64] = get_window(window, M)
    
    tfreq, tmag, tphase = SM.sineModelAnal(
        xchunk, fs, w, N, H, t, maxnSines, minSineDur, freqDevOffset, freqDevSlope
    )
    
    if plot:
        y = SM.sineModelSynth(tfreq, tmag, tphase, Ns, H, fs)
        _plot_sinusoidal(fs, xchunk, tfreq, H, y)
    
    return [tfreq.tolist(), tmag.tolist(), tphase.tolist()]


def _analyze_f0(
    fs: int,
    xchunk: NDArray[np.float64],
    plot: bool
) -> list[list[float]]:
    """
    Fundamental frequency (pitch) detection using TWM algorithm.
    
    Detects the fundamental frequency (pitch) of the audio over time.
    Uses the Two-Way Mismatch (TWM) algorithm which compares detected
    peaks with harmonic series of candidate frequencies.
    
    Algorithm:
    1. Compute STFT and find spectral peaks
    2. For each frame, test candidate F0 frequencies
    3. Score candidates using TWM error function
    4. Select F0 with minimum error above threshold
    
    Args:
        fs: Sample rate in Hz.
        xchunk: Audio samples.
        plot: Whether to display visualization.
    
    Returns:
        [f0] - fundamental frequency values over time.
    """
    M: int = 1024           # Window size
    N: int = 1024           # FFT size
    H: int = 128            # Hop size
    t: int = -90            # Threshold in negative dB
    minf0: int = 130        # Minimum F0 frequency in Hz
    maxf0: int = 5000       # Maximum F0 frequency in Hz
    f0et: int = 7           # F0 error threshold
    window: str = 'blackman'
    w: NDArray[np.float64] = get_window(window, M)
    
    f0 = HM.f0Detection(xchunk, fs, w, N, H, t, minf0, maxf0, f0et)
    
    if plot:
        _plot_f0(fs, xchunk, f0, H)
    
    return [f0.tolist()]


def _analyze_harmonic(
    fs: int,
    xchunk: NDArray[np.float64],
    plot: bool
) -> list[list[float]]:
    """
    Harmonic Model analysis for tracking harmonic partials.
    
    Tracks harmonic components of pitched sounds. First detects the
    fundamental frequency, then finds harmonics as integer multiples
    of F0.
    
    Algorithm:
    1. Detect fundamental frequency using TWM
    2. Find harmonics as multiples of F0
    3. Track harmonic frequencies and magnitudes through time
    4. Handle missing harmonics and frequency drift
    
    Args:
        fs: Sample rate in Hz.
        xchunk: Audio samples.
        plot: Whether to display visualization.
    
    Returns:
        [hfreq, hmag, hphase] - harmonic frequencies, magnitudes, and phases.
    """
    window: str = 'blackman'
    M: int = 2048           # Window size
    N: int = 2048           # FFT size
    t: int = -90            # Threshold in negative dB
    minSineDur: float = 0.1  # Minimum duration of harmonics
    nH: int = 10            # Maximum number of harmonics
    minf0: int = 30         # Minimum F0 in Hz
    maxf0: int = 3000       # Maximum F0 in Hz
    f0et: int = 7           # F0 error threshold
    harmDevSlope: float = 0.01  # Harmonic deviation slope
    H: int = 128            # Hop size
    w: NDArray[np.float64] = get_window(window, M)
    
    hfreq, hmag, hphase = HM.harmonicModelAnal(
        xchunk, fs, w, N, H, t, nH, minf0, maxf0, f0et, harmDevSlope, minSineDur
    )
    
    if plot:
        Ns: int = 512       # Synthesis FFT size
        y = SM.sineModelSynth(hfreq, hmag, hphase, Ns, H, fs)
        _plot_harmonic(fs, xchunk, hfreq, H, y)
    
    return [hfreq.tolist(), hmag.tolist(), hphase.tolist()]


def _analyze_hpr(
    fs: int,
    xchunk: NDArray[np.float64],
    plot: bool
) -> list[list[float]]:
    """
    Harmonic Plus Residual (HPR) model analysis.
    
    Separates audio into harmonic components and residual (noise/transients).
    Combines harmonic tracking with residual spectrum analysis.
    
    Algorithm:
    1. Perform harmonic analysis to extract harmonics
    2. Synthesize harmonic component
    3. Subtract harmonics from original to get residual
    4. Analyze residual using STFT
    
    Args:
        fs: Sample rate in Hz.
        xchunk: Audio samples.
        plot: Whether to display visualization.
    
    Returns:
        [hfreq, hmag, hphase, mXr, pXr] - harmonics + residual spectrogram.
    """
    window: str = 'blackman'
    M: int = 2048           # Window size
    N: int = 2048           # FFT size
    t: int = -100           # Threshold in negative dB
    minSineDur: float = 0.1  # Minimum duration of harmonics
    nH: int = 48            # Maximum number of harmonics
    minf0: int = 30         # Minimum F0 in Hz
    maxf0: int = 700        # Maximum F0 in Hz
    f0et: int = 5           # F0 error threshold
    harmDevSlope: float = 0.01  # Harmonic deviation slope
    H: int = 128            # Hop size
    w: NDArray[np.float64] = get_window(window, M)
    
    hfreq, hmag, hphase, xr = HPR.hprModelAnal(
        xchunk, fs, w, N, H, t, minSineDur, nH, minf0, maxf0, f0et, harmDevSlope
    )
    
    # Analyze residual with STFT
    M_res: int = 1024
    N_res: int = 1024
    H_res: int = 512
    w_res: NDArray[np.float64] = get_window(window, M_res)
    mXr, pXr = STFT.stftAnal(xr, w_res, N_res, H_res)
    
    if plot:
        _plot_hpr(fs, xchunk, hfreq, H, mXr, N, xr)
    
    return [hfreq.tolist(), hmag.tolist(), hphase.tolist(), mXr.tolist(), pXr.tolist()]


def _plot_stft(
    fs: int,
    xchunk: NDArray[np.float64],
    mX: NDArray[np.float64],
    N: int,
    H: int,
    y: NDArray[np.float64]
) -> None:
    """Plot STFT analysis results."""
    plt.figure(figsize=(12, 9))
    maxplotfreq: float = 10000.0
    
    # Input sound
    plt.subplot(4, 1, 1)
    plt.plot(np.arange(xchunk.size) / float(fs), xchunk)
    plt.axis([0, xchunk.size / float(fs), min(xchunk), max(xchunk)])
    plt.ylabel('amplitude')
    plt.xlabel('time (sec)')
    plt.title('input sound: x')
    
    # Magnitude spectrogram
    plt.subplot(4, 1, 2)
    numFrames: int = int(mX[:, 0].size)
    frmTime = H * np.arange(numFrames) / float(fs)
    binFreq = fs * np.arange(int(N * maxplotfreq / fs)) / N
    plt.pcolormesh(frmTime, binFreq, np.transpose(mX[:, :int(N * maxplotfreq / fs) + 1]))
    plt.xlabel('time (sec)')
    plt.ylabel('frequency (Hz)')
    plt.title('magnitude spectrogram')
    plt.autoscale(tight=True)
    
    plt.tight_layout()
    plt.show()


def _plot_sinusoidal(
    fs: int,
    xchunk: NDArray[np.float64],
    tfreq: NDArray[np.float64],
    H: int,
    y: NDArray[np.float64]
) -> None:
    """Plot sinusoidal model analysis results."""
    plt.figure(figsize=(12, 9))
    maxplotfreq: float = 5000.0
    
    # Input sound
    plt.subplot(3, 1, 1)
    plt.plot(np.arange(xchunk.size) / float(fs), xchunk)
    plt.axis([0, xchunk.size / float(fs), min(xchunk), max(xchunk)])
    plt.ylabel('amplitude')
    plt.xlabel('time (sec)')
    plt.title('input sound: x')
    
    # Sinusoidal frequencies
    plt.subplot(3, 1, 2)
    if tfreq.shape[1] > 0:
        numFrames: int = tfreq.shape[0]
        frmTime = H * np.arange(numFrames) / float(fs)
        tfreq_plot = tfreq.copy()
        tfreq_plot[tfreq_plot <= 0] = np.nan
        plt.plot(frmTime, tfreq_plot)
        plt.axis([0, xchunk.size / float(fs), 0, maxplotfreq])
        plt.title('frequencies of sinusoidal tracks')
    
    # Output sound
    plt.subplot(3, 1, 3)
    plt.plot(np.arange(y.size) / float(fs), y)
    plt.axis([0, y.size / float(fs), min(y), max(y)])
    plt.ylabel('amplitude')
    plt.xlabel('time (sec)')
    plt.title('output sound: y')
    
    plt.tight_layout()
    plt.show()


def _plot_f0(
    fs: int,
    xchunk: NDArray[np.float64],
    f0: NDArray[np.float64],
    H: int
) -> None:
    """Plot fundamental frequency detection results."""
    plt.figure(figsize=(12, 9))
    maxplotfreq: float = 4000.0
    
    # F0 frequencies
    if f0.size > 0:
        numFrames: int = f0.size
        frmTime = H * np.arange(numFrames) / float(fs)
        plt.plot(frmTime, f0)
        plt.axis([0, xchunk.size / float(fs), 0, maxplotfreq])
        plt.title('frequencies of f0')
    
    plt.tight_layout()
    plt.show()


def _plot_harmonic(
    fs: int,
    xchunk: NDArray[np.float64],
    hfreq: NDArray[np.float64],
    H: int,
    y: NDArray[np.float64]
) -> None:
    """Plot harmonic model analysis results."""
    plt.figure(figsize=(12, 9))
    maxplotfreq: float = 2000.0
    
    # Input sound
    plt.subplot(3, 1, 1)
    plt.plot(np.arange(xchunk.size) / float(fs), xchunk)
    plt.axis([0, xchunk.size / float(fs), min(xchunk), max(xchunk)])
    plt.ylabel('amplitude')
    plt.xlabel('time (sec)')
    plt.title('input sound: x')
    
    # Harmonic frequencies
    plt.subplot(3, 1, 2)
    if hfreq.shape[1] > 0:
        numFrames: int = hfreq.shape[0]
        frmTime = H * np.arange(numFrames) / float(fs)
        hfreq_plot = hfreq.copy()
        hfreq_plot[hfreq_plot <= 0] = np.nan
        plt.plot(frmTime, hfreq_plot)
        plt.axis([0, xchunk.size / float(fs), 0, maxplotfreq])
        plt.title('frequencies of harmonic tracks')
    
    # Output sound
    plt.subplot(3, 1, 3)
    plt.plot(np.arange(y.size) / float(fs), y)
    plt.axis([0, y.size / float(fs), min(y), max(y)])
    plt.ylabel('amplitude')
    plt.xlabel('time (sec)')
    plt.title('output sound: y')
    
    plt.tight_layout()
    plt.show()


def _plot_hpr(
    fs: int,
    xchunk: NDArray[np.float64],
    hfreq: NDArray[np.float64],
    H: int,
    mXr: NDArray[np.float64],
    N: int,
    xr: NDArray[np.float64]
) -> None:
    """Plot harmonic plus residual analysis results."""
    window: str = 'blackman'
    Ns: int = 512
    M: int = 2048
    N_plot: int = 2048
    H_plot: int = 128
    w: NDArray[np.float64] = get_window(window, M)
    mXr_plot, pXr = STFT.stftAnal(xr, w, N_plot, H_plot)
    y, yh = HPR.hprModelSynth(hfreq, np.zeros_like(hfreq), np.zeros_like(hfreq), xr, Ns, H, fs)
    
    plt.figure(figsize=(12, 9))
    maxplotfreq: float = 5000.0
    
    # Input sound
    plt.subplot(3, 1, 1)
    plt.plot(np.arange(xchunk.size) / float(fs), xchunk)
    plt.axis([0, xchunk.size / float(fs), min(xchunk), max(xchunk)])
    plt.ylabel('amplitude')
    plt.xlabel('time (sec)')
    plt.title('input sound: x')
    
    # Magnitude spectrogram of residual
    plt.subplot(3, 1, 2)
    maxplotbin: int = int(N_plot * maxplotfreq / fs)
    numFrames: int = int(mXr_plot[:, 0].size)
    frmTime = H_plot * np.arange(numFrames) / float(fs)
    binFreq = np.arange(maxplotbin + 1) * float(fs) / N_plot
    plt.pcolormesh(frmTime, binFreq, np.transpose(mXr_plot[:, :maxplotbin + 1]))
    plt.autoscale(tight=True)
    
    # Plot harmonic frequencies on residual spectrogram
    if hfreq.shape[1] > 0:
        harms = hfreq * np.less(hfreq, maxplotfreq)
        harms[harms == 0] = np.nan
        numFrames = int(harms[:, 0].size)
        frmTime = H * np.arange(numFrames) / float(fs)
        plt.plot(frmTime, harms, color='k', ms=3, alpha=1)
        plt.xlabel('time(s)')
        plt.ylabel('frequency(Hz)')
        plt.autoscale(tight=True)
        plt.title('harmonics + residual spectrogram')
    
    # Output sound
    plt.subplot(3, 1, 3)
    plt.plot(np.arange(y.size) / float(fs), y)
    plt.axis([0, y.size / float(fs), min(y), max(y)])
    plt.ylabel('amplitude')
    plt.xlabel('time (sec)')
    plt.title('output sound: y')
    
    plt.tight_layout()
    plt.show()
