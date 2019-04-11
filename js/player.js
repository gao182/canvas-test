var Pageload = {
	init : function() {
		this.classifyid = document.cookie.match(name)['input'];
		this.$detail = $('main>.detail');
		this.$tags = this.$detail.find('.tag');
		this.$img = $('.music-img');
		this.$bg = $('#bg');
		this.$songName = this.$detail.find('h1');
		this.$songTime = this.$detail.find('time');
		this.$singer = this.$detail.find('.singer');

		this.getData();
		Footer.init();
		SongApp.init();
	},
	bind : function() {
	},
	getData : function(){
		var _this = this;
		$.getJSON('//api.imjad.cn/cloudmusic/',
			{type : 'playlist', id : _this.classifyid})
		.done(function(rep){
			_this.renderTag(rep.playlist);
			Footer.renderData(rep.playlist.tracks);
		}).fail(function(){
			console.log('error');
		})
	},
	renderTag : function(data) {
		var _this = this;
		var imgSrc = data.tracks[0].al.picUrl + '?param=600y600';
		this.$tags.text(function(){
			var arr = [];
			data.tags.forEach(function(tag){
				arr.push(tag);
			})
			return arr.join('.');
		})
		this.$img.css('background-image','url('+imgSrc +')');
		this.$bg.css('background-image','url('+imgSrc +')');
		this.$songName.text(data.tracks[0].name);
		this.$singer.text(_this.getSinger(data.tracks[0].ar));
		this.$songTime.text(_this.countTime(data.tracks[0].dt));

		console.log(data.tracks[0].id);
		SongApp.getSong(data.tracks[0].id);
	},
	countTime : function(times) {
		var minute = Math.floor(times/60000);
		var second = Math.floor(times/1000) - minute*60;
		minute = (minute + '').length > 1 ? minute : '0' + minute;
		second = (second + '').length > 1 ? second : '0' + second;
		return minute + ':' + second;
	},
	getSinger : function(singers) {
		var arr = [];
		singers.forEach(function(singer){
			arr.push(singer.name);
		})
		return arr.join('/');
	}
}

var EventCommon = {
	on : function(type, hander) {
		$(document).on(type, hander);
	},
	fire : function(type ,data) {
		$(document).trigger(type, data);
	}
}

var Footer = {
	init : function() {
		this.$panel = $('footer.playlist');
		this.$ul = this.$panel.find('ul');
		this.$left = this.$panel.find('.icon-left');
		this.$right = this.$panel.find('.icon-right');
		this.$box = this.$panel.find('.box');
		this.isAnimate = false;
		this.isToStart = true;
		this.isToEnd = false;

		this.bind();
	},
	bind : function() {
		var _this = this;
		this.$left.on('click', function(){
			if (_this.isAnimate || _this.isToStart) { return }
			var liWidth = _this.$ul.find('li').outerWidth(true);
			var columns = Math.floor(_this.$box.width()/liWidth);
			if (!_this.isToStart) {
				_this.isAnimate = true;
				_this.$ul.animate({
					left : '+=' + columns * liWidth
				}, 400, function(){
					_this.isAnimate = false;
					_this.isToEnd = false;
					if (parseFloat(_this.$ul.css('left')) > -4 && parseFloat(_this.$ul.css('left')) < 4) {
						_this.isToStart = true;
					}
				})
			}
		})
		this.$right.on('click', function(){
			if (_this.isAnimate || _this.isToEnd) { 
				return 
			}else{
				var liWidth = _this.$ul.find('li').outerWidth(true);
				var columns = Math.floor(_this.$box.width()/liWidth);
				if (!_this.isToEnd) {
					_this.isAnimate = true;
					_this.$ul.animate({
						left : '-=' + columns * liWidth
					}, 400, function(){
						_this.isAnimate = false;
						_this.isToStart = false;
						if (parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.width())) {
							_this.isToEnd = true;
						}
					})
				}
			}
		})
		this.$ul.on('click','li', function(){
			EventCommon.fire('getID', {
				songId : $(this).find('.intro').attr('data'),
				imgSrc : $(this).find('.sort').attr('data-img'),
				songName : $(this).find('.song-name').text(),
				singer : $(this).find('.singer').text(),
				songTime : $(this).find('.time').text()
			});
			$(this).find('.btn-icon').addClass('icon-out').removeClass('icon-play');
			$(this).siblings().find('.btn-icon').addClass('icon-play').removeClass('icon-out');
		})
	},
	renderData : function(data) {
		var $node;
		var _this = this;
		data.forEach(function(list,idx){
			$node = $('<li>\
							<div class="sort"></div>\
							<div class="intro">\
								<div class="song-name"></div>\
								<span class="singer"></span>\
								<span class="time"></span>\
							</div>\
							<span class="btn-icon iconfont icon-play"></span>\
						</li>')
			$node.find('.sort').attr('data-img',list.al.picUrl + '?param=600y600');
			$node.find('.intro').attr('data',list.id);
			$node.find('.sort').text(idx+1);
			$node.find('.song-name').text(list.name);
			$node.find('.singer').text(Pageload.getSinger(list.ar));
			$node.find('.time').text(Pageload.countTime(list.dt));
			_this.$ul.append($node);
		})
		this.setStyle();
	},
	setStyle : function(){
		var count = this.$ul.find('li').length;
		var liWidth = this.$ul.find('li').outerWidth(true);
		this.$ul.css({
			width : count * liWidth + 'px'
		});
	}
}

var SongApp = {
	init : function(){
		this.songId;
		this.$detail = $('main>.detail');
		this.$tags = this.$detail.find('.tag');
		this.$img = $('.music-img');
		this.$bg = $('#bg');
		this.$songName = this.$detail.find('h1');
		this.$songTime = this.$detail.find('time');
		this.$singer = this.$detail.find('.singer');
		this.$love = $('main>.control>.btn-love');
		this.$play = $('.btn-play');
		this.$next = $('main>.control>.btn-next');
		this.audio = new Audio();
		this.audio.autoplay = true;

		this.bind();
	},
	bind : function(){
		var _this = this;
		EventCommon.on('getID', function(e,data){
			_this.songId = data.songId;
			_this.getSong(data.songId);
			_this.renderDetail(data);
		})
	},
	getSong : function(data){
		var _this = this;
		$.getJSON('//api.imjad.cn/cloudmusic/',{type : 'song', id : data}).done(function(rep){
			_this.playSong(rep.data[0].url);
		}).fail(function(){
			console.log('error');
		})
	},
	renderDetail : function(data) {
		this.$img.css('background-image','url('+ data.imgSrc +')');
		this.$bg.css('background-image','url('+ data.imgSrc +')');
		this.$songName.text(data.songName);
		this.$singer.text(data.singer);
		this.$songTime.text(data.songTime);
	},
	playSong : function(url) {
		this.audio.src = url;
		this.$play.removeClass('icon-play').addClass('icon-out');
	}
}

Pageload.init();