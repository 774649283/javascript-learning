/***************************************************************
* loading用的
******************************************************************/
(function($) {
  var loadDiv = '<div class="dt_loding_content"><img src="css/image/loading.gif"/>'+lang.loadingajax+'</div>';
	var loadDivGif = '<div class="dt_loding_content"><img src="css/image/loading.gif"/></div>';
	var methods = {
		show: function (){
      var element =  arguments[0] ? loadDivGif : loadDiv;
			return this.each (function (){
				var $this = $(this);
				$this.addClass ("dt_loding_bg");
				$this.append (element);
			});
		},
		hide: function (){
			return this.each (function (){
				var $this = $(this);
				$this.removeClass ("dt_loding_bg");
				$this.find (".dt_loding_content").remove ();
			});
		}
	};


	$.fn.LoadData = function (options) {
    var method = arguments[0];
		var option = arguments[1];

		if(methods[method]) {
			method = methods[method];
        }else {
			method = methods.show;
		}

		return method.call(this, option);
	}
})(jQuery);
