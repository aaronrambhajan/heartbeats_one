const fs = require('fs');
const _ = require('underscore');

/* Returns all filenames within a directory including
 * path prefixes.
 */
function gatherFiles(path) {
  let files = fs.readdirSync(path);

  for (i=0; i<files.length; i++) {
    files[i] = path + files[i];
  }
  return files;
}

/* Combines two arrays by choosing ten from each then
 * returns shuffled copies of each.
 */
function combineRandom(one, two) {
    test = [];
    test.push.apply(test, _.sample(one, 10));
    test.push.apply(test, _.sample(two, 10));
    let copy1 = _.shuffle(Object.assign({}, test));
    let copy2 = _.shuffle(Object.assign({}, test));

    return {one: copy1, two: copy2};
}

/* Creates the timeline of all trials throughout the experiment.
 */
function createTrials(filenames, num_trials, learning) {
  experiment = [];

  for (i=0; i < num_trials; i++) {

    // Determine correct response
    let filename = filenames.pop();
    let correct_response;
    if (filename.indexOf('irregular') > -1) {
        correct_response = 'i';
    } else {
        correct_response = 'r';
    }

    // Create the trial
    var trial = {
      type: 'audio-keyboard-response',
      stimulus: filename,
      choice: ['r', 'i'],
      prompt: '<div></div>',
      trial_ends_after_audio: true
    }

/*    // Add the learning function
    if (learning) { 
        trial.on_finish = feedback(data, correct_response) 
    }
*/
    experiment.push(trial);
  }
  return experiment;
}

/* Pieces all trials together and returns.
 */
function renderTrials(dir1, dir2) {
    const reg_wav = gatherFiles(dir1);
    const irreg_wav = gatherFiles(dir2);
    
    let exp = combineRandom(reg_wav, irreg_wav);
 
    const learning = createTrials(exp.one, 20, true);
    const testing = createTrials(exp.two, 20, false);

    let timeline = [];
    timeline.push.apply(timeline, learning);
    timeline.push.apply(timeline, testing);

    return timeline; 
}

module.exports = {
    renderTrials:  renderTrials,
    gatherFiles: gatherFiles
};

