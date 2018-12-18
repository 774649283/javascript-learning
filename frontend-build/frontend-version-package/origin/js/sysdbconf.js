$(function () {
  $('#sysdbAddModal').modal('show');

  $(document)
    .on('click', '#sysdbAddModal .btn.btn-primary', function () {
      var node = trim($('#addSysdbNode').val());
  		var str = node.split(",");
  		var iparr = [];
  		if (node == '') {
  			DisplayTips (lang.node.ip_is_null);
  			return;
  		}
  		//1、判断输入的ip地址是否正确，若有一个不对，就提示错误
  		for (var i = 0; i < str.length; i++) {
  			if ( !valifyIP (str[i]) ) {
  				DisplayTips (str[i] + " " + lang.node.ip_is_error);
  				return false;
  			}
  		}

  		var params = {
  			'ips': str.join(',')
  		};

  		//检查节点可添加性
  		var callback = function (result) {
        $('.modal-header').LoadData('hide');
  			if (!result) {
          DisplayTips(lang.node.add_sysdb_error);
        };
  			if (result.code == 200) {
          DataModel['logout'](null, function (result) {}, true, null);
          setTimeout(function () {
            window.location.href = "http://" + window.location.hostname;
          }, 1500);
  			}else {
          DisplayTips(lang.node.add_sysdb_error);
        }
  		}

      $('.modal-header').LoadData('show');
  		// $header.LoadData('show');
  		DataModel['addSysdbNode'](params, callback, true, null);
      })
});
