// YAFI
// Yet Another Fancy Interjector
// or, You Ash Fow It

var fs = require('fs');
// var gui = require('nw.gui');
// var gui = global.window.nwDispatcher.requireNwGui();


var util = {
	boolFlip: function() {
		return Math.floor(Math.random() * 2) == 0;
	},
	randInRange: function(min,max) {
	    return Math.floor(Math.random() * (max - min + 1) + min);
	},
	randLfromR: function(arr) {
	    return arr[this.randInRange(0,(arr.length - 1))];
	},
	readFileToArr: function(filename) {
		return fs.readFileSync(filename).toString().split("\n").map(function(e){
			return e.replace(/(\n|\r)/,"");
		});
	}
};

// read in pls
var sep = /^win/.test(process.platform) ? '\\' : '/';
var lex = '.' + sep + 'lexicon' + sep;

var adv = util.readFileToArr(lex + 'adverbs.txt');
var adj_advable = util.readFileToArr(lex + 'adjectives_adverbable.txt');
var adj_nonadvable = util.readFileToArr(lex + 'adjectives_nonadverbable.txt');
var gnoun = util.readFileToArr(lex + 'nouns_group.txt');
var pnoun = util.readFileToArr(lex + 'nouns_personal.txt');

// config pls
var vocab = {
	adverbs: adv,
	adjectives: {
		adverbable: adj_advable,
		notAdverbable: adj_nonadvable
	},
	groupNouns: gnoun,
	personalNouns: pnoun,
	getAdv: function(){
		var domain = this.adjectives.adverbable.concat(this.adverbs);
		var adv = util.randLfromR(domain);
		
		if (!!arguments[0]) {
			var args = arguments[0];
			while (args.indexOf(adv) != -1) {
				adv = util.randLfromR(domain);
			}
		}

		return adv;
	},
	getAdj: function(){
		var domain = this.adjectives.adverbable.concat(this.adjectives.notAdverbable);
		var adj = util.randLfromR(domain);

		if (!!arguments[0]) {
			var args = arguments[0];
			while (args.indexOf(adj) != -1) {
				adj = util.randLfromR(domain);
			}
		}

		return adj;
	},
	getGroupNoun: function(){
		return util.randLfromR(this.groupNouns);
	},
	getPersonalNoun: function(){
		return util.randLfromR(this.personalNouns);
	}
};

// syntax:
// [[[adv) adj] gr-of] [adv] adj sing[s]

function adverbize(string) {
	var adv = /ly$/;
	var able = /y$/;
	if (adv.test(string)) {
		return string;
	} else {
		if (able.test(string)) {
			return string.replace(/y/,"ily");
		} else {
			return string + "ly";
		}
	}
}

function generateSyntax(plural) {
	var baseAdj, baseAdv, groupAdj, groupAdv;

	var usedWords = [];
	var syntaxObj = {
		personalNoun: vocab.getPersonalNoun()
	};

	baseAdj = vocab.getAdj();
	usedWords.push(baseAdj);
	syntaxObj.baseAdj = baseAdj;

	if (util.boolFlip()) {					// base adv?
		baseAdv = vocab.getAdv(usedWords);
		usedWords.push(baseAdv);
		syntaxObj.baseAdv = adverbize(baseAdv);
	}

	if (!!plural) {							// group?
		syntaxObj.groupNoun = vocab.getGroupNoun();	

		if (util.boolFlip()) { 				// group adj?
			groupAdj = vocab.getAdj(usedWords);
			usedWords.push(groupAdj);
			syntaxObj.groupAdj = groupAdj;

			if (util.boolFlip()) {			// group adv?
				groupAdv = vocab.getAdv(usedWords);
				syntaxObj.groupAdv = adverbize(groupAdv);
			}
		}
	}

	return syntaxObj;
}

function inflectAndSerialize(syntax) {
	var phrase = syntax.baseAdj + " " + syntax.personalNoun;

	if (syntax.hasOwnProperty('baseAdv')) {
		phrase = syntax.baseAdv + " " + phrase; 
	} 

	if (syntax.hasOwnProperty('groupNoun')) {
		phrase = syntax.groupNoun + " of " + phrase + "s";

		if (syntax.hasOwnProperty('groupAdj')) {
			phrase = syntax.groupAdj + " " + phrase;

			if (syntax.hasOwnProperty('groupAdv')) {
				phrase = syntax.groupAdv + " " + phrase;
			}
		}
	}

	// if (process.stdout.isTTY) {
		// return phrase + "\n";
	// } else {
		return phrase;
	// }
}

if (process.argv) {
	var plural = !!process.argv[0]
	process.stdout.write(inflectAndSerialize(generateSyntax(plural)));// + "\n");
} else {
	process.stdout.write(inflectAndSerialize(generateSyntax(util.boolFlip())));// + "\n");
}

// gui.Window.get().showDevTools();


/*
var tray;

function buildTray() {
	var traymenu = new gui.Menu();
	traymenu.append(new gui.MenuItem({label: 'Exit', click: function(){ process.exit(); }} ));
	
	tray = new gui.Tray({
		title: '',
		icon: 'assets/yafi_tray.png',
		menu: traymenu,
		iconsAreTemplates: false
	});
	tray.tooltip = 'YAFI';
}

buildTray();
*/


// TODO:
// create menu
	// should include selector: singular/plural/random
	// should also include listener on/off
	// also, exit (herpaderpaderp)
// create tray icon
// listen for keystroke - default shift+ctrl+F but can be changed? (blarg that is not MVP)
// do swear when keystroke

// package that shit up with jxcore
	// do not package the lexicon with jxcore, that should remain external (one hopes jxcore is not smart enough to throw a blat about the missing folder)
// make an installer that blats out the binary, the lexicon folder and a readme
	// pandoc the fuck out of a readme

// OMGTODO:
// make it so that holding the hotkey oscillates a meter
// make the intensity of the swear depend on the value of the meter rather than being random
// ie: adj-noun -> adv-adj-noun -> group-adj-noun -> group-adv-adj-noun -> adj-group-adj-noun -> adj-group-adv-adj-noun -> adv-adj-group-adj-noun -> adv-adj-group-adv-adj-noun
// this will likely require some clever math because nonlinear distribution of words
// maybe make the adverbs appear when floor(meterValue) > n && floor(mV) % 3 == 0 or something
// meanwhile group + adj scales linearly
// filling the meter, of course, blats out the longest possible swear 