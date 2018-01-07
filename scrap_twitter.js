var fs = require('fs');
var data = fs.read('config');
var input = data.split('\n');
input.splice(-1,1);

for (var i in input) {
	var entry = input[i];
	var keyVal = entry.split('=');
	var key = keyVal[0];
	var val = keyVal[1];

	if (key === 'email') {
		const email = val;
	}
	else if (key === 'password') {
		const password = val;
	} else if (key === 'waitTime') {
		const waitTime = val;
	} else if (key === 'logprogress') {
		const logProgress = (val == 'true');
	}
}

var casper = require('casper').create({
  logLevel: 'debug'
});

casper.on('remote.message', function(message) {
    this.echo(message);
});

casper.start().thenOpen("https://twitter.com/", function() {
	if (logProgress) {
		console.log('Capturing screenshot for twitter homepage');
	}
	this.capture('1_homepage.png');
	this.wait(waitTime);
});

casper.then(function(){
	this.wait(waitTime);
	this.evaluate(function() {
		document.getElementsByClassName('js-login')[0].click();
	});
});

casper.then(function(){
	this.capture('2_AfterLoginClick.png');
	this.evaluate(function(email, password) {
		document.getElementsByClassName('js-signin-email')[0].value = email;
		document.getElementsByName('session[password]')[0].value = password;
		document.getElementsByClassName('js-submit')[0].click();
	}, email, password);
	this.wait(waitTime);
});

casper.then(function(){
	if (logProgress) {
		console.log("Make a screenshot and save it as AfterLogin.png");
	}
	this.wait(waitTime);
	this.capture('3_AfterLoginFilled.png');
});

casper.then(function(){
	var stream = this.evaluate(function() {
          window.document.body.scrollTop = document.body.scrollHeight;
		var stream = [];
		for (var i = 0; i < document.getElementsByClassName('content').length; i++) {

			var singleContent = document.getElementsByClassName('content')[i];
			if (!(singleContent.querySelector('span b'))) {
				continue;
			}

			var tweet = {};
			tweet.user = singleContent.querySelector('span b').innerHTML;
			tweet.tweet = singleContent.querySelector('.tweet-text').innerHTML;
			stream.push(tweet);
		}

		return stream;
	});

	// output tweet
	for (var i in stream) {
		console.log('-----------------------------------------------');
		console.log('user=', stream[i].user);
		console.log('tweet=', stream[i].tweet);
	}

	console.log('done');
});

casper.run();
