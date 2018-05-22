import librosa as lb
import numpy as np
import os
import pydub
# import ffmpeg

sound = pydub.AudioSegment.from_wav("./IRG44K/0.wav")
sound.export("./IRG44K/test.mp3", format="mp3")

"""
Resamples the original heartbeat samples up to 44K to enable
proper playback through HTML web clients.
"""

rdir = "./REG44K/"
idir = "./IRG44K/"
new1 = "./REGMP3/"
new2 = "./IRGMP3/"

regular = [f for f in os.listdir(rdir) if os.path.isfile(os.path.join(rdir, f)) and ('wav' in f)]
irregular = [f for f in os.listdir(idir) if os.path.isfile(os.path.join(idir, f)) and ('wav' in f)]

for i in range(len(regular)):
    # y, sr = lb.load(rdir + regular[i])
    # new = lb.resample(y, sr, 44100)
    # lb.output.write_wav(Nrdir + str(i) + '.wav', new, 44100)
    sound = pydub.AudioSegment.from_wav(rdir+regular[i])
    sound.export((new1+regular[i][:-4]+".mp3"), format="mp3")

for i in range(len(irregular)):
    # y, sr = lb.load(idir + irregular[i])
    # new = lb.resample(y, sr, 44100)
    # lb.output.write_wav(Nidir + str(i) + '.wav', new, 44100)
    sound = pydub.AudioSegment.from_wav(idir+irregular[i])
    sound.export((new2+irregular[i][:-4]+".mp3"), format="mp3")

