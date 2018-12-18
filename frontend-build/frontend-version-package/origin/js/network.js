$(function (ev) {

  // 绑定的网卡
  var networkCardMonitor = [];

  /* ------------------- 加载网络信息 ------------------- */
	var node = $('.node-nav-sub-left li.active').data('ip');
	var netparameter = {
		'node': node,
	};
	var callback = function (result){
		$('.network_nodeinfo').LoadData('hide');
		if (result == undefined)
			return;
		if (result.code == 200) {

			$('.network_nodeinfo').find('.js-netlist').html(result.result);
			$('.grid').masonry({
				itemSelector: '.grid-item',
				columnWidth: '.col-lg-6',
				percentPosition: true
			});

      // 获取网卡监控信息
      $('.network_nodeinfo').LoadData('show');
      DataModel['listMonitorNet']({'node': node}, monitorNetCallback, true, null);
		}
	}
	if(node){
		$('.network_nodeinfo').LoadData('show');
		DataModel['listAllNet'](netparameter, callback, true, null);
	}

  /* ------------------- 列举网卡监控信息 ------------------- */
  var monitorNetCallback = function (result) {
    $('.network_nodeinfo').LoadData('hide');
    if (result.code == 200) {

      var $netMonitorPage = $('.js-network-mag.bound-sub');

      $netMonitorPage.each(function () {
        networkCardMonitor.push($(this).find('.nic-ntw > span').text());
      });


      var allMonitor = result.result;
      var netMonitor;
      for (var i = 0; i < allMonitor.length; i++) {
        netMonitor = allMonitor[i]['monitor_net_list'];

        for (var j = 0; j < netMonitor.length; j++) {
          if (networkCardMonitor.indexOf(netMonitor[j]) !== -1) {

            $netMonitorPage.each(function () {
              console.log($(this).find('.nic-ntw > span').text(), netMonitor[j]);
              if ( $(this).find('.nic-ntw > span').text() == netMonitor[j] ) {
                $(this).
                  find('.other-action-ntw > .monitor_sub > span').
                  css('color', 'red').
                  data('ismonitor', 1).
                  attr('title', lang.network.unset_net_card_monitor);
              }
            });

          }
        }
      }

    }else {
      DisplayTips(lang.network.monitor_net_list_error);
    }

  };



	var timer = null;
	var bLen = 0; //用来存储已绑定的总网卡
	var tobebindLen = 0; //存储将要绑定
	var broundLen = 0; //存储已绑定

	$(document)
	//添加绑定时，显示网卡
	.on('click', '#bind_nic', function(ev){

		var shownNetList = function(result){
			var htm2 = '';
			if (result == undefined) {
				return;
			}
			if (result.code == 200) {
				var count = 0;
				for(var i =0; i < result.result.netlist.length; i++){
					if (result.result.netlist[i].nictype == 1) {
						htm2 += '<tr><td><input type="checkbox" class="netaddname" name="'+
						result.result.netlist[i]['name']+'" /></td><td>' + result.result.netlist[i]['name'] +
						'</td><td>'+result.result.netlist[i]['ipaddr']+'</td></tr>';
						count++;
					}
				}
				if (count == 0) {
					htm2 += '<div style="width:100%;"><p type="text" id="no-net-info" class="form-control">'+ lang.network.no_avail_net_card_now +'</p></div>';
					$('#setBindModal').find('.form-group').find('.form-net').html(htm2);
				}else {
					$('#setBindModal').find('.form-group').find('.form-net').find('tbody').html(htm2);
				}
			}else{
				DisplayTips( lang.network.display_net_card_fail );
			}
		}
		DataModel['listNeedNetInfo'](netparameter, shownNetList, true,'显示网卡');
	})
	.on('click', '.net-content .network-mag .pic-ntw input', function (ev) {
		//全选按钮不勾选
		var $this = $(this);
		selectInputSingle($this);
	})
	//.on ('mouseover', '.net-content .network-mag .nic-ntw', function (ev) {
	//	clearInterval( timer );
	//	$this = $(this);
	//	$net = $this.closest('.network-mag');
	//	$popver = $('#js-popver-ntw');
	//	mouseoverNet ($this, $net, $popver);
	//})
        .on('mouseover','.nic-ntw',function(){
            $el=$(this);
            var isSub = $el.parent().hasClass('bound-sub');
            $el.siblings().removeClass('net-mouseover');
            $el.removeClass('net-mouseover').addClass('net-mouseover');
            if(isSub){
                $('#js-popver-ntw .js-ntw-gateway').parent().hide();
                $('#js-popver-ntw .js-ntw-bondmode').parent().hide();
            }else {
                $('#js-popver-ntw .js-ntw-gateway').parent().show();
                $('#js-popver-ntw .js-ntw-bondmode').parent().show();
            }
            var gateway = $el.data('gateway');
            var mac = $el.data('hwaddr');
            var bondmode = $el.data('bondmode');
            var curspeed = $el.data('speed') / 1000;
            curspeed = curspeed > 1 ? (curspeed + 'GB') : ( $el.data('speed') + 'MB');
            var maxspeed = $el.data('maxspeed') / 1000;
            maxspeed = maxspeed > 1 ? (maxspeed + 'GB') : ( $el.data('maxspeed') + 'MB');
            var link = getNetLinkStatus ( $el.data('link') );


            $('#js-popver-ntw .js-ntw-gateway').text(gateway);
            $('#js-popver-ntw .js-ntw-mac').text(mac);
            $('#js-popver-ntw .js-ntw-bondmode').text(bondmode);
			$('#js-popver-ntw .js-ntw-cur-speed').text(curspeed);
			$('#js-popver-ntw .js-ntw-max-speed').text(maxspeed);
            //$('#js-popver-ntw .js-ntw-cur-speed').text(curspeed);
            //$('#js-popver-ntw .js-ntw-max-speed').text(maxspeed);
            $('#js-popver-ntw .js-ntw-link').text(link);

            popverPosition($('#js-popver-ntw'), $el);
        })
	.on('mouseover', '#js-popver-ntw', function (ev) {
		clearInterval( timer );
        $(this).css('display', 'table');
	})
	.on('mouseout', '.net-content .network-mag .nic-ntw', function (ev) {
		$this = $(this);
		$popver = $('#js-popver-ntw');
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(popverOut($popver), 300);
	})
	.on ('mouseleave', '#js-popver-ntw', function (ev) {
		$popver = $('#js-popver-ntw');
        popverOut($popver);
	})
	.on ('mouseover', '.network_nodeinfo', function(ev){
		$('.network_nodeinfo .basic_header .nodeinfo-do').removeClass('hidden');
	})
	.on ('mouseout', '.network_nodeinfo', function(ev){
		$('.network_nodeinfo .basic_header .nodeinfo-do').addClass('hidden');
	})

    //监控
	.on ('click','.network_monitor', function (ev) {
		var $this = $(this).parent().parent();
		$node = $('.fixed_nav_left .v-menu li.active');
		var operate ;
		var host = $node.data('ip');
		var ismonitor = $this.data ("ismonitor");
		if(ismonitor==true){
			operate='delete';
		}else if(ismonitor==false){
			operate='set';
		}
		var netports = $this.data ("netports");
		var parameter = {
			'ip':host,
			'netports' : netports,
			'manage' : operate,
		};
		var callback = function (result){
			if (result == undefined) {
				DisplayTips( lang.wizard.set_fail );
				return;
			}
			if (result.code == 200) {
				DisplayTips( lang.wizard.set_success );
                refresh();
			}else{
				DisplayTips( lang.wizard.set_fail );
			}
		}
		DataModel['networkMonitor'](parameter, callback, true, '');
	} )

  /* ------------------- 网卡监控 ------------------- */
  .on ('click','.monitor_sub > span', function (ev) {

		var $node = $('.fixed_nav_left .v-menu li.active');
		var operate ;
		var host = $node.data('ip');
		var ismonitor = $(this).data('ismonitor') == 0 ? false : true;
    operate = ismonitor ? 'delete' : 'set';
		var netports = $(this).data('name');

		var parameter = {
			'ip':host,
			'netports' : netports,
			'manage' : operate,
		};
		var callback = function (result){
			if (result == undefined) {
				DisplayTips( lang.wizard.set_fail );
				return;
			}

			if (result.code == 200) {

				DisplayTips( lang.wizard.set_success );

        var $netMonitorPage = $('.js-network-mag.bound-sub');
        var color = operate == 'delete' ? '' : 'red';
        var ismonitor = operate == 'delete' ? 0 : 1;
        var tips = operate == 'delete' ? lang.network.set_net_card_monitor : lang.network.unset_net_card_monitor;

        $netMonitorPage.each(function () {
          if ( $(this).find('.nic-ntw > span').text() == netports ) {
            $(this).
              find('.other-action-ntw > .monitor_sub > span').
              css('color', color).
              data('ismonitor', ismonitor).
              attr('title', tips);
          }
        });

			}else{
				DisplayTips( lang.wizard.set_fail );
			}
		}
		DataModel['networkMonitor'](parameter, callback, true, '');
	} )

	//IP设置
	.on ('click', '#setIp', function (ev) {
		$ntw = $(this).closest('.network-mag');
		$nicntw = $ntw.find('.nic-ntw');
		var gateway = $nicntw.data('gateway');//网关
		var ip = trim( $ntw.find('.ip-ntw span').text() );//ip
		var netmask = $nicntw.data('subnet');//掩码
		var name = trim( $nicntw.find('span').text() );

		$('#setIPModal').data('gateway', gateway);
		$('#setIPModal').data('ip', ip);
		$('#setIPModal').data('netmask', netmask);
		$('#setIPModal').data('name', name);
		$('#setIPModal').modal('show');

		$("#sip_Name").val (name);
		$("#sip_Newip").val (ip);
		$("#sip_Newmask").val (netmask);
		$("#sip_Newgateway").val (gateway);
		var NetworkIpArr=[];
		for(i = 0;i < $('.sub-menu').length;i++){
			NetworkIpArr.push($('.sub-menu:eq('+i+')').data('ip'));
		}
		if (NetworkIpArr.indexOf(ip) >= 0) {
			$("#sip_Newip").attr('disabled','disabled');
		}
	})
	//bond的IP设置setBondIp
	.on ('click', '#setBondIp', function (ev) {
		$ntw = $(this).closest('.network-mag');
		$nicntw = $ntw.find('.nic-ntw');
		var gateway = $nicntw.data('gateway');//网关
		var ip = trim( $ntw.find('.ip-ntw span').eq(0).text() );//ip
		var netmask = $nicntw.data('subnet');//掩码
		var name = trim( $nicntw.find('span').text() );

		$('#setBondIPModal').data('gateway', gateway);
		$('#setBondIPModal').data('ip', ip);
		$('#setBondIPModal').data('netmask', netmask);
		$('#setBondIPModal').data('name', name);
		$('#setBondIPModal').modal('show');

		$("#sbondip_Name").val (name);
		$("#sbondip_Newip").val (ip);
		$("#sbondip_Newmask").val (netmask);
		$("#sbondip_Newgateway").val (gateway);
		var NetworkIpArr=[];
		for(i = 0;i < $('.sub-menu').length;i++){
			NetworkIpArr.push($('.sub-menu:eq('+i+')').data('ip'));
		}
		if (NetworkIpArr.indexOf(ip) >= 0) {
			$("#sbondip_Newip").attr('disabled','disabled');
		}
	})
	//添加网卡到绑定
	.on ('click', '.addbondnic', function(ev) {
		$modal = $('#addbondnicIdModal');
		var bondName = $(this).parent().parent().parent().find('.nic-ntw').find('span').text();
		$modal.modal('show');
		var htm = '';
		var shownNetList = function(result){
			nodeinfo = result.result.netlist;
			var ahtm = '<table class="table" name="'+ bondName+'">';
			htm += ahtm;
			var j = 0;
			for(var i = 0 ; i < nodeinfo.length; i++){
				if(nodeinfo[i]['nictype'] == '1'){
					var htm2 = '<tr><td>' + nodeinfo[i]['name'] + '</td><td>' +
						nodeinfo[i]['ipaddr'] + '</td><td><input type="checkbox" name="' +
						nodeinfo[i]['name'] + '"></td></tr>';
					htm += htm2;
					j++;
				}
			}
			if (j == 0) {
				htm += '<p>'+ lang.node.no_available_node +'</p>';
			}
			htm += '</table>';
			$modal.find('.modal-body').html(htm);
			$modal.find('.modal-body').LoadData('hide');
		}
		$modal.find('.modal-body').LoadData('show');
		DataModel['listNeedNetInfo'](netparameter, shownNetList, true,'显示网卡');
	})
	//添加网卡到绑定确定事件
	.on ('click', '#addbondnicIdModal .btn-primary', function(ev){
		$modal = $('#addbondnicIdModal');
		bondName = $modal.find('.table').attr('name');
		netName = '';
		$modal.find('input:checked').each(function(){
			netName += $(this).attr('name');
			netName += ',';
		});
		if (netName != null) {
			netName = netName.substring(0,netName.length - 1);
		}
		if (netName == '') {
			DisplayTips( lang.network.select_at_least_one_net_card );
			return;
		}
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');

		var addnicpara = {
		'host' : host,
		'name': bondName,
		'nic': netName,
		};
		var addbondnicfun = function(result){
			removeWaitMask();
			$modal.find('.modal-body').LoadData('hide');
			if (result.code == 200) {
				$modal.modal('hide');
				DisplayTips( lang.network.net_card_bind_success );
				refresh ();
			} else if (result.code == 0) {
				DisplayTips('false');
			}
		}
		$modal.find('.modal-body').LoadData('show');
		addWaitMask();
		DataModel['addbondnic'](addnicpara, addbondnicfun, true, '添加网卡到绑定');
	})
	//从绑定删除网卡按钮
	.on ('click', '.delbondnic', function(ev) {
		var curNics = $(this).closest('.net-content').find('.bound-sub').length;
		//若绑定下只有一个网卡，不允许删除
		if (curNics < 2) {
			DisplayTips(lang.network.cannot_del_the_only_nic_in_bond );
			return;
		}
		$modal = $('#delbondnicIdModal');
		var nic = $(this).parent().parent().find('.nic-ntw').find('span').text();
		//var bondName = $(this).parent().parent().prev('.js-network-mag').find('.nic-ntw').find('span').text();
		var bondName = $(this).parent().parent().parent().find('.bound-network-mag').find('.nic-ntw').attr('title');
		$modal.modal('show');
		htm = '<p name="'+ nic +'" namebond="'+ bondName +'">'+lang.network.net_card_name + nic + '</p>';
		$modal.find('.modal-body').html(htm);
	})
	.on ('click', '#delbondnicIdModal .btn-primary', function(ev){
		$modal = $('#delbondnicIdModal');
		var nic = $modal.find('.modal-body').find('p').attr('name');
		var bondName = $modal.find('.modal-body').find('p').attr('namebond');
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var nicpara = {
			'host' : host,
			'name' : bondName,
			'nic' : nic,
		};
		var delbondnicfun = function(result){
            removeWaitMask();
			if (result.code == 200) {
				DisplayTips( lang.network.del_net_card_from_binding_success );
				refresh();
			} else if (result.code == 0) {
				DisplayTips('code = 0');
			}
		}
		$modal.find('.modal-body').LoadData('show');
        addWaitMask();
		DataModel['delbondnic'](nicpara, delbondnicfun, true, '从绑定删除网卡');
	})

	.on ('click', '#setBondIPModal .btn-primary', function (ev) {
		$modal = $(this).closest('#setIPModal');
		var gateway = $modal.data('gateway');//网关
		var ip = $modal.data('ip');//ip
		var netmask = $modal.data('netmask');//掩码
		var name = $modal.data('name');;
		//获取ip设置的相关参数

		var ethname = trim( $("#sbondip_Name").val () );
		var ethip = trim( $("#sbondip_Newip").val () );
		var mask =  trim( $("#sbondip_Newmask").val () );
		var gateway =  trim( $("#sbondip_Newgateway").val () );

		if (!valifyIP(ethip)) {
			DisplayTips ( lang.network.ip_addr_input_error );
			return;
		}
		// if (!valifyIP(mask)) {
		// 	DisplayTips ("掩码输入错误");
		// 	return;
		// }
		if (gateway != '' && !valifyIP(gateway)) {
			DisplayTips ( lang.network.gateway_input_error );
			return;
		}
		if (isNaN(mask)) {
			DisplayTips ( lang.network.mask_input_error );
		 	return;
		}
		if ((mask < 1) || (mask > 32)) {
			DisplayTips ( lang.network.mask_input_error );
		 	return;
		}
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
			'name': ethname,
			'ipaddr': ethip,
			'netmask': mask,
			'gateway': gateway,
		};
		var mycallback = function (result){
            removeWaitMask();
			$('#setBondIPModal').find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.network.modify_ip_addr_success );
				$("#setBondIPModal").modal ("hide");
				refresh ();
			} else {
				DisplayTips(result.result);
			}
		}
		$('#setBondIPModal').find('.modal-header').css('font-size','13px').LoadData('show')
        addWaitMask();
		DataModel['setBondIp'](parameter, mycallback, true, "修改IP地址");
	})
	.on ('click', '#setIPModal .btn-primary', function (ev) {
		// $modal = $(this).closest('#setIPModal');
		// var gateway = $modal.data('gateway');//网关
		// var ip = $modal.data('ip');//ip
		// var netmask = $modal.data('netmask');//掩码
		// var name = $modal.data('name');;
		//获取ip设置的相关参数
		var ethname = trim( $("#sip_Name").val () );
		var ethip = trim( $("#sip_Newip").val () );
		var mask =  trim( $("#sip_Newmask").val () );
		var gateway =  trim( $("#sip_Newgateway").val () );

		if (!valifyIP(ethip)) {
			DisplayTips ( lang.network.ip_addr_input_error );
			return;
		}
		// if (!valifyIP(mask)) {
		// 	DisplayTips ("掩码输入错误");
		// 	return;
		// }
		if (!valifyIP(gateway)) {
			DisplayTips ( lang.network.gateway_input_error );
			return;
		}
		if (isNaN(mask)) {
			DisplayTips ( lang.network.mask_input_error );
		 	return;
		}
		if ((mask < 1) || (mask > 32)) {
			DisplayTips ( lang.network.mask_input_error );
		 	return;
		}
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
			'name': ethname,
			'ipaddr': ethip,
			'netmask': mask,
			'gateway': gateway,
		};
		var mycallback = function (result){
            removeWaitMask();
			$('#setIPModal').find('.modal-header').LoadData('hide')
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.cluster.edit_ip_success );
				$("#setIPModal").modal ("hide");
				refresh ();
			} else {
				DisplayTips(result.result);
			}
		}
		$('#setIPModal').find('.modal-header').css('font-size','13px').LoadData('show')
        addWaitMask();
		DataModel['setIp'](parameter, mycallback, true, "修改IP地址");
	})

	//创建网卡绑定
	.on ('click', '#setBindModal .btn-primary', function (ev) {
        var $modal = $('#setBindModal');
		var ethname = "";
		var selectd = $('.network_nodeinfo .net-content').find('.ntwselectd');
        for(var i = 0; i < selectd.length; ++i){
        	var name = trim ( $(selectd[i]).find('.nic-ntw').find('span').text() );
			if (ethname != "")
				ethname = ethname + ",";

			ethname += name;
        }
		var type = $("#bond_Type").val ();
		var ethip = $("#bond_Ip").val ();
		var mask = $("#bond_Mask").val ();
		var gateway = $("#bond_Gateway").val ();
		var nics = '';
		$modal.find('.form-net .table tbody input:checked').each(function(){
			nics += $(this).attr('name') + ',';
		});
		nics = nics.substring(0, nics.length - 1);

		if (!valifyIP(ethip)) {
			DisplayTips ( lang.network.ip_addr_input_error );
			return;
		}
		// if (!valifyIP(mask)) {
			// DisplayTips ("掩码输入错误");
			// return;
		// }
		if (isNaN(mask) || mask == '') {
			DisplayTips ( lang.network.mask_input_error );
			return;
		}
		if (mask < 0 || mask > 32) {
			DisplayTips ( lang.network.mask_input_error );
			return;
		}
		if (gateway != ''&& !valifyIP(gateway)) {
			DisplayTips ( lang.network.gateway_input_error );
			return;
		}
		if (nics == '') {
			DisplayTips ( lang.network.select_at_least_one_net_card );
			return;
		}
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');

		var parameter = {
			'host': host,
			'names': ethname,
			'bondmode': type,
			'ipaddr': ethip,
			'netmask': mask,
			'gateway': gateway,
			'nics': nics,
		};
		var mycallback = function (result){
            removeWaitMask();
            $modal.find('.modal-header').LoadData('hide');
            $modal.modal('hide');

			if (result == undefined)
				return;
			if (result.code == 200) {
				refresh ();
			} else {
				DisplayTips( lang.network.net_card_bind_fail + '(' + result.result + ')');
			}
		}
		$modal.find('.modal-header').LoadData('show');
        addWaitMask();
		DataModel['setBond'](parameter, mycallback, true, "网卡绑定");
	})
	//删除绑定
	.on ('click', '#cancel_bind_nic', function (ev) {
		$modal = $('#cancelBindModal');
		$modal.modal('show');
		var htm = '';
		var showBondList = function(result){
			bondinfo = result.result.netlist;
			var ahtm = '<table class="table" name="">';
			htm += ahtm;
			var j = 0;
			for(var i = 0 ; i < bondinfo.length; i++){
				if(bondinfo[i]['nictype'] == '0'){
					var htm2 = '<tr><td>' + bondinfo[i]['name'] + '</td><td>' +
						bondinfo[i]['ipaddr'] + '</td><td><input type="checkbox" name="' +
						bondinfo[i]['name'] + '"></td></tr>';
					htm += htm2;
					j++;
				}
			}
			if (j == 0) {
				htm += '<p>'+lang.network.no_deletable_binding+'</p>';
			}
			htm += '</table>';
			$modal.find('.modal-body').html(htm);
			$modal.find('.modal-body').LoadData('hide');
		}
		$modal.find('.modal-body').LoadData('show');
		DataModel['listNeedNetInfo'](netparameter, showBondList, true, '显示网卡');
	})
	.on ('click', '#cancelBindModal .btn-primary', function (ev) {
		$modal = $('#cancelBindModal');
		bondName = '';
		$modal.find('input:checked').each(function(){
			bondName += $(this).attr('name');
			bondName += ',';
		});
		if (bondName != null) {
			bondName = bondName.substring(0,bondName.length - 1);
		}
		if (bondName == '') {
			DisplayTips( lang.network.select_at_least_one_net_card );
			return;
		}
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');

		var delbondpara = {
		'host' : host,
		'name': bondName,
		};
		var delbondfun = function(result){
            removeWaitMask();
			$modal.find('.modal-body').LoadData('hide');
			$modal.modal('hide');
			if (result.code == 200) {
				DisplayTips( lang.network.del_binding_success );
				refresh ();
			} else if (result.code == 0) {
				DisplayTips('false');
			}
		}
		$modal.find('.modal-body').LoadData('show');
        addWaitMask();
		DataModel['cancelBond'](delbondpara, delbondfun, true, '删除绑定');
	})
	// .on ('click', '#cancel_bind_nic', function (ev) {
	// 	$ntw = $('.network_nodeinfo .net-content').find('.bound-network-mag');
	// 	var bondName = trim( $ntw.find('.nic-ntw').find('span').text() );
	// 	$('#cancelBindModal').data('bondName', bondName);
	// 	var showtip = "确定要取消绑定 " + bondName + " ?";
	// 	$("#cancelBindModal .modal-body p").html (showtip);
	// })
	// .on ('click', '#cancelBindModal .btn-danger', function (ev) {
	// 	$node = $('.fixed_nav_left .v-menu li.active');
 //        var $modal =  $('#cancelBindModal');
	// 	var host = $node.data('ip');
	// 	var name = $modal.data('bondName');
	// 	var parameter = {
	// 		'host': host,
	// 		'name': name,
	// 	};
	// 	var mycallback = function (result){
 //            $modal.find('.modal-header').LoadData('hide');
	// 		if (result == undefined)
	// 			return;
	// 		if (result.code == 200) {
	// 			refresh ();
	// 		} else {
	// 			DisplayTips("取消网卡绑定失败 (" + result.result + ")");
	// 		}
	// 	}
	// 	$modal.find('.modal-header').LoadData('show');
	// 	DataModel['cancelBond'](parameter, mycallback, true, "取消网卡绑定");
	// })
	// 设置默认网关
	.on ('click', '#setGateway', function (ev) {
		$this = $(this);
		$node = $('.fixed_nav_left .v-menu li.active');
        $modal = $('#setDefaultGateWayModal');
		var host = $node.data('ip');
		var name = trim( $this.closest('.network-mag').find('.nic-ntw').find('span').text() );
		$('#setDefaultGateWayModal').data('name', name);
		var parameter = {
			'host': host,
		};
		var mycallback = function (result){
            $modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				var dfg = result.result;
				var showtip = '<p>'+ lang.network.cur_default_gateway + dfg + ' .</p>';
					showtip += '<p>'+lang.network.sure_to_set  + name +  lang.network.as_default_gateway +'</p>'
				$modal.find('.modal-body').html (showtip);
			}
            else{
                DisplayTips(result.result);
            }
		}
        $modal.find('.modal-body').html('');
        $modal.find('.modal-header').LoadData('show');
		DataModel['dfgwdev'](parameter, mycallback, true, "");
		$('#setDefaultGateWayModal').modal('show');
	})
    // 设置默认网关
    .on('change','.gateway-select',function(){
        var gatewaySelected = $(this).val();
		gatewaySelected = gatewaySelected.split(':');
		var name = gatewaySelected[0];
		var ipaddr = gatewaySelected[1];
        $node = $('.fixed_nav_left .v-menu li.active');
        var host = $node.data('ip');
        var parameter = {
            'host': host,
            'name': name,
            'ipaddr': ipaddr
        };
        var mycallback = function (result){
            if (result == undefined)
                return;
            if (result.code == 200) {
                DisplayTips( lang.network.set_default_gateway_success );
            } else {
                //DisplayTips("默认网关设置失败 (" + result.result + ")");
                DisplayTips( lang.network.set_default_gateway_fail );
            }
        }
        DataModel['setdfgwdev'](parameter, mycallback, true, "设置默认网关");
    })
	.on ('click', '#setDefaultGateWayModal .btn-primary', function (ev) {
        $modal = $('#setDefaultGateWayModal');
		var name = $(this).closest('#setDefaultGateWayModal').data('name');
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
			'name': name,
		};
		var mycallback = function (result){
            removeWaitMask();
            $modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.network.set_default_gateway_success );
				$('#setDefaultGateWayModal').modal('toggle');
			} else {
				DisplayTips( lang.network.set_default_gateway_fail + '(' + result.result + ')');
			}
		}
		$modal.find('.modal-header').LoadData('show');
        addWaitMask();
		DataModel['setdfgwdev'](parameter, mycallback, true, "设置默认网关");
	})

  .on ('mouseover', '.bound-sub', function(ev){
    $(this).find('.delbondnic').removeClass('hidden');
    $(this).find('.monitor_sub').removeClass('hidden');
  })
  .on ('mouseleave', '.bound-sub', function(ev){
    $(this).find('.delbondnic').addClass('hidden');
    $(this).find('.monitor_sub').addClass('hidden');
  })

  /* ------------------- 网卡监控 ------------------- */
  .on ('click','.monitor_sub > span', function (ev) {

		var $node = $('.fixed_nav_left .v-menu li.active');
		var operate ;
		var host = $node.data('ip');
		var ismonitor = $(this).data('ismonitor') == 0 ? false : true;
    operate = ismonitor ? 'delete' : 'set';
		var netports = $(this).data('name');

		var parameter = {
			'ip':host,
			'netports' : netports,
			'manage' : operate,
		};
		var callback = function (result){
			if (result == undefined) {
				DisplayTips( lang.wizard.set_fail );
				return;
			}

			if (result.code == 200) {

				DisplayTips( lang.wizard.set_success );

        var $netMonitorPage = $('.js-network-mag.bound-sub');
        var color = operate == 'delete' ? '' : 'red';
        var ismonitor = operate == 'delete' ? 0 : 1;
        var tips = operate == 'delete' ? lang.network.set_net_card_monitor : lang.network.unset_net_card_monitor;

        $netMonitorPage.each(function () {
          if ( $(this).find('.nic-ntw > span').text() == netports ) {
            $(this).
              find('.other-action-ntw > .monitor_sub > span').
              css('color', color).
              data('ismonitor', ismonitor).
              attr('title', tips);
          }
        });

			}else{
				DisplayTips( lang.wizard.set_fail );
			}
		}
		DataModel['networkMonitor'](parameter, callback, true, '');
	} )

	//DNS设置
	.on ('keypress', '.dns-ntw-row .dns-ntw input', function (ev) {
		ev.stopPropagation();
		var keycode = ev.which;
		$this = $(this);
		var dnsstr = trim( $this.val() );
		if(dnsstr.substr(-1, 1) != ',') {
			dnsstr += ',';
		}
		var dnsarr = dnsstr.split(",");
		if(keycode == 13){
			var dns1 = dnsarr[0];
			var dns2 = dnsarr[1];
			if (dns1 != "") {
				if (!valifyIP(dns1)) {
					DisplayTips(lang.network.first_dns_error);
					return;
				}
			}
			if (dns2 != "") {
				if (!valifyIP(dns2)) {
					DisplayTips (lang.network.second_dns_error);
					return;
				}
			}
			$node = $('.fixed_nav_left .v-menu li.active');
			var host = $node.data('ip');

			var parameter = {
				'host': host,
				'dns1': dns1,
				'dns2': dns2,
			};
			var mycallback = function (result){
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips( lang.network.set_dns_success );
				}else if (result.code == 701) {
					DisplayTips( lang.cluster.user_no_root );
				}
				else {
					DisplayTips( lang.network.set_dns_fail + " (" + result.result + ")");
				}
			}

			DataModel['setDNS'](parameter, mycallback, true, lang.network.set_dns );
		}
	})
	//网络
	$(document).on ('mouseover', '.net-content .network-mag', netMouseover);
	$(document).on ('mouseout', '.net-content .network-mag', netMouseout);

	//
	function netMouseover (ev) {
		ev.stoppropagation;
		$this = $(this);
		$this.find('.other-action-ntw div.hidden').removeClass('hidden');
		//$this.find('.pic-ntw img').css('display', 'none');
		//$this.find('.pic-ntw input').css('display', 'inline-block');
	}

	function netMouseout (ev) {
		ev.stoppropagation;
		$this = $(this);
		$this.find('.other-action-ntw div').addClass('hidden');
		//$this.find('.pic-ntw img').css('display', 'inline-block');
		//$this.find('.pic-ntw input').css('display', 'none');
	}

	function netMouseover1 (ev) {
		ev.stoppropagation;
		$this = $(this);
		$this.find('.other-action-ntw div.hidden').removeClass('hidden');
		//$this.find('.pic-ntw img').css('display', 'none');
		//$this.find('.pic-ntw input').css('display', 'inline-block');
	}

	function netMouseout1 (ev) {
		ev.stoppropagation;
		$this = $(this);
		//$this.find('.pic-ntw img').css('display', 'none');
		//$this.find('.pic-ntw input').css('display', 'inline-block');
		$this.find('.other-action-ntw div').addClass('hidden');
	}
	//复选框被勾选时调用
	function selectInputSingle (el) {
		$content = el.closest('.net-content');
		$part = el.closest('.network-mag');

		if (el.prop('checked') == true) {
			//添加pink 、user-mag-pink类，移除user-mag
			$part.removeClass('js-network-mag').addClass('ntwselectd');
			$part.find('div').addClass('pink');
			$part.find('.other-action-ntw div.hidden').removeClass('hidden');
			//解除mouseout的绑定事件
			$(document).off('mouseout', '.net-content .network-mag', netMouseout);
			$(document).on('mouseout', '.net-content .network-mag', netMouseover);

			$content.find('.network-mag .pic-part img').css('display', 'none');
			$content.find('.network-mag .pic-part input').css('display', 'inline-block');
			//重新添加绑定的mouseout事件
			$(document).on('mouseout', '.net-content .js-network-mag', netMouseout1);
			//2、若点击大于等于两个的待绑定网卡，则绑定按钮出现
			if ( el.closest('.network-mag.tobebind').length > 0 ) {
				++tobebindLen;
			}
			if (tobebindLen >= 2) {
				$('#bind_nic').css('display', 'inline-block');
			}
		} else{
			//取消勾选，变换成之前的
			//如果页面上一个被勾选的都没有，此时重置密码和删除图标才消失，否则就出现
			var len = ( $content.find('.network-mag').length - $content.find('.js-network-mag').length ) - 1;
			if (len < 1) {
				// tobebindLen = 0;
				// bLen = 0;
				//移除userMouseout1这个事件，并重新绑定
				$(document).off('mouseout', '.net-content .network-mag', netMouseout1);
				$(document).on('mouseout', '.net-content .network-mag', netMouseout);
				$content.find('.network-mag .pic-ntw img').css('display', 'inline-block');
				$content.find('.network-mag .pic-ntw input').css('display', 'none');
				el.closest('.basic_content_list').siblings('.net-content').find('.network-mag .is-select-all input').prop('checked', false);
			}
			//一旦勾选取消，立刻移除pink类
			el.closest('.network-mag').addClass('js-network-mag').removeClass('ntwselectd');
			el.closest('.network-mag').find('div').removeClass('pink');
			$part.find('.other-action-ntw>div').addClass('hidden');
			//2、若点击大于等于两个的待绑定网卡，则绑定按钮出现
			if ( el.closest('.network-mag.tobebind').length > 0 ) {
				--tobebindLen;
			}
			if (tobebindLen < 2) {
				$('#bind_nic').css('display', 'none');
			}
		}

        //控制取消绑定图标出现
        bLen = el.closest('.ntwselectd.bound-network-mag').length;
            if(bLen == 1){
                $('#cancel_bind_nic').css('display', 'inline-block');
            }
            else{
                $('#cancel_bind_nic').css('display', 'none');
            }
	}

	//移入到网络信息的设备号上，显示相关的信息
	function mouseoverNet ($el, $part, $popver) {
		$part.siblings().removeClass('net-mouseover');
		$part.removeClass('net-mouseover').addClass('net-mouseover');

		var len = $el.closest('.network-mag.bound-sub').length;
		if ( len > 0 ) {
			$('#js-popver-ntw .js-ntw-gateway').hide();
			$('#js-popver-ntw .js-ntw-bondmode').hide();
		}

		var gateway = $el.data('gateway');
		var mac = $el.data('hwaddr');
		var bondmode = $el.data('bondmode');
		var curspeed = $el.data('speed') / 1000;
		curspeed = curspeed > 1 ? (curspeed + 'GB') : ( $el.data('speed') + 'MB');
		var maxspeed = $el.data('maxspeed') / 1000;
		maxspeed = maxspeed > 1 ? (maxspeed + 'GB') : ( $el.data('maxspeed') + 'MB');
		var link = getNetLinkStatus ( $el.data('link') );


		$('#js-popver-ntw .js-ntw-gateway').text(gateway);
		$('#js-popver-ntw .js-ntw-mac').text(mac);
		$('#js-popver-ntw .js-ntw-bondmode').text(bondmode);
		$('#js-popver-ntw .js-ntw-cur-speed').text(curspeed );
		$('#js-popver-ntw .js-ntw-max-speed').text(maxspeed);
		//$('#js-popver-ntw .js-ntw-speed').text(curspeed + '/' + maxspeed);
		$('#js-popver-ntw .js-ntw-link').text(link);

		popverPosition($popver, $el);
	}

	// 网卡连接状态转换
	function getNetLinkStatus ($status) {
		switch($status)
		{
			case 0:
				return lang.network.connection;
				break;
			case 1:
				return lang.network.disconnected;
				break;
			default:
				return lang.network.unknown ;
				break;
		};
	}
})
