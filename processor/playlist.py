# ////////////////////////////////////////////////////////////
# playlist ///////////////////////////////////////////////////
# ////////////////////////////////////////////////////////////
import os
location = '/Users/tometz/Documents/Audio/TomWav/_audiovis/public/content/'
playlistname = 'Horizon'
playlist = []


#generate array from each folder
folders = [x[0] for x in os.walk(location)]
for i in folders:
    if i != location:
        playlist.append(i[len(location):])

#write array to json file
import json
data = {}
data['name'] = playlistname
data['songs'] = playlist
with open(location + '_playlist.json', 'w') as outfile:
    json.dump(data, outfile)

print 'playlist', data




# end
