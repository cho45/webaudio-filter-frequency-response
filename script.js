
var App = angular.module('App', []);

App.controller('MainCtrl', function ($scope) {
	$scope.types = [
		{
			type: "lowpass",
			frequency: true,
			Q: true,
			gain: false
		},
		{
			type: "highpass",
			frequency: true,
			Q: true,
			gain: false
		},
		{
			type: "bandpass",
			frequency: true,
			Q: true,
			gain: false
		},
		{
			type: "lowshelf",
			frequency: true,
			Q: false,
			gain: true
		},
		{
			type: "highshelf",
			frequency: true,
			Q: false,
			gain: true
		},
		{
			type: "peaking",
			frequency: true,
			Q: true,
			gain: true
		},
		{
			type: "notch",
			frequency: true,
			Q: true,
			gain: false
		},
		{
			type: "allpass",
			frequency: true,
			Q: true,
			gain: false
		}
	];
	$scope.params = {
		frequency : 1000,
		Q : 1,
		gain: 1
	};

	$scope.setType = function (type) {
		$scope.type = type;
		$scope.draw();
	};

	var context = new AudioContext();
	var filter = context.createBiquadFilter();

	var canvas = document.getElementById('canvas');
	canvas.width  = canvas.parentNode.offsetWidth * window.devicePixelRatio;
	canvas.height = 300 * window.devicePixelRatio;

	var width = canvas.width;
	var frequencyHz = new Float32Array(width);
	var magResponse = new Float32Array(width);
	var phaseResponse = new Float32Array(width);

	var oct = 10;

	for (var i = 0; i < width; i++) {
		var n = oct * ((i / width) - 1.0);
		frequencyHz[i] = (context.sampleRate / 2) * Math.pow(2.0, n);
	}

	$scope.draw = function () {
		console.log($scope.params);

		filter.type = $scope.type.type;
		for (var key in $scope.params) if ($scope.params.hasOwnProperty(key)) {
			var val = $scope.params[key];
			if ($scope.type[key]) {
				console.log('set', key, val);
				filter[key].value = val;
			}
		}
		filter.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
		console.log(filter);

		var scale = 60;
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.strokeStyle = "#CCCCCC";
		ctx.fillStyle = "#000000";
		ctx.lineWidth = 2;
		ctx.font = (14 * window.devicePixelRatio) + "px sans-serif";
		console.log(ctx.font);
		for (var f = 10; f < context.sampleRate / 2; f *= 10) {
			for (var n = 1; n < 10; n++) {
				var x = f * n;
				var i = Math.round(
					( (Math.log(x / context.sampleRate) + Math.log(2) * oct + Math.log(2)) * width ) /
					( Math.log(2) * oct )
				);
				ctx.moveTo(i, 0);
				ctx.lineTo(i, canvas.height);
				if (
					x == 1e2 ||
					x == 2e2 ||
					x == 4e2 ||
					x == 1e3 ||
					x == 2e3 ||
					x == 4e3 ||
					x == 1e4
				   ) {
					ctx.fillText(x + "Hz", i, canvas.height - 10);
				}
			}
		}
		ctx.stroke();

		ctx.beginPath();
		ctx.fillStyle = "#660000";
		for (var db = -100; db < 60; db += 20) {
			var y = ((canvas.height * scale) - (db * canvas.height)) / (3 * scale);
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.fillText(db + "dB", 0, y);
		}
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = "#990000";
		ctx.lineWidth = 2;
		ctx.moveTo(0, canvas.height);
		for (var i = 0; i < width; i++) {
			var db = 20 * Math.log(magResponse[i]) / Math.LN10; // no warnings
			ctx[i === 0 ? "moveTo" : "lineTo"](i, ((canvas.height * scale) - (db * canvas.height)) / (3 * scale));
		}
		ctx.stroke();


		ctx.beginPath();
		ctx.fillStyle = "#006600";
		for (var deg = -270; deg <= 270; deg += 90) {
			var y =  (deg + 360) * canvas.height / (360 * 2); // no warnings
//			ctx.moveTo(0, y);
//			ctx.lineTo(width, y);
			ctx.fillText(deg + "°", width - 100, y);
		}
		ctx.stroke();

		ctx.strokeStyle = "#009900";
		ctx.beginPath();
		ctx.moveTo(0, canvas.height);
		for (var i = 0; i < width; i++) {
			var phase = phaseResponse[i] + Math.PI;
			var degree = phaseResponse[i] * (180 / Math.PI);
			ctx.lineTo(i, (degree + 360) * canvas.height / (360 * 2));
		}
		ctx.stroke();
	};

	$scope.$watch("params", function () {
		$scope.draw();
	}, true);

	$scope.setType($scope.types[0]);

});

