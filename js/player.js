var Pageload = {
	init : function() {
		this.classifyid = document.cookie.match(name)['input'];
		this.my = location.search.search('my');
		this.$detail = $('main>.detail');
		this.$tags = this.$detail.find('.tag');
		this.$img = $('.music-img');
		this.$bg = $('#bg');
		this.$songName = this.$detail.find('h1');
		this.$songTime = this.$detail.find('time');
		this.$singer = this.$detail.find('.singer');
		this.$next = $('.btn-next');
		this.songInfo = {};

		if (this.my == -1) {
			this.getData();
		} else {
			this.renderTag(JSON.parse(localStorage['loveSongObj']));
			Footer.renderMylove(JSON.parse(localStorage['loveSongObj']));
		}
		
		Footer.init();
		SongApp.init();
		this.bind();
	},
	bind : function(){
		$('nav .menu').on('click',function(){
			if ($(this).hasClass('active')) {
				$('nav ul.classify').removeClass('active');
				$('#logo').removeClass('active');
				$(this).removeClass('active');
			}else {
				$('nav ul.classify').addClass('active');
				$('#logo').addClass('active');
				$(this).addClass('active');
			}
		})
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
		var id,imgSrc,name,singer;
		if (this.my == -1) {
			id = data.tracks[0].id;
			imgSrc = data.tracks[0].al.picUrl + '?param=600y600';
			this.$tags.text(function(){
				var arr = [];
				data.tags.forEach(function(tag){
					arr.push(tag);
				})
				return arr.join('.');
			})
			name = data.tracks[0].name;
			singer = _this.getSinger(data.tracks[0].ar);
		    if(SongApp.loveSongObj[id]){
		      $('.btn-love').addClass('on')
		    }else{
		      $('.btn-love').removeClass('on')
		    }
		}else {
			var i = Object.keys(data)[0];
			id = data[i].songId;
			imgSrc = data[i].imgSrc;
			this.$tags.text('我的歌单');
			name = data[i].songName;
			singer = data[i].singer;
			$('.btn-love').addClass('on');
		}

		this.$img.css('background-image','url('+imgSrc +')');
		this.$bg.css('background-image','url('+imgSrc +')');
		this.$songName.text(name);
		this.$singer.text(singer);
		this.$next.attr('data-next-sort', 1);

		this.songInfo = {
				songId : id,
				imgSrc : imgSrc,
				songName : name,
				singer : singer
		};

		SongApp.getSong(id);
		SongApp.loadLyc(id);
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
		this.$panel = $('footer');
		this.$ul = $('footer ul');
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
			if (_this.isAnimate) { return }
			var liWidth = _this.$ul.find('li').outerWidth(true);
			var columns = Math.floor(_this.$box.width()/liWidth);
			if (!_this.isToStart) {
				_this.isAnimate = true;
				_this.$ul.animate({
					left : '+=' + columns * liWidth
				}, 400, function(){
					_this.isAnimate = false;
					_this.isToEnd = false;
					if (parseFloat(_this.$ul.css('left')) > 0) {
						_this.isToStart = true;
					}
				})
			}
		})
		this.$right.on('click', function(){
			if (_this.isAnimate) { return }
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
		})
		this.$ul.on('click','li', function(){
			EventCommon.fire('getID', {
				sortId : $(this).find('.sort').text(),
				songId : $(this).find('.intro').attr('data'),
				imgSrc : $(this).find('.sort').attr('data-img'),
				songName : $(this).find('.song-name').text(),
				singer : $(this).find('.singer').text()
			});
			$(this).find('.btn-icon').addClass('icon-out').removeClass('icon-play');
			$(this).siblings().find('.btn-icon').addClass('icon-play').removeClass('icon-out');
		})
		EventCommon.on('nextClick', function(e,data){
			var sort = data.nextSort;

			if (sort >= _this.$ul.find('li').length) {
				sort = 0;
			}
			_this.$ul.find('li').eq(sort).trigger('click');
			_this.setLiwidth(sort);
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
	renderMylove : function(data){
		var html = " ";
		var i=1;
		for(var idx in data){
			html += '<li>\
						<div class="sort" data-img="'+data[idx]['imgSrc']+'">'+i+'</div>\
						<div class="intro" data="'+data[idx]['songId']+'">\
							<div class="song-name">'+data[idx]['songName']+'</div>\
							<span class="singer">'+data[idx]['singer']+'</span>\
							<span class="time"></span>\
						</div>\
						<span class="btn-icon iconfont icon-play"></span>\
					</li>'
			i++
		}
		$('footer ul').html(html);
		this.setStyle();
	},
	setStyle : function(){
		var count = $('footer ul').find('li').length;
		var liWidth = $('footer ul').find('li').outerWidth(true);
		$('footer ul').css({
			width : count * liWidth + 'px'
		});
	},
	setLiwidth : function(data){
		var liWidth = this.$ul.find('li').outerWidth(true);
		var _this = this;

		this.$ul.animate({
			left : '-' + data * liWidth
		},400, function(){
			_this.isToStart = false;
		});
	}
}

var SongApp = {
	init : function(){
		this.$detail = $('main>.detail');
		this.$tags = this.$detail.find('.tag');
		this.$img = $('.music-img');
		this.$bg = $('#bg');
		this.$songName = this.$detail.find('h1');
		this.$songTime = this.$detail.find('time');
		this.$singer = this.$detail.find('.singer');
		this.$love = $('.btn-love');
		this.$play = $('.btn-play');
		this.$next = $('.btn-next');
		this.$bar = this.$detail.find('.bar');
		this.$setbar = this.$detail.find('.bar-progress');
		this.$lyc = this.$detail.find('.lyc');
		this.lycObj = {};
		this.songInfo = {};
		this.loveSongObj = JSON.parse(localStorage['loveSongObj']||'{}');
		this.audio = new Audio();
		this.audio.autoplay = false;
		this.clock;

		this.bind();
	},
	bind : function(){
		var _this = this;
		EventCommon.on('getID', function(e,data){
			_this.songInfo = data;
			_this.autoSong();
			_this.getSong(data.songId);
			_this.renderDetail(data);
			_this.timeLine();
			_this.loadLyc(data.songId);

		})
		this.$play.on('click', function(){
			if (_this.audio.paused) {
				_this.audio.play();
				_this.$play.removeClass('icon-play').addClass('icon-out');
				_this.timeLine();
			}else {
				_this.audio.pause();
				_this.$play.removeClass('icon-out').addClass('icon-play');
				clearInterval(_this.clock);
			}
		})
		this.$next.on('click', function(){
			EventCommon.fire('nextClick',{nextSort : _this.$next.attr('data-next-sort')});
		})
		this.$bar.on('click', function(e){
			_this.$setbar.css({ width : e.offsetX });
			_this.audio.currentTime = e.offsetX/parseFloat(_this.$bar.width()) * _this.audio.duration;
		})
		this.audio.addEventListener('ended', function(){
			setTimeout(function(){
				_this.$next.trigger('click');
			}, 1000)
		})
		this.$love.on('click',function(){
			var data = _this.$next.attr('data-next-sort') == 1 ? Pageload.songInfo : _this.songInfo;
			if ($(this).hasClass('on')) {
				$(this).removeClass('on');
				delete _this.loveSongObj[data.songId]
			}else {
				$(this).addClass('on');
				_this.loveSongObj[data.songId] = data
			}
			localStorage['loveSongObj'] = JSON.stringify(_this.loveSongObj)
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
		this.$next.attr('data-next-sort', data.sortId);

	    if(this.loveSongObj[data.songId]){
	      this.$love.addClass('on')
	    }else{
	      this.$love.removeClass('on')
	    }
	},
	playSong : function(data) {
		if (data) {
			this.audio.src = data;
		}else {
			alert('error，进入下一曲！');
			this.$next.trigger('click');
		}
	},
	timeLine : function(){
		var _this = this;
		clearInterval(this.clock);
		this.clock = setInterval(function(){
			_this.$songTime.text(Pageload.countTime(_this.audio.currentTime*1000));
			_this.$setbar.animate({
				width : Math.floor(_this.audio.currentTime/_this.audio.duration * 100) + '%'
			}, 1000);

			_this.$lyc.text(_this.lycObj[_this.$songTime.text()]);

		}, 1000);
	},
	autoSong : function() {
		this.audio.autoplay = true;
		this.$play.removeClass('icon-play').addClass('icon-out');
	},
	loadLyc : function(data){
		var _this = this;
		$.getJSON('//api.imjad.cn/cloudmusic/',{type : 'lyric', id : data}).done(function(rep){
			var lycObj = {};
			rep.lrc.lyric.split('\n').forEach(function(line){
				var timeArr = line.match(/\d{2}:\d{2}/g)
				if (timeArr) {
					timeArr.forEach(function(time){
						lycObj[time] = line.replace(/\[.+?\]/g , '')
					})
				}
			})
			_this.lycObj = lycObj;
		}).fail(function(){
			console.log('error');
		})
	}
}

Pageload.init();