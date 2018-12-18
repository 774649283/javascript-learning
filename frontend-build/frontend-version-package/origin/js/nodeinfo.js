$('.alert-message').hide();
$(function (argument) {
	var host = $('.node-nav-sub-left li.active').data('ip');
	var parameter = {
		'host': host,
	};
	var serPara = {
		'ip': host
	};
	var Shutdownstatus = 0;

	//加载基本信息
	var basicData = '';
	var basiccallback = function (result){
		$(".basic_nodeinfo").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var data = result.result;
			var name = data.hostname;
			var cpu = data.cpu;
			if (cpu == undefined || cpu == '') {
				cpu = '--';
			}
			var ram = formatCapacityKB(data.memory.total);
			var used,
				rate,
				total;
			if ( data.sysdev != '' ) {
				used = formatCapacity(data.sysdev.usedsize);
				rate = data.sysdev.usedpercent;
				rate = rate.toFixed(2);
				total = formatCapacity(data.sysdev.capacity);
			} else{
				used = 0;
				rate = 0;
				total = 0;
			}

			// $('.machine_name_value input').val(name);
			$('.machine_name_value span').text(name);
			$('.cpu_name_value span').text(cpu);
			$('.ram_name_value span').text(ram);
			$('.system_disk_value span').text(data.sysdev.sysdev);
			$('.system_space_value .system_space_used').text(used);
			$('.system_space_value .system_space_total').text(total);
			$('.system_space_value .utilization_rate').text(rate+'%');
		} else {
			$('.cpu_name_value span').text('--');
			$('.ram_name_value span').text('--');
			$('.system_disk_value span').text('--');
			$('.system_space_value .system_space_used').text(0);
			$('.system_space_value .system_space_total').text(0);
			$('.system_space_value .utilization_rate').text(0 + '%');
		}
	}

	if (host) {
		$(".basic_nodeinfo").LoadData ("show");
		DataModel['listBasic'](parameter, basiccallback, true, '');
	}

	//加载关机与启动
	// var offOnData = '';
	// var runcallback = function (result){
	// 	$(".off_on_nodeinfo").LoadData ("hide");
	// 	if (result == undefined)
	// 		return;
	// 	if (result.code == 200) {
	// 		// showRun (result);
	// 		var data = result.result;
	// 		$('.off_on_contrnt .start_time').text(data.boottime);
	// 		$('.off_on_contrnt .runtime').text((data.runtime/3600/24).toFixed(2) + lang.per_day);
	// 		$('.grid').masonry({
	// 		  itemSelector: '.grid-item',
	// 		  columnWidth: '.col-lg-6',
	// 		  percentPosition: true
	// 		})
	// 	}
	// }
  //
	// if (host) {
	// 	$(".off_on_nodeinfo").LoadData ("show");
	// 	DataModel['listRun'](parameter, runcallback, true, '');
	// }

	//加载时钟设置
	var clockData = '';
	$nodecon = $('.clock_nodeinfo');
	var clockcallback = function (result){
		$nodecon.LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			// showRun (result);
			var data = result.result;
			var timezone,ntpserver,time;
			timezone = data['timezone'];
			ntpserver = data['ntpserver'];
			time = data['time'];
			//$nodecon.find('.ntp_name_row').find('.ntp_name_value span').text(ntpserver);
			$nodecon.find('#js-sys-time').val(time);
			$nodecon.find('.timezone_clock').find('span').text(timezone['timezone'] + timezone['offset'] );
			$daylightrow = $nodecon.find('.js-daylight-row');
			if ( timezone['daylight'] != 0 ) {
				$daylightrow.removeClass('hidden');
				$daylightrow.find('.daylight_clock span').text(timezone['dstname']);
			} else{
				$daylightrow.addClass('hidden');
			}
			var citycallback = function (res) {
				$nodecon.LoadData ("hide");
				if (res == undefined)
					return;
				if (res.code == 200) {
					var htm = "";
					var citylist = res.result.citylist;

					if ( timezone['currentcity'] == '') {
						htm += '<option value=""></option>';
					} else if ( timezone['currentcity'] != '"Asia/Shanghai"') {
						htm += '<option value="Asia/Shanghai">Asia/Shanghai</option>';
					}
					for (var i = 0; i < citylist.length; i++) {
						if ( timezone['currentcity'] == citylist[i]['city'] ) {
							htm += '<option value="'+ citylist[i]['city'] +'" selected>' + citylist[i]['city'] + '</option>';
						} else {
							htm += '<option value="'+ citylist[i]['city'] +'">' + citylist[i]['city'] + '</option>';
						}
					};
					$nodecon.find('#mac_city').html(htm);
				} else {
					DisplayTips(lang.node.list_city_info_fail);
				}
			}
			if(host){
				$nodecon.LoadData ("show");
				DataModel['listAllCity'](parameter, citycallback, true, '');
			}

			$('.grid').masonry({
			  itemSelector: '.grid-item',
			  columnWidth: '.col-lg-6',
			  percentPosition: true
			})
		}
	}
	if (host) {
		$nodecon.LoadData ("show");
		DataModel['listClock'](parameter, clockcallback, true, '');
	}
    //加载时钟角色
    $nodecon.find('.ntp_name_value span').text('loading...');

    var charaCallback = function (result){
        if (result == undefined)
            return;
        if (result.code == 600) {
        	$nodecon.find('.ntp_name_value span').text('');
        }
        else if (result.code == 200){
            $nodecon.find('.ntp_name_value span').text(result.result);
        }
        else{
            //DisplayTips(lang.cluster.get_node_character_fail);
            $nodecon.find('.ntp_name_value span').text(lang.cluster.get_node_character_fail);
        }
    }
	if (host) {
    // var parameter = {
    //   'host': host,
    // };
    // 使用心跳节点
    DataModel['listNode'](null, function (result) {
      var chaPara = JSON.parse(JSON.stringify(parameter));
      if (result.code == 200) {
        var nodes = result.result.nodes || [];
        nodes.forEach(function (node) {
          if (node.ip == chaPara.host) {
            chaPara.host = node.hbeatip;
          }
        });
      }

      DataModel['getCharacter'](chaPara, charaCallback, true, '');
    }, true, null);
	}

	//加载服务列表
	var serCallback = function (result) {
		$(".servlist_nodeinfo").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var preset = {
				1: lang.node.enable,
				2: lang.node.disable,
				3: lang.node.unknown
			}
			var status = {
				1: lang.running,
				2: lang.stopped,
				3: lang.fail,
				4: lang.unknown
			}
			var pcolor = {
				1: 'green',
				2: 'black',
				3: 'gray'
			}
			var scolor = {
				1: 'green',
				2: 'black',
				3: 'red',
				4: 'gray'
			}
			var html = '';
			var data = result.result[0].service;

			for (var i = 0; i < data.length; i++) {
        if (data[i].name === 'api') continue;
				html += '<tr data-service="' + data[i].name + '" data-status="' + data[i].status +'">' +
					'<td>' + data[i].name + '</td>' +
					'<td style="color:' + pcolor[data[i].preset] + '">' + preset[data[i].preset] + '</td>' +
					'<td style="color:' + scolor[data[i].status] + '">' + status[data[i].status] + '</td>' +
					( data[i].type !== 1 ?

					'<td class="servCtrl hidden"><a href="javascript:;" style="color:#595959;"' +
					( data[i].status === 1 ?
					'title='+ lang.cluster.stop_service +' class="nodeStopService"><span class="glyphicon glyphicon-pause">' :
					'title='+ lang.cluster.start_service +' class="nodeStartService"><span class="glyphicon glyphicon-play">' ) +
					'</span></a></td>' :

						'<td style="cursor:not-allowed"></td>' ) +
					'</tr>';
			}
			$('.servlist_nodeinfo #nodeServiceTable tbody').html(html);

			//添加折叠功能
			// $('.servlist_nodeinfo').addFold(300, function () {
			// 	$('.grid').masonry({
			// 		itemSelector: '.grid-item',
			// 		columnWidth: '.col-lg-6',
			// 		percentPosition: true
			// 	});
			// });
		}
		else {
			DisplayTips( lang.node.load_service_list_fail );
		}

		$('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.col-lg-6',
			percentPosition: true
		})
	}
	if (host) {
		$(".servlist_nodeinfo").LoadData ("show");
		DataModel['listServices'](serPara, serCallback, true, '');
	}


	autoHeight();
	$(document)
	.delegate ('.fixed_nav_left ul>li.sub-menu', 'click', function (ev) {
		// when clicked, shows info with this
		$this = $(this);
		$this.closest('ul.v-menu').find('li.active').removeClass('active');
		$this.addClass('active');
		var node = $this.data('ip');
		var myurl = parseURL (window.location.href);
		if (node == myurl.params.node) {
			return;
		}
		myurl.params.node = node;
		window.location = "?" + jQuery.param(myurl.params);
	})
	//.delegate ('.machine_name_row', 'mouseover', '.remove_mach_value', focusInputTextMouseOver)
	//.delegate ('.machine_name_row', 'mouseout', '.remove_mach_value', focusInputTextMouseOut)
	// .delegate ('.ntp_name_row', 'mouseover', '.remove_ntp_name', focusInputTextMouseOver)
	// .delegate ('.ntp_name_row', 'mouseout', '.remove_ntp_name', focusInputTextMouseOut)
	.delegate ('.dns-ntw-row', 'mouseover', '.remove-dns-value', focusInputTextMouseOver)
	.delegate ('.dns-ntw-row', 'mouseout', '.remove-dns-value', focusInputTextMouseOut)
	.delegate ('.remove_mach_value', 'click', function (ev) {
		//
		$this = $(this);
		$input = $this.siblings('.machine_name_value').find('input');
		$input.val('');
	})
	.delegate ('.remove_ntp_name', 'click', function (ev) {
		//
		$this = $(this);
		$input = $this.siblings('.ntp_name_value').find('input');
		$input.val('');
	})
	.delegate ('.remove-dns-value', 'click', function (ev) {
		//
		$this = $(this);
		$input = $this.siblings('.dns-ntw').find('input');
		$input.val('');
	})
	//添加节点
	.delegate ('#addNodeModal .btn-primary', 'click', function (ev) {
		$header = $('#addNodeModal .modal-header');
		var node = trim( $('#add_aNewSip').val() );
		var str = node.split(",");
		var iparr = [];
		if (node == '') {
			DisplayTips (lang.node.ip_is_null);
			return;
		}
		//1、判断输入的ip地址是否正确，若有一个不对，就提示错误
		for (var i = 0; i < str.length; i++) {
			iparr.push(str[i]);
			if ( !valifyIP (str[i]) ) {
				DisplayTips (str[i] + " " + lang.node.ip_is_error);
				return false;
			}
		}
		//2、判断当前节点是否已经存在
		var parameter = {
			'node': node
		};
		var checkPara = {
			'ips': node
		};

		//检查节点可添加性
		var callback = function (result) {
			if (!result) {
				return;
			}
			if (result.code === 200) {
				var data = result.result;
				for (var i = 0; i < data.length; i++) {
					if (data[i].result === 0) {
						$header.LoadData('hide');
						DisplayTips(lang.node.please_check_nodes_status);
						return;
					}
				}
				DataModel["addNode"](parameter, dncallback, true, lang.node.add_node);
			} else {
				DisplayTips(lang.node.cannot_get_nodes_status);
				$header.LoadData('hide');
			}
		}

		$header.LoadData('show');
		DataModel['checkNodes'](checkPara, callback, true, null);

		var dncallback = function (result){
			$header.LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				var html = '';
				DisplayTips (lang.node.add_node_success);
				for (var i = 0; i < iparr.length; i++) {
					html += '<li class="sub-menu" data-ip="'+ iparr[i] +'">'+
				        		'<a href="javascript:void(0);" style="float:left;">' +
				        			'<span class="glyphicon glyphicon-hdd"></span>' +
				        			'<span>' + iparr[i] + '</span>' +
				        			// '<div id="del_single_node" class="hidden" data-toggle="modal" data-target="#deleteNodeModal">' +
			        				// '<span class="glyphicon glyphicon-trash"></span>'+
			        				// '</div>'+
				        		'</a>'+
			        		'</li>';
				};
				autoHeight();
				$('.fixed_nav_left .v-menu li:last').before(html);
				autoHeight();
				setTimeout("refresh()", 1000);
			} else {
				DisplayTips(lang.node.add_node_fail + '(' + result.result + ')' );
			}
			$('#addNodeModal').modal('hide');
		}
	})

	//设置焦点
	.on('shown.bs.modal','#addNodeModal',function(ev){
		$('#add_aNewSip').focus();
	})

	//取消消除之前输入的数据
	.on('click', '#addNodeModal .btn-default', function(ev) {
		$('#addNodeModal #add_aNewSip').val('');
	} )

	.delegate ( '#deleteNodeModal .btn-danger', 'click', function (ev) {
		$this = $(this);
		$modal = $('#deleteNodeModal');
		// $node = $('.fixed_nav_left .v-menu li.active');
		// var node = $node.data('ip');
		var node = $modal.data('node');
		var parameter = {
			'node': node,
		};
		var dncallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips (lang.node.del_node_success);
				autoHeight();
				$('li.sub-menu.liactive').remove();
				autoHeight();
				refresh();
			}else {
				DisplayTips(lang.node.del_node_fail + result.result );
			}
			$('#deleteNodeModal').modal('hide');
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel["delNode"](parameter, dncallback, true, lang.node.del_node);
	} )
	//设置时间
	.delegate ( '#js-sys-time', 'click', function (ev) {
		WdatePicker({
			dateFmt:'MM/dd/yy HH:mm:ss',
			isShowClear:false,
			onpicked:function (dp){
				var time = dp.cal.getDateStr();
				var year = dp.cal.getP('y');
				var mon = dp.cal.getP('M');
				var day = dp.cal.getP('d');
				var hour = dp.cal.getP('H');
				var min = dp.cal.getP('m');
				var sec = dp.cal.getP('s');
				var dest = $(".fixed_nav_left .v-menu li.active").data ("ip");
				var parameter = {
					'node': dest,
					'year': year,
					'mon': mon,
					'day': day,
					'hour': hour,
					'minute': min,
					'second': sec
				};
				var mycallback = function (result){
					if (result == undefined) {
						$("#js-sys-time").val($("#js-sys-time").attr("val"));
						return;
					}
					if (result.code == 200) {
            isInit = false;
						DisplayTips( lang.node.set_time_success );
						$("#js-sys-time").attr ("val", mon+"/"+day+"/"+year+ ' ' + hour + ":" + min + ":" +sec);
					} else if (result.code == 602) {
						DisplayTips(result.result);
					} else {
            if (isInit) {
              isInit = false;
              DataModel['setTime'](parameter, mycallback, true, lang.node.set_time);
            }else {
              DisplayTips(lang.node.set_time_fail + '(' + result.result + ')' );
              $("#js-sys-time").val($("#js-sys-time").attr("val"));
            }

					}
				}

        var isInit = true;
				DataModel['setTime'](parameter, mycallback, true, lang.node.set_time);

        setTimeout(function () {
          if (isInit) {
            DataModel['setTime'](parameter, mycallback, true, lang.node.set_time);
          }
        }, 2e3);
			}
		})
	} )
	//修改机器名
	.delegate ('.machine_name_value input', 'keypress', function (ev) {
		ev.stopPropagation();
		var keycode = ev.which;
		$this = $(this);
		if(keycode == 13){
			//按下enter键，就保存机器名
			var newname = trim ( $this.val() );
			if ( newname == '' ) {
				DisplayTips(lang.node.input_machine_name);
				return false;
			}
			var node = $('.fixed_nav_left li.active').data('ip');
			var parameter = {
				'node': node,
				'name': newname
			};
			var dncallback = function (result){
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips (lang.node.edit_hostname_success);
					$('.machine_name_value input').text(newname);
				}else {
					DisplayTips(lang.node.edit_hostname_fail);
				}
			}
			DataModel["editHostName"](parameter, dncallback, true, lang.node.edit_hostname);
		}
	})
	//设置NTP服务器名
	.delegate ('.ntp_name_value input', 'keypress', function (ev) {
		event.stopPropagation();
		var keycode = event.which;
		$this = $(this);
		if(keycode == 13){
			//按下enter键，就保存NTP服务器名
			var ntpservername = trim ( $this.val() );
			var node = $('.fixed_nav_left li.active').data('ip');
			var parameter = {
				'node': node,
				'ntpserver': ntpservername
			};
			var dncallback = function (result){
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips (lang.node.set_ntpsername_success);
					$this.text(ntpservername);
				}else {
					DisplayTips(lang.node.set_ntpsername_fail + '（' +  result.result + '）' );
				}
			}
			DataModel["setNTPName"](parameter, dncallback, true, lang.node.set_ntpsername);
		}
	})
	//修改城市
	.delegate ( '#mac_city', 'change', function (ev) {
		var city = $("#mac_city").val ();
		var node = $('.fixed_nav_left li.active').data('ip');
		var parameter = {
			'node': node,
			'city': city
		};
		var mycallback = function (result){
			$('.clock_nodeinfo').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				var data = result.result;
				DisplayTips( lang.node.set_city_success);
				var clockpara = {
					'host': node
				};
				var clockcallback = function (result) {
					$('.clock_nodeinfo').LoadData('hide');
					if (result == undefined)
						return;
					if (result.code == 200) {
						var data = result.result;
						var timezone = data['timezone'];
						$('.clock_nodeinfo').find('.timezone_clock').find('span').text(timezone['timezone'] + timezone['offset'] );
						if ( timezone['daylight'] != 0 ) {
							$daylightrow.removeClass('hidden');
							$daylightrow.find('.daylight_clock span').text(timezone['dstname']);
						} else{
							$daylightrow.addClass('hidden');
						}
						$('.grid').masonry({
							itemSelector: '.grid-item',
						  	columnWidth: '.col-lg-6',
						  	percentPosition: true
						})
					} else {
						DisplayTips(lang.node.update_timezone_fail);
					}
				}
				$('.clock_nodeinfo').LoadData('show');
				DataModel['listClock'](clockpara, clockcallback, true, '');

			} else {
				DisplayTips( lang.node.set_city_fail);
			}
		}
		$('.clock_nodeinfo').LoadData('show');
		DataModel['setCity'](parameter, mycallback, true, lang.node.set_city);
	} )
    //时钟信息
    // .on('mouseover','.clock_nodeinfo .ntp_character_row',function(ev){
    //     $(this).find('.js-clock-info').removeClass('hidden');
    // })
    // .on('mouseout','.clock_nodeinfo .ntp_character_row',function(ev){
    //     $(this).find('.js-clock-info').addClass('hidden');
    // })
    .on('click','.clock_nodeinfo .nodeinfo-do',function(ev){
        $modal = $('#nodeClockInfoModal');
        var htm = '';
        var callback = function(result){
        $modal.find('#srcInfo').LoadData('hide');
            if (result == undefined)
                return;
            if(result.code == 200){
                for(var i = 0;result.result[0][i];i++){
                    htm += '<li>' + result.result[0][i] + '</li>';
                }
                $modal.find('#srcInfo').html(htm);
            }else if(result.code == 701){
				DisplayTips(lang.cluster.user_no_root );
			}
            else{
                DisplayTips(lang.cluster.get_clock_source_fail + '(' + result.result + ')');
                htm = '<li style="color: red;">' + lang.cluster.get_clock_source_fail + '</li>';
                $modal.find('#srcInfo').html(htm);
            }
        }
        $modal.find('#srcInfo').LoadData('show');
        DataModel['listNodeSource'](parameter, callback, true, '');
    })
    //同步时钟源
    .on('click','#nodeClockInfoModal .btn-primary',function(ev){
        $modal = $('#nodeClockInfoModal');
        var serveraddr = trim($modal.find('#inputClockSource').val());
				if (serveraddr === '') {
					serveraddr = trim($modal.find('#srcInfo li:eq(0)').text());
					if (!isIpAddr(serveraddr) && !valifyDomain(serveraddr)) {
            DisplayTips(lang.cluster.get_clock_source_fail);
						return;
					}
				}
        if (!isIpAddr(serveraddr) && !valifyDomain(serveraddr)) {
            DisplayTips(lang.cluster.confirm_ip_format);
            return;
        }
        var adPara = {
            'host': host,
            'serveraddr': serveraddr
        }
        var callback = function(result){
            $modal.find('#srcInfo').LoadData('hide');
            if(result == undefined)
                return;
            if(result.code == 200){
                DisplayTips(lang.cluster.adjust_clock_source_success);
            }
            else{
                DisplayTips(lang.cluster.adjust_clock_source_fail);
            }
            $modal.modal('hide');
        }

        $modal.find('#srcInfo').LoadData('show');
        DataModel['adjustClock'](adPara, callback, true, '');
    })
    //时钟初始化
    .on('click','#nodeClockInfoModal .btn-info',function(ev){
        $modal = $('#nodeClockInfoModal');
        var callback = function(result){
            $modal.find('#srcInfo').LoadData('hide');
            if(result == undefined)
                return;
            if(result.code == 200){
                DisplayTips(lang.cluster.init_node_clock_success);
            }
            else{
                DisplayTips(lang.cluster.init_node_clock_fail);
            }
            $modal.modal('hide');
        }
        $modal.find('#srcInfo').LoadData('show');
        DataModel['initNodeClock'](parameter, callback, true, '');
    })


	//启动停止节点服务
	.on('mouseover', '.servlist_nodeinfo #nodeServiceTable tr', function (ev) {
		$(this).find('.servCtrl').removeClass('hidden');
	})
	.on('mouseout', '.servlist_nodeinfo #nodeServiceTable tr', function (ev) {
		$(this).find('.servCtrl').addClass('hidden');
	})
	.on('click', '.servlist_nodeinfo .nodeStartService', function (ev) {
		var serviceName = $(this).closest('tr').data('service');
		$('#startNodeServiceModal').data('service', serviceName)
			.modal('show')
			.find('.serviceName')
			.text(serviceName);
	})
	.on('click', '.servlist_nodeinfo .nodeStopService', function (ev) {
		var serviceName = $(this).closest('tr').data('service');
		$('#stopNodeServiceModal').data('service', serviceName)
			.modal('show')
			.find('.serviceName')
			.text(serviceName);
	})
	.on('click', '#startNodeServiceModal .btn-primary', function (ev) {
		$modal = $('#startNodeServiceModal');
		var para = {
			'ip': host,
			'service': $modal.data('service')
		};
		var callback = function (result) {
			$modal.find('.modal-header').LoadData('hide');
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DisplayTips( lang.node.start_service_success );
				setTimeout(function() {
					refresh();
				}, 3e3);
			} else {
				DisplayTips( lang.node.start_service_fail );
				$modal.modal('hide');
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel['startServices'](para, callback, true, '');
	})
	.on('click', '#stopNodeServiceModal .btn-primary', function (ev) {
		$modal = $('#stopNodeServiceModal');
		var para = {
			'ip': host,
			'service': $modal.data('service')
		};
		var callback = function (result) {
			$modal.find('.modal-header').LoadData('hide');
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DisplayTips( lang.node.stop_service_success );
				setTimeout(function() {
					refresh();
				}, 3e3);
			} else {
				DisplayTips( lang.node.stop_service_fail );
        $modal.modal('hide');
        if (para.service === 'api') {
          setTimeout(function() {
  					refresh();
  				}, 2e3);
        }
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel['stopServices'](para, callback, true, '');
	})
	//重置当前节点
	.on('mouseover', '.basic_nodeinfo', function (ev) {
		$(this).find('.nodeinfo-do').removeClass('hidden');
	})
	.on('mouseout', '.basic_nodeinfo', function (ev) {
		$(this).find('.nodeinfo-do').addClass('hidden');
	})
	.on('click', '#nodeResetModal .btn-danger', function (ev) {
		$modal = $('#nodeResetModal');
		var step = ['resetConf', 'resetCluster', 'resetConfAdmin', 'resetIdisk', 'resetSysdb'];
		var confirmText = trim($('#nodeResetConfirm').val()).toLowerCase();

		if ($('.node-nav-sub-left li.active').length === 0) {
			DisplayTips( lang.node.no_node_in_cluster );
			$modal.modal('hide');
			return;
		}
		if (confirmText !== 'confirm') {
			DisplayTips(lang.cluster.confirm_input_confirm);
			return;
		}

		var para = {
			'ip': host
		};
		var callback1 = function (result) {
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DataModel[step[1]](para, callback2, true, '');
			} else {
				DisplayTips( lang.node.reset_node_fail + '1');
				$modal.find('.modal-header').LoadData('hide');
			}
		}
		var callback2 = function (result) {
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DataModel[step[2]](para, callback3, true, '');
			} else {
				DisplayTips( lang.node.reset_node_fail + '2');
				$modal.find('.modal-header').LoadData('hide');
			}
		}
		var callback3 = function (result) {
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DataModel[step[3]](para, callback4, true, '');
			} else {
				DisplayTips( lang.node.reset_node_fail + '3');
				$modal.find('.modal-header').LoadData('hide');
			}
		}
		var callback4 = function (result) {
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DataModel[step[4]](para, callback5, true, '');
			} else {
				DisplayTips( lang.node.reset_node_fail + '4');
				$modal.find('.modal-header').LoadData('hide');
			}
		}
		var callback5 = function (result) {
			$modal.find('.modal-header').LoadData('hide');
			if (!result) {
				return;
			}
			if (result.code === 200) {
				DisplayTips( lang.node.reset_node_success );
				setTimeout(function() {
					refresh();
				}, 3e3);
			} else {
				DisplayTips( lang.node.reset_node_fail + '5');
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel[step[0]](para, callback1, true, '');
	});

	//自适应高度
	function autoHeight (ev) {
		var h1 = $('.fixed_nav_left').height();
		var h2 = $('.fixed_nav_left .v-menu').height();
		if ( h1*0.9 < h2 ) {
			$('.fixed_nav_left .v-menu').css('height', '90%');
		} else{
			$('.fixed_nav_left .v-menu').css('height', 'auto');
		};
	}

    //判断IP地址格式
    function isIpAddr(str){
        return (str.match(/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/g) !== null);
    }

})
//基本信息、网络信息、时钟设置中需要聚焦到文本框最后一个字符的后面  移出
function focusInputTextMouseOut (ev) {
	$this = $(this);
	$this.find(ev.data).addClass('hidden');
	$this.find('input').focusEnd();
}

//移入时聚焦
function focusInputTextMouseOver (ev) {
	$this = $(this);
	$this.find(ev.data).removeClass('hidden');
	$this.find('input').focusEnd();
}

//新建分区按钮显示
$(document)
  .on('mouseover', '.js-masonry>div', function (ev) {
      $(this).find('.nodeinfo-do').removeClass('hidden');
  })
  .on('mouseout', '.js-masonry>div', function (ev) {
     $(this).find('.nodeinfo-do').addClass('hidden');
  })
