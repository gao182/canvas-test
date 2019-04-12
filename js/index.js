var SongList = {
	init : function(){
		this.$panel = $('.songCD');
		this.$ul = this.$panel.find('.box>ul');
		this.$left = this.$panel.find('span.icon-left');
		this.$right = this.$panel.find('span.icon-right');
		this.$box = this.$panel.find('.box');
		this.$name = this.$panel.find('.songCD-name');
		this.isAnimate = false;
		this.isToStart = true;
		this.isToEnd = false;

		this.getData(this.$name.find('a'));
		this.bind();
	},
	bind : function(){
		var _this = this;
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
					if (parseFloat(_this.$ul.css('left')) >= -1) {
						_this.isToStart = true;
					}
				})
			}
		})
		this.$right.on('click', function(){
			if (_this.isAnimate || _this.isToEnd) { return }
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
		this.$ul.on('click','li',function(){
			document.cookie = $(this).attr('data-id');
		})
		this.$name.find('li').on('click', function(e){
			e.preventDefault();
			$(this).find('a').addClass('active');
			$(this).siblings().find('a').removeClass('active');
			_this.$ul.css({left : 0});
			_this.getData($(this).find('a'));
		})
	},
	getData : function(name){
		var _this = this;
		var sText;
		if (name.length > 1) {
			sText = name.eq(0).text(); 
		}else {
			sText = name.text();
		}
		$.getJSON('//api.imjad.cn/cloudmusic/',
			{type : 'search', search_type : '1000', s : sText, limit : '20'})
		.done(function(rep){
			_this.renderData(rep.result.playlists);
		}).fail(function(){
			console.log('error');
		})
	},
	renderData : function(data){
		var html = "";
		data.forEach(function(list){
			html += '<li data-id="'+ list.id +'">\
						<a href="player.html" target="_blank">\
							<div class="img" style="background-image: url('+ list.coverImgUrl +');"></div>\
							<p>'+ list.name +'</p>\
						</a>\
					</li>';	
		})
		this.$ul.html(html);
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

SongList.init();