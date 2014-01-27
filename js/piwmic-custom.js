
	//needs jquery
	//from mic recognizes a particular hi-pitch and then low-pitch pattern that identifies a PIW!
	//when successful calls piwShoot() which you must build into your code somewhere


	var analyser = null;
	var array;
	var interval_check = null;
	var ctx = null;
	var oldVals = new Array();
	oldVals.push(100,100,100,100,100,100,100,100,100,100);
	var pause = false;
	var baseCounter = 0; //how many, till baseSize is reached
	var baseSize =  micVars.baseSize;  //over how many to do average
	var minScore = micVars.peeSensitivity; //minimum score to recognize a "pi"
	var minScore2 = micVars.wwSensitivity; //minimun score to recognize a "uu"
	var freqDrop = micVars.peevswwSpread; //freq difference "pi" vs "uu"
	var pi = false;
	var pifreq = 0;
	var highest;
  	var highestN = 280;


	jQuery(document).ready(function () {
           navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia);
          

		if (!navigator.getUserMedia) 
		{
		  alert('getUserMedia() is not supported in your browser');
		} 
		else 
		{
		  

			var context;
			//window.addEventListener('load', init, false);
			
			try {
				  // Fix up for prefixing
				  //handle different prefix of the audio context
				  var AudioContext = AudioContext || webkitAudioContext;
				  //create the context.
				  var context = new AudioContext();
			  	}
			catch(e) {
			    	alert('Web Audio API is not supported in this browser');
			  	}

			navigator.webkitGetUserMedia({audio: true, video: false}, 
				//success:
				startStreaming,
				//fail:
				function () 
				{
					console.log('capturing microphone data failed!');
					console.log(evt);
				}
				);

		}



		function startStreaming(stream)
		{
				  
	 	  console.log("yeah!");

	 	  
	 	  	var microphone;
	 	  	var rafID = null;
	 	  	analyser = context.createAnalyser();
	 	  	analyser.smoothingTimeConstant = 0.9;
	 		//convert audio stream to mediaStreamSource (node)
			microphone = context.createMediaStreamSource(stream);
			 //connect microphone to analyser
	    	microphone.connect(analyser);
	    	

	    	//analyser.fftSize = 1024;    //con esto el fft tiene el espectro dividido en 512 buckets 
	    	
	    	var screenfps = 60;
	    	base = new Uint8Array(analyser.frequencyBinCount);

	    

	    	//get audio
			//rafID = window.requestAnimationFrame(checkAudio);
		
  			interval_check = setInterval(checkAudio, Math.round(1000/screenfps));

		}



		function checkAudio()
		{

			// get the average, bincount is fftsize / 2
			array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			if (baseCounter<micV.baseCounter)
			{
				baseCounter += 1;
			}
			else 
			{
				baseCounter = micV.baseCounter;			
			}

			for (var i = 0; i < base.length; i++)
			{
				var holder = base[i]*(micV.baseCounter-1);
				holder += array[i];
				//record to adjust base level
				base[i] = holder/micV.baseCounter;
				//substract base from current
				array[i] = array[i]- base[i];
			}



  			

  			
  			

  			var old = oldVals.shift();  //returns frist element and removes it

  			var score = 0;

  			if (pause == false)		
  			{
	  			highest = array[280];
	  			for (var i=180; i<550;i++)
	  			{
	  				if(array[i]>highest)
	  				{
	  					highest = array[i];
	  					highestN = i;
	  				}
	  			}

	  			if(highestN>280 && highest > old[highestN]*1.2 && highest>60 )
	  			{
		  			for (var i=100; i<600;i++)
		  			{
		  				var multi = highestN+30-i;
		  				if(multi != 0)
		  				{
		  				score += (1/multi) * (array[i]-old[i]);
		  				} 

		  			}

		  			
		  			if (score > micV.peeSensitivity)
		  			{
		  				pause = true;
		  				pifreq = highestN;
		  				var lookforU = setTimeout(function(){pi = true},30);
		  				var forgetU = setTimeout(function(){pi = false;pause = false},500);

		  			}
		  		}
		  	}
		  	else if (pi == true)
	  			{	
	  				score = 0;
	  				
	  				for (var i=150; i<550;i++)
	  				{
		  				var multi = pifreq-micV.peevswwSpread-i;
		  				if(multi != 0)
		  				{
		  					score += (1/multi) * (array[i]-old[i]);
		  				} 
		  				else
		  				{
		  					score += 0.5* (array[i]-old[i]);
		  				}
		  				
	  				}
	  				if(score>micV.wwSensitivity)
	  				{
	  					console.log("PIW!  score " + score + " highestN " + highestN + " value " + highest);
	  					pi = false;
	  					piwShoot();
	  				}
	  			}

  			

  			oldVals.push(array.subarray(0,601));  //adds at the console
  			//end.log(array.subarray(0,601));
  			


		}









	});
	

