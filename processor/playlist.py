"""
Playlist generation module for audio visualization.

This module scans a directory of audio stems and generates a playlist JSON file
that can be used by the frontend visualization application. The playlist includes
song ordering and metadata for the Horizon EP visualization project.

Example usage:
    python playlist.py
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any


def generate_playlist(
    source_location: str,
    dest_location: str,
    playlist_name: str,
    featured_song: str | None = None
) -> dict[str, Any]:
    """
    Generate a playlist JSON file from a directory of audio folders.
    
    Scans the source location for subdirectories (each representing a song),
    sorts them alphabetically, and optionally moves a featured song to the end.
    The resulting playlist is saved as a JSON file.
    
    Args:
        source_location: Path to directory containing song folders (audio stems).
        dest_location: Path to directory where playlist JSON will be saved.
        playlist_name: Display name for the playlist.
        featured_song: Optional song name to move to the end of the playlist.
                      This allows featuring a specific song as the "finale".
    
    Returns:
        Dictionary containing the playlist data with 'name' and 'songs' keys.
    
    Raises:
        FileNotFoundError: If source_location does not exist.
        PermissionError: If dest_location is not writable.
    
    Example:
        >>> data = generate_playlist(
        ...     '/path/to/stems/',
        ...     '/path/to/content/',
        ...     'My EP',
        ...     featured_song='FinalTrack'
        ... )
        >>> print(data['songs'])
        ['Song1', 'Song2', 'FinalTrack']
    """
    source_path = Path(source_location)
    dest_path = Path(dest_location)
    
    # Validate paths
    if not source_path.exists():
        raise FileNotFoundError(f"Source location not found: {source_location}")
    
    if not dest_path.exists():
        raise FileNotFoundError(f"Destination location not found: {dest_location}")
    
    # Generate array from each folder
    playlist: list[str] = []
    for item in source_path.iterdir():
        if item.is_dir():
            playlist.append(item.name)
    
    # Sort alphabetically
    playlist.sort()
    
    # Move featured song to the end if specified
    if featured_song and featured_song in playlist:
        playlist.remove(featured_song)
        playlist.append(featured_song)
    
    # Build playlist data
    data: dict[str, Any] = {
        'name': playlist_name,
        'songs': playlist
    }
    
    # Write array to JSON file
    output_file = dest_path / '_playlist.json'
    try:
        with open(output_file, 'w', encoding='utf-8') as outfile:
            json.dump(data, outfile, indent=2)
    except PermissionError as e:
        raise PermissionError(f"Cannot write to {output_file}: {e}") from e
    
    print(f"playlist: {data}")
    return data


if __name__ == '__main__':
    # Default configuration for Horizon EP
    LOCATION = '/Users/tometz/Documents/Clients/Audiovis/stems/'
    LOCATION_DEST = '/Users/tometz/Documents/Clients/Audiovis/public/content/'
    PLAYLIST_NAME = 'Glissline - Horizon EP'
    
    generate_playlist(
        source_location=LOCATION,
        dest_location=LOCATION_DEST,
        playlist_name=PLAYLIST_NAME,
        featured_song='Horizon'  # Featured as the finale
    )