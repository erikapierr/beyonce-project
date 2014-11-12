//define the bands widget
var bandsWidget = {
	artist: 'Beyonce',
	response: [],

	//initializer function
	init: function(artist) {
		$("#submit-button").on('click', function(e){
			e.preventDefault();
	        bandsWidget.location = $('.location').val();
	    	//$(this).unbind('click');
	    	bandsWidget.artist="Beyonce";
	    	bandsWidget.makeRequest();

    	});
	},
	makeRequest: function(){
		$.ajax({
			url: 'http://api.bandsintown.com/artists/' + bandsWidget.artist + '/events/search.json?callback=showArtist',
			type:'GET',
			dataType: 'jsonp',
			data: {
				format: 'json',
				app_id: 'beyonceapi',
				api_version: '2.0',
				date: 'upcoming',
				location: bandsWidget.location
			},
			success: bandsWidget.parseData
		});
	},
	//how to respond if there is/isn't a show & if artist is/isn't beyonce
	parseData: function(response) {
			//if upcoming show...
			bandsWidget.response = response;

		if (response.length > 0 && bandsWidget.artist == "Beyonce") {
			bandsWidget.showArtistDiv(bandsWidget.beyDiv);
			lastfmWidget.addDate();
			lastfmWidget.activateClock;
			//if no upcoming show...
		} else if (response.length===0 && bandsWidget.artist == "Beyonce") {
			bandsWidget.showArtistDiv(bandsWidget.noBeyonce);
			//if no upcoming show for related artists...
		} else if (response.length===0 && bandsWidget.artist != "Beyonce") {
			bandsWidget.showArtistDiv(bandsWidget.noOtherArtist);
			//if show is upcoming...
		} else if (bandsWidget.location === undefined) {
		} else if (response.length > 0 && bandsWidget.artist!="Beyonce") {
			bandsWidget.showArtistDiv(bandsWidget.otherArtist);
			lastfmWidget.addDate();
			lastfmWidget.activateClock();
		} else {
			$('p.invalid-entry').css('display', 'block');
		};
	},
	//change the div when an artist or location is selected
	beyDiv: $('.bey-in-town'),
	noBeyonce: $('.bey-not-in-town'),
	noOtherArtist: $('.other-not-in-town'),
	otherArtist: $('.other-in-town'),
	error: $('.error'),
	showArtistDiv: function(artistDiv) {
		$('.is-bey-touring').css('display', 'none');
		$('.option').css('display', 'none');
		$(artistDiv).css('display', 'block');
		$('p.invalid-entry').css('display', 'none');
	}
};

//define last.fm widget
var lastfmWidget = {
	artistList: [],
	artistImg: [],
	artistURL: [],	
	generatedArtists: [],
	artistToSearch: "beyonce",
//initializer function
	init: function() {
		$.ajax({
			url: 'http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar',
			type: 'GET',
			dataType: 'jsonp',
			data: {
				artist: lastfmWidget.artistToSearch,
				format: 'json',
				autocorrect: '1',
				api_key: 'bedc1174f8b58bdc8c711c3292f922d8'},
			success: lastfmWidget.parseData
		});
	},
	//parse result data and load new artists
	parseData: function(result) {
		for (var i=0; i<99; i++) {
			var artist = result.similarartists.artist[i];
			if (!((artist.name == "Whitney Houston") || (artist.name == "Destiny's Child") || (artist.name=="Spice Girls") || (artist.name == "Michael Jackson") || (artist.name == "Aaliyah") || (artist.name == "TLC"))) {
			lastfmWidget.artistList.push(artist.name);
			lastfmWidget.artistImg.push(artist.image[3]['#text']);
			}	
		}
		lastfmWidget.loadNewArtists();
		lastfmWidget.tryAgain();
	},
	//choose a random artist; send info to DOM
	//shuffle function from http://css-tricks.com/snippets/javascript/shuffle-array/
	random: [],
	createRandomArray: function() {
		for (var i=0;i<94;i++) {
			lastfmWidget.random.push(i);
		}
	},
	Shuffle: function(o) {
		for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	},
	newArtistGenerator: function(i) {
	    return function() { 
		    $('.new-artist:eq('+i+')').find('a').attr('href', lastfmWidget.artistURL[lastfmWidget.random[0]]);
			$('.new-artist:eq('+i+')').find('img').attr('src', lastfmWidget.artistImg[lastfmWidget.random[0]]);
			$('.new-artist:eq('+i+')').find('p').text(lastfmWidget.artistList[lastfmWidget.random[0]]);
			lastfmWidget.random.splice(0,1);
	    };
	},
	//helper function for newArtistGenerator
	loadNewArtists: function() {
		lastfmWidget.createRandomArray();
		lastfmWidget.Shuffle(lastfmWidget.random);
		for (var i = 0; i < 6; i++) {
		    lastfmWidget.generatedArtists[i] = lastfmWidget.newArtistGenerator(i);	
			}
		for (var j = 0; j < 6; j++) {
		    lastfmWidget.generatedArtists[j](); 
			}
	},
	//choose new artist and reinitialize bandsWidget
	tryAgain: function(){
		var currentArtist= $('.new-artist').find('a');
		currentArtist.on('click', function() {
			lastfmWidget.artistToSearch = $(this).text();
			bandsWidget.artist = $(this).text();
			bandsWidget.makeRequest();
			lastfmWidget.loadNewArtists();
			$('.your-artist').text(bandsWidget.artist);
			
		});
	},
//load date/time/url for chosen artist
	addDate: function() {
		if (bandsWidget.response.length > 0) {
		$('.concert-date').text(bandsWidget.response[0].formatted_datetime + " at " + bandsWidget.response[0].venue.name);
		$('.other-in-town').find('a').attr('href', bandsWidget.response[0].ticket_url);
			}
		},
//activate countdown clock
	activateClock: function() {
			if (bandsWidget.response.length > 0) {
			lastfmWidget.dateTime = bandsWidget.response[0].datetime.split('T');
			lastfmWidget.date = lastfmWidget.dateTime[0].split('-');
			lastfmWidget.time = lastfmWidget.dateTime[1].split(':');

		$(".clock").countdown(lastfmWidget.date[0] + "/" + lastfmWidget.date[1] + "/" + lastfmWidget.date[2] + " " + lastfmWidget.time[0] + ":" + lastfmWidget.time[1] + ":" + lastfmWidget.time[2], function(event) {
    	    $(this).text(
    	      event.strftime('%D days %H:%M:%S')
    	    );
    	    });
		} else if (bandsWidget.response.length === 0) {return null;}
	}
};
$(document).ready(function(){
	bandsWidget.init();
	lastfmWidget.init();
	var headerHeight = $('.header-container').css('height');
	$('.video-container').css({
		'height': headerHeight,
		overflowY: 'hidden'
	});
	var videoHeight = $('.video-container').css('height');
	$('.header-container').css('height', videoHeight);
	// $("video").prop('muted', true);
});