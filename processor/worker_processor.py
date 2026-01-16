"""
Audio chunk processing worker module.

This module processes individual chunks of audio data, extracting spectral
features at a target frame rate for visualization. It handles the core
analysis pipeline:

1. STFT (Short-Time Fourier Transform) analysis for spectral content
2. Harmonic Model analysis for pitch and harmonic tracking
3. Volume, balance (pan), and stereo width calculations

The worker processes audio in chunks to manage memory efficiently, then
aggregates results into dictionaries for the parent analysis module.

The processing includes:
- Converting dB magnitude to linear amplitude
- Downsampling analysis frames to target FPS (e.g., 24fps for video)
- Computing peak values across time windows
- Calculating stereo characteristics (pan, width)

Example usage:
    worker_processor(
        'song.wav', 44100, 24, left_audio, right_audio,
        chunk_idx=0, total_chunks=10, chunk_len=88200, total_len=882000,
        stft_dict, stft2_dict, harmonic_dict, resid_dict,
        volume_dict, balance_dict, width_dict
    )
"""
from __future__ import annotations

import math
from typing import Any

import numpy as np
from numpy.typing import NDArray

from processor import processor


# Type aliases for result dictionaries
STFTDict = dict[int, list[list[float]]]
HarmonicDict = dict[int, list[list[list[float]]]]
VolumeDict = dict[int, list[float]]


def worker_processor(
    filename: str,
    fs: int,
    fps: int,
    x: NDArray[np.float64],
    x2: NDArray[np.float64],
    i: int,
    chunkcount: int,
    chunklen: int,
    totallen: int,
    return_dict_stft: STFTDict,
    return_dict_stft2: STFTDict,
    return_dict_harmonic: HarmonicDict,
    return_dict_resid: dict[int, Any],
    return_dict_volume: VolumeDict,
    return_dict_balance: VolumeDict,
    return_dict_width: VolumeDict
) -> None:
    """
    Process a chunk of audio and extract spectral features.
    
    Analyzes a portion of stereo audio using STFT and harmonic models,
    then downsamples the results to the target frame rate for visualization.
    Results are stored in the provided dictionaries.
    
    Args:
        filename: Name of the audio file being processed (for logging).
        fs: Sample rate in Hz (e.g., 44100).
        fps: Target frames per second for output (e.g., 24 for video).
        x: Left channel audio samples as numpy array.
        x2: Right channel audio samples as numpy array.
        i: Current chunk index (0-based).
        chunkcount: Total number of full chunks.
        chunklen: Number of samples per chunk.
        totallen: Total number of samples in the audio.
        return_dict_stft: Output dictionary for left channel STFT data.
        return_dict_stft2: Output dictionary for right channel STFT data.
        return_dict_harmonic: Output dictionary for harmonic analysis data.
        return_dict_resid: Output dictionary for residual data (reserved).
        return_dict_volume: Output dictionary for volume levels.
        return_dict_balance: Output dictionary for stereo balance (pan).
        return_dict_width: Output dictionary for stereo width.
    
    Notes:
        - Volume is calculated as sum of linear magnitude across frequency bins
        - Balance (pan) is left-right difference in volume
        - Width is average absolute difference between left and right spectra
        - STFT is converted from dB to linear using 10^(dB/10) formula
    
    Example:
        >>> stft_results = {}
        >>> worker_processor('test.wav', 44100, 24, left, right, 0, 1, 88200, 88200,
        ...                  stft_results, {}, {}, {}, {}, {}, {})
        >>> len(stft_results[0])  # Number of frames at 24fps
        48
    """
    origi: int = i
    chunkdelta: int = i * chunklen
    
    # Get this chunk of audio
    xchunk: NDArray[np.float64] = x[chunkdelta:chunklen + chunkdelta]
    xchunk2: NDArray[np.float64] = x2[chunkdelta:chunklen + chunkdelta]
    
    # STFT Analysis
    stftsamples, stftsamples2, volume, balance, width = _process_stft(
        fs, fps, xchunk, xchunk2
    )
    
    # Harmonic Model Analysis
    harmonicsamples = _process_harmonic(fs, fps, xchunk, xchunk2, chunklen)
    
    # Store results in dictionaries
    return_dict_stft[origi] = stftsamples
    return_dict_stft2[origi] = stftsamples2
    return_dict_harmonic[origi] = harmonicsamples
    return_dict_volume[origi] = volume
    return_dict_balance[origi] = balance
    return_dict_width[origi] = width
    
    print(f"{filename} worker {origi}/{chunkcount}")


def _process_stft(
    fs: int,
    fps: int,
    xchunk: NDArray[np.float64],
    xchunk2: NDArray[np.float64]
) -> tuple[list[list[float]], list[list[float]], list[float], list[float], list[float]]:
    """
    Process STFT analysis and extract volume, balance, and width.
    
    Performs Short-Time Fourier Transform on both stereo channels,
    converts magnitude from dB to linear, finds peaks across time windows,
    and calculates stereo characteristics.
    
    Args:
        fs: Sample rate in Hz.
        fps: Target frames per second.
        xchunk: Left channel audio chunk.
        xchunk2: Right channel audio chunk.
    
    Returns:
        Tuple of (stft_left, stft_right, volumes, balances, widths).
    
    Algorithm:
        1. Compute STFT for both channels
        2. For each target frame period:
           - Find peak magnitude at each frequency bin
           - Convert dB to linear amplitude: 10^(dB/10)
           - Sum magnitudes for volume
           - Calculate left-right difference for balance
           - Calculate average absolute difference for width
    """
    # Perform STFT analysis on both channels
    result: list[list[float]] = processor(fs, xchunk, 'TheSTFT', False)
    result2: list[list[float]] = processor(fs, xchunk2, 'TheSTFT', False)
    
    # Calculate STFT parameters
    numframes: int = len(result[0])
    analysislen: int = len(result[0][0]) - 1
    
    hopsize: int = 512
    fftsizeratio: float = float(analysislen) / hopsize
    framelen: float = float(fs) / fps * fftsizeratio
    ratio: float = float(framelen) / analysislen
    
    # Initialize output arrays
    stftsamples: list[list[float]] = []
    stftsamples2: list[list[float]] = []
    volume: list[float] = []
    balance: list[float] = []
    width: list[float] = []
    
    rprev: float = 0.0
    delta: int = 0
    
    # Iterate over STFT frames and downsample to target FPS
    for frame_idx in range(numframes):
        r: float = frame_idx % ratio
        
        # Trigger output at frame boundaries
        if r < rprev or frame_idx == numframes - 1:
            # Find peak magnitude at each frequency bin across the window
            maximum: list[float] = [-1000.0] * analysislen
            maximum2: list[float] = [-1000.0] * analysislen
            
            for j in range(delta):
                for k in range(analysislen):
                    if result[0][frame_idx - j][k] > maximum[k]:
                        maximum[k] = result[0][frame_idx - j][k]
                    if result2[0][frame_idx - j][k] > maximum2[k]:
                        maximum2[k] = result2[0][frame_idx - j][k]
            
            # Convert to linear amplitude and calculate volume
            # Formula: linear = 10^(dB/10) for power (was /20 for amplitude)
            # Reference: http://www.mogami.com/e/cad/db.html
            sums: float = 0.0
            sums2: float = 0.0
            
            for j in range(analysislen):
                maximum[j] = math.pow(10, maximum[j] / 10)
                maximum2[j] = math.pow(10, maximum2[j] / 10)
                sums += maximum[j]
                sums2 += maximum2[j]
            
            # Calculate pan (balance): left-right difference
            pan: float = sums2 - sums
            
            # Calculate stereo width: average absolute difference
            thewidth: float = 0.0
            for j in range(delta):
                for k in range(analysislen):
                    thewidth += result[0][frame_idx - j][k] - result2[0][frame_idx - j][k]
            thewidth = abs(thewidth) / analysislen
            
            # Use loudest channel for volume
            thevolume: float = sums if sums >= sums2 else sums2
            
            # Store results
            stftsamples.append(maximum)
            stftsamples2.append(maximum2)
            volume.append(thevolume)
            balance.append(pan)
            width.append(thewidth)
            delta = 0
        
        rprev = r
        delta += 1
    
    return stftsamples, stftsamples2, volume, balance, width


def _process_harmonic(
    fs: int,
    fps: int,
    xchunk: NDArray[np.float64],
    xchunk2: NDArray[np.float64],
    chunklen: int
) -> list[list[list[float]]]:
    """
    Process harmonic model analysis for pitch tracking.
    
    Performs harmonic analysis on both stereo channels, extracts harmonic
    frequencies and magnitudes, and downsamples to target frame rate.
    
    Args:
        fs: Sample rate in Hz.
        fps: Target frames per second.
        xchunk: Left channel audio chunk.
        xchunk2: Right channel audio chunk.
        chunklen: Length of the audio chunk in samples.
    
    Returns:
        List of [frequencies, magnitudes] pairs for each output frame.
        Each frame contains merged left/right harmonic data.
    
    Algorithm:
        1. Compute harmonic analysis for both channels
        2. For each target frame period:
           - Average harmonic frequencies and magnitudes across window
           - Convert magnitude from dB to linear: 10^(dB/20)
           - Merge left and right channel data
    """
    # Perform harmonic model analysis
    HMresult: list[list[list[float]]] = processor(fs, xchunk, 'TheHM', False)
    HMresult2: list[list[list[float]]] = processor(fs, xchunk2, 'TheHM', False)
    
    # Calculate harmonic analysis parameters
    numframes: int = len(HMresult[0])
    nH: int = len(HMresult[0][0])  # Number of harmonics
    analysislen: float = float(chunklen) / numframes
    
    hopsize: int = 128
    fftsizeratio: float = float(analysislen) / hopsize
    framelen: float = float(fs) / fps * fftsizeratio
    ratio: float = float(framelen) / analysislen
    
    # Initialize output
    harmonicsamples: list[list[list[float]]] = []
    
    rprev: float = 0.0
    delta: int = 0
    
    # Iterate over harmonic frames and downsample to target FPS
    for frame_idx in range(numframes):
        r: float = frame_idx % ratio
        
        # Trigger output at frame boundaries
        if r < rprev or frame_idx == numframes - 1:
            # Initialize averaging arrays
            hfreqaverages: list[float] = [0.0] * nH
            hfreqaverages2: list[float] = [0.0] * nH
            hmagaverages: list[float] = [0.0] * nH
            hmagaverages2: list[float] = [0.0] * nH
            
            # Sum values across window for averaging
            for j in range(delta):
                for k in range(nH):
                    hfreqaverages[k] += HMresult[0][frame_idx - j][k]
                    hfreqaverages2[k] += HMresult2[0][frame_idx - j][k]
                    hmagaverages[k] += HMresult[1][frame_idx - j][k]
                    hmagaverages2[k] += HMresult2[1][frame_idx - j][k]
            
            # Calculate averages and convert magnitude to linear
            for j in range(nH):
                # Average frequencies (rounded to integer Hz)
                hfreqaverages[j] = int(round(hfreqaverages[j] / delta)) if delta > 0 else 0
                hfreqaverages2[j] = int(round(hfreqaverages2[j] / delta)) if delta > 0 else 0
                
                # Average magnitudes
                hmagaverages[j] = hmagaverages[j] / delta if delta > 0 else 0
                hmagaverages2[j] = hmagaverages2[j] / delta if delta > 0 else 0
                
                # Convert dB to linear amplitude: 10^(dB/20)
                hmagaverages[j] = math.pow(10, hmagaverages[j] / 20)
                hmagaverages2[j] = math.pow(10, hmagaverages2[j] / 20)
            
            # Merge left and right channels (average)
            hfreqaveragesmerged: list[float] = []
            hmagaveragesmerged: list[float] = []
            
            for j in range(nH):
                hfreqaveragesmerged.append((hfreqaverages[j] + hfreqaverages2[j]) / 2)
                hmagaveragesmerged.append((hmagaverages[j] + hmagaverages2[j]) / 2)
            
            harmonicsamples.append([hfreqaveragesmerged, hmagaveragesmerged])
            delta = 0
        
        rprev = r
        delta += 1
    
    return harmonicsamples


