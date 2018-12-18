$(function (ev) {
	var diskLoaded = 'no';
	var timer = null;
	$('.grid').masonry({
		itemSelector: '.grid-item',
		columnWidth: '.col-lg-6',
		percentPosition: true,
	});
	var progressPara = {
		//'tag' : 'disk.add'
	};

	//加载disklist的js:
	var scallback = function (result){
		$('.dt_g_right_subdiv_second').LoadData('hide');
		if (result == undefined)
			return;
		if (result.code == 200) {
			if (result.result == '') {
				htm = '<div class="no-record-parent"><span class="no-record" style="color:#ccc;">'+lang.no_record+'</span></div>';
				$('.dt_g_right_subdiv_second').find('.bs-docs-grid').html(htm);
			} else{
				//$('.dt_g_right_subdiv_second').find('.bs-docs-grid').html(result.result);
				//加载硬盘
				var data = result.result;
				var str = '';
				for(var i=0,len=data.length;i<len;i++){
					var str2 = '';
					var data2 = data[i]['disklist'];
					str += '<div class="col-xs-12 col-md-5 col-lg-6  box-shadow grid-item grid-item-style diskmgm-info" data-hostname="'+ data[i]['hostname'] +'" data-ip="'+ data[i]['ip'] +'" style="position: absolute; left: 0%; top: 0px;">'
						+ '<div class="basic_header">'
						+ '<img src="css/image/info3.png" style="width:42px;">'
						+ '<span>'+ data[i]['hostname'] +'</span>'
						+ '<a class="fl-rt js-add-disk-info hidden" href="javascript:;" title="'+ lang.disk.create_disk +'">'
						+ '<img src="css/image/plus.png" style="width:43px" class="test">'
						+ '</a>'
						+ '</div>'
						+ '<div class="basic_content">'
						+ '<div class="basic_content_list">'
						+ '<div class="basic_cont_row">'
						+ '<div class="col-lg-1 basic-lg-1 inlineblock">'
						+ '<span>ID</span>'
						+ '</div>'
						+ '<div class="col-lg-3 basic-lg-2 inlineblock ellipsis"><span title="'+ lang.disk.disk_name +'">'+ lang.disk.disk_name+ '</span></div>'
						+ '<div class="col-lg-2 basic-lg-2 inlineblock ellipsis"><span title="'+ lang.cluster.status +'">'+ lang.cluster.status +'</span></div>'
						+ '<div class="col-lg-3 basic-lg-3 inlineblock ellipsis"><span title="'+ lang.statis.avail_space +'">'+ lang.statis.avail_space +'</span></div>'
						+ '<div class="col-lg-2 basic-lg-3 inlineblock ellipsis"><span title="'+ lang.statis.total_space +'">'+ lang.statis.total_space +'</span></div>'
						+ '<div class="col-lg-1 basic-lg-1 inlineblock"></div>'
						+ '</div>';
					for(var j=0,len2=data2.length;j<len2;j++){
						var device = data2[j]['usage']['device'].slice(5);
						var device2 = data2[j]['usage']['device'].slice(5);
						var statstr = '';
						var size = formatCapacityKB(data2[j]['usage']['available']);
						var allsize = formatCapacityKB(data2[j]['usage']['size']);
						if(data2[j]['status'] == 'up'){
							statstr = '<div class="col-lg-2 basic-lg-2 inlineblock"><span style="color:green;">'+ lang.disk.normal +'</span></div>';
						}else{
							statstr = '<div class="col-lg-2 basic-lg-2 inlineblock"><span style="color:red;">'+ lang.disk.abnormal +'</span></div>';
						}

						str2 +='<div class="basic_cont_row js-diskmgm-row" data-devname="'+ device +'" data-id="'+ data2[j]['id'] +'">'
							+ '<div class="col-lg-1 basic-lg-1 inlineblock"><span>'+ data2[j]['id'] +'</span></div>'
							+ '<div class="col-lg-3 basic-lg-2 inlineblock js-device-name"><span>'+ device2 +'</span></div>'
							+ statstr
							+ '<div class="col-lg-3 basic-lg-3 inlineblock"><span>'+ size +'</span></div>'
							+ '<div class="col-lg-2 basic-lg-3 inlineblock"><span>'+ allsize +'</span></div>'
							+ '<div class="col-lg-1 basic-lg-1 inlineblock diskrow-do" style="height:30px;">'
							+ '<a href="javascript:;" class="js-del-disk-single hidden" title="'+ lang.disk.del_disck +'">'
							+ '<span class="glyphicon glyphicon-trash" style="width:50%;"></span>'
							+ '</a>'
							+ '<a href="javascript:;" class="js-refresh-disk-single hidden" title="'+ lang.disk.ref_disk +'">'
							+ '<span class="glyphicon glyphicon-refresh" style="width:50%;"></span>'
							+ '</a>'
							+ '</div>'
							+ '</div>';
					}

					str += str2 + '</div></div></div>';
				}
				var html = '<div class="row show-grid grid js-masonry">' + str + '</div>';
				$('.dt_g_right_subdiv_second').find('.bs-docs-grid').html(html);
				//end
				$('.grid').masonry({
					itemSelector: '.grid-item',
					columnWidth: '.col-lg-6',
					percentPosition: true,
				});
				for(var i=0;i<$('.diskmgm-info').length;i++){
					var disknum = $('.diskmgm-info:eq('+ i+')');
					var rowlength = disknum.find('.js-diskmgm-row').length;
					disknum.find('.disk-total').html(rowlength);
				}
			}
		}
	}
	$('.dt_g_right_subdiv_second').LoadData('show');
	DataModel['listAllDisk'](null, scallback, true, null);

	//应对首屏时页面卡片重叠的bug
	var masonryTimer = setInterval(function () {
		if ($('.grid-item').length === 0) {
			return;
		} else {
			$('.grid').masonry({
				itemSelector: '.grid-item',
				columnWidth: '.col-lg-6',
				percentPosition: true,
			});
			//执行一次退出
			clearInterval(masonryTimer);
		}
	}, 0.8e3);

	var progresscallback = function (result){
		if (result == undefined)
			return;
		if (result.code == 200) {
			data = result.result;
			if (data.last == 100 && data.current == 100) {
				clearInterval(timer);
				var allClass = $('#overflowProgress').attr('class');
				var judgeValue = allClass.indexOf('hide');
				if (judgeValue == -1) {
					$('#overflowProgress .js-progress-bar').attr('aria-valuenow', 100);
					$('#overflowProgress .js-progress-bar').css('width', '100%');
					$('#overflowProgress .js-progress-bar').find('span').text('100%');
					DisplayTips(lang.cluster.add_osd_disk_success);
					setTimeout(function (ev) {
						$('#overflowProgress').addClass('hide');
						$('.progressInfo').addClass('hide');
						refresh();
					}, 3 * 1000);
				} else {
					$('#overflowProgress').addClass('hide');
					$('.progressInfo').addClass('hide');
				}
			} else {
				$('#overflowProgress').removeClass('hide');
				$('.progressInfo').removeClass('hide');
				$('#overflowProgress .js-progress-bar').attr('aria-valuenow', data.current);
				$('#overflowProgress .js-progress-bar').css('width', data.current + '%');
				$('#overflowProgress .js-progress-bar').find('span').text(data.current + '%');
			}
		}else {
			return;
		}
	}
	DataModel['showAddDiskProgress'](null, progresscallback, true, null);

	timer = setInterval( function(){
			DataModel['showAddDiskProgress'](null, progresscallback, true, null);
	} , 15*1000 );

	//setInterval( function(){
	//	var allClass = $('#overflowProgress').attr('class');
	//	var judgeValue = allClass.indexOf('hide');
	//	//judgeValue == -1 说明hide类不存在，即页面有进度条显示，应该继续访问后台获取进度条
	//	if (judgeValue == -1) {
	//		DataModel['showAddDiskProgress'](progressPara, progresscallback, true, null);
	//	} else{
	//		$('#overflowProgress').addClass('hide');
	//		$('.progressInfo').addClass('hide');
	//	}
	//} , 3*1000 );

	$(document)
	.on ('mouseover', '.diskmgm-info', function (ev) {
		$this = $(this);
		$this.find('.js-add-disk-info').removeClass('hidden');
		$this.find('.js-del-disk-info').removeClass('hidden');
	})
	.on ('mouseout', '.diskmgm-info', function (ev) {
		$this = $(this);
		$this.find('.js-add-disk-info').addClass('hidden');
		$this.find('.js-del-disk-info').addClass('hidden');
	})
	.on( 'click', '#create-new-osddisk', function (ev) {
		$modal = $('#addNewOsdDiskModal');
		var callback = function (result) {
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				var nodeData, diskData, hostnames="";
				nodeData = result.result.nodes;

				for (var i = 0; i < nodeData.length; i++) {
					hostnames += nodeData[i]['ip'] + ',';
				};
				hostnames = hostnames.substring(0, hostnames.length-1);
				var osdpara = {
					'hostnames': hostnames,
				};
				var osdcallback = function (result) {
					$modal.find('.modal-header').LoadData ("hide");
					if (result == undefined) {
						return;
					} else if (result.code == 200) {
						diskData = result.result;
						// sortDiskInfo(diskData);
						var htm = "";
						for (var i = 0; i < diskData.length; i++) {
							htm += '<tr class="js-node" data-ip="'+ diskData[i]['ip'] +'" data-name="'+ diskData[i]['hostname'] +'">' +
	                  					'<td class="left" style="width:60%;">' +
	                    					'<a href="javascript:;" class="js-plus-subdisks" data-ip="'+ diskData[i]['ip'] +'" data-name="'+ diskData[i]['hostname'] +'">'+
	                      						'<span class="glyphicon glyphicon-plus-sign"></span>'+
	                    					'</a>'+
	                    					'<a href="javascript:;" class="js-minus-subdisks hidden" data-ip="'+ diskData[i]['ip'] +'">'+
	                      						'<span class="glyphicon glyphicon-minus-sign">'+
	                      						'</span>'+
	                    					'</a>'+
	                    					'<span>'+ diskData[i]['hostname'] +'</span>' +
	                    					'<span>' + '（'+ diskData[i]['ip'] +'）' + '</span>' +
	                  					'</td>' +
					                  	'<td style="width:40%;">'+
					                    	'<input type="checkbox" class="sub-check-disk"/>'+
					                  	'</td>'+
				                   '</tr>';
				            htm += 	'<tr class="subdisks hidden" data-ip="'+ diskData[i]['ip'] +'" data-host="'+ diskData[i]['hostname'] +'">'+
					                	'<td colspan="2" style="padding:0;">'+
					                    	'<table class="table table-condensed table-hover" style="margin-left:11px;">'+
					                      		'<tbody>';
					             		var availdisks = diskData[i]['diskinfo']['available'];
					             		if (availdisks == undefined) {
					             			DisplayTips( lang.node.node + diskData[i]['hostname'] + lang.cluster.load_disk_fail );
					             		}else{
					             			if ( availdisks.length > 0 ) {
						             			for (var j = 0; j < availdisks.length; j++) {
						             				// (availdisks[j]['type'] == 0)?(availdisks[j]['type']='hdd'):(availdisks[j]['type']='ssd');
						             				htm += 	'<tr class="js-disk" data-disk="'+ availdisks[j]['devicename'] +'">' +
	                          									'<td class="showleftborder" style="width:58%;">' +
	                            									'<div class="showcenterline" style="width:15px;float:left;">'+ '</div>' +
	                            									'<span style="float:left;">' + availdisks[j]['devicename'] + '(' + availdisks[j]['size']  + ', ' + availdisks[j]['type'].toUpperCase() + ')' + '</span>' +
	                          									'</td>'+
	                          									'<td style="width:42%;">' +
	                            									'<input type="checkbox" class="sub-check-disk">' +
	                          									'</td>' +
	                        								'</tr>';
						             			}
					             			}
					             		}

						       	htm += 		'</tbody>'+
					                    '</table>'+
					                  '</td>'+
					                '</tr>';
						};
						$('table.add-osddisk-body').find('tbody').html(htm);
					} else {
						DisplayTips(lang.cluster.list_avail_disks_add_fail);
					}
				}
				DataModel['listDiskDetails'](osdpara, osdcallback, true, null);
			} else {
				DisplayTips(lang.cluster.list_avail_disks_add_fail);
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['listNode'](null, callback, true, null);
		$('table.add-osddisk-body').find('tbody').html('');
		$modal.modal('show');
	})
	.on ( 'click', '#addNewOsdDiskModal .btn-primary', function (ev){
		$modal = $('#addNewOsdDiskModal');
		$disknodeinputs = $modal.find('.js-node');
		var result = addDiskInfo( $disknodeinputs );
		var hostList = result.htm;
		$modal2 = $('#confirmAddDiskModel');
		$modal2.modal('show');
		$modal2.find('.modal-body').html(hostList);
		$modal.modal('hide');
	})
	.on ('click', '#confirmAddDiskModel .btn-info', function(ev){
		$modal2 = $('#confirmAddDiskModel');
		$modal = $('#addNewOsdDiskModal');
		$disknodeinputs = $modal.find('.js-node');
		var htm = "";
		var result = addDiskInfo( $disknodeinputs );
		var hostList = result.arr;
		if ( hostList.length == 0 ) {
			DisplayTips( lang.disk.select_add_disks );
			return false;
		}
		var diskhostname = "";
		for (var i = 0; i < hostList.length; i++) {
			diskhostname += hostList[i][2] + ':' + hostList[i][1] + ';';
		}
		diskhostname = diskhostname.substring(0 ,diskhostname.length-1);
		var diskpara = {
			'diskListStr': diskhostname,
		};
		var diskCallback = function (result){
			$modal2.find('.modal-body').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				clearInterval( timer );
				setTimeout(function() {
					setInterval(function() {
				DataModel['showAddDiskProgress'](null, progresscallback, true, null);
					}, 5e3);
				}, 10e3);
			} else {
				DisplayTips( lang.cluster.add_osd_disk_fail + '(' + result.result + ')' );
			}
		}

		$modal2.find('.modal-body').LoadData('show');
		$('#overflowProgress').removeClass('hide');
		$('.progressInfo').removeClass('hide');
		$modal2.modal('hide');
		DataModel['addDisksWizard'](diskpara, diskCallback, true, '');
	})
	// .on ( 'click', '#addNewOsdDiskModal .btn-primary', function (ev) {
	// 	$modal = $('#addNewOsdDiskModal');
	// 	$disknodeinputs = $modal.find('.js-node');
	// 	var htm = "";
	// 	var result = addDiskInfo( $disknodeinputs );
	// 	var hostList = result.arr;
	// 	if ( hostList.length == 0 ) {
	// 		DisplayTips( lang.disk.select_add_disks );
	// 		return false;
	// 	}
	// 	var diskhostname = "";
	// 	for (var i = 0; i < hostList.length; i++) {
	// 		diskhostname += hostList[i][2] + ':' + hostList[i][1] + ';';
	// 	}
	// 	diskhostname = diskhostname.substring(0 ,diskhostname.length-1);
	// 	var diskpara = {
	// 		'diskListStr': diskhostname,
	// 	};
	// 	var diskCallback = function (result){
	// 		$modal.find('.modal-body').LoadData('hide');
	// 		if (result == undefined)
	// 			return;
	// 		if (result.code == 200) {
	// 			setTimeout( refresh(), 3*1000 );
	// 			DisplayTips(lang.cluster.add_osd_disk_success);
	// 		} else {
	// 			DisplayTips( lang.cluster.add_osd_disk_fail + '(' + result.result + ')' );
	// 		}
	// 	}
	// 	$modal.find('.modal-body').LoadData('show');
	// 	DataModel['addDisksWizard'](diskpara, diskCallback, true, '');
	// })
	.on ( 'click', '.js-sel-all', function (ev) {
	    //全选按钮被选，执行两件事情
	    //1、所有的checkbox被选中
	    $this = $(this);
	    var $inputs = $(this).closest('table').siblings().find('.add-osddisk-body').find('tr td .sub-check-disk');
	    if ($(this).prop('checked') == true) {
	        $inputs.each(function (i) {
	            $(this).prop("checked", true);
	        })
	    } else {
	        $inputs.each(function (i) {
	            $(this).prop("checked", false);
	        })
	    }
	})
	.on ('click', '.js-add-disk-info', function (ev) {
		$modal = $('#addNewDiskModal');
		$diskinfo = $(this).closest('.diskmgm-info');
		$diskinfo.siblings('.diskmgm-info').removeClass('adding');
		$diskinfo.addClass('adding');
		$('#newdiskname').html('');

		var hostname = $diskinfo.data('hostname');
		var $disklist = $diskinfo.find('.basic_content_list').find('.js-diskmgm-row');
		var arr = [];
		for (var i = 0; i < $disklist.length; i++) {
			arr.push($($disklist[i]).data('devname'));
		};
		var para = {
			'hostnames': hostname,
		}
		var diskCallback = function (result){
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined)
				return;
			if (result.code == 200) {
				var data = result.result;
                // sortDiskInfo(data);
				var avail = data[0]['diskinfo']['available'];
				var htm = '';
				for (var i = 0; i < avail.length; i++) {
					htm += '<option>' + avail[i]['devicename'] + '</option>';
				};
				$('#newdiskname').html(htm);
			} else {
				DisplayTips(lang.cluster.load_disk_fail);
			}
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel['listDiskDetails'](para, diskCallback, true, null);
		$modal.modal('show');
		$modal.data('hostname', hostname);
	})
	.on ('click', '#addNewDiskModal .btn-primary', function (ev) {
		$modal = $('#addNewDiskModal');

		if ($modal.find('#newdiskname option').length < 1) {
			DisplayTips(lang.cluster.no_avail_disk_for_add);
			return false;
		}

		var disk = trim( $modal.find('#newdiskname').val() );
		var hostname = $modal.data('hostname');
		var diskListStr = hostname + ':' + disk;
		var para = {
			'diskListStr': diskListStr,
		};
		var callback = function (result) {
			$diskinfo = $('.diskmgm-info.adding');
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				$modal.find('.modal-header').LoadData ("hide");
				$('#overflowProgress').removeClass('hide');
				$('.progressInfo').removeClass('hide');
				clearInterval( timer );
				setTimeout(function() {
					setInterval(function() {
						DataModel['showAddDiskProgress'](null, progresscallback, true, null);
					}, 5e3);
				}, 10e3);
			} else {
				DisplayTips(lang.cluster.new_disk_fail);
			}
			$diskinfo.removeClass('adding');
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['newDisk'](para, callback, true, lang.cluster.new_disk);
	})
	.on ('click', '#addNewDiskModal .btn-default', function (ev) {
		$('.diskmgm-info.adding').removeClass('adding');
	})
	.on('mouseover', '.js-diskmgm-row', function (ev) {
		$(this).find('.js-del-disk-single').removeClass('hidden');
		$(this).find('.js-refresh-disk-single').removeClass('hidden');
	})
	.on('mouseout', '.js-diskmgm-row', function (ev) {
		$(this).find('.js-del-disk-single').addClass('hidden');
		$(this).find('.js-refresh-disk-single').addClass('hidden');
	})
	.on('click', '.js-del-disk-single', function (ev) {
		$this = $(this);
		$this.closest('.basic_content_list').find('.js-diskmgm-row').removeClass('removing');
		$this.closest('.js-diskmgm-row').addClass('removing');
		var devname = $this.closest('.js-diskmgm-row').data('devname');
		var id = $this.closest('.js-diskmgm-row').data('id');
		$('#delDiskModel p').html(lang.cluster.sureto_del_devname + '<span style="color:red;">' + ' ' + devname + ' ' + '</span>' + lang.cluster.disk_device + '?');
		$('#delDiskModel').modal('show');
		$('#delDiskModel').data('devname', devname);
		$('#delDiskModel').data('id', id);
	})
	.on ('click', '#delDiskModel .btn-danger', function (ev) {
		$modal = $('#delDiskModel');
		var id = $modal.data('id');
		var para = {
			'osdNums': id,
		};
		var callback = function (result) {
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined) {
				$('.js-diskmgm-row.removing').removeClass('removing');
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.del_disk_success);
				$('.js-diskmgm-row.removing').remove();
				$(function (ev) {
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.col-lg-6',
						percentPosition: true,
					});
				})
			} else {
				DisplayTips(result.result || lang.cluster.del_disk_fail);
				$('.js-diskmgm-row.removing').removeClass('removing');
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel['delDisk'](para, callback, true, lang.cluster.del_disk);
	})
	.on ('click', '#delDiskModel .btn-default', function (ev) {
		$('.js-diskmgm-row.removing').removeClass('removing');
	})
	//刷新磁盘
	.on('click', '.js-refresh-disk-single', function (ev) {
		$this = $(this);
		$this.closest('.js-diskmgm-row');
		var devname = $this.closest('.js-diskmgm-row').data('devname');
		var id = $this.closest('.js-diskmgm-row').data('id');
		var ip = $this.closest('.diskmgm-info').data('ip');
		$('#refreshDiskModel p').html(lang.node.sure_fresh_disk + '<span>' + ' ' + devname + ' ' + '</span> ?');
		$('#refreshDiskModel').data('ip', ip);
		$('#refreshDiskModel').data('id', id);
		$('#refreshDiskModel').modal('show');
	})
	.on ('click', '#refreshDiskModel .btn-primary', function (ev) {
		$modal = $('#refreshDiskModel');
		var id = $modal.data('id');
		var ip = $modal.data('ip');
		var para = {
			'ipaddr': ip,
			'id': id,
		};
		var callback = function (result) {
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				DisplayTips( lang.node.refresh_disk_success );
			} else {
				DisplayTips( lang.node.refresh_disk_fail );
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel['refreshDiskInfo'](para, callback, true, null);
	});
})
