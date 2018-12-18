$(function (ev) {
	var undefined;
	var diskData = '';
    var timer = null;
    var left = null;
    var top = null;
	var smartPosition = 'right';
	function diskStatus (status)
	{
		switch(status)
		{
			case -1:
				return "";
			case 0:
				return lang.disk.avail;
			case 1:
				return lang.disk.online;
			case 2:
				return lang.disk.offline;
			case 3:
				return lang.disk.rebuild;
			case 4:
				return lang.disk.hot_standby;
			case 5:
				return lang.disk.damage;
			case 6:
				return lang.disk.loss;
			default:
				return lang.disk.unknown;
		};
	}

	// 加载磁盘信息
	var node = $('.node-nav-sub-left li.active').data('ip');
	var parameter = {
		'node': node,
	};
	var mdscallback = function (result){
		$(".disk_nodeinfo").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			showDiskList (result);
			$('.grid').masonry({
			  itemSelector: '.grid-item',
			  columnWidth: '.col-lg-6',
			  percentPosition: true
			})
		}
	}
	if(node){
		$(".disk_nodeinfo").LoadData ("show");
		DataModel['diskList'](parameter, mdscallback, true, "");
	}

	var gdiskID = "";

	//磁盘
	$(document)
	.delegate ('.disk-mag', 'mouseover', function (ev) {
		$this = $(this);
		$this.find('.other-act-disk div.hidden').removeClass('hidden');
	})
	.delegate ('.disk-mag', 'mouseout', function (ev) {
		$this = $(this);
		$this.find('.other-act-disk div').addClass('hidden');
	})
	//磁盘
	.delegate ('.disk_nodeinfo', 'mouseover', function (ev) {
		$this = $(this);
		$this.find('.c_basic_right').removeClass('hidden');
	})
	.delegate ('.disk_nodeinfo', 'mouseout', function (ev) {
		$this = $(this);
		$this.find('.c_basic_right').addClass('hidden');
	})
	//以下四个移入移出事件用来处理，鼠标可以移到显示磁盘详情的popver框上
	.delegate('.disk-content .disk-mag .name-disk', 'mouseover', function (ev) {
		$this = $(this);
		clearInterval( timer );
		$disk = $this.closest('.disk-mag');
		$popver = $('#js-popver-disk');
		mouseoverDiskName($this, $disk, $popver);
	})
	.delegate('#js-popver-disk', 'mouseover', function (ev) {
		clearInterval( timer );
		$disk = $('.disk-content .disk-mag.disk-mouseover');
		$el = $disk.find('.name-disk');
		$popver = $('#js-popver-disk');
		mouseoverDiskName($el, $disk, $popver);
	})
	.delegate('.disk-content .disk-mag .name-disk', 'mouseout', function (ev) {
        $this = $(this);
		$popver = $('#js-popver-disk');
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(popverOut($popver), 300);
	})
	.delegate ('#js-popver-disk', 'mouseout', function (ev) {
		$popver = $('#js-popver-disk');
        popverOut($popver);
	})
	.delegate ('.disk-content .disk-mag .smart-disk', 'mouseover', function (ev) {
		var $this = $(this);

		//判断#smart该弹出的位置
		smartPosition = $(this).offset().left > 900 ? 'left' : 'right';

		$(this).closest('.disk-mag').siblings().removeClass('disk-mouseover');
		$this.closest('.disk-mag').removeClass('disk-mouseover').addClass('disk-mouseover');
		var id = $this.find('.smartdetail').data ("id");
		clearInterval( timer );
		popverMouseover (id, $this);
		$popver = $('#smart');
		popverPosition($popver, $this, smartPosition);
	})
	.delegate ('#smart','mouseover', function (ev) {
		var $this = $(this);
		var id = $this.data ("id");
		clearInterval( timer );
		popverMouseover (id, $this);
		$popver = $this;
		$el = $('.disk-content').find('.disk-mag.disk-mouseover .smart-disk');
		popverPosition($popver, $el, smartPosition);
	} )
	.delegate('.disk-content .disk-mag .smart-disk', 'mouseout', function (ev) {
		if(timer){
            clearTimeout(timer);
        }
    	$popver = $('#smart');
        timer = setTimeout(popverOut($popver), 300);
	})
	.delegate('#smart', 'mouseout', function (ev) {
		$popver = $('#smart');
		popverOut($popver);
	})
	.delegate ('.disk_location','click', function (ev) {
		var $this = $(this).parent().parent();
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var operate ='';
		if($this.attr('class')=='other-act-disk1'){
			operate='stop';
		}else if($this.attr('class')=='other-act-disk'){
			operate='start';
		}
		var sn = $this.data ("serial");
		var parameter = {
			'host':host,
			'sn' : sn,
			'operate' : operate,
		};
		var callback = function (result){
			if (result == undefined) {
				DisplayTips( lang.wizard.set_fail );
				return;
			}
			if (result.code == 200) {
				if($this.attr('class')=='other-act-disk1'){
					DisplayTips( lang.disk.disk_location_stop_success );
				}else if($this.attr('class')=='other-act-disk'){
				DisplayTips( lang.wizard.set_success );
				}
				refresh();
			}else{
				DisplayTips( lang.wizard.set_fail );
			}
		}
		DataModel['setLocation'](parameter, callback, true, '');
	} )
	// .delegate ('#rescanGlobalDiskModal .btn-primary', 'click', function (ev) {
	// 	$modal = $('#rescanGlobalDiskModal');
	// 	$node = $('.fixed_nav_left .v-menu li.active');
	// 	var host = $node.data('ip');
	// 	var parameter = {
	// 		'host': host,
	// 	};
	// 	var mdscallback = function (result){
	// 		$modal.find('.modal-header').LoadData ("hide");
	// 		if (result == undefined)
	// 			return;
	// 		if (result.code == 200) {
	// 			refresh ();
	// 			//showDiskList (result);
	// 			$modal.modal('hide');
	// 			DisplayTips( lang.node.rescan_global_disk_success );
	// 		}
	// 	}
	// 	$modal.find('.modal-header').LoadData ("show");
	// 	DataModel['diskRescan'](parameter, mdscallback, true, lang.disk_rescan);
	// })
	//刷新磁盘信息缓存
	.on('click', '#refreshDiskCacheModal .btn-primary', function (ev) {
		$modal = $('#refreshDiskCacheModal');
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
		};
		var callback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (!result)
				return;
			if (result.code == 200) {
				DisplayTips( lang.node.refresh_disk_cache_success );
				$modal.modal('hide');
				setTimeout(function() {
					refresh();
				}, 2000);
			}
			else {
				DisplayTips( lang.node.refresh_disk_cache_fail );
			}
		}
		$modal.find('.modal-header').LoadData ('show');
		DataModel['refreshCache'](parameter, callback, true, lang.disk_rescan);
	})
	//删除磁盘信息缓存
	.on('click', '#cleanDiskCacheModal .btn-primary', function (ev) {
		$modal = $('#cleanDiskCacheModal');
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
		};
		var callback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (!result)
				return;
			if (result.code == 200) {
				DisplayTips( lang.node.clean_disk_cache_success );
				$modal.modal('hide');
				setTimeout(function() {
					refresh();
				}, 2000);
			}
			else {
				DisplayTips( lang.node.clean_disk_cache_fail );
			}
		}
		$modal.find('.modal-header').LoadData ('show');
		DataModel['cleanCache'](parameter, callback, true, lang.disk_rescan);
	});
	// 跳转SMART信息的
	function adjustSMART() {
		var tdws = new Array()
		$(".dt_dtable_body table tbody tr:first td").each (function (){
			var tdw = $(this).width ();
			tdws[tdws.length] = tdw+10;
		});

		// 有滚动条时菜单偏右
		var obj=$(".dt_dtable_body");
		if (obj != undefined) {
			if(obj.scrollHeight>obj.clientHeight||obj.offsetHeight-4>obj.clientHeight){
				$(".dt_dtable_head").css ("padding-right", "25px");
			}else {
				$(".dt_dtable_head").css ("padding-right", "9px");
			}
		}
		if (tdws.length != 0) {
			var i = 0;
			$(".dt_dtable_head table thead tr:first th").each (function (){
				$(this).width (tdws[i]);
				++i;
			});
		}
	}

	//自定义的相关函数
	function showDiskList (result) {
		diskData = result.result.disklist;
		var data = result.result.disklist;
		var html = '';
		for (var i = 0; i < data.length; i++) {
			html += '<div class="disk-mag">' +
						'<div class="col-lg-3 basic-lg-3 ellipsis left name-disk" data-serial="' + data[i]['sn'] + '" data-dpath="' + data[i]['path'] + '" data-box="' + data[i]['enclosure'] + '" data-sloat="' + data[i]['slot'] + '" data-type="' + data[i]['type'] + '" data-interface="'+ data[i]["interface"] +'">'+
							'<span>'+ 'disk' + data[i]['id'] + '</span>'+
				      	'</div>'+
						'<div class="col-lg-3 basic-lg-3 capacity-disk" style="cursor:pointer;">'+
							'<span>'+ formatCapacityMB(data[i]['capacity']) + '</span>'+
						'</div>'+
						'<div class="col-lg-3 basic-lg-3 smart-disk" style="">'+
							'<a href="javascript:;">';
							if (data[i]['health'] == 1) {
								html +='<span class="smartdetail" data-id="'+ data[i]['id'] +'" data-smart="'+ data[i]['smart_type'] +'" style="color:green;">' + lang.disk.normal + '</span>';
							} else if(data[i]['health'] == 2){
								// html +='<span style="color:red;">' + lang.disk.alarm +'</span>';
								html +='<span class="smartdetail" data-id="'+ data[i]['id'] +'" data-smart="'+ data[i]['smart_type'] +'" style="color:orange;">' + lang.disk.alarm + '</span>';
							}else if (data[i]['health'] == 3) {
                // html +='<span style="color:red;">' + lang.disk.error +'</span>';
                html +='<span class="smartdetail" data-id="'+ data[i]['id'] +'" data-smart="'+ data[i]['smart_type'] +'" style="color:red;">' + lang.disk.error + '</span>';
							}
							else if (data[i]['health'] == 4) {
								html +='<span style="color:red;">' + lang.disk.offline +'</span>';
							}
			html += '</a>'+
				'</div>'
			if (data[i]['led_status'] == 1) {
				html +='<div class="other-act-disk1" style="width: 10%" data-serial="' + data[i]['sn'] + '">'+
					'<div>' +
					'<a href="javscript:;" class="disk_location" title="' + lang.disk.disk_location + '">' +
					'<span class="glyphicon glyphicon-map-marker" style="color: red;"></span>' +
					'</a>' +
					'</div>'+
					'</div>'
			}else if(data[i]['led_status'] == 0) {
				html +='<div class="other-act-disk" style="width: 10%" data-serial="' + data[i]['sn'] + '">'+
					'<div class="hidden">' +
					'<a href="javscript:;" class="disk_location" title="' + lang.disk.disk_location + '">' +
					'<span class="glyphicon glyphicon-map-marker"></span>' +
					'</a>' +
					'</div>'+
					'</div>'
			}
			html +='</div>';
		};
		$('.disk_nodeinfo .disk-content').html(html);
	}
	//移到磁盘健康状态上，显示smart详情的popver框
	function popverMouseover (id, el) {
		function showSMART () {
			var name = "disk"+id;
			$('#smart').data('id', id);
			$("#smart .popover-title").html (name + " S.M.A.R.T." + lang.disk.information);
			var html ="<tr><th>"+lang.disk.check_property+"</th><th>"+lang.disk.current_value+"</th>"+
			"<th>"+lang.disk.historical_value+"</th><th>"+lang.disk.valve_value+"</th>"+
			"<th>"+lang.disk.key_value+"</th></tr>";
			var htm = "";
			var list = [];
			for (var m = 0; m < diskData.length; ++m) {
				if ( diskData[m]["id"] == id ) {
					list = diskData[m]["smart"];
				}
			}
			if (list != undefined) {
				for (var k = 0; k < list.length; ++k) {
					if ( list[k]["failed"] !== 'no' )
						htm += "<tr style='color:red;'><td>";
					else
						htm += "<tr><td>";
					htm += list[k]["attribute_name"];
					htm += "</td><td>";
					htm += list[k]["value"];
					htm += "　</td><td>";
					htm += list[k]["worst"];
					htm += "　</td><td>";
					htm += list[k]["threshold"];
					htm += "　</td><td>";
					if (list[k]["key"] == 'yes')
						htm += lang.disk.critical;
					else if (list[k]["key"] == 'no')
						htm += lang.disk.normal;
					else
						htm += "-";
					htm += "　</td></tr>";
				}
			}
			$("#smart .dt_dtable_head table thead").html (html);
			$("#smart .dt_dtable_body table tbody").html (htm);
		}
		function showSMART1 () {
			var name = "disk"+id;
			$('#smart').data('id', id);
			$("#smart .popover-title").html (name + " S.M.A.R.T." + lang.disk.information);
			var html ="<tr><th>"+lang.disk.check_property+"</th><th>"+lang.disk.current_value+"</th></tr>";
			var htm = "";
			var list = [];
			for (var m = 0; m < diskData.length; ++m) {
				if ( diskData[m]["id"] == id ) {
					list = diskData[m]["smart"];
				}
			}
			htm += "<tr><td>";
			htm += "Less_Segment_Number";
			htm += "</td><td>";
			htm += list[0]["number_of_read_and_write_commands_whose_size_less_than_segment_size"];
			htm += "</td></tr><tr><td>";
			htm += "Blocks_From_Initiator";
			htm += "</td><td>";
			htm += list[0]["blocks_received_from_initiator"];
			htm += "</td></tr><tr><td>";
			htm += "Current_Drive_Temperature";
			htm += "</td><td>";
			htm += list[0]["current_drive_temperature"];
			htm += "</td></tr><tr><td>";
			htm += "LCC_Accumulated";
			htm += "</td><td>";
			htm += list[0]["accumulated_load_unload_cycles"];
			htm += "</td></tr><tr><td>";
			htm += "Cache_Blocks_To_Initiator";
			htm += "</td><td>";
			htm += list[0]["blocks_read_from_cache_and_sent_to_initiator"];
			htm += "</td></tr><tr><td>";
			htm += "Greater_Segment_Number";
			htm += "</td><td>";
			htm += list[0]["number_of_read_and_write_commands_whose_size_more_than_segment_size"];
			htm += "</td></tr><tr><td>";
			htm += "SCC_Accumulated";
			htm += "</td><td>";
			htm += list[0]["accumulated_start_stop_cycles"];
			htm += "</td></tr><tr><td>";
			htm += "Grown_Defect_List";
			htm += "</td><td>";
			htm += list[0]["elements_in_grown_defect_list"];
			htm += "</td></tr><tr><td>";
			htm += "Blocks_To_Initiator";
			htm += "</td><td>";
			htm += list[0]["blocks_sent_to_initiator"];
			htm += "</td></tr><tr><td>";
			htm += "Specified_LC_Over_Device_Lifetime";
			htm += "</td><td>";
			htm += list[0]["specified_load_unload_count_over_device_lifetime"];
			htm += "</td></tr><tr><td>";
			htm += "Hours_Powered_Up";
			htm += "</td><td>";
			htm += list[0]["number_of_hours_powered_up"];
			htm += "</td></tr><tr><td>";
			htm += "Minutes_Until_Next_Test";
			htm += "</td><td>";
			htm += list[0]["number_of_minutes_until_next_internal_SMART_test"];
			htm += "</td></tr><tr><td>";
			htm += "Drive_Trip_Temperature";
			htm += "</td><td>";
			htm += list[0]["drive_trip_temperature"];
			htm += "</td></tr><tr><td>";
			htm += "Specified_CC_Over_Device_Lifetime";
			htm += "</td><td>";
			htm += list[0]["specified_cycle_count_over_device_lifetime"];
			htm += "</td></tr>";
			$("#smart .dt_dtable_head table thead").html (html);
			$("#smart .dt_dtable_body table tbody").html (htm);
		}
		if ( gdiskID != id ) {
			if(el.find('.smartdetail').data('smart') == 2 || el.find('.dt_dtable_head th').length == 2){
				showSMART1 ()
			}else{
				showSMART ()
			}
			$("#smart").css ("display", "inline-block");
			gdiskID = id;
			adjustSMART ();
		}else {
			var temp= $("#smart").is(":hidden");
			if (temp) {
				if(el.find('.smartdetail').data('smart') == 2 || el.find('.dt_dtable_head th').length == 2 ){
					showSMART1 ()
				}else{
					showSMART ()
				}
				$("#smart").css ("display", "inline-block");
				adjustSMART ();
			}else {
				$("#smart").css ("display", "none");
			}
		}
	}

	//移入到磁盘名上，显示相关的信息
	function mouseoverDiskName ($el, $disk, $popver) {
		$disk.siblings().removeClass('disk-mouseover');
		$disk.removeClass('disk-mouseover').addClass('disk-mouseover');
		var serial = $el.data('serial');
		var dpath = $el.data('dpath');
		var box = $el.data('box');
		var sloat = $el.data('sloat');
		var interfa = $el.data('interface');
		var type = $el.data('type');

		$('#js-popver-disk .js-disk-serial').text(serial);
		$('#js-popver-disk .js-disk-devicepath').text(dpath);
		$('#js-popver-disk .js-disk-box').text(box);
		$('#js-popver-disk .js-disk-sloat').text(sloat);
		$('#js-popver-disk .js-disk-interface').text(interfa);
		$('#js-popver-disk .js-disk-type').text(type);
		popverPosition($popver, $el);
	}
})
