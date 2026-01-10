# ////////////////////////////////////////////////////////////
# playlist ///////////////////////////////////////////////////
# ////////////////////////////////////////////////////////////
import os
import json

location = '/Users/tometz/Documents/Clients/Audiovis/stems/'
location_dest = '/Users/tometz/Documents/Clients/Audiovis/public/content/'
playlistname = 'Glissline - Horizon EP'
playlist = []

#generate array from each folder
folders = [x[0] for x in os.walk(location)]
for i in folders:
    if i != location:
        playlist.append(i[len(location):])

# sort alphabetically
playlist.sort()
# Let's move "Horizon" to the end
if "Horizon" in playlist:
    playlist.remove("Horizon")
    playlist.append("Horizon")

#write array to json file
data = {}
data['name'] = playlistname
data['songs'] = playlist
with open(location_dest + '_playlist.json', 'w') as outfile:
    json.dump(data, outfile)

print('playlist', data)