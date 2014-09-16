/****************************************************
 * Theresa's Sound World
 * tsw.js
 * An audio library.
 * http://theresassoundworld.com/
 * https://github.com/stuartmemo/theresas-sound-world 
 * Copyright 2014 Stuart Memo
 ****************************************************/


(function (window, undefined) {
    'use strict';

    var tsw,
        version = '0.1.0';

    tsw = (function () {

        /***********
         * Helpers *
         **********/

        /*
         * Applies the attributes of one object to another.
         * @return {object} A newly merged object.
         */
        var applyObject = function (obj1, obj2) {
            for (var attr in obj2) {
                obj1[attr] = obj2[attr];
            }

            return obj1;
        };

        /*
         * Applies the settings object to a node.
         * @method applySettings
         * @return {AudioNode} Node with settings applied.
         */
        var applySettings = function (node, settings) {
            for (var setting in settings) {
                node[setting].value = settings[setting];
            }
        };

        /*
         * Is an argument an array?
         * @param thing Argument to check if it's an array.
         */
         var isArray = function (thing) {
            return Array.isArray(thing);
         };

        /*
         * Is an argument a function?
         * @param thing Argument to check if it's a function.
         */
         var isFunction = function (thing) {
            return typeof thing === 'function';
         };

        /*
         * Is an argument an object?
         * @param thing Argument to check if it's an object.
         */
        var isObject = function (thing) {
            return typeof thing === 'object';
        };

        /*
         * Is an argument a string?
         * @param thing Argument to check if it's a string.
         */
        var isString = function (thing) {
            return typeof thing === 'string';
        };

        /*
         * Is an argument a number?
         * @param thing Argument to check if it's a number.
         */
        var isNumber = function (thing) {
            return typeof thing === 'number';
        };

        /*
         * Is an argument defined?
         * @param thing Argument to check if it's defined.
         */
        var isDefined = function (thing) {
            return typeof thing !== 'undefined';
        };

        /*
         * Is an argument an object with an audio node?
         * @param thing Argument to check if it's an object with an audio node.
         */
         var isObjectWithNode = function (thing) {
            var is_object_with_node = false;

            if (Object(thing)) {
                if ('node' in thing) {
                    is_object_with_node = true;
                }
            }

            return is_object_with_node;
         };

        /*
         * Is an argument a native node?
         * @parm thing Argument to check if it's a native node wat.
         */
        var isNativeNode = function (thing) {
            return typeof thing.context !== 'undefined';
        };

        /*
         * Is an argument a tsw node?
         * @parm thing Argument to check if it's a tsw node.
         */
        var isTswNode = function (thing) {
            return (thing.hasOwnProperty('input') || thing.hasOwnProperty('output'));
        };

        /*
         * Is property of an object an audio parameter?
         * @param thing Argument to check if is an audio paramter.
         */
        var isAudioParam = function (thing) {
            if (isObject(thing)) {
                return ('setValueAtTime' in thing);
            } else {
                return false;
            }
        };

        /*
         * Enable jQuery style getters & setters.
         * @param paramToGetSet
         */
        var createGetSetter = function (node, arrayOfParams) {
            var that = this;

            arrayOfParams.forEach(function (param) {
                node[param] = function (val, targetTime, transition) {

                    if (typeof val === 'undefined') {
                        if (that[param].hasOwnProperty('value')) {
                            return that[param].value;
                        } else {
                            return that[param];
                        }
                    } else {
                        if (that[param].hasOwnProperty('value')) {
                            if (isDefined(targetTime)) {
                                // Set current value first so we have a schedule.
                                transition = transition || 0;
                                that[param].setTargetAtTime(that[param].value, tsw.now(), transition);
                                that[param].setTargetAtTime(val, targetTime, transition);
                            }
                            that[param].value = val;
                        } else {
                            console.log(param);
                            //that[param] = val;
                        }
                    }
                };
            });
        };

        /***************
         * Sound World *
         **************/

        var tsw = {},
            nodes_to_disconnect = [];

        tsw.version = version;
        tsw.isBrowserSupported = false;
        tsw.processors = []; // Add ScriptProcessor nodes to global object to avoid garbage collection.

        var initialise = function () {
            tsw.noise_buffer = tsw.buffer();

            for (var i = 0; i < tsw.noise_buffer.buffer().length; i++) {
                tsw.noise_buffer.buffer().getChannelData(0)[i] = (Math.random() * 2) - 1;
            }
        };

        /*
         * Check if browser has Web Audio API.
         * Also, map older API methods to new ones.
         * @param {function} success Success method execute.
         * @param {function} failure Failure method execute.
         */
        var checkBrowserSupport = function (success, failure) {
            var context;
            // Check if the Web Audio API is supported.
            if (typeof webkitAudioContext === 'undefined' && typeof AudioContext === 'undefined') {
                if (typeof webkitAudiocontext().prototype.createGainNode === 'undefined') {
                    failure('Sorry, your browser doesn\'t support a recent enough version of the Web Audio API.');
                } else {
                    // Using older version of API.
                    var ctx = webkitAudiocontext().prototype;

                    ctx.createGain  = ctx.createGainNode;
                    ctx.createDelay  = ctx.createDelayNode;
                    ctx.createScriptProcessor = ctx.createJavaScriptNode;
                }
            } else {
                if (typeof AudioContext === 'function') {
                    context = new AudioContext();
                    tsw.context = function () {
                        return context;
                    };
                } else {
                    context = new webkitAudioContext();
                    tsw.context = function () {
                        return context;
                    };
                }
            }

            // All is good, continue;
            tsw.isBrowserSupported = true;
            success();
        };

        /*
         * Map WAAPI methods to tsw.
         */
        var mapToSoundWorld = function () {
            tsw.speakers = tsw.context().destination;
        };

        /*
         * Fade in an audio source.
         * @param thingToFadeOut Audio source to fade out.
         */
        tsw.fadeIn = function (thingToFadeIn) {
            thingToFadeIn.output.gain.cancelScheduledValues(tsw.now());
            thingToFadeIn.output.gain.setValueAtTime(0, tsw.now());
            thingToFadeIn.output.gain.exponentialRampToValueAtTime(1, tsw.now() + 2);
        };

        /*
         * Fade out an audio source.
         * @param thingToFadeOut Audio source to fade out.
         */
        tsw.fadeOut = function (thingToFadeOut) {
            thingToFadeOut.output.gain.cancelScheduledValues(tsw.now());
            thingToFadeOut.output.gain.setValueAtTime(1, tsw.now());
            thingToFadeOut.output.gain.exponentialRampToValueAtTime(0.000001, tsw.now() + 2);
            thingToFadeOut.output.gain.setValueAtTime(0, tsw.now() + 2.0001);
        };

        /*
         * Get the current time of the audio context().
         * @return {number} Time since audio began (in seconds).
         */
        tsw.now = function () {
            return this.context().currentTime;
        };

        tsw.channelMerger = function (channels) {
            return tsw.context().createChannelMerger(channels);
        };

        /*
         * Connects multiple nodes together.
         * @param {AudioNodes} arguments Nodes to connect in order.
         */
        tsw.connect = function () {

            var updateConnectedToArray = function (node1, node2) {
                node1.connectedTo.push(node2);
                node2.connectedTo.push(node1);
            };

            var connectNativeNodeToNativeNode = function () {
                arguments[0].connect(arguments[1]);
            };

            var connectNativeNodeToTswNode = function () {
                arguments[0].connect(arguments[1].input);
            };

            var connectNativeNodeToArray = function () {
                for (var j = 0; j < arguments[1].length; j++) {
                    tsw.connect(arguments[0], arguments[1][j]);
                }
            };

            var connectArrayToNativeNode = function () {
                for (var j = 0; j < arguments[0].length; j++) {
                    tsw.connect(arguments[0][j], arguments[1]);
                }
            };

            var connectTswNodeToTswNode = function () {
                arguments[0].output.connect(arguments[1].input);
            };

            var connectTswNodeToNativeNode = function () {
                arguments[0].output.connect(arguments[1]);
            };

            var connectArrayToTswNode = function () {
                for (var j = 0; j < arguments[0].length; j++) {
                    tsw.connect(arguments[0][j], arguments[1]);
                }
            };

            var connectArrayToArray = function () {
                for (var j = 0; j < arguments[0].length; j++) {
                    tsw.connect(arguments[0][j], arguments[1]);
                }
            };

            var connectObjectWithNodeToObjectWithNode = function () {
                arguments[0].node.connect(arguments[1].node, arguments[0].channel, arguments[1].channel);
            };

            // Iterate over each argument.
            for (var i = 0; i < arguments.length - 1; i++) {
                var first_arg = arguments[i],
                    second_arg = arguments[i + 1];

                // First argument is a native node, second is a tsw node.
                if (isNativeNode(first_arg) && isTswNode(second_arg)) {
                    connectNativeNodeToTswNode(first_arg, second_arg);
                    continue;
                }

                // First argument is a tsw node, second is a native node.
                if (isTswNode(first_arg) && isNativeNode(second_arg)) {
                    connectTswNodeToNativeNode(first_arg, second_arg);
                    continue;
                }

                // First arggument is native node, second is an array.
                if (isNativeNode(first_arg) && isArray(second_arg)) {
                    connectNativeNodeToArray(first_arg, second_arg);
                    continue;
                }

                // First argument is an array, second is a native node.
                if (isArray(first_arg) && isNativeNode(second_arg)) {
                    connectArrayToNativeNode(first_arg, second_arg);
                    continue;
                }

                // Both arguments are native nodes.
                if (isNativeNode(first_arg) && isNativeNode(second_arg)) {
                    connectNativeNodeToNativeNode(first_arg, second_arg);
                    continue;
                }

                // Both arguments are tsw nodes.
                if (isTswNode(first_arg) && isTswNode(second_arg)) {
                    connectTswNodeToTswNode(first_arg, second_arg);
                    continue;
                }

                // First argument is a tsw node, second is an array.
                if (isTswNode(first_arg) && isArray(second_arg)) {
                    connectTswNodeToArray(first_arg, second_arg);
                    continue;
                }

                // First argument is array, second is a tsw node.
                if (isArray(first_arg) && isTswNode(second_arg)) {
                    connectArrayToTswNode(first_arg, second_arg);
                    continue;
                }

                // Both arguments are arrays.
                if (isArray(first_arg) && isArray(second_arg)) {
                    connectArrayToArray(first_arg, second_arg);
                    continue;
                }

                // First argument is an object containing nodes, second is an array.
                if (isObjectWithNode(first_arg) && isArray(second_arg)) {
                    connectObjectWithNodeToArray(first_arg, second_arg);
                    continue;
                }

                // First argument is an array, second is an object containing nodes.
                if (isArray(first_arg) && isObjectWithNode(second_arg)) {
                    connectArrayToObjectWithNode(first_arg, second_arg);
                    continue;
                }

                // Both arguments are objects containing nodes.
                if (isObjectWithNode(first_arg) && isObjectWithNode(second_arg)) {
                    connectObjectWithNodeToObjectWithNode(first_arg, second_arg);
                    continue;
                }
            }
        };

        /*
         * Disconnects a node from everything it's connected to.
         * @param {AudioNode} node First audio node
         * @param {AudioNode} node Second audio node
         * @param {AudioNode} node Third....etc.
         */
        tsw.disconnect = function () {
            var argumentsLength = arguments.length;

            for (var i = 0; i < argumentsLength; i++) {
                if (arguments[i].hasOwnProperty('disconnect')) {
                    arguments[i].disconnect();
                }
                if (arguments[i].hasOwnProperty('input')) {
                    tsw.disconnect(arguments[i].input);
                }
                if (arguments[i].hasOwnProperty('ouput')) {
                    tsw.disconnect(arguments[i].output);
                }
            }
        };

        /*
         * Disconnects a node after a certain time.
         * @param {number} Time to disconnect node in seconds.
         */
        tsw.disconnectAfterTime = function (nodeToDisconnect, timeToDisconnect) {
            nodes_to_disconnect.push({node: nodeToDisconnect, time: timeToDisconnect});
        };

        /*
        * @param {array} files
        * @param {function} callback
        */
        tsw.load = function () {
            var returnObj = {},
                files = arguments[0].files,
                basePath = arguments[0].path || '',
                extensions = [],
                files_loaded = 0,
                files_failed= 0,
                number_of_files = 0,
                successCallback,
                failCallback,
                that = this;

            // Load a single file
            var loadFile = function (basePath, fileKey, filePath, returnObj, successCallback, failCallback) {
                var request = new XMLHttpRequest();

                request.open('GET', basePath + filePath, true);
                request.responseType = 'arraybuffer';

                var success = function () {
                    files_loaded++;

                    that.context().decodeAudioData(request.response, function (decodedBuffer) {
                        returnObj[fileKey] = decodedBuffer;

                        if (Object.keys(returnObj).length === number_of_files) {
                            successCallback(returnObj);
                        }
                    });
                };

                var fail = function () {
                    files_failed++;

                    if (isFunction(failCallback)) {
                        failCallback();
                    } else {
                        console.log('There was an error loading your file(s)', request.status);
                    }
                };

                request.onreadystatechange = function () {
                    if (request.readyState === 4) {
                        request.status === 200 ? success() : fail();
                    }
                };

                request.send();
            };

            // Is 2nd argument a config object or the callback?
            if (typeof arguments[1] === 'object') {
                basePath = arguments[1].path || '';
                extensions = arguments[1].extensions || [];
            } else if (typeof arguments[1] === 'function') {
                successCallback = arguments[1];
            }

            // Is 3rd argument is the failure callback?
            if (typeof arguments[2] === 'function') {
                failCallback = arguments[2];
            }

            // 1st argument is files object
            if (typeof files === 'object') {
                number_of_files = Object.keys(files).length;
                for (var file in files) {
                    loadFile(basePath, file, files[file], returnObj, successCallback, failCallback);
                }
            } else if (typeof files === 'string') {
                number_of_files = 1;
                /** THIS WONT WORK - NO FILE AT THIS POINT **/
                loadFile(basePath, file, files[file], returnObj, successCallback);
            } else {
                throw new Error('Files must be an array or a valid string.');
            }
        };

        /*
         * Create a wait/delay node.
         * @param {number} delayTime Time to delay input in seconds.
         * @return {node} delay node.
         */
        tsw.wait = function (delayTime) {
            var node,
                delayNode = this.context().createDelay();

            delayTime = delayTime || 1;

            node = tsw.createNode({
                nodeType: 'delay'
            });

            createGetSetter.call(delayNode, node, ['delayTime']);
            node.delayTime(delayTime);
            tsw.connect(node.input, delayNode, node.output);

            return node;
        };

        /*
         * Make an incoming stream mono.
         */
        tsw.createMonoMaker = function () {
            var effect = {};

            effect.input = tsw.createGain();
            effect.output = tsw.createGain();

            tsw.connect(effect.input, effect.output);

            return effect;
        };

        /*
         * Pan incoming sound.
         * Range from -1 to 1.
         * -1 is fully left. 1 is fully right.
         * @param {number} pan
         */
        tsw.panner = function (pan) {
            var panner = {},
                left_gain = tsw.createGain(1),
                right_gain = tsw.createGain(0),
                merger = tsw.createChannelMerger(2);

            panner.input = tsw.createGain();
            panner.output = tsw.createGain();
            panner.value = pan;

            // Force max panning values.
            if (panner.value > 1) {
                panner.value = 1;
            } else if (panner.value < -1) {
                panner.value = -1;
            }

            // 100% === 2
            // Example value = -0.56
            // (0.44 / 2) * 100 = 22% -> 78%
            // Left gain = (1 / 100) * 78 = 0.78 
            // Right gain = 1 - 0.78 =  0.22

            // Example value = 0.2
            // (1.2 / 2) * 100 = 60% -> 40%
            // Left gain = (1 / 100) * 40 = 0.4
            // Right gain = 1 - 0.4 = 0.6

            left_gain.gain.value = 1 - (0.01 * ((1 + panner.value) / 2) * 100);
            right_gain.gain.value = 1 - left_gain.gain.value;

            tsw.connect(panner.input, [left_gain, right_gain]);

            tsw.connect(
                {
                    node: left_gain,
                    channel: 0
                },
                {
                    node:  merger,
                    channel: 0
                }
            );

            tsw.connect(
                {
                    node: right_gain,
                    channel: 0
                },
                {
                    node:  merger,
                    channel: 1
                }
            );

            tsw.connect(merger, panner.output);

            return panner;
        };

        /*
         * Play preloaded buffer.
         * @param {buffer} AudioBuffer Preloaded audio buffer of sound to play.
         * @param {number} when
         */
        tsw.play = function (buffers, when) {
            when = when || 0;

            if (isArray(buffers)) {
                buffers.forEach(function (buffer) {
                    buffer.start(when);
                });
            } else {
                buffers.start(when);
            }
        };

        /*
         * Stop buffer if it's currently playing.
         * @param {AudioBuffer} buffer
         * @param {number} when Time to stop in seconds.
         */
        tsw.stop = function (buffer, when) {
            when = when || 0;
            buffer.stop(when);
        };

        /*
         * Reverse a buffer
         * @param {AudioBuffer} buffer
         * @return {node} Return node containing reversed buffer.
         */
        tsw.reverse = function (sourceNode) {
            // Reverse the array of each channel
            for (var i = 0; i < sourceNode.buffer.numberOfChannels; i++) {
                Array.prototype.reverse.call(sourceNode.buffer.getChannelData(i));
            }
            return sourceNode;
        };

        /*
         * Update old WAA methods to more recent names.
         *
         * @param {object} Additional options.
         */
        var updateMethods = function (options) {
            this.start = function (timeToStart) {
                console.log(options.sourceNode);
                if (options.sourceNode.hasOwnProperty('start')) {
                    options.sourceNode.start(timeToStart);
                } else {
                    options.sourceNode.noteOn(timeToStart);
                }

                return this;
            };

            this.stop = function (timeToStop) {
                if (options.sourceNode.hasOwnProperty('stop')) {
                    options.sourceNode.stop(timeToStop);
                } else {
                    options.sourceNode.noteOff(timeToStop);
                }

                return this;
            };
        };

        tsw.createNode = function (options) {
            var node = {};

            options = options || {};

            node.input = tsw.context().createGain();
            node.output = tsw.context().createGain();

            node.nodeType = function () {
                return options.nodeType || 'default';
            };

            node.attributes = options.attributes;

            // Keep a list of nodes this node is connected to.
            node.connectedTo = [];

            if (options.hasOwnProperty('sourceNode')) {
                updateMethods.call(node, options);
            } else {
                options.sourceNode = false;
            }

            return node;
        };

        /*
         * Create oscillator node.
         * @param {string} waveType The type of wave form.
         * @param {number} frequency The starting frequency of the oscillator.
         * @return {node} Oscillator node of specified type.
         */
        tsw.oscillator = function (waveType, frequency) {
            var node,
                osc = tsw.context().createOscillator();

            node = tsw.createNode({
                sourceNode: osc,
                nodeType: 'oscillator'
            });

            createGetSetter.call(osc, node, ['type', 'frequency', 'waveType']);
            node.type(waveType || 'sine');
            node.frequency(frequency || 440);

            node.waveType = waveType || 'sine';

            node.nodeType = function () {
                return 'oscillator';
            };

            node.fadeIn = function () {
                tsw.fadeIn(this);
                return this;
            };

            node.fadeOut = function () {
                tsw.fadeOut(this);
                return this;
            };

            node.detune = function (amount) {
                osc.detune.value = amount;
                return this;
            };

            node.type(node.waveType.toLowerCase());

            node.isPlaying = function () {
                if (osc.playbackState === 2) {
                    return true;
                } else {
                    return false;
                }
            };

            node.returnNode = function () {
                return osc;
            };

            tsw.connect(osc, node.output);

            return node;
        };

        /*
         * Create gain node.
         * @return {node} Gain node.
         */
        tsw.gain = function (volume) {
            var node,
                gainNode;

            if (typeof this.context().createGain === 'function') {
                gainNode = this.context().createGain();
            } else {
                gainNode = this.context().createGainNode();
            }

            node = tsw.createNode({
                nodeType: 'gain'
            });

            node.params = {
                gain: gainNode.gain
            };

            createGetSetter.call(gainNode, node, ['gain']);

            if (isObject(volume)) {
                if (volume.hasOwnProperty('gain')) {
                    volume = volume.gain.value;
                }
            }

            if (volume <= 0) {
                volume = 0;
            }

            if (typeof volume === 'undefined') {
                volume = 1;
            }

            node.gain(volume);

            tsw.connect(node.input, gainNode, node.output);

            return node;
        };

        /*
         * Create buffer node.
         * @return {node} Buffer node.
         */
        tsw.buffer = function (no_channels, buffer_size, sample_rate) {
            var node = tsw.createNode({
                nodeType: 'buffer'
            });

            no_channels = no_channels || 1;
            buffer_size = buffer_size || 65536;
            sample_rate = sample_rate || 44100;

            var buffer = this.context().createBuffer(no_channels, buffer_size, sample_rate);

            createGetSetter.call(buffer, node, ['numberOfChannels', 'bufferSize', 'sampleRate']);

            node.data = function (val) {
                var channel_data;

                if (typeof val === 'undefined') {
                    channel_data = [];

                    for (var i = 0; i < no_channels; i++) {
                        channel_data.push(buffer.getChannelData(i));
                    }

                    return channel_data;
                }
            };

            node.buffer = function () {
                return buffer;
            };

            return node;
        };
        
        /*
         * Create buffer source node.
         * @return BufferSource node.
         */
        tsw.bufferPlayer = function (buff) {
            var source = this.context().createBufferSource();

            source.buffer = buff;

            if (typeof source.start === 'undefined') {
                source.start = source.noteOn;
                source.stop = source.noteOff;
            }

            return source;
        };

        /*
         * Create filter node.
         * @param {string} filterType Type of filter.
         * @return {node} Filter node.
         */
        tsw.filter = function () {
            var node = tsw.createNode({
                    nodeType: 'filter'
                }),
                options = {},
                filter = tsw.context().createBiquadFilter();

            if (isObject(arguments[0])) {
                options.type = arguments[0].type;
                options.frequency = arguments[0].frequency || 1000;
                options.Q = arguments[0].Q;
            } else if (isString(arguments[0])) {
                options.type = arguments[0];
            }

            options.type = options.type || 'lowpass';
            options.Q = options.Q || 0;

            createGetSetter.call(filter, node, ['type', 'frequency', 'Q']);

            node.type(options.type);
            node.frequency(options.frequency || 1000);
            node.Q(options.Q || 0);

            tsw.connect(node.input, filter, node.output);

            return node;
        };

        /*
         * Create analyser node.
         *
         * @method createAnalyser
         * @return Analyser node.
         */
        tsw.analyser = function () {
            return this.context().createAnalyser();
        };

        /*
         * Creates compressor node.
         * @param {object} settings Compressor settings.
         * @return Created compressor node.
         */
        tsw.compressor = function (settings) {
            /*
             *  Compressor 
             *  ==========
             *  +----------+     +----------------------+     +---------------+
             *  |  Input   |-->--|       Compressor     |-->--|     Output    |
             *  | (Source) |     | (DynamicsCompressor) |     | (Destination) |
             *  +----------+     +----------------------+     +---------------+
             */
            var node = tsw.createNode({nodeType: 'compressor'}),
                compressor = this.context().createDynamicsCompressor(),
                defaults = {
                    threshold: -24,     // dbs (min: -100, max: 0)
                    knee: 30,           // dbs (min: 0, max: 40)
                    ratio: 12,          // ratio (min: 1, max: 20)
                    attack: 0.003,      // seconds (min: 0, max: 1)
                    release: 0.25       // seconds (min: 0, max: 1)
                };

            settings = applyObject(defaults, settings);
            applySettings(compressor, settings);

            tsw.connect(node.input, compressor, node.output);

            return node;
        };

        /*
         * Create processor node.
         * @return Script Processor node.
         */
        tsw.processor = function (bs, callback) {
            var bufferSize = bs || 1024,
                processor =  tsw.context().createScriptProcessor(bufferSize, 1, 1);

            if (typeof callback === 'function') {
                processor.onaudioprocess = function (e) {
                    callback(e);
                };
            }

            return processor;
        };

        /*
         * Create waveshaper.
         */
        tsw.waveShaper = function () {
            var waveShaper = this.context().createWaveShaper(),
                curve = new Float32Array(65536);

            for (var i = 0; i < 65536 / 2; i++) {
                if (i < 30000) {
                    curve[i] = 0.1;
                } else {
                    curve[i] = -1;
                }
            }

            waveShaper.curve = curve;

            return waveShaper;
        };

        /*
         * Create envelope.
         * @param {object} envelopeParams Envelope parameters.
         * @return Envelope filter.
         */
        tsw.envelope = function (settings) {
            var envelope = {};

            settings = settings || {};

            // Initial levels
            envelope.name = settings.name|| '';
            envelope.startLevel = settings.startLevel || 0;
            envelope.maxLevel = settings.maxLevel || 1;
            envelope.minLevel = settings.minLevel || 0;
            envelope.param = settings.param || null;
            envelope.nodeType = function () {
                return 'envelope';
            };

            // Envelope values
            envelope.attackTime = settings.attackTime || 0;
            envelope.decayTime = settings.decayTime || 1;
            envelope.sustainLevel = settings.sustainLevel || 1;
            envelope.releaseTime = settings.releaseTime || 1;

            // Automation parameters 
            if (isAudioParam(settings.param)) {
                envelope.param = settings.param;
            }

            // Should the release kick-in automatically
            settings.autoStop === undefined ? envelope.autoStop = true : envelope.autoStop = settings.autoStop;

            envelope.start = function (timeToStart) {
                // Calculate times
                var decayTime = this.attackTime + this.decayTime,
                    releaseTime = decayTime + this.releaseTime;

                // Calculate levels
                this.maxLevel = this.startLevel + this.maxLevel;
                this.sustainLevel = this.startLevel + this.sustainLevel;

                // Param is actual AudioParam
                if (isAudioParam(this.param)) {
                    // Attack
                    this.param.setValueAtTime(0, tsw.now());
                    this.param.linearRampToValueAtTime(this.maxLevel, tsw.now() + this.attackTime);

                    // Decay
                    this.param.setTargetAtTime(this.sustainLevel, tsw.now(), this.decayTime);
                }
            };

            envelope.stop = function (timeToStop) {
                timeToStop = timeToStop || tsw.now();
                timeToStop += this.releaseTime;

                // Release
                if (!this.autoStop && isAudioParam(this.param)) {
                    this.param.setTargetAtTime(this.minLevel, tsw.now(), this.releaseTime / 10);
                }
            };

            return envelope;
        };

        /*
         * Create noise.
         * @param {string} colour Type of noise.
         * @return Noise generating node.
         */
        tsw.noise = function () {
            var node,
                noise_source = this.bufferPlayer(tsw.noise_buffer.buffer());

            node = tsw.createNode({
                nodeType: 'noise',
                sourceNode: noise_source,
                attributes: {
                    color: 'white'
                }
            });

            noise_source.loop = true;

            createGetSetter.call(noise_source, node, ['buffer']);

            node.color = node.colour = function (color) {
                if (typeof color === 'undefined') {
                    return node.attributes.color;
                } else {
                    node.attributes.color = color;
                }
            };

            node.nodeType = function () {
                return 'noise';
            };

            node.play = function (timeToStart) {
                noise_source.start(timeToStart);
            };

            return node;
        };

        /*
         * Create LFO.
         * @param {object} settings LFO settings.
         */
        tsw.lfo = function (settings) {

            /*********************************

            LFO 
            ===
            +----------+     +--------------+
            |    LFO   |-->--|    Target    |
            | (Source) |     | (AudioParam) |
            +----------+     +--------------+

            *********************************/

            var node,
                lfo = tsw.oscillator(),
                depth = this.gain(),
                noise_source = this.bufferPlayer(tsw.noise_buffer.buffer()),
                defaults = {
                    frequency: 0,
                    waveType: 'triangle',
                    depth: 1,
                    target: null,
                    autoStart: false
                };

            node = tsw.createNode({
                nodeType: 'noise',
                sourceNode: noise_source
            });

            // Merge passed settings with defaults
            settings = applyObject(defaults, settings);

            lfo.type(settings.waveType || 'triangle');
            depth.gain(settings.depth);
            lfo.frequency(settings.frequency);

            if (settings.autoStart) {
                lfo.start(tsw.now());
            }

            lfo.modulate = function (target) {
                tsw.connect(depth, target);
            };

            lfo.setWaveType = function (waveType) {
                lfo.type = lfo[waveType.toUpperCase()];
            };

            lfo.frequency = function (f) {
                if (typeof f === 'undefined') {
                    return lfo.frequency.value; 
                } else {
                    lfo.frequency.value = f;
                }
            };

            lfo.depth = function (d) {
                if (typeof d === 'undefined') {
                    return depth.gain.value; 
                } else {
                    depth.gain.value = d;
                }
            };

            lfo.modulate(settings.target);

            return lfo;
        };

        /*
         * Get user's audio input.
         * @param {function} Callback function with streaming node passed as param;
         */
        tsw.getUserAudio = function (callback) {
            var audioStream = function (stream) {
                var streamNode = tsw.context().createMediaStreamSource(stream);

                callback(streamNode);
            };

            navigator.webkitGetUserMedia({audio: true}, audioStream);
        };

        /*
         * Time manager
         */
        var timeManager = function () {
            (function loop () {
                nodes_to_disconnect.forEach(function (nodeToDisconnect) {
                    if (nodeToDisconnect.time < tsw.now()) {
                        tsw.disconnect(nodeToDisconnect.node);
                    }
                });
                setTimeout(loop, 500);
            })();
        };

        // Expose helper functions.
        tsw.isString = isString;
        tsw.isNumber = isNumber;

        /*
         * Kick everything off.
         */
        tsw.init = function () {
            checkBrowserSupport(function () {
                // Browser is compatible.
                mapToSoundWorld();
                initialise();
                timeManager();
            }, function (error) {
                // Browser is not compatible.
                console.log(error);
            });
        };

        return (window.tsw = tsw) ;
    })();

    tsw.init();

})(window);
