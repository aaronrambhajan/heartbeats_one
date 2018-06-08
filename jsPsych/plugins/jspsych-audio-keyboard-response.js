/**
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/
jsPsych.plugins["audio-keyboard-response"] = run();     


function run() {
  var plugin = {};
  plugin.info = getInfo();
  plugin.trial = getTrial;
  return plugin;
};


function getInfo() {
  var info = {};
  jsPsych.pluginAPI.registerPreload('audio-keyboard-response', 'stimulus', 'audio');

  info = {
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
        default: ['r', 'i'],
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
  return info;
}


function getTrial(display_element, trial) {

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

  function play_feedback(resp) {
    var feedback;
    resp ? feedback = './sound/coin.wav' : feedback = './sound/bump.wav';
    var ctxt = jsPsych.pluginAPI.audioContext();
    var src = ctxt.createBufferSource();
    src.buffer = jsPsych.pluginAPI.getAudioBuffer(feedback);
    // src.connect(ctxt.destination);
    var gainNode = ctxt.createGain();
    src.connect(gainNode);
    gainNode.connect(ctxt.destination);
    gainNode.gain.value = 0.3;
    src.start(0);
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


  // start audio
  function play_audio(time) {
      if (context !== null) {
          source.start(time);
      } else {
          audio.play();
      }
  }
  

  // timer progress bar
  var x = 0,
      dur = trial.trial_duration/1000, 
      width = document.querySelector('.track').offsetWidth;
  function updateTime(resp) {
      x++;
      var prog = (resp ? ((x/2)*100) : ((x/dur)*100));
      document.querySelector('.progress').style.width = prog + '%';
  }


  function reset_response_variables() {
      clearInterval(timer);
      x = 0;
      document.querySelector('.progress').style.width = 0;
  }


  // end trial when it is time
  function end_trial() {

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

    display_element.innerHTML = ''; // clear display
    jsPsych.finishTrial(trial_data); // next trial
  };


  // handle responses by the subject
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


  // play audio
  var startTime = context.currentTime;
  play_audio(startTime);
  let timer = setInterval(function() { updateTime(false); }, 1000);


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
        respond('trial_expired');
    }, trial.trial_duration);
  }


  function respond(action) {
      // Determine heartbeat state
      let heartbeat_status, changed;
      (trial.correct_response == 82) ? (heartbeat_status = '<font color="#000080"><b>regular</b></font>.</div>') : (heartbeat_status = '<font color="#C71585"><b>irregular</b></font>.</div>');
      
      var correct_text = ('<div class="stimuli" id="responded_correct">Correct. This heartbeat is ' + heartbeat_status),
          wrong_text = ('<div class="stimuli" id="responded_wrong">Incorrect. This heartbeat is ' + heartbeat_status),
          trial_end_text = '<div class="stimuli" id="responded_wrong">Please respond before the trial ends.</div>', 
          test_phase_text = '<div class="stimuli" id="responded"></div>', 
          respond_text = '<div class="stimuli"><font color="#000080"><b>[r]</b></font> or <font color="C71585"><b>[i]</b></font>?</div>',
          player = '<div class="player"> <p class="message"></p> <div class="controls"> <div class="track"> <div class="progress"></div> <div class="scrubber"> </div> </div> </div> </div>';
      
      stop_audio();
      reset_response_variables();
      
      switch(action) {
          case 'trial_expired': // End audio, prompt 2-second response window, continue
              display_element.innerHTML = respond_text + player;
              timer = setInterval(function() { updateTime(true); }, 1000);
              jsPsych.pluginAPI.setTimeout(function() { respond('trial_ended'); }, 2000);
              return; break; // exit with timeout
          case 'trial_ended':
              changed = trial_end_text;
              play_feedback(false);
              break;
          case 'correct_response':
              trial.learning ? (changed = correct_text, play_feedback(true)) : changed = test_phase_text;
              break;
          case 'wrong_response':
              trial.learning ? (changed = wrong_text, play_feedback(false)) : changed = test_phase_text;
      }
     
      // Clear the experiment palette 
      jsPsych.pluginAPI.clearAllTimeouts();
      jsPsych.pluginAPI.cancelAllKeyboardResponses();
      display_element.innerHTML = changed;
      jsPsych.pluginAPI.setTimeout(function() { end_trial(); }, 3000); // 3-second window to read
  }
};
