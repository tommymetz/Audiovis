"""
Audio analysis module for extracting spectral features.

This module provides the core audio analysis pipeline that processes stereo
audio samples and extracts various features for visualization:

- STFT (Short-Time Fourier Transform) spectral data
- Harmonic analysis data
- Volume/loudness measurements
- Stereo balance (pan position)
- Stereo width measurements

The analysis works by:
1. Splitting audio into chunks for efficient processing
2. Processing each chunk through STFT and harmonic analysis
3. Normalizing spectral data for consistent visualization
4. Identifying non-quiet samples for clustering

Example usage:
    stft_left, stft_right, harmonics, chunks, volumes, balances, widths, non_quiet = \
        analysis('song.wav', 44100, 24, left_samples, right_samples)
"""
from __future__ import annotations

from typing import Any

from worker_processor import worker_processor


# Type aliases for better readability
STFTSamples = list[list[float]]
HarmonicSamples = list[list[list[float]]]
HarmonicChunks = list[list[list[list[float]]]]


def analysis(
    filename: str,
    fs: int,
    fps: int,
    x: Any,
    x2: Any
) -> tuple[STFTSamples, STFTSamples, HarmonicSamples, HarmonicChunks, 
           list[float], list[float], list[float], list[int]]:
    """
    Analyze audio samples and extract spectral features for visualization.
    
    Processes stereo audio data to extract STFT spectral data, harmonic
    information, volume levels, stereo balance, and width measurements.
    Audio is processed in chunks for memory efficiency.
    
    Args:
        filename: Name of the audio file being processed (for logging).
        fs: Sample rate of the audio in Hz (e.g., 44100).
        fps: Target frames per second for visualization output (e.g., 24).
        x: Left channel audio samples as numpy array.
        x2: Right channel audio samples as numpy array.
    
    Returns:
        A tuple containing:
        - stftsamples_normalized: Normalized STFT data for left channel
        - stftsamples_normalized2: Normalized STFT data for right channel
        - harmonicsamples: Harmonic frequency and magnitude data
        - harmonicchunks: Raw harmonic chunks before flattening
        - volumes: Volume level for each frame
        - balances: Stereo balance (-1 to 1) for each frame
        - widths: Stereo width for each frame
        - nonquietsamples: Indices of frames above noise threshold
    
    Raises:
        ValueError: If audio samples are empty or sample rate is invalid.
    
    Example:
        >>> fs = 44100
        >>> fps = 24
        >>> stft_l, stft_r, harm, chunks, vol, bal, wid, nq = \
        ...     analysis('test.wav', fs, fps, left_audio, right_audio)
    """
    if len(x) == 0 or len(x2) == 0:
        raise ValueError("Audio samples cannot be empty")
    
    if fs <= 0:
        raise ValueError(f"Sample rate must be positive, got {fs}")
    
    if fps <= 0:
        raise ValueError(f"FPS must be positive, got {fps}")
    
    totallen: int = len(x)
    chunkseconds: int = 2  # Process 2 seconds at a time
    
    chunklen: int = fs * chunkseconds
    chunkcount: int = totallen // chunklen
    lastlen: int = totallen - (chunkcount * chunklen)
    
    # Initialize result dictionaries for collecting chunk outputs
    return_dict_stft: dict[int, list[list[float]]] = {}
    return_dict_stft2: dict[int, list[list[float]]] = {}
    return_dict_harmonic: dict[int, list[list[list[float]]]] = {}
    return_dict_resid: dict[int, Any] = {}  # Reserved for residual analysis
    return_dict_volume: dict[int, list[float]] = {}
    return_dict_balance: dict[int, list[float]] = {}
    return_dict_width: dict[int, list[float]] = {}
    
    # Process all chunks sequentially
    for i in range(chunkcount):
        worker_processor(
            filename, fs, fps, x, x2, i, chunkcount, chunklen, totallen,
            return_dict_stft, return_dict_stft2, return_dict_harmonic,
            return_dict_resid, return_dict_volume, return_dict_balance, return_dict_width
        )
    
    # Process last bit (remaining samples that don't fill a complete chunk)
    if lastlen > 0:
        worker_processor(
            filename, fs, fps, x, x2, chunkcount, chunkcount, chunklen, totallen,
            return_dict_stft, return_dict_stft2, return_dict_harmonic,
            return_dict_resid, return_dict_volume, return_dict_balance, return_dict_width
        )
    
    # Collect and flatten chunk results
    stftchunks: list[list[list[float]]] = list(return_dict_stft.values())
    stftchunks2: list[list[list[float]]] = list(return_dict_stft2.values())
    harmonicchunks: HarmonicChunks = list(return_dict_harmonic.values())
    volumechunks: list[list[float]] = list(return_dict_volume.values())
    balancechunks: list[list[float]] = list(return_dict_balance.values())
    widthchunks: list[list[float]] = list(return_dict_width.values())
    
    # Convert chunks into single flattened arrays
    stftsamples: list[list[float]] = []
    stftsamples2: list[list[float]] = []
    volumes: list[float] = []
    balances: list[float] = []
    widths: list[float] = []
    
    for i in range(len(stftchunks)):
        stftsamples.extend(stftchunks[i])
        stftsamples2.extend(stftchunks2[i])
        volumes.extend(volumechunks[i])
        balances.extend(balancechunks[i])
        widths.extend(widthchunks[i])
    
    # Convert harmonic chunks into single multi-dim array
    harmonicsamples: HarmonicSamples = []
    for i in range(len(harmonicchunks)):
        harmonicsamples.extend(harmonicchunks[i])
    
    # Normalize STFT samples for consistent visualization
    # Each frame is normalized by its maximum value to bring all frames to [0,1] range
    stftsamples_normalized: STFTSamples = []
    stftsamples_normalized2: STFTSamples = []
    gains: list[float] = []
    gains2: list[float] = []
    maximums: list[float] = []
    maximums2: list[float] = []
    
    for i in range(len(stftsamples)):
        # Find maximum value in this frame
        maximum: float = 0.0
        maximum2: float = 0.0
        for j in range(len(stftsamples[i])):
            if stftsamples[i][j] > maximum:
                maximum = stftsamples[i][j]
            if stftsamples2[i][j] > maximum2:
                maximum2 = stftsamples2[i][j]
        
        # Calculate gain (inverse of maximum for normalization)
        # Handle edge case where maximum is 0 to avoid division by zero
        if maximum == 0:
            maximum = 1e-10
        if maximum2 == 0:
            maximum2 = 1e-10
            
        gain: float = 1.0 / maximum
        gain2: float = 1.0 / maximum2
        gains.append(gain)
        gains2.append(gain2)
        maximums.append(maximum)
        maximums2.append(maximum2)
        
        # Normalize values by multiplying by gain
        normalized: list[float] = []
        normalized2: list[float] = []
        for j in range(len(stftsamples[i])):
            normalized.append(stftsamples[i][j] * gain)
            normalized2.append(stftsamples2[i][j] * gain2)
        
        stftsamples_normalized.append(normalized)
        stftsamples_normalized2.append(normalized2)
    
    # Make list of samples that aren't noise to choose from
    # Threshold of 0.0001 filters out quiet/silent frames
    noise_threshold: float = 0.0001
    nonquietsamples: list[int] = []
    for i in range(len(volumes)):
        if volumes[i] >= noise_threshold:
            nonquietsamples.append(i)
    
    return (
        stftsamples_normalized,
        stftsamples_normalized2,
        harmonicsamples,
        harmonicchunks,
        volumes,
        balances,
        widths,
        nonquietsamples
    )
