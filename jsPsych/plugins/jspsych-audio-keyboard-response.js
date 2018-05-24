/**
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["audio-keyboard-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('audio-keyboard-response', 'stimulus', 'audio');

  plugin.info = {
    name: 'audio-keyboard-response',
    description: '',
    parameters: {
      subject: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Subject ID',
        default: undefined,
        description: 'Unique identification for participant'
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The audio to be played.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        array: true,
        default: ['r', 'i'], // jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: false,
        description: 'If true, then the trial will end as soon as the audio file finishes playing.'
      },
      correct_response: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Proper response',
        default: undefined,
        description: 'The response the participant is supposed to give.'
      },
      learning: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name:'Learning trials',
        default: false,
        description: 'Will include feedback portion if true.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      source.connect(context.destination);
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
      audio.currentTime = 0;
    }

/*    // If all audio plays with no response...    
    if(trial.trial_ends_after_audio){
      if(context !== null){
        source.onended = function() {
          respond('audio_ended');
        }
      } else {
        audio.addEventListener('ended', end_trial);
      }
    }
*/
    // show prompt if there is one
    if (trial.prompt !== null) {
      display_element.innerHTML = trial.prompt;
    }

    // store response
    var response = {
      rt: null,
      key: null
    };

    // Stop the audio file if playing
    function stop_audio() {
        if (context !== null) {
            source.stop();
            source.onended=function() { }
        } else {
            audio.pause();
            audio.removeEventListener('ended', end_trial);
        }
    }


    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      //jsPsych.pluginAPI.clearAllTimeouts();
      // stop_audio();
      
      // kill keyboard listeners
      // jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
      if(context !== null && response.rt !== null){
        response.rt = Math.round(response.rt * 1000);
      }
      var trial_data = {
        "subject": trial.subject,
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key,
        "correct": (response.key == trial.correct_response),
        "date": new Date()
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      // Check for correct response.
      if (response.key == trial.correct_response) {
        respond('correct_response');
      } else {
        respond('wrong_response');
      }
    };

    // start audio
    if(context !== null){
      startTime = context.currentTime;
      source.start(startTime);
    } else {
      audio.play();
    }

    // start the response listener
    if(context !== null) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'audio',
        persist: false,
        allow_held_key: false,
        audio_context: context,
        audio_context_start_time: startTime
      });
    } else {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
          respond('trial_ended');
      }, trial.trial_duration);
    }

    function respond(action) {
        
        // Determine heartbeat state
        let heartbeat_status;
        if (trial.correct_response == 82) {
            heartbeat_status = '<font color="#000080"><b>regular</b></font>.</div>';
        } else {
            heartbeat_status = '<font color="#C71585"><b>irregular</b></font>.</div>';
        }
        let changed;
        let correct_text = '<div class="stimuli" id="responded_correct">Correct. This heartbeat is ' + heartbeat_status;
        let wrong_text = '<div class="stimuli" id="responded_wrong">Incorrect. This heartbeat is ' + heartbeat_status;
        // let none_text1 = '<div class="stimuli" id="responded_wrong">Please respond before the audio ends.</div>';
        let none_text2 = '<div class="stimuli" id="responded_wrong">Please respond before the trial ends.</div>';
        let test_text = '<div class="stimuli" id="responded"></div>';
        
        switch(action) {
            case 'audio_ended':
                changed = none_text2;
                break;
            case 'trial_ended':
                changed = none_text2;
                break;
            case 'correct_response':
                if (trial.learning) { changed = correct_text; } 
                else { changed = test_text; }
                break;
            case 'wrong_response':
                if (trial.learning) { changed = wrong_text; }
                else { changed = test_text; }
        }
        
        jsPsych.pluginAPI.clearAllTimeouts();
        jsPsych.pluginAPI.cancelAllKeyboardResponses();
        stop_audio();
        display_element.innerHTML = changed;
        jsPsych.pluginAPI.setTimeout(function() { end_trial(); }, 3000);
    }
  };

  return plugin;
})();
