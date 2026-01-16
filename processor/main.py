"""
Main audio analysis pipeline for Audiovis visualization.

This module is the entry point for the audio analysis pipeline that processes
audio stems and generates visualization data. It performs the complete workflow:

1. Discover audio files in the source directory
2. Generate MP3 files from WAV masters for web playback
3. Split stereo files into left/right channels for analysis
4. Run spectral analysis (STFT, harmonics) via the analysis module
5. Perform K-means clustering to find spectral "fingerprints"
6. Vector quantize samples to their nearest centroids
7. Export binary data files and JSON metadata for the frontend

The output consists of:
- MP3 audio file for web playback
- JSON metadata files with track info and data structure
- Binary data files with volume, balance, width, centroids, and pitch data

Usage:
    python main.py

Configure source/destination paths and parameters in the analyze() function.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from subprocess import CalledProcessError, check_output
from typing import Any

import numpy as np
from numpy.typing import NDArray
from smstools.models import utilFunctions as UF

from analysis import analysis
from kmeans import kmeans
from vector_quantize import vector_quantize


def analyze() -> None:
    """
    Main analysis function that processes audio files for visualization.
    
    Processes all WAV audio stems in the source folder, performs spectral
    analysis, clustering, and exports visualization data for the web frontend.
    
    The function:
    1. Lists all WAV files matching the master filename pattern
    2. Creates an MP3 version of the master file for web playback
    3. For each stem file:
       - Splits stereo to left/right channels
       - Performs STFT and harmonic analysis
       - Clusters spectral frames using K-means
       - Vector quantizes frames to centroids
       - Exports JSON metadata and binary data files
    
    Configuration (modify these values as needed):
        thename: Song/project name (folder name)
        TheFolder: Source folder containing WAV stems
        TheDestFolder: Destination for analysis output
        masterfile: Main audio file name
        startingpos: Starting position in seconds (for trimming)
        writemp3: Whether to generate MP3 file
        limit: Maximum number of stems to process
        skipcount: Number of stems to skip (for partial processing)
    
    Output files:
        - _analysis_files.json: List of processed audio files
        - {masterfile}.mp3: Compressed audio for web playback
        - {stemfile}_analysis.json: Metadata and structure info
        - {stemfile}_analysis.data: Binary visualization data
    """
    # Configuration
    thename: str = 'Details'
    TheFolder: str = f'/Users/tometz/Documents/Clients/Audiovis/stems/{thename}/'
    TheDestFolder: str = f'/Users/tometz/Documents/Clients/Audiovis/public/content/{thename}/'
    masterfile: str = f'{thename}.wav'
    
    # Trim file name extension for pattern matching
    masterfilestring: str = masterfile[:-4] if masterfile.endswith('.wav') else masterfile
    
    # Processing parameters
    startingpos: int = 0  # Starting position in seconds (for trimming intro)
    writemp3: bool = True  # Whether to generate MP3 file
    fps: int = 24  # Target frames per second for visualization
    
    # File discovery
    audiofiles: list[str] = _discover_audio_files(
        TheFolder, masterfile, masterfilestring, limit=100
    )
    
    # Save list of audio files to JSON
    _save_file_list(TheDestFolder, masterfile, audiofiles)
    
    # Skip some files if needed (for partial/incremental processing)
    # Set skipcount > 0 to resume processing after a certain number of already-processed files
    skipcount: int = 0
    if skipcount > 0:
        audiofiles = audiofiles[skipcount:]
    print(f"Processing {len(audiofiles)} audio files: {audiofiles}")
    
    # Create trimmed and compressed master file
    if writemp3:
        _create_mp3(TheFolder, TheDestFolder, masterfile, startingpos)
    
    # Process each audio stem
    total_tracks = len(audiofiles)
    for i, filename in enumerate(audiofiles, start=1):
        print(f"\n[{i}/{total_tracks}] Processing: {filename}")
        _process_stem(
            filename, TheFolder, TheDestFolder, masterfilestring,
            startingpos, fps
        )


def _discover_audio_files(
    folder: str,
    masterfile: str,
    masterfilestring: str,
    limit: int = 100
) -> list[str]:
    """
    Discover WAV audio files matching the master file pattern.
    
    Args:
        folder: Directory to search for audio files.
        masterfile: Name of the master audio file (to exclude).
        masterfilestring: Filename prefix to match stem files.
        limit: Maximum number of files to return.
    
    Returns:
        List of matching audio filenames (without path).
    
    Raises:
        FileNotFoundError: If folder does not exist.
    """
    folder_path = Path(folder)
    if not folder_path.exists():
        raise FileNotFoundError(f"Audio folder not found: {folder}")
    
    audiofiles: list[str] = []
    # Sort files alphabetically for deterministic, reproducible ordering
    # This ensures _config.json order indices remain valid across runs
    files = sorted([f.name for f in folder_path.iterdir() if f.is_file()])
    
    for filename in files:
        if filename.endswith('.wav') and filename != masterfile:
            if filename.startswith(masterfilestring):
                audiofiles.append(filename)
                if len(audiofiles) >= limit:
                    break

    return audiofiles


def _save_file_list(dest_folder: str, masterfile: str, audiofiles: list[str]) -> None:
    """
    Save list of audio files to JSON for the frontend.
    
    Args:
        dest_folder: Destination directory for the JSON file.
        masterfile: Name of the master audio file.
        audiofiles: List of stem audio filenames.
    """
    mp3file = masterfile[:-4] + '.mp3' if masterfile.endswith('.wav') else masterfile
    
    data: list[dict[str, Any]] = [{
        'mp3file': mp3file,
        'audiofiles': audiofiles
    }]
    
    output_path = Path(dest_folder) / '_analysis_files.json'
    with open(output_path, 'w', encoding='utf-8') as outfile:
        json.dump(data, outfile, indent=2)


def _create_mp3(
    source_folder: str,
    dest_folder: str,
    masterfile: str,
    startingpos: int
) -> None:
    """
    Create trimmed MP3 file from WAV master using sox and lame.
    
    Args:
        source_folder: Directory containing source WAV file.
        dest_folder: Directory for output MP3 file.
        masterfile: Name of the master WAV file.
        startingpos: Start position in seconds for trimming.
    
    Raises:
        CalledProcessError: If sox or lame commands fail.
        FileNotFoundError: If masterfile doesn't exist.
    """
    masterfilestring = masterfile[:-4] if masterfile.endswith('.wav') else masterfile
    
    source_path = Path(source_folder) / masterfile
    if not source_path.exists():
        raise FileNotFoundError(f"Master file not found: {source_path}")
    
    # Create trimmed version using sox
    editfile = Path(source_folder) / f'{masterfilestring}_edit.wav'
    soxcommand = ['sox', str(source_path), str(editfile), 'trim', str(startingpos)]
    
    try:
        check_output(soxcommand)
    except CalledProcessError as e:
        raise RuntimeError(f"sox trim failed: {e}") from e
    
    # Create MP3 using lame
    print('Creating MP3 with LAME...')
    mp3file = Path(dest_folder) / f'{masterfilestring}.mp3'
    lamecommand = ['lame', '--abr', '100', str(editfile), str(mp3file)]
    
    try:
        check_output(lamecommand)
    except CalledProcessError as e:
        raise RuntimeError(f"lame encoding failed: {e}") from e
    
    # Clean up temporary edit file
    try:
        editfile.unlink()
    except FileNotFoundError:
        pass  # File may not exist if previous step failed


def _process_stem(
    filename: str,
    source_folder: str,
    dest_folder: str,
    masterfilestring: str,
    startingpos: int,
    fps: int
) -> None:
    """
    Process a single audio stem file and export visualization data.
    
    Args:
        filename: Name of the stem audio file.
        source_folder: Directory containing source WAV files.
        dest_folder: Directory for output files.
        masterfilestring: Master file base name (unused but kept for API).
        startingpos: Start position in seconds for trimming.
        fps: Target frames per second for visualization.
    """
    # Split stereo file into left and right channels using sox
    fileleft = f'_Split_{filename}.l.wav'
    fileright = f'_Split_{filename}.r.wav'
    
    source_path = Path(source_folder)
    
    soxleft = ['sox', str(source_path / filename), str(source_path / fileleft), 'remix', '1']
    soxright = ['sox', str(source_path / filename), str(source_path / fileright), 'remix', '2']
    
    try:
        check_output(soxleft)
        check_output(soxright)
    except CalledProcessError as e:
        print(f"Warning: Failed to split {filename}: {e}")
        return
    
    # Read the WAV files
    try:
        fs, x = UF.wavread(str(source_path / fileleft))
        fs, x2 = UF.wavread(str(source_path / fileright))
    except Exception as e:
        print(f"Warning: Failed to read {filename}: {e}")
        os.remove(source_path / fileleft)
        os.remove(source_path / fileright)
        return
    
    # Delete split files (no longer needed)
    os.remove(source_path / fileleft)
    os.remove(source_path / fileright)
    
    # Trim audio to remove intro portion
    delta = startingpos * fs
    x = x[delta:]
    x2 = x2[delta:]
    
    # Perform analysis
    result = _analyze_and_cluster(filename, fs, fps, x, x2)
    
    # Export results
    _export_results(filename, dest_folder, fs, fps, result)


def _analyze_and_cluster(
    filename: str,
    fs: int,
    fps: int,
    x: NDArray[np.float64],
    x2: NDArray[np.float64]
) -> dict[str, Any]:
    """
    Perform spectral analysis and K-means clustering on audio.
    
    Args:
        filename: Name of the audio file (for logging).
        fs: Sample rate in Hz.
        fps: Target frames per second.
        x: Left channel audio samples.
        x2: Right channel audio samples.
    
    Returns:
        Dictionary containing analysis results and clustering data.
    """
    # Run spectral analysis
    (stftsamples_normalized, stftsamples_normalized2, harmonicsamples,
     harmonicchunks, volumes, balances, widths, nonquietsamples) = analysis(
        filename, fs, fps, x, x2
    )
    
    result: dict[str, Any] = {
        'stftsamples_normalized': stftsamples_normalized,
        'stftsamples_normalized2': stftsamples_normalized2,
        'harmonicsamples': harmonicsamples,
        'harmonicchunks': harmonicchunks,
        'volumes': volumes,
        'balances': balances,
        'widths': widths,
        'nonquietsamples': nonquietsamples,
        'allquietsamples': False,
        'centroids': [],
        'stftvqarray': []
    }
    
    # Check if there are any non-quiet samples to cluster
    if len(nonquietsamples) > 0:
        # K-Means clustering
        centroidcount: int = 24  # Number of spectral "fingerprints"
        vqupdatecount: int = 1   # K-means iterations multiplier
        
        centroids = kmeans(
            centroidcount, vqupdatecount,
            stftsamples_normalized, stftsamples_normalized2, nonquietsamples
        )
        
        # Vector Quantization - assign each sample to nearest centroid
        stftvqarray = vector_quantize(stftsamples_normalized, centroidcount, centroids)
        
        result['centroids'] = centroids
        result['stftvqarray'] = stftvqarray
    else:
        print(f'{filename}: all quiet samples, skipping clustering')
        result['allquietsamples'] = True
    
    return result


def _export_results(
    filename: str,
    dest_folder: str,
    fs: int,
    fps: int,
    result: dict[str, Any]
) -> None:
    """
    Export analysis results to JSON metadata and binary data files.
    
    Output format:
        JSON file contains structure description and track metadata.
        Binary file contains packed uint16 values in order:
        - volume (len x 1)
        - balance (len x 1)
        - width (len x 1)
        - centroids (centroidcount x fftsize)
        - centroid_indexes (len x 1)
        - pitch (len x 1)
    
    Args:
        filename: Name of the source audio file.
        dest_folder: Directory for output files.
        fs: Sample rate in Hz.
        fps: Target frames per second.
        result: Analysis results dictionary from _analyze_and_cluster.
    """
    dest_path = Path(dest_folder)
    allquietsamples = result['allquietsamples']
    
    # Prepare metadata
    data: dict[str, Any] = {}
    
    if not allquietsamples:
        stftsamples_normalized = result['stftsamples_normalized']
        harmonicsamples = result['harmonicsamples']
        harmonicchunks = result['harmonicchunks']
        volumes = result['volumes']
        balances = result['balances']
        widths = result['widths']
        centroids = result['centroids']
        stftvqarray = result['stftvqarray']
        
        length = len(stftsamples_normalized)
        centroidcount = len(centroids)
        
        # Scale values to 16-bit integer range
        multiplier: int = 65535  # uint16 max
        
        # Find max values for normalization
        maxvolume = max(volumes) if volumes else 1.0
        maxbalance = max((abs(b) for b in balances), default=1.0)
        maxwidth = max(widths) if widths else 1.0
        
        # Prevent division by zero
        if maxvolume == 0:
            maxvolume = 1.0
        if maxwidth == 0:
            maxwidth = 1.0
        
        # Scale volumes, balances, widths to uint16 range
        scaled_volumes: list[int] = []
        scaled_balances: list[int] = []
        scaled_widths: list[int] = []
        
        for i in range(len(volumes)):
            scaled_volumes.append(int(round(float(volumes[i]) / maxvolume * multiplier)))
            scaled_balances.append(int(round(balances[i] * (multiplier / 2)) + (multiplier // 2)))
            scaled_widths.append(int(round(float(widths[i]) / maxwidth * multiplier)))
        
        # Scale centroids to uint16 range
        scaled_centroids: list[list[int]] = []
        for i in range(centroidcount):
            scaled_centroid: list[int] = []
            for j in range(len(centroids[0])):
                scaled_centroid.append(int(round(centroids[i][j] * multiplier)))
            scaled_centroids.append(scaled_centroid)
        
        # Process harmonic data
        nH = len(harmonicchunks[0][0][0]) if harmonicchunks else 0
        minf0: int = 30
        maxf0: int = 3000
        
        # Scale harmonic frequencies
        scaled_harmonics: list[int] = []
        for i in range(len(harmonicsamples)):
            value = float(harmonicsamples[i][0][0]) / maxf0
            scaled_harmonics.append(int(round(value * multiplier)))
        
        # Build structure description
        data['structure'] = {
            0: {'volume': [length, 1]},
            1: {'balance': [length, 1]},
            2: {'width': [length, 1]},
            3: {'centroids': [centroidcount, len(centroids[0])]},
            4: {'centroid_indexes': [length, 1]},
            5: {'pitch': [length, 1]},
        }
        data['track'] = {
            'filename': filename,
            'fs': fs,
            'fps': fps,
            'byte_num_range': multiplier,
            'stft_size': len(stftsamples_normalized[0]),
            'maxvolume': maxvolume,
            'allquietsamples': allquietsamples,
            'pitchmin': minf0,
            'pitchmax': maxf0
        }
    else:
        data['track'] = {
            'allquietsamples': allquietsamples
        }
    
    # Write JSON metadata
    json_path = dest_path / f'{filename}_analysis.json'
    with open(json_path, 'w', encoding='utf-8') as outfile:
        json.dump(data, outfile, sort_keys=True, indent=2)
    
    # Write binary data file
    if not allquietsamples:
        # Flatten centroids for binary output
        flat_stft_clusters: list[int] = [x for sublist in scaled_centroids for x in sublist]
        
        # Combine all data in order
        combined_lists = (
            scaled_volumes +
            scaled_balances +
            scaled_widths +
            flat_stft_clusters +
            stftvqarray +
            scaled_harmonics
        )
        
        # Write as uint16 binary
        data_path = dest_path / f'{filename}_analysis.data'
        with open(data_path, mode='wb') as fileobj:
            off = np.array(combined_lists, dtype=np.uint16)
            off.tofile(fileobj)


# Run the analysis when executed directly
if __name__ == '__main__':
    analyze()
