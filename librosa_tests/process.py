f = './validation/REFERENCE.csv'
file = open(f, 'r')
import os

"""
Organizing all files.
"""
for line in file:
    if line[-3] == '-':
        filename = '/Users/aaronrambhajan/Downloads/heartsounds/validation/' + line[:-4] + '.wav'
        newname = '/Users/aaronrambhajan/Downloads/heartsounds/irregular/' + line[:-4] + '.wav'
        os.rename(filename, newname)
    else:
        filename = '/Users/aaronrambhajan/Downloads/heartsounds/validation/' + line[:-3]+ '.wav'
        newname = '/Users/aaronrambhajan/Downloads/heartsounds/regular/' + line[:-3] + '.wav'
        os.rename(filename, newname)    
