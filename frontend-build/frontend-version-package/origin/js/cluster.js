$(function (ev) {
	var nodeLoaded = 'no'; //用来存储是否加载可用节点的信息
	var nodeListData = ""; //存储节点
	var nodeIpList = [];
	var mastersNode = '';
	var ipNode = '';

	//加载存储节点相关信息
	var storageNodeCallback = function (result){
		$(".storage-node-con").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
            //var htm = '';
            //$('.bs-docs-grid').data('key', 'stroagenode');
            //htm += showNodeServerList (result);
		    //$('.storage-node-con .basic_content_list').html(htm);
			data = result.result;
			var htm ='';
			var key = $('.bs-docs-grid').data('key');
			htm += '<div class="basic_cont_row">' +
				'<div class="col-lg-6 basic-lg-6 inlineblock" style="padding: 0 !important;text-align: left !important;">'+
				'<span style="padding-left: 50px;">'+ lang.cluster.hostname +'</span>' +
				'</div>' +
				'<div class="col-lg-2 basic-lg-2 inlineblock left">' +
				'<span>' + lang.cluster.status +'</span>' +
				'</div>' +
				'<div class="col-lg-4 basic-lg-4 inlineblock">' +
				'</div>'+
				'</div>';
			for (var i = 0; i < data.length; i++) {
				htm += '<div class="basic_cont_row js-storage-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['status'] +'" data-ip="'+ data[i]['ip'] +'">';
				var hostname = "";
				hostname = data[i]['hostname'];
				htm +=     '<div class="col-lg-6 basic-lg-6 inlineblock" style="padding: 0 !important;text-align: left !important;">' +
					'<span style="padding-left: 50px;">' + hostname + '</span>'+
					'</div>'+
					'<div class="col-lg-2 basic-lg-2 inlineblock js-status left">';
				if (key == "nas") {
					var nstatus = data[i]['nstatus'];
					nstatus = getCnasNodeState (nstatus);
					if ( nstatus == 'normal' ) {
						htm += '<span style="color:green;">' + nstatus + '</span>' ;
					} else {
						htm += '<span style="color:red;">' + nstatus + '</span>' ;
					}
				} else{
					if ( data[i]['status'] == 1 ) {
						htm += '<span style="color:green;">' + lang.running + '</span>' ;
					} else {
						htm += '<span style="color:red;">' + lang.stopped + '</span>' ;
					}
				}
					htm += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
						'<a href="javascript:;" class="hidden js-start-storage-service" title="'+ lang.cluster.start_storage_service +'" style="margin-right:15px;">'+
						'</a>'+
						'<a href="javascript:;" class="hidden js-stop-storage-service" title="' + lang.cluster.stop_storage_service + '" style="margin-right:15px;">'+
						'</a>'+
						'<a href="javascript:;" class="hidden js-del-storage-service" title="' + lang.cluster.del_storage_service+ '">'+
						'</a>'+
						'</div>'+
						'</div>';
			}

			$('.storage-node-con .basic_content_list').html(htm);

		}
		$('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.col-lg-6',
			percentPosition: true
		});
	}
	$(".storage-node-con").LoadData ("show");
	DataModel['listStorageNode'](null, storageNodeCallback, true, null);

	//加载基础信息
	var basicInfoCallback = function (result){
		$(".basic-info").LoadData("hide");
		if (result == undefined) {
			return;
		}
		if (result.code == 200) {
			data = result.result;
			var htm ='';
			htm += '<div class="basic_cont_row">' +
	                '<div class="col-lg-6 basic-lg-6 inlineblock" style="padding: 0 !important;text-align: left !important;">'+
	                    '<span style="padding-left: 50px;">'+ lang.cluster.hostname +'</span>' +
	                '</div>' +
	                '<div class="col-lg-2 basic-lg-2 inlineblock left">' +
	                  '<span>' + lang.cluster.status +'</span>' +
	                '</div>' +
	                '<div class="col-lg-4 basic-lg-4 inlineblock">' +
	                '</div>'+
	            '</div>';
			$.each(data, function(index, nodeData) {
				if (nodeData[0] !== 'cluster') {
					htm +='<div class="cluster_content_row basic_cont_row" data-hostname="' + nodeData[0] + '">';
					htm += '<div class="col-lg-6 basic-lg-6 inlineblock" style="padding: 0 !important;text-align: left !important;"><span style="padding-left: 50px;">'+ nodeData[0] +'</span></div>';
					if (nodeData[1] == 'healthy') {
						htm += '<div class="col-lg-2 basic-lg-2 inlineblock nodeStatus left"><span style="color:green;" status="1">'+ lang.running +'</span></div>';
					}else{
						htm += '<div class="col-lg-2 basic-lg-2 inlineblock nodeStatus left"><span style="color:red;" status="0">'+ lang.disk.abnormal +'</span></div>';
					}
					htm += '<div class="col-lg-4 basic-lg-4 inlineblock" style="height：30px;"><a href="javascript:;" class="js-del-basic-node hidden"><span class="glyphicon glyphicon-trash"></span></a></div>';
					htm += '</div>';
				}
			});
			$('.basic-info .cluster_content').html(htm);
		}
		$('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.col-lg-6',
			percentPosition: true
		});

	}
	$(".basic-info").LoadData("show");
	DataModel['clusterNodeBasicInfo'](null, basicInfoCallback, true, null);

	//加载监控服务相关信息
	var monitorCallback = function (result){
		$(".monitor-service-con").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var htm = '';
			$('.bs-docs-grid').data('key', 'monitor');
			htm += showNodeServerList (result);
		    $('.monitor-service-con .basic_content_list').html(htm);
		}
		$('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.col-lg-6',
			percentPosition: true
		});
	}
	$(".monitor-service-con").LoadData ("show");
	DataModel['listMonitor'](null, monitorCallback, true, null);

	/* ------------------- 加载对象存储相关信息 ------------------- */
	var objCallback = function (result){
		$(".objstorage-service").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var htm = '';
			$('.bs-docs-grid').data('key', 'obj');
      // 添加接口未返回的额外的节点信息
      //    {
        //     "status": 1,
        //     "hostname": "node2",
        //     "addr": "10.0.20.148"
        // }
      function addObjExits(nodeArray) {

        return nodeArray;
      }

			htm += showNodeServerList ( addObjExits(result) );
			$('.objstorage-service .basic_content_list').html(htm);
		}
		$('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.col-lg-6',
			percentPosition: true
		});
	}
	$(".objstorage-service").LoadData ("show");
	DataModel['listObj'](null, objCallback, true, null);

	//加载元数据相关信息
	var metaCallback = function (result){
		$(".metadata-service").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var htm = '';
			$('.bs-docs-grid').data('key', 'meta');
			htm += showNodeServerList (result);
		    $('.metadata-service .basic_content_list').html(htm);
		}
		$('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.col-lg-6',
			percentPosition: true
		});
	}
	$(".metadata-service").LoadData ("show");
	DataModel['listMetaData'](null, metaCallback, true, null);

	var nasNodeArr = []
		dnsNodeStr = '';
    //列举DNS 域名信息 其他域名
    var dnsCallback = function (result) {
        $('.grid-dns-ser').LoadData ("hide");
        if (result == undefined)
            return;
        if (result.code == 200) {
            var data = result.result;
            var htm = "";
            for (var i = 0; i < data.length; i++) {
                var iplist = data[i]['ip_list'];
                htm += 	'<tr class="js-normal-dns-row" data-domain="' + data[i]['domain'] + '">' +
                    '<td class="modal-word-break domain-td col-lg-4 basic-lg-6">'+
                    '<span class="other-domain">' + data[i]['domain'] + ' ' +'</span>' +
                    '<a title="' + lang.cluster.edit_dns_domain + '" class="js-edit-domain-name invisible"><span class="glyphicon glyphicon-pencil"></span></a>' +
                    '</td>' +
                    '<td class="ip-td col-lg-2 basic-lg-4" style="text-align:left;margin-left:0">' +
                    '<span>' +
                    '<ul class="tabs-ip">';
				if (iplist) {
					for (var j = 0; j < iplist.length; j++) {
						htm += '<li data-ip="' + iplist[j] + '">' +
							'<a href="javascript:;" style="padding: 0">' + iplist[j] +
							'<span class="close-ip delIpAddr js-del-dns-ip invisible" title="' + lang.cluster.del_ip + '">×</span>' +
							'</a>' +
							'</li>';
					}
				}

                htm +=	'</ul>' +
                    '</span>' +
                    '</td>' +
                    '<td class="col-lg-2 basic-lg-2" style="text-align:right;">' +
                    '<a class="js-add-ip-service invisible" title="'+ lang.cluster.add_ip +'" style="margin-right:5px;">'  +
                    '<span class="glyphicon glyphicon-plus"></span> ' +
                    '</a>' +
                    '<a class="js-del-domain-service invisible" title="' + lang.cluster.del_domian + '"> ' +
                    '<span class="glyphicon glyphicon-trash"></span> ' +
                    '</a>' +
                    '</td>' +
                    '</tr>';
            };
            $('.grid-dns-ser').find('.js-dns-table tbody').html(htm);
        }
		else if(result.code == 701){}
		else {
            DisplayTips( lang.cluster.list_dns_info_fail );
        }
        $('.grid').masonry({
            itemSelector: '.grid-item',
            columnWidth: '.col-lg-6',
            percentPosition: true
        });
    }
    $('.grid-dns-ser').LoadData ("show");
    DataModel['listDnsList'](null, dnsCallback, true, '');

    //列举本集群域名
    var listCurcallback = function (result) {
        $('.grid-dns-ser').LoadData ("hide");
        if (result == undefined){
            return;
        }
        if (result.code == 200) {
            var data = result.result;
            var htm = "";
            //本集群域名只有一个
                var iplist = data.ip_list;
                var domain_value = 0;
                if (data.domain_name == undefined) {
                	domain_value = 1;
					htm += 	'<tr class="js-cur-dns-row" data-value="' + domain_value + '" data-domain="' + data.domain_name + '">' +
						'<td class="modal-word-break domain-td">'+
						'<span>' + lang.cluster.unset + ' ' +'</span>' +
						'<a title="' + lang.cluster.edit_dns_domain + '" class="js-edit-cur-domain-name invisible"><span class="glyphicon glyphicon-pencil"></span></a>' +
						'<a class="js-refresh-cur-domain-service invisible" title="' + lang.cluster.refresh_domian + '"> ' +
						'<span class="glyphicon glyphicon-refresh"></span> ' +
						'</a>' +
						'</td>' +
						'<td class="ip-td">' +
						'<span>' +
						'<ul class="tab-ip" >';
                }else{
					htm += 	'<tr class="js-cur-dns-row" data-value="' + domain_value + '" data-domain="' + data.domain_name + '">' +
						'<td class="modal-word-break domain-td col-lg-4 basic-lg-6">'+
						'<span>' + data.domain_name + ' ' +'</span>' +
						'<a title="' + lang.cluster.edit_dns_domain + '" class="js-edit-cur-domain-name invisible"><span class="glyphicon glyphicon-pencil"></span></a>' +
						'<a class="js-refresh-cur-domain-service invisible" title="' + lang.cluster.refresh_domian + '"> ' +
						'<span class="glyphicon glyphicon-refresh"></span> ' +
						'</a>' +
						'</td>' +
                    '<td class="ip-td col-lg-4 basic-lg-6" style="text-align: left">' +
						'<span>' +
						'<ul class="tab-ip" style="padding-left:0;margin-left:0" >';
				}
				if (iplist) {
					for (var j = 0; j < iplist.length; j++) {
						htm += '<li data-ip="' + iplist[j] + '">' +
							'<a href="javascript:;" style="padding: 0">' + iplist[j] +
							'</a>' +
							'</li>';
					}
				}

                htm +=	'</ul>' +
                    '</span>' +
                    '</td>' +
                    '</tr>';
            $('.grid-dns-ser').find('.js-curdns-table tbody').html(htm);
			//自动刷新集群域名(考虑到发送请求可能出现的性能问题，暂时不改)
			//var refreshTimer = setInterval(function () {
			//	console.log($(".js-cur-dns-row .ip-td .tab-ip li:eq(0)").attr("data-ip") )
			//	if ($(".js-cur-dns-row .ip-td .tab-ip li:eq(0)").attr("data-ip")==undefined||null) {
			//		$('.js-refresh-cur-domain-service' ).trigger('click');
			//		clearInterval(refreshTimer);
			//	} else {
			//		//让系统自动执行单击事件
			//		clearInterval(refreshTimer);
			//	}
			//}, 0.8e3)
        }
		else if(result.code == 701){}
		else {
            DisplayTips( lang.cluster.list_dns_info_fail );
        }
        $('.grid').masonry({
            itemSelector: '.grid-item',
            columnWidth: '.col-lg-6',
            percentPosition: true
        });
    }
    $('.grid-dns-ser').LoadData ("show");
    DataModel['listCurClusterDns'](null, listCurcallback, true, null);

    //显示上级DNS服务器
    var getForwarderfun = function (result){
        if (result == null ) {
            return;
        }
        if (result.code == 200) {
            var val = result.result;
            $('#forwarderdns').find('input').val(val);
        }
		else if(result.code == 701){

		}
		else{
            DisplayTips( lang.cluster.get_forwarder_fail  );
        }
    }
    DataModel['getForwarder'](null, getForwarderfun, true, '');

	//列举ntp主节点
	var ntpCallback = function (result) {
		$('.grid-ntp-ser').LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			mastersNode = result.result;
			var masters = result.result.split(',');
            var htm = '';
            for(var i = 0;masters[i];i++){
                htm += '<tr><td>' + masters[i] + '</td></tr>';
            }
            $('.grid-ntp-ser .js-ntp-table tbody').html(htm);
		}
		else if (result.code == INFI_STATUS.uninitialized) {}
		else if (result.code == 701) {}
		else {
			DisplayTips( lang.cluster.list_ntp_ser_fail );
		}
		$('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.col-lg-6',
			percentPosition: true
		});
	}
	$('.grid-ntp-ser').LoadData ("show");
	DataModel['getMaster'](null, ntpCallback, true, '');

    //获取外部时间源
	var srcCallback = function (result) {
		if (result == undefined)
			return;
		if (result.code == 200) {
			ipNode = result.result;
			var clockSrc = result.result.split(',');
			var htm = '';
			if(ipNode != ''){
				for(var i = 0;clockSrc[i];i++){
					htm += '<tr><td>' + clockSrc[i] + '</td></tr>';
				}
			}else{
				htm += '<tr><td>-</td></tr>';
			}
			$('.grid-ntp-ser .js-ntpclock-table tbody').html(htm);
		} else {
            $('.js-ntpclock-table').text('');
		}
		$('.grid').masonry({
			itemSelector: '.grid-item',
			columnWidth: '.col-lg-6',
			percentPosition: true
		});
	}
	DataModel['getClockSrc'](null, srcCallback, true, '');


  /* ------------------- 获取mgr状态 ------------------- */

  // hostname - mgr
  var hostname = '';
  // mgr exits hostnames
  var mgrExitsHostname = [];

  var mgrCallback = function (response) {
		$(".mgr_nodeinfo").LoadData ("hide");

    if (response.code !== 200) {
      $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.col-lg-6',
        percentPosition: true
      });
      return;
    }

    if ( response.result && !response.result.length ) {
      // $('#add_mgr').removeClass('hidden');
      return;
    }

    var result = response.result;

    var htmlDom = '';

    for (var i = 0; i < result.length; i++) {
      mgrExitsHostname.push(String(result[i].hostname));
      htmlDom =
      '<div class="mgr-mag mgr_status_on" data-bind="' + i + '">' +
        '<div class="col-lg-7 basic-lg-6 col-mgr-row left mgr_core inlineblock">' +
          ' <span>'+ result[i].hostname + '</span> ' +
          // ' <span>'+ result[i].addr + '</span> ' +
        ' </div> ' +

        '<div class="col-lg-2 basic-lg-2 col-mgr-row left mgr_status">' +
            (result[i].status == '1' ?
             '<span style="color: green">' + lang.node.mgr_start + '</span>' :
             '<span style="color: #f05d2f">' + lang.node.mgr_stop + '</span>') +
        '</div>' +

        '<div class="col-lg-3 basic-lg-3 col-mgr-row mgr_func hidden" style="border: solid 0 #fff">' +
            (result[i].status == '1' ?
             '<span class="glyphicon glyphicon-pause" style="color: #248fbd;" action="stop" data-bind="' + i + '" title="' + lang.node.stop_mgr + '"></span>' :
             '<span class="glyphicon glyphicon-play" style="color: #248fbd;" action="start" data-bind="' + i + '" title="' + lang.node.start_mgr + '"></span> ') +
             '<span class="glyphicon glyphicon-trash" style="margin-left: 1rem; color: #248fbd;" action="delete" data-bind="' + i + '" title="' + lang.node.delete_mgr + '"></span>' +
         '</div>' +
      '</div>';

      $('.mgr_nodeinfo .basic_content').append($(htmlDom));

      $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.col-lg-6',
        percentPosition: true
      });
    }

  }

  $(".mgr_nodeinfo").LoadData("show");
  DataModel['mgrManage']({ ip: window.location.hostname, action: 'get' }, mgrCallback, true, null);


	$(document)
  // mgr服务的管理
  /* ------------------- mgr管理 ------------------- */
  .on ('mouseover', '#js-popver-mgr', function (ev) {
    clearInterval( timer );
    $this = $(this);
    // $permit = $('#liccode-list .permit-mag.permit-mouseover');
    // $el = $permit.find('.lictype-permit');
    // $popver = $('#js-popver-mgr');
    //
    // mouseoverPermit ($el, $permit, $popver);
  })
  .on('mouseover', '.mgr_nodeinfo', function (ev) {
    $(this).find('.c_basic_right').removeClass('hidden');
  })
  .on('mouseout', '.mgr_nodeinfo', function (ev) {
    $(this).find('.c_basic_right').addClass('hidden');
  })
  .on('mouseover', '.mgr-mag.mgr_status_on', function (ev) {
    $(this).find('.mgr_func').removeClass('hidden');
  })
  .on('mouseout', '.mgr-mag.mgr_status_on', function (ev) {
    $(this).find('.mgr_func').addClass('hidden');
  })
  .on ('mouseleave', '#js-popver-mgr', function (ev) {
    $popver = $('#js-popver-mgr');
    // popverOut($popver);
  })

  .on('click', '#add_mgr', function (ev) {

      // 获取当前所有节点
      DataModel['listNode'](null, function (result) {

        if (result.code != 200) {
          DisplayTips(lang.statis.list_node_statis_fail);
          return;
        }

        var nodeLength = result.result.nodes.length;
        if (mgrExitsHostname.length < nodeLength) {
          $modal = $('#addMgrModal');
          $modal.modal('show');

          //把页面上当前已添加的节点存起来
      		$rows = $('.mgr-mag.mgr_status_on') || [];
          $nodes = result.result.nodes;
      		var exitsMgr = [];
          var totalNodes = [];
          var $mgrNode;
      		for (var j = 0; j < $rows.length; j++) {
            $mgrNode = $('.mgr-mag.mgr_status_on:eq('+j+')');
            if ($mgrNode.data('bind') !== undefined) {
              exitsMgr.push($mgrNode.find('.mgr_core > span').text());
            }
      		};
          for (var i = 0; i < $nodes.length; i++) {
            totalNodes.push($nodes[i].hostname);
          }

          var htm = "";
          for (var i = 0; i < totalNodes.length; i++) {
            if (exitsMgr.indexOf(totalNodes[i]) === -1){
              htm += '<option data-host="'+ totalNodes[i] + '">' + totalNodes[i] + '</option>';
            }
          }

          $modal.find('#inputHostname').html( htm );
      		$modal.modal('show');

        }else {
          DisplayTips(lang.node.mgr_add_disable);
        }

      }, true, null);
  })

  // mgr add modal
  .on('click', '#addMgrModal button[data-action="cancel"]', function (ev) {
    $('#addMgrModal').modal('hide');
  })

  // mgr manage modal
  .on('click', '#mgrManageModal button.btn-primary', function (ev) {
    var $mgrFather = $('.mgr-mag[data-bind='+ $('#mgrManageModal').data('bind') +']');
    var mgrCallback = {
      start: function (result) {
        $('#mgrManageModal').modal('hide');
        if (result.code !== 200) {
          return DisplayTips(lang.node.start_mgr_fail);
        }
        DisplayTips(lang.node.start_mgr_success);
        $mgrFather.
          find('.mgr_status > span').
          css('color', 'green').
          text(lang.node.mgr_start);
        $mgrFather.find('.mgr_func > span:first').
          attr({
            class: "glyphicon glyphicon-pause",
            action: "stop",
            title: lang.node.stop_mgr
          });
      },
      stop: function (result) {
        $('#mgrManageModal').modal('hide');
        if (result.code !== 200) {
          return DisplayTips(lang.node.stop_mgr_fail);
        }
        DisplayTips(lang.node.stop_mgr_success);
        $mgrFather.
          find('.mgr_status > span').
          css('color', '#f05d2f').
          text(lang.node.mgr_stop);
        $mgrFather.find('.mgr_func > span:first').
          attr({
            class: "glyphicon glyphicon-play",
            action: "start",
            title: lang.node.start_mgr
          });
      },
      delete: function (result) {
        $('#mgrManageModal').modal('hide');
        if (result.code !== 200) {
          return DisplayTips(lang.node.delete_mgr_fail);
        }
        DisplayTips(lang.node.delete_mgr_success);
        mgrExitsHostname.splice(mgrExitsHostname.indexOf(params.hostname), 1);
        $mgrFather.remove();
      }
    };

    var params = {
      ip: window.location.hostname,
      action: $('#mgrManageModal').data('action'),  // mgr manage action
      hostname: $('#mgrManageModal').data('hostname')
    };

    params.hostname && DataModel['mgrManage'](params, mgrCallback[params.action], true, null);
  })

  // mgr 启动 停止 删除
  .on('click', '.mgr-mag .mgr_func > span', function (ev) {
    var $mgrFather = $('.mgr-mag[data-bind='+ $(this).attr('data-bind') +']');
    var bind = $(this).attr('data-bind');
    var action =  $(this).attr('action');
    var hostname = $mgrFather.find('.mgr_core > span:first').text().trim();
    var modalTextMap = {
      delete: {
        header: lang.node.delete_mgr,
        body: lang.node.mgr_delete_node_tips,
      },
      start: {
        header: lang.node.start_mgr,
        body: lang.node.mgr_start_node_tips,
      },
      stop: {
        header: lang.node.stop_mgr,
        body: lang.node.mgr_stop_node_tips,
      }
    };

    $('#mgrManageModal')
      .data('bind', bind)
      .data('action', action)
      .data('hostname', hostname);
    $('#mgrManageModal').find('#mgrManageModalLabel').text(modalTextMap[action].header);
    $('#mgrManageModal').find('.modal-body > p').text(modalTextMap[action].body + hostname + ' ?');
    $('#mgrManageModal').modal('show');

  })

  // mgr添加
  .on('click', '#addMgrModal button[data-action="add"]', function (ev) {
    var $model = $('#addMgrModal');
    var hostname = $('#inputHostname').val().trim();

    // 不能添加相同节点的mgr
    if (mgrExitsHostname.indexOf(hostname) !== -1) {
      $('.add-mgr-info').removeClass('hidden').text(lang.node.mgr_add_samenode_disable);
      setTimeout(function () {
        $('.add-mgr-info').addClass('hidden').text('');
      }, 5000);
      return;
    }

    var mgrAddCallback = function (response) {
      $('#addMgrModal .modal-header').LoadData('hide');
      // $('.add-mgr-info').addClass('hidden').text('');
      $model.modal('hide');

      if (response.code !== 200) {
        return DisplayTips(lang.node.add_mgr_fail);
      }
      DisplayTips(lang.node.add_mgr_success);
      mgrExitsHostname.push(params.hostname);

      // 拿到当前索引
      var nowIndex = $('.mgr_nodeinfo .basic_content').children().length ?
        $('.mgr_nodeinfo .basic_content > div:last').find('.mgr_func > span:first').attr('data-bind') : 0;
      var htmlDom = '';

      nowIndex = Number(nowIndex);
      nowIndex++;
      for (var i = 0; i < result.length; i++) {
          htmlDom =
          '<div class="mgr-mag mgr_status_on" data-bind="' + nowIndex + '">' +
            '<div class="col-lg-7 basic-lg-6 col-mgr-row left mgr_core">' +
              ' <span>'+ result[i].hostname + '</span> ' +
              // ' <span>'+ result[i].addr + '</span> ' +
            ' </div> ' +

            '<div class="col-lg-2 basic-lg-2 col-mgr-row left mgr_status">' +
                (result[i].status == '1' ?
                 '<span style="color: green">' + lang.node.mgr_start + '</span>' :
                 '<span style="color: #f05d2f">' + lang.node.mgr_stop + '</span>') +
            '</div>' +

            '<div class="col-lg-3 basic-lg-3 col-mgr-row mgr_func hidden" style="border: 0">' +
                (result[i].status == '1' ?
                 '<span class="glyphicon glyphicon-pause" style="color: #248fbd;" action="stop" data-bind="' + nowIndex + '" title="' + lang.node.stop_mgr + '"></span>' :
                 '<span class="glyphicon glyphicon-play" style="color: #248fbd;" action="start" data-bind="' + nowIndex + '" title="' + lang.node.start_mgr + '"></span> ') +
                 '<span class="glyphicon glyphicon-trash" style="margin-left: 1rem; color: #248fbd;" action="delete" data-bind="' + nowIndex + '" title="' + lang.node.delete_mgr + '"></span>' +
             '</div>' +
          '</div>';

          $('.mgr_nodeinfo .basic_content').append($(htmlDom));
          nowIndex++;
      };
    }
    var params = {
      ip: window.location.hostname,
      action: 'add',
      hostname: hostname
    };
    var result = [{'status': '1', 'hostname': params.hostname, 'addr': params.hostname}];

    if (params.hostname) {
      DataModel['mgrManage'](params, mgrAddCallback, true, null);
      $('#addMgrModal .modal-header').LoadData('show');
      // $('.add-mgr-info').removeClass('hidden').text(lang.node['mgr_add_running']);
    }else {
      $('.add-mgr-info').removeClass('hidden').text(lang.node['please_input_hostname']);
      setTimeout(function () {
        $('.add-mgr-info').addClass('hidden').text('');
      }, 5000);
    }
  })


	//集群管理基础信息删除显示
	.on('mouseover', '.cluster_content .cluster_content_row', function(ev){
		$this = $(this);
		$this.find('.js-del-basic-node').removeClass('hidden');
	})
	.on('mouseout', '.cluster_content .cluster_content_row', function(ev){
		$this = $(this);
		$this.find('.js-del-basic-node').addClass('hidden');
	})
	.on('keypress', '#forwarderdns', function (ev) {
		ev.stopPropagation();
		var keycode = ev.which;
		if (ev.which == 13) {
			$this = $(this);
			var dnsstr = trim( $this.find('input').val() );
			var dnsarr = dnsstr.split(',');

			for(var i = 0; i < dnsarr.length; i++){
				if (!valifyIP(dnsarr[i]) && dnsarr[i] != '') {
					DisplayTips ( lang.cluster.ip_format_error );
					return;
				}
			}
			var parameter = {
				'ip_list' : dnsstr,
			};
			var callback = function (result){
				$('#forwarderdns').LoadData('hide');
				if (result == undefined) {
					return;
				}
				if (result.code == 200) {
					DisplayTips( lang.user.modify_success );
				}else{
					DisplayTips( lang.user.modify_fail);
				}
			}
			$('#forwarderdns').LoadData('show');
			DataModel['setForwarder'](parameter, callback, true, '');
		}
	})

	.on('mouseover', '.js-monitor-row', function (ev) {
		$this = $(this);
		var status = $this.data('status');
		if (status == 1) {
			//说明已启动，就显示“暂停”按钮
			$this.find('.js-stop-monitor-service').removeClass('hidden');
		} else {
			//显示"启动"按钮
			$this.find('.js-start-monitor-service').removeClass('hidden');
		}
		$this.find('.js-del-monitor-service').removeClass('hidden');
	})
	.on('mouseout', '.js-monitor-row', function (ev) {
		$this = $(this);
		$this.find('.js-start-monitor-service').addClass('hidden');
		$this.find('.js-stop-monitor-service').addClass('hidden');
		$this.find('.js-del-monitor-service').addClass('hidden');
	})
	.on('mouseover', '.js-meta-row', function (ev) {
			$this = $(this);
			var status = $this.data('status');
			if (status == 1) {
				//说明已启动，就显示“暂停”按钮
				$this.find('.js-stop-meta-service').removeClass('hidden');
			} else {
				//显示"启动"按钮
				$this.find('.js-start-meta-service').removeClass('hidden');
			}
			$this.find('.js-del-meta-service').removeClass('hidden');
		})
		.on('mouseout', '.js-meta-row', function (ev) {
			$this = $(this);
			$this.find('.js-start-meta-service').addClass('hidden');
			$this.find('.js-stop-meta-service').addClass('hidden');
			$this.find('.js-del-meta-service').addClass('hidden');
		})
	.on('mouseover', '.js-obj-row', function (ev) {
			$this = $(this);
			var status = $this.data('status');
			if (status == 1) {
				//说明已启动，就显示“暂停”按钮
				$this.find('.js-stop-obj-service').removeClass('hidden');
			} else {
				//显示"启动"按钮
				$this.find('.js-start-obj-service').removeClass('hidden');
			}
			$this.find('.js-del-obj-service').removeClass('hidden');
		})
	.on('mouseout', '.js-obj-row', function (ev) {
			$this = $(this);
			$this.find('.js-start-obj-service').addClass('hidden');
			$this.find('.js-stop-obj-service').addClass('hidden');
			$this.find('.js-del-obj-service').addClass('hidden');
	})
	.on('mouseout', '.js-storage-row', function (ev) {
		$this = $(this);
		$this.find('.js-start-storage-service').addClass('hidden');
		$this.find('.js-stop-storage-service').addClass('hidden');
		$this.find('.js-del-storage-service').addClass('hidden');
	})
	.on('mouseover', '.js-storage-row', function (ev) {
		$this = $(this);
		var status = $this.data('status');
		if (status == 1) {
			//说明已启动，就显示“暂停”按钮
			$this.find('.js-stop-storage-service').removeClass('hidden');
		} else {
			//显示"启动"按钮
			$this.find('.js-start-storage-service').removeClass('hidden');
		}
		$this.find('.js-del-storage-service').removeClass('hidden');
	})
	.on ('mouseover', '.monitor-service-con', function (ev) {
		$this = $(this);
		$this.find('.js-add-monitor').removeClass('hidden');
	})
	.on ('mouseout', '.monitor-service-con', function (ev) {
		$this = $(this);
		$this.find('.js-add-monitor').addClass('hidden');
	})
	.on ('mouseover', '.basic-info', function (ev) {
		$this = $(this);
		$this.find('.js-add-node').removeClass('hidden');
	})
	.on ('mouseout', '.basic-info', function (ev) {
		$this = $(this);
		$this.find('.js-add-node').addClass('hidden');
	})
  .on ('mouseover', '.dns-service', function (ev) {
		$this = $(this);
		$this.find('.js-add-dns').removeClass('hidden');
	})
	.on ('mouseout', '.dns-service', function (ev) {
		$this = $(this);
		$this.find('.js-add-dns').addClass('hidden');
	})
	.on ('mouseover', '.storage-node-con', function (ev) {
		$this = $(this);
		$this.find('.js-add-storage-node').removeClass('hidden');
	})
	.on ('mouseout', '.storage-node-con', function (ev) {
		$this = $(this);
		$this.find('.js-add-storage-node').addClass('hidden');
	})
	.on ( 'mouseover' ,'.metadata-service', function (ev) {
		$this = $(this);
		$this.find('.js-add-metadata').removeClass('hidden');
	})
	.on ( 'mouseout' ,'.metadata-service', function (ev) {
		$this = $(this);
		$this.find('.js-add-metadata').addClass('hidden');
	})
	.on ( 'mouseover' ,'.objstorage-service', function (ev) {
		$this = $(this);
		$this.find('.js-add-obj-storage').removeClass('hidden');
	})
	.on ( 'mouseout' ,'.objstorage-service', function (ev) {
		$this = $(this);
		$this.find('.js-add-obj-storage').addClass('hidden');
		})
	.on( 'click', '.js-edit-cluster-dns', function (ev) {
		$modal = $('#editDnsModal');
		var olddns = trim( $('.js-domainname').text() );
		$modal.find('#new_dns').val(olddns);
		$modal.modal('show');
	})
	.on('shown.bs.modal','#editDnsModal',function(ev){
		$('#new_dns').focus();
	})

	//编辑NTPserver
	.on ( 'click', '.js-edit-ntpser', function (ev) {
		$modal = $('#editNtpServerModal');
        //按钮和输入框显示状态初始化
        $modal.find('.form-group:first').removeClass('hidden');
		$modal.find('.form-group:eq(1)').addClass('hidden');
		$modal.find('.form-group:eq(2)').addClass('hidden');
        $modal.find('.btn-info').attr('disabled','disabled');
        $modal.find('.btn-info').removeClass('hidden');
        $modal.find('.btn-primary').addClass('hidden');
        $modal.find('#new_ntpser').html('');
		$modal.modal('show');
		var nodeCallback = function (result){
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				var data = result.result.nodes;
				var htm = "";
				nodeIpList = [];
				// var curntpser = trim( $('.grid-ntp-ser').find('.js-curntpser').text() );
				for (var i = 0; i < data.length; i++) {
					var node = data[i];
					// nodeIpList.push(node.ip);
          nodeIpList.push(node.hbeatip);
                    htm +=  '<div class="checkbox"><label>' +
                                '<input type="checkbox" data-host="' + node['hbeatip'] + '" value="' + node['hostname'] + '">' +
                                node['hostname'] + '(' + node['hbeatip'] + ')' +
                            '</label></div>';
				};
				$modal.find('#new_ntpser').html(htm);
			} else {
				DisplayTips( lang.cluster.list_avail_nodes_add_fail );
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel["listNode"](null, nodeCallback, true, null);
	} )
    //自定义NTP服务器
    // .on('change','#editNtpServerModal #new_ntpser',function(ev){
    //     var $this = $(this);
    //     if($this.val() == lang.cluster.custom){
    //         $('#editNtpServerModal .form-group:last').removeClass('hidden');
    //         $('#custom_ntpser').focus();
    //     }
    //     else
    //         $('#editNtpServerModal .form-group:last').addClass('hidden');
    // })
    //根据复选框限定最大选择数
    .on('change','#editNtpServerModal :checkbox',function(ev){
        var maxChecked = 10;
        var curChecked = $('#editNtpServerModal :checkbox:checked').length;
        $modal = $('#editNtpServerModal');
        if(curChecked >= maxChecked){
            $('#editNtpServerModal :checkbox:not(:checked)').closest('div').addClass('disabled');
        }
        else{
            $('#editNtpServerModal :checkbox').closest('div').removeClass('disabled');
        }
        if(curChecked !== 0){
            $modal.find('.btn-info').removeAttr('disabled');
        }
        else{
            $modal.find('.btn-info').attr('disabled','disabled');
        }
    })
    //下一步
    .on('click','#editNtpServerModal .btn-info',function(ev){
        $(this).addClass('hidden');
        $modal = $('#editNtpServerModal');
        $modal.find('.btn-primary').removeClass('hidden');
        $modal.find('.form-group:eq(1)').removeClass('hidden');
		$modal.find('.form-group:eq(2)').removeClass('hidden');
        $modal.find('.form-group:first').addClass('hidden');
		if(ipNode != ''){
			var initntpser = ipNode.split(',')
			var htm = '';
			for (var i = 0; i < initntpser.length; i++) {
				htm +=  '<div class="js-machine" data-ip="' + initntpser[i] + '">'+
					'<span>' + initntpser[i] + '</span>' +
					'<a class="fl-rt" id="js-trash-ip">' +
					'<span class="glyphicon glyphicon-trash" style="color:red"></span>' +
					'</a>' +
					'</div>';
			};
			$('#editNtpServerModal .text-area-style').html(htm);
		}
    })
	.on( 'click', '#editNtpServerModal .btn-primary', function (ev) {
		$modal = $('#editNtpServerModal');
        var masters = [];
        for(var i = 0;$modal.find(':checked:eq(' + i + ')').data('host');i++){
            masters[i] = $modal.find(':checked:eq(' + i + ')').data('host');
        }
        var ipaddrs = masters.join();
		var clockSource = '';
		$('.js-machine').each(function (i) {
				clockSource += $('.js-machine:eq('+i+')').data('ip');
			if(i != $('.js-machine').length - 1 ){
				clockSource += ',';
			}
			return clockSource;
		})
		//若不输入外部源
		var domainarr=['.com','.net','.cn','.org'];
		if (clockSource === '') {
			clockSource = '';
		}
		var ipStr = nodeIpList.join();
        var masterPara = {
			'nodes': ipStr,
            'ipaddrs': ipaddrs
        }
        var srcPara = {
			'nodes': ipStr,
            'clock_src': clockSource
        }
		var startPara = {
			'nodes': ipStr
		}

		//设置主节点
        var mCallback = function(result){
			      removeWaitMask();
            if(result == undefined)
                return;
            if(result.code == 200){
				        // addWaitMask();
            }
            else{
              DisplayTips( lang.cluster.set_ntp_server_fail );
              $modal.find('.modal-header').LoadData ("hide");
            }
        }

        //设置外部源
        var sCallback = function(result){
            removeWaitMask();
            if(result == undefined)
                return;
            if(result.code == 200){
                var oldHtml = $modal.find('.modal-body').html();
                $modal.find('.modal-body').html('<p>' + lang.wizard.set_finish_then_start_service + '</p>');
                addWaitMask();
                DataModel["clockStart"](startPara, startCallback, true, null);
            }
            else{
                DisplayTips(lang.cluster.set_clock_source_fail);
                $modal.find('.modal-header').LoadData ("hide");
            }
        };

        //启动服务
        var startCallback = function(result){
            removeWaitMask();
            $modal.find('.modal-header').LoadData ("hide");
            if(result == undefined)
                return;
            if(result.code == 200){
                DisplayTips( lang.cluster.set_ntp_server_success );
                setTimeout(function(){
                    refresh();
                },1500);
            }
            else{
                DisplayTips(lang.cluster.start_clock_update_service_fail);
                $modal.find('.modal-body').html(oldHtml);
            }
            $modal.modal('hide');
        };

		if(ipaddrs != ipNode || ipaddrs != mastersNode){
            $modal.find('.modal-header').LoadData ("show");
            DataModel["setMaster"](masterPara, mCallback, true, null);
		    DataModel["setClockSrc"](srcPara, sCallback, true, null);
		}else{
			$modal.modal('hide');
		}
	})


	//添加节点到集群的模态框
	.on( 'click', '.js-add-node', function (ev) {
		$modal = $('#addNodeModal');

		var nodeCallback = function (result){
			if (result.code != 200) {
				DisplayTips( lang.cluster.get_code_fail );
				return;
			}
			var nowNodeNum = $('.cluster_content').find('.cluster_content_row').length;
			var count = result.result.count;
			var allNode = result.result.nodes;

			if (count == nowNodeNum) {
				DisplayTips( lang.cluster.add_code_finish );
				return;
			}else{
				var htm = '';
				var nodeNameArr = [];//页面上的节点名
				var healthyhostname = '';//要发送到的节点名
				var healthyhost = '';//要发送到的节点名对应的ip,默认为当前结点。
				$('.cluster_content .cluster_content_row').each(function(i){
					nodeNameArr.push($(this).data('hostname'));

					if ($(this).find('.nodeStatus span').attr('status') == 1) {
						healthyhostname = $(this).data('hostname');
					}
				});
				//找到healthyhostname对应的ip
				$.each(allNode, function(n){
					if (healthyhostname == allNode[n].hostname) {
						healthyhost = allNode[n].ip;
					}
				});
				//总的节点的节点名
				$.each(allNode, function(n){
					if ( -1 == nodeNameArr.indexOf(allNode[n].hostname) ) {
						htm += '<div class="checkbox">';
						htm += '<label><input type="checkbox" name="'+ healthyhost +'"value="'+ allNode[n].ip +'">'+ allNode[n].hostname +'</label>';
						htm += '</div>';
					}
				});
				$modal.modal('show');
				$modal.find('.modal-body').html(htm);
			}
		}
		DataModel['listAllNode'](null, nodeCallback, true, null);
	})
	//添加节点到集群
	.on ('click', '#addNodeModal .btn-primary', function(ev) {
		$modal = $('#addNodeModal');

		var len = $modal.find('.modal-body input:checked').length;
		if (len == 0) {
			DisplayTips( lang.cluster.please_select_node_ip );
			return;
		}

		var hosts = '';
		$modal.find('.modal-body input:checked').each(function(i){
			hosts += $(this).val();
			hosts += ',';
		});

		hosts = hosts.substring(0, hosts.length - 1);
		var healthyhost = $modal.find('.modal-body input').attr('name');
		var para = {
			'hosts': hosts,
			'host' : healthyhost,
		}
    $modal.find('.modal-header').LoadData("show");

    /* ------------------- 列举心跳节点 ------------------- */
    DataModel['listNode'](null, function (result) {

      if (result && result.code == 200) {
        var nodes = result.result.nodes;
        var addCallback = function (result){
    			$modal.find('.modal-header').LoadData("hide");
    			$modal.modal("hide");

    			if (result == undefined) {
    				return;
    			}
    			if (result.code == 200) {
    				DisplayTips( lang.node.add_node_success );
    				refresh();
    			}else {
    				DisplayTips( lang.node.add_node_fail );
    			}

    		}

        nodes.forEach(function (node) {
          if (node.ip == para.hosts) {
              para.hosts = node.hbeatip;
              DataModel['clusterNodeAdd']( para, addCallback, true, null);
          }
        });

      }else {
        DisplayTips( lang.node.add_node_fail );
      }


    }, true, null);

	})
	//从集群删除节点模态框
	.on ( 'click', '.js-del-basic-node', function(ev){
		var len = $('.cluster_content').find('.cluster_content_row').length;
		if (len <= 2) {
			DisplayTips( lang.cluster.less_master_node );
			return;
		}

		var $row = $(this).closest('.cluster_content_row');
		var hostname = $row.find('div span:eq(0)').text();
		var healthyhostname = '';
		$('.basic-info .cluster_content').find('.cluster_content_row').each(function(i){
			if ($(this).find('.nodeStatus span').attr('status') == 1 && $(this).find('div span:eq(0)').text() != hostname) {
				healthyhostname = $(this).find('div span:eq(0)').text();
			}
		});

		if (healthyhostname == '') {
			DisplayTips( lang.cluster.no_normal_node );
			return;
		}

		$modal = $('#delNodeModal');
		$modal.modal("show");
		var htm = '';
		htm += '<div style="padding-left : 10px;"><p name="'+ healthyhostname+'" value="'+ hostname +'">' + lang.node.sure_to_del_cur_node + '&nbsp;&nbsp;'+ hostname +'<p></div>';
		$modal.find('.modal-body').html(htm);
	})
	//从集群删除节点
	.on ( 'click', '#delNodeModal .btn-primary', function(ev){
		$modal = $('#delNodeModal');
		var delhostname = $modal.find('.modal-body p').attr('value');
		var healthyhost = $modal.find('.modal-body p').attr('name');
		var delhostip = '';

		var nodeCallback = function (result){
			if (result.code != 200) {
				DisplayTips( lang.cluster.get_code_fail );
				return;
			}
			var allNode = result.result.nodes;
      console.log(allNode);
			$.each(allNode, function(n){
				if (allNode[n].hostname == delhostname) {
					// delhostip = allNode[n].ip;
          delhostip = allNode[n].hbeatip;
				} else if(allNode[n].hostname == healthyhost) {
					healthyhost = allNode[n].ip;
				}
			});

      /* ------------------- 删除 ------------------- */
      var para = {
  			'hosts': delhostip,
  			'host': healthyhost,
  		}

  		var delnodeCallback = function (result) {
  			$modal.find('.modal-header').LoadData("hide");
  			$modal.modal("hide");
  			if (result == undefined) {
  				return;
  			}
  			if (result.code == 200) {
  				DisplayTips( lang.node.del_node_success );
  				refresh();
  			} else{
  				DisplayTips( lang.node.del_node_fail );
  			}
  		}
  		$modal.find('.modal-header').LoadData("show");
  		DataModel['clusterNodeDel'](para, delnodeCallback, true, null);

		}


    DataModel['listAllNode'](null, nodeCallback, false, null);

	})
	//添加监控服务
	.on ( 'click', '.js-add-monitor', function (ev) {
		$modal = $('#addMonitorModal');
		$this = $(this);
		//把页面上当前已添加的节点存起来
		$rows = $('.monitor-service-con').find('.js-monitor-row');
		var arr = [];
		for (var j = 0; j < $rows.length; j++) {
			arr.push( $($rows[j]).data('host') );
		};
		if ( nodeLoaded == 'no' ) {
			showAvailNodeList( 'newmons' );
		} else {
			var nodes = nodeListData;
			var htm = "";
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				htm += '<option data-host="'+ node['hostname'] + '">' + node['hostname'] + '</option>';
			}
			$modal.find('#newmons').html( htm );
		}
		$modal.modal('show');
		$modal.data('hosts', arr);
	})
	.on ( 'click', '#addMonitorModal .btn-primary', function (ev) {
		$modal = $('#addMonitorModal');
		var mons = $modal.find('#newmons').find("option:selected").data('host');
		var hosts = $modal.data ( 'hosts');
		for (var i = 0; i < hosts.length; i++) {
			if (hosts[i] == mons) {
				DisplayTips(lang.cluster.monitor_has_added);
				return;
			}
		};
		var para = {
			'mons': mons,
		}
		var callback = function (result) {
			$modal.find('.modal-header').LoadData('hide');
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.new_monitor_success);
				DataModel['listMonitor'](null, monitorCallback, true, null);
			} else {
				DisplayTips(lang.cluster.new_monitor_fail);
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData('show');
		DataModel['newMonitor'](para, callback, true, lang.cluster.new_monitor);
	})
	//删除监控服务
	.on ( 'click', '.js-del-monitor-service', function (ev) {
		$row = $(this).closest('.js-monitor-row');
		var hostname = $(this).closest('.js-monitor-row').data('host');
		$row.siblings('.js-monitor-row').removeClass('deling');
		$row.addClass('deling');
		$('#delMonitorModel .modal-body p').html(lang.cluster.sureto_del_monitor + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
		$('#delMonitorModel').modal('show');
		$('#delMonitorModel').data('host', hostname);
	})
	.on ( 'click', '#delMonitorModel .btn-danger', function (ev) {
		//先判断下监控节点的个数是否小于4，如果小于4，则不让删除
		$allmons = $('.monitor-service-con .basic_content_list').find('.js-monitor-row');
		if ( $allmons.length < 4 ) {
			DisplayTips(lang.cluster.monitors_number_morthan_three);
			return false;
		}
		$modal = $('#delMonitorModel');
		var mons = $modal.data('host');
		var para = {
			'mons': mons,
		}
		var callback = function (result) {
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				$modal.find(".modal-body").LoadData ("hide");
				DisplayTips(lang.cluster.del_monitor_service_success);
				$('.js-monitor-row.deling').remove();
				$(function (ev) {
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.col-lg-6',
						percentPosition: true
					});
				})
			} else {
				DisplayTips(lang.cluster.del_monitor_service_fail);
			}
			$modal.modal('hide');
		}
		$modal.find(".modal-body").LoadData ("show");
		DataModel['delMonitor'](para, callback, true, lang.cluster.del_monitor_service);
	})
	//启动监控服务
	.on ( 'click', '.js-start-monitor-service', function (ev) {
		var hostname = $(this).closest('.js-monitor-row').data('host');
		$(this).closest('.monitor-service-con').find('.js-monitor-row').removeClass('starting');
		$(this).closest('.js-monitor-row').addClass('starting');
		$('#startMonitorModal .modal-body p').html(lang.cluster.sureto_start_monitor + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
		$('#startMonitorModal').modal('show');
		$('#startMonitorModal').data('host', hostname);
	})
	.on ( 'click', '#startMonitorModal .btn-primary', function (ev) {
		$modal = $('#startMonitorModal');
		var mons = $modal.data('host');
		var para = {
			'mons': mons,
		}
		var callback = function (result) {
            $modal.find('.modal-header').LoadData('hide');
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				var data = result.result;
				DisplayTips(lang.cluster.start_monitor_service_success);
				$('.js-monitor-row.starting').find('.js-status span').css('color', 'green').text(lang.running);
				$('.js-monitor-row.starting').data('status', '1');
			} else {
				DisplayTips(lang.cluster.start_monitor_service_fail);
			}
			$modal.modal('hide');
			$modal.find(".modal-body").LoadData ("hide");
		}
		$modal.find(".modal-header").LoadData ("show");
		DataModel['startMonitor'](para, callback, true, lang.cluster.start_monitor_service);
	})
	//暂停监控服务
	.on ( 'click', '.js-stop-monitor-service', function (ev) {
		var hostname = $(this).closest('.js-monitor-row').data('host');
		$(this).closest('.monitor-service-con').find('.js-monitor-row').removeClass('stoping');
		$(this).closest('.js-monitor-row').addClass('stoping');
		$('#stopMonitorModal .modal-body p').html(lang.cluster.sureto_stop_monitor + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
		$('#stopMonitorModal').modal('show');
		$('#stopMonitorModal').data('host', hostname);
	})
	.on ( 'click', '#stopMonitorModal .btn-primary', function (ev) {
		$modal = $('#stopMonitorModal');
		var mons = $modal.data('host');
		var para = {
			'mons': mons,
		}
		var callback = function (result) {
            $modal.find('.modal-header').LoadData('hide');
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.stop_monitor_service_success);
				$('.js-monitor-row.stoping').find('.js-status span').css('color', 'red').text(lang.stopped);
				$('.js-monitor-row.stoping').data('status', '0');
			} else {
				DisplayTips(lang.cluster.stop_monitor_service_fail);
			}
			$modal.modal('hide');
			$('.js-monitor-row.stoping').removeClass('stoping');
		}
        $modal.find('.modal-header').LoadData('show');
		DataModel['stopMonitor'](para, callback, true, lang.cluster.stop_monitor_service);
	})
	.on ('mouseover', '.ntp-server', function (ev) {
		$this = $(this);
		$this.find('.js-edit-ntpser').removeClass('invisible');
	})
	.on ('mouseout', '.ntp-server', function (ev) {
		$this = $(this);
		$this.find('.js-edit-ntpser').addClass('invisible');
	})
	//上一级DNS服务器
        .on('click','.js-forward-dns',function(ev){
            $modal = $('#forwardDnsModal');
            $modal.find('#newForwardIp').val('');
            $modal.modal('show');

            function callback(result){
                $modal.find('#curForwardIp').LoadData('hide');
                if(result == undefined)
                    return;
                if(result.code == 200){
                    var ips = result.result.split(',');
                    var htm = ips.join('<br>');
                    $modal.find('#curForwardIp>span').html(htm);
                }
                else{
                    $modal.find('#curForwardIp>span').html(lang.cluster.get_ip_fail);
                }
            }
            $modal.find('#curForwardIp').LoadData('show');
            DataModel['getForwarder'](null,callback,true,null);
        })
        .on('click','#forwardDnsModal .btn-primary',function(ev){
            $modal = $('#forwardDnsModal');
            var newIps = $modal.find('#newForwardIp').val().split(',');
            for(var i in newIps){
                newIps[i] = trim(newIps[i]);
                if(!isIpAddr(newIps[i])){
                    DisplayTips(lang.cluster.confirm_ip_format);
                    return;
                }
            }
            var formatedIps = newIps.join();
            var para = {
                'ip_list': formatedIps
            }

            function callback(result){
                removeWaitMask();
                $modal.find('.modal-header').LoadData('hide');
                if(!result)
                    return;
                if(result.code == 200){
                    DisplayTips(lang.cluster.set_forwarder_success);
                    $modal.modal('hide');
                }
                else{
                    DisplayTips(lang.cluster.set_forwarder_fail);
                }
            }
            $modal.find('.modal-header').LoadData('show');
            addWaitMask();
            DataModel['setForwarder'](para,callback,true,null);
        })
	//添加域名解析
		.on ('click','.js-add-dns',function(ev){
			$modal = $('#addDnsModal');
			$modal.modal('show');
		})
		.on ('shown.bs.modal','#addDnsModal',function(ev){
			$('#new_domain').focus();
		})
		.on ('click', '#addDnsModal .btn-default', function(){
			$('#addDnsModal #new_domain').val('');
			$('#addDnsModal #addNewIPaddr').val('');
		})
		.on ('click', '#addDnsModal .btn-primary', function (ev) {
			$modal = $('#addDnsModal');
			var domain, iplist, dnsSelectCluster;
			var hasDomain = $('.other-domain');
			domain = trim( $modal.find('#new_domain').val() );
			iplist = trim( $modal.find('#addNewIPaddr').val() );

			dnsSelectCluster = trim( $modal.find('#dnsSelectCluster').find('option:selected').attr('name') );
			//dnsSelectCluster值为1 设置本集群；值为2设置其他集群；
			if (!valifyDomain(domain, 3)) {
				DisplayTips( lang.cluster.domian_name_error );
				return false;
			}
			for (var dl = 0; dl < hasDomain.length; dl++) {
                var thisDomain = trim(hasDomain.eq(dl).text());
				if (domain === thisDomain) {
					DisplayTips( lang.cluster.repeat_domain_name );
					return false;
				}
			}
			if ( iplist == '' ) {
				DisplayTips( lang.cluster.input_ip );
				return false;
			} else{};
			var str = iplist.split(",");
			var iparr = [];
			var hash={};
			var repeat="";
			//1、判断输入的ip地址是否正确，若有一个不对，就提示错误
			for (var i = 0; i < str.length; i++) {

				if(!hash[str[i]]){
					hash[str[i]]=true;
					iparr.push(str[i]);
				}else{
					repeat+=str[i]+"  ";
				}
				if ( !valifyIP (str[i]) ) {
					DisplayTips (str[i] + " " + lang.node.ip_is_error);
					return false;
				}
			}
			if(iparr.length<str.length){
				iplist=iparr.join(",");
				DisplayTips ( lang.node.ip_is_repeat+repeat);
			}
			var para = {
				'domain': domain,
				'iplist': iplist
			}
			var twocallback = function (result) {
				$modal.find('.modal-header').LoadData ("hide");
                removeWaitMask();
				if (result == undefined) {
					return;
				} else if (result.code == 200) {
					var htm = "";
					htm +=  '<tr class="js-normal-dns-row" data-domain="' + domain + '">' +
						'<td class="modal-word-break domain-td col-lg-4 basic-lg-6">' +
						'<span class="other-domain">' + domain + ' ' + '</span>' +
						'<a title="' + lang.cluster.edit_dns_domain + '" class="js-edit-domain-name invisible"><span class="glyphicon glyphicon-pencil"></span></a>' +
						'</td>' +
						'<td class="ip-td col-lg-2 basic-lg-4" style="text-align:left;margin-left:0">' +
						'<span>' +
						'<ul class="tabs-ip" style="padding-left:0;margin-left:0">';
					if (iparr) {
						for (var j = 0; j < iparr.length; j++) {
							htm += '<li data-ip="' + iparr[j] + '">' +
								'<a href="javascript:;" style="padding: 0">' + iparr[j] +
								'<span class="close-ip delIpAddr js-del-dns-ip invisible" title="' + lang.cluster.del_ip + '">×</span>' +
								'</a>' +
								'</li>';
						}
					}

					htm +=	'</ul>' +
						'</span>' +
						'</td>' +
						'<td class="col-lg-2 basic-lg-2" style="text-align:right;">' +
						'<a class="js-add-ip-service invisible" title="'+ lang.cluster.add_ip +'" style="margin-right:5px;">'  +
						'<span class="glyphicon glyphicon-plus"></span> ' +
						'</a>' +
						'<a class="js-del-domain-service invisible" title="' + lang.cluster.del_domian + '"> ' +
						'<span class="glyphicon glyphicon-trash"></span> ' +
						'</a>' +
						'</td>' +
						'</tr>';
					$('.dns-service').find('table.js-dns-table').find('tbody').append(htm);
					DisplayTips(lang.cluster.add_dns_set_success);
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.col-lg-6',
						percentPosition: true
					});
				} else {
					DisplayTips(lang.cluster.add_dns_set_fail);
				}
				$modal.modal('hide');
			}

			var onecallback = function (result) {
                removeWaitMask();
				$modal.find('.modal-header').LoadData ("hide");
				if (result == undefined) {
					return;
				} else if (result.code == 200) {
					var htm = "";
					htm +=  '<tr class="js-normal-dns-row" data-domain="' + domain + '">' +
						'<td class="modal-word-break">' +
						'<span>' + domain + ' ' + '</span>' +
						'<a title="' + lang.cluster.edit_dns_domain + '" class="js-edit-domain-name invisible"><span class="glyphicon glyphicon-pencil"></span></a>' +
						'</td>' +
						'<td>' +
						'<span>' +
						'<ul class="tabs-ip" style="padding-left:0;">';
					for (var j = 0; j < iparr.length; j++) {
						htm += '<li data-ip="' + iparr[j] + '">' +
							'<a href="javascript:;" style="padding: 0">' + iparr[j] +
							'<span class="close-ip delIpAddr js-del-dns-ip invisible" title="' + lang.cluster.del_ip + '">×</span>' +
							'</a>' +
							'</li>';
					};

					htm +=	'</ul>' +
						'</span>' +
						'</td>' +
						'<td>' +
						'<a class="js-add-ip-service invisible" title="'+ lang.cluster.add_ip +'" style="margin-right:5px;">'  +
						'<span class="glyphicon glyphicon-plus"></span> ' +
						'</a>' +
						'<a class="js-del-domain-service invisible" title="' + lang.cluster.del_domian + '"> ' +
						'<span class="glyphicon glyphicon-trash"></span> ' +
						'</a>' +
						'</td>' +
						'</tr>';
					$('.dns-service').find('table.js-curdns-table').find('tbody').append(htm);
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.col-lg-6',
						percentPosition: true
					});
				} else {
					DisplayTips(lang.cluster.add_dns_set_fail);
				}
				$modal.modal('hide');
			}
            addWaitMask();
			if (dnsSelectCluster == 2) {
				$modal.find('.modal-header').LoadData ("show");
				DataModel['createDnsList'](para, twocallback, true, null);
			}else if (dnsSelectCluster == 1) {
				$modal.find('.modal-header').LoadData ("show");
				DataModel['createCurClusterDns'](para, onecallback, true, null);
			}
		})
		//删除一行域名
		.on ( 'click', '.js-del-domain-service', function (ev) {
			$this = $(this);
			$tr = $this.closest('tr.js-normal-dns-row');
			$tr.addClass('deling');
			$tr.siblings('tr.js-normal-dns-row').removeClass('deling');
			$modal = $('#delDnsModal');
			var domain = $tr.data('domain');
			$modal.find('.modal-body p').html( lang.cluster.confirm_del_domian + '<span style="color:red;">&nbsp;' +domain + '</span>' + '？');
			$modal.modal('show');
		})
		.on ( 'click', '#delDnsModal .btn-danger', function (ev) {
			$modal = $('#delDnsModal');
			$tr = $('tr.js-normal-dns-row.deling');
			$ul = $tr.find('ul.tabs-ip');
			$lis = $ul.find('li');
			var domain, iplist = '';
			domain = $tr.data('domain');
			for (var i = 0; i < $lis.length; i++) {
				var ip = $($lis[i]).data('ip');
				iplist += ip + ',';
			};
			iplist = iplist.substring(0, iplist.length-1);
			var para = {
				'domain': domain,
				'ip': iplist
			}
			var callback = function (result) {
                removeWaitMask();
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined) {
					return;
				} else if (result.code == 200) {
					DisplayTips(lang.cluster.del_domian + ' ' + domain + ' ' + lang.success + '！！');
					$tr.remove();
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.col-lg-6',
						percentPosition: true
					});
				} else {
					DisplayTips(lang.cluster.del_domian + ' ' + domain + ' ' + lang.fail + '！！');
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
            addWaitMask()
			DataModel['delDnsList'](para, callback, true, null);
		})
		//显示隐藏删除ip图标
		.on ( 'mouseover', 'ul.tabs-ip>li', function (ev) {
			$this = $(this);
			$this.find('.js-del-dns-ip').removeClass('invisible');
		})
		.on ( 'mouseout', 'ul.tabs-ip>li', function (ev) {
			$this = $(this);
			$this.find('.js-del-dns-ip').addClass('invisible');
		})
		//显示隐藏增加IP，删除图标，编辑域名图标
		.on ( 'mouseover', '.js-dns-table>tbody>tr', function (ev) {
			$this = $(this);
			$this.find('.js-add-ip-service').removeClass('invisible');
			$this.find('.js-del-domain-service').removeClass('invisible');
			$this.find('.js-edit-domain-name').removeClass('invisible');
		})
		.on ( 'mouseover', '.js-curdns-table>tbody>tr', function (ev) {
			$this = $(this);
			$this.find('.js-refresh-cur-domain-service').removeClass('invisible');
			$this.find('.js-edit-cur-domain-name').removeClass('invisible');
		})
		.on ( 'mouseout', '.js-dns-table>tbody>tr', function (ev) {
			$this = $(this);
			$this.find('.js-add-ip-service').addClass('invisible');
			$this.find('.js-del-domain-service').addClass('invisible');
			$this.find('.js-edit-domain-name').addClass('invisible');
		})
        .on ( 'mouseout', '.js-curdns-table>tbody>tr', function (ev) {
            $this = $(this);
            $this.find('.js-refresh-cur-domain-service').addClass('invisible');
            $this.find('.js-edit-cur-domain-name').addClass('invisible');
        })
		//修改域名
		.on('click','.js-edit-domain-name',function(ev){
			$modal = $('#editDnsModal');
			$dnsTr = $(this).closest('tr');
			var nameInput = $modal.find('#new_dns');
			var oldname = trim($dnsTr.data('domain'));
			var ipArr = [];
			var ipNum = $dnsTr.find('.tabs-ip>li').length;
			for(i = 0;i < ipNum;i++){
				ipArr.push($dnsTr.find('.tabs-ip>li:eq(' + i +')').data('ip'));
			}
			nameInput.val(oldname);
			nameInput.data('oldname',oldname);
			nameInput.data('ipStr',ipArr.join());
			$modal.modal('show');
		})
        //修改本集群域名
		.on('click','.js-edit-cur-domain-name',function(ev){
			$modal = $('#editCurDnsModal');
			$dnsTr = $(this).closest('tr');
			var nameInput = $modal.find('#new_cur_dns');
			var oldname = trim($dnsTr.data('domain'));
			var oldvalue = trim($dnsTr.data('value'));
			if (oldvalue == 1) {
				oldname = '';
			}
			var ipArr = [];
			var ipNum = $dnsTr.find('.tabs-ip>li').length;
			for(i = 0;i < ipNum;i++){
				ipArr.push($dnsTr.find('.tabs-ip>li:eq(' + i +')').data('ip'));
			}
			nameInput.val(oldname);
			nameInput.data('oldname',oldname);
			nameInput.data('ipStr',ipArr.join());
			$modal.modal('show');
		})
		.on( 'click', '#editDnsModal .btn-primary', function (ev){
			$modal = $('#editDnsModal');
			var $input = $('#new_dns');
			var $exist = $('.other-domain');
			var newname = $input.val();
			var oldname = $input.data('oldname');
			if(!valifyDomain(newname, 3)){
				DisplayTips(lang.cluster.domian_name_error);
				return;
			}
			if(newname === oldname){
				DisplayTips(lang.cluster.domain_not_edited);
				return;
			}
			//判断是否修改为重复域名
			var existList = [];
			$exist.each(function (index) {
				existList.push(trim($(this).text()));
			});
			if(existList.indexOf(newname) !== -1) {
				DisplayTips( lang.cluster.repeat_domain_name );
				return;
			}
			var ipStr = $input.data('ipStr');
			var delPara = {
				'domain': oldname,
				'iplist': ipStr
			}
			var addPara = {
				'domain': newname,
				'iplist': ipStr
			}
			var addCallback = function (result) {
                removeWaitMask();
				$modal.find('.modal-header').LoadData ("hide");
				if (result == undefined) {
					return;
				} else if (result.code == 200) {
					$dnsTr.data('domain',newname);
					$dnsTr.attr('data-domain',newname);
					$dnsTr.find('td:first>span').html(newname + ' ');
					DisplayTips(lang.cluster.edit_dns_domain + lang.success + '！！');
				} else {
					DisplayTips(lang.cluster.edit_dns_domain + lang.fail + '！！');
					$dnsTr.remove();
				}
				$modal.modal('hide');
			}
			var delCallback = function (result) {
                removeWaitMask();
				if (result == undefined) {
					$modal.find('.modal-header').LoadData ("hide");
					return;
				} else if (result.code == 200) {
					DataModel['createDnsList'](addPara, addCallback, true, null);
				} else {
					DisplayTips(lang.cluster.edit_dns_domain + lang.fail + '！！');
					$modal.find('.modal-header').LoadData ("hide");
					$modal.modal('hide');
				}
			}
			$modal.find('.modal-header').LoadData ("show");
            addWaitMask();
			DataModel['delDnsList'](delPara, delCallback, true, null);
		})
        //修改本集群域名
        .on( 'click', '#editCurDnsModal .btn-primary', function (ev){
			$modal = $('#editCurDnsModal');
			var $input = $('#new_cur_dns');
			var newname = $input.val();
			var oldname = $input.data('oldname');
			if(!isDomain(newname)){
				DisplayTips(lang.cluster.domian_name_error);
				return;
			}
			if(newname === oldname){
				DisplayTips(lang.cluster.domain_not_edited);
				return;
			}
			var ipStr = $input.data('ipStr');

			var editPara = {
				'domain': newname
			}
            var listCurcallback = function (result) {
                removeWaitMask();
                $('.grid-dns-ser').LoadData ("hide");
				$modal.find('.modal-header').LoadData ("hide");
                if (result == undefined){
                    return;
                }
                if (result.code == 200) {
                    var data = result.result;
                    var htm = "";
                    //本集群域名只有一个
                    var iplist = data.ip_list;
                    htm += 	'<tr class="js-cur-dns-row" data-domain="' + data.domain_name + '">' +
                        '<td class="modal-word-break domain-td col-lg-4 basic-lg-6">'+
                        '<span>' + data.domain_name + ' ' +'</span>' +
                        '<a title="' + lang.cluster.edit_dns_domain + '" class="js-edit-cur-domain-name invisible"><span class="glyphicon glyphicon-pencil"></span></a>' +
                        '<a class="js-refresh-cur-domain-service invisible" title="' + lang.cluster.refresh_domian + '"> ' +
                        '<span class="glyphicon glyphicon-refresh"></span> ' +
                        '</a>' +
                        '</td>' +
                        '<td class="ip-td col-lg-4 basic-lg-6" style="text-align: left">' +
                        '<span>' +
                        '<ul class="tab-ip" style="padding-left:0;margin-left:0">';
					if (iplist) {
						for (var j = 0; j < iplist.length; j++) {
							htm += '<li data-ip="' + iplist[j] + '">' +
								'<a href="javascript:;" style="padding: 0">' + iplist[j] +
								'</a>' +
								'</li>';
						}
					}

                    htm +=	'</ul>' +
                        '</span>' +
                        '</td>' +
                        '</tr>';
                    $('.grid-dns-ser').find('.js-curdns-table tbody').html(htm);
					DisplayTips( lang.node.modify_success );
                } else {
                    DisplayTips( lang.node.modify_fail );
                }
                $('.grid').masonry({
                    itemSelector: '.grid-item',
                    columnWidth: '.col-lg-6',
                    percentPosition: true
                });
            }
			var editCallback = function (result) {
                removeWaitMask();
				$modal.find('.modal-header').LoadData ("hide");
				if (result == undefined) {
					return;
				}
				if (result.code == 200) {
					$modal.find('.modal-header').LoadData ("show");
                    addWaitMask();
					DataModel['listCurClusterDns'](null, listCurcallback, true, null);
                    $modal.modal('hide');
				} else {
					DisplayTips(lang.cluster.edit_dns_domain + lang.fail + '！！');
					$modal.modal('hide');
				}
			}
			$modal.find('.modal-header').LoadData ("show");
            addWaitMask();
			DataModel['createCurClusterDns'](editPara, editCallback, true, null);
		})
        //刷新本集群域名信息
        .on( 'click', '.js-refresh-cur-domain-service', function (ev){
            var oldname = trim($(this).closest('tr').data('domain'));
            var editPara = {
                'domain': oldname
            }
            var listCurcallback = function (result) {
                removeWaitMask();
                $('.grid-dns-ser').LoadData ("hide");
                if (result == undefined){
                    return;
                }
                if (result.code == 200) {
                    var data = result.result;
                    var htm = "";
                    //本集群域名只有一个
                    var iplist = data.ip_list;
                    htm += 	'<tr class="js-cur-dns-row" data-domain="' + data.domain_name + '">' +
                        '<td class="modal-word-break domain-td col-lg-4 basic-lg-6">'+
                        '<span>' + data.domain_name + ' ' +'</span>' +
                        '<a title="' + lang.cluster.edit_dns_domain + '" class="js-edit-cur-domain-name invisible"><span class="glyphicon glyphicon-pencil"></span></a>' +
                        '<a class="js-refresh-cur-domain-service invisible" title="' + lang.cluster.refresh_domian + '"> ' +
                        '<span class="glyphicon glyphicon-refresh"></span> ' +
                        '</a>' +
                        '</td>' +
                        '<td class="ip-td col-lg-4 basic-lg-6" style="text-align: left">' +
                        '<span>' +
                        '<ul class="tab-ip" style="padding-left:0;margin-left:0">';
					if (iplist) {
						for (var j = 0; j < iplist.length; j++) {
							htm += '<li data-ip="' + iplist[j] + '">' +
								'<a href="javascript:;" style="padding: 0">' + iplist[j] +
								'</a>' +
								'</li>';
						}
					}

                    htm +=	'</ul>' +
                        '</span>' +
                        '</td>' +
                        '</tr>';
                    $('.grid-dns-ser').find('.js-curdns-table tbody').html(htm);
						DisplayTips( lang.cluster.refresh_success );
                }
				else if(result.code == 701){}
				else {
                    DisplayTips( lang.cluster.list_dns_info_fail );
                }
                $('.grid').masonry({
                    itemSelector: '.grid-item',
                    columnWidth: '.col-lg-6',
                    percentPosition: true
                });
            }
            var editCallback = function (result) {
                if (result == undefined) {
                    removeWaitMask();
                    return;
                } else if (result.code == 200) {
                    DataModel['listCurClusterDns'](null, listCurcallback, true, null);
                } else {
                    removeWaitMask();
                    DisplayTips(lang.cluster.edit_dns_domain + lang.fail + '！！');
                }
            }
            addWaitMask();
            DataModel['createCurClusterDns'](editPara, editCallback, true, null);
        })

		//添加某个域名下的单个IP
		.on('click','.js-add-ip-service',function(ev){
			$modal = $('#addIpModal');
			$this = $(this);
			$tr = $this.closest('tr.js-normal-dns-row');
			$tr.addClass('addiping');
			$tr.siblings('tr').removeClass('addiping');
			var domain = $tr.data('domain');
			$modal.data('domain', domain);
			$modal.modal('show');
		})
		.on ( 'click', '#addIpModal .btn-primary', function (ev) {
			$modal = $('#addIpModal');
			var domain = $modal.data('domain');
			var ip = trim( $modal.find('#add_ip').val() );
			var hasdomain=$('#otherdnslist').find('tr');
			for(var i=0;i<hasdomain.length;i++){
				var domainvalue=hasdomain.eq(i).data('domain');
				if(domain==domainvalue){
					var hasip=$(hasdomain.eq(i)).find('li');
					for(var i=0;i<=hasip.length;i++){
						var existip=hasip.eq(i).data('ip');
						if(ip==existip){
							DisplayTips(lang.cluster.ip_is_exist);
							return false;
						}
					}
				}
			}
			if ( ip == '' ) {
				DisplayTips( lang.cluster.please_input_ip );
				return false;
			}
			if (!valifyIP(ip)) {
				DisplayTips( lang.cluster.ip_format_error );
				return false;
			}
			var ismonitor = 'False';
			var para = {
				'domain': domain,
				'ip': ip,
				'ismonitor': ismonitor
			}
			var callback = function (result) {
                removeWaitMask();
				$modal.find('.modal-header').LoadData('hide');
				if (result == undefined) {
					return;
				} else if (result.code == 200) {
					DisplayTips(lang.cluster.add_ip + ' ' + ip + ' ' + lang.success + '！！');
					$tr = $('tr.js-normal-dns-row.addiping');
					$ul = $tr.find('ul.tabs-ip');
					var htm = "";
					htm += '<li data-ip="' + ip + '">' +
						'<a href="javascript:;" style="padding: 0">' + ip +
						'<span class="close-ip delIpAddr js-del-dns-ip invisible" title="' + lang.cluster.del_ip + '">×</span>' +
						'</a>' +
						'</li>';
					$ul.append(htm);
				} else {
					DisplayTips(lang.cluster.add_ip + ' ' + ip + ' ' + lang.fail + '！！');
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-header').LoadData('show');
            addWaitMask();
			DataModel['addSingleIp'](para, callback, true, null);
		})
		.on('shown.bs.modal','#addIpModal',function(ev){
			$('#add_ip').focus();
		})
		//删除某个域名下的单个IP
		.on ( 'click', 'ul.tabs-ip>li .js-del-dns-ip', function (ev) {
			$this = $(this);
			var $header = $this.closest('.dns-service').find('.basic_header');
			$('#otherdnslist').LoadData('show');
			var domain, ip;
			$tr = $this.closest('tr.js-normal-dns-row');
			$li = $this.closest('li');
			domain = $tr.data('domain');
			ip = $li.data('ip');
			var ismonitor = 'False';
			var curIp = $this.attr('name');
			if (curIp == 'curIp') {
				ismonitor = 'True';
			}
			var para = {
				'domain': domain,
				'ip': ip,
				'ismonitor': ismonitor
			}
			var callback = function (result) {
				$('#otherdnslist').LoadData('hide');
				if (result == undefined) {
					return;
				} else if (result.code == 200) {
					DisplayTips(lang.cluster.del_ip + ' ' + ip + ' ' + lang.success + '！！');
					$li.remove();
					if($('.js-normal-dns-row .ip-td').text() == ''){
						$tr.remove();
					}
				} else {
					DisplayTips(lang.cluster.del_ip + ' ' + ip + ' ' + lang.fail + '！！');
				}
			}

			DataModel['delSingleIp'](para, callback, true, null);

		})
		//编辑单个IP
		.on('click','ul.tabs-ip > li > a',function(ev){
			//如果点到删除按钮，不展开编辑框
			if(ev.target.localName === 'span'){
				return;
			}
			$this = $(this).closest('li');
			var primaryIp = $this.data('ip');
			var inputHtml = '<input type="text" class="js-edit-single-ip" maxlength="15" size="11" value="' + primaryIp + '" checked="checked">' +
				'<a class="js-edit-ip-confirm"><span class="glyphicon glyphicon-ok"></span></a>';
			$this.html(inputHtml);
			$this.find('.js-edit-single-ip').focus();

		})
		//控制编辑框何时消失
		.on('mouseover','.js-edit-ip-confirm',function(ev){
			$this = $(this).closest('li');
			var primaryIp = $this.data('ip');
			var editIp = trim($this.find('input').val());
			var $ipInput = $this.find('input');
			if(editIp === primaryIp){
				$ipInput.removeClass('js-ip-edited');
				$ipInput.addClass('js-edit-single-ip');
			}
			else{
				$ipInput.removeClass('js-edit-single-ip');
				$ipInput.addClass('js-ip-edited');
			}
		})
		.on('mouseout','.js-edit-ip-confirm',function(ev){
			var $ipInput = $this.find('input');
			$ipInput.removeClass('js-ip-edited');
			$ipInput.addClass('js-edit-single-ip');
		})

		//失去焦点时收起编辑框
		.on('focusout','.js-edit-single-ip',function(ev){
			$this = $(this).closest('li');
			var primaryIp = $this.data('ip');
			var primaryHtml = '<a href="javascript:;" style="padding: 0">' + primaryIp + '<span class="close-ip delIpAddr js-del-dns-ip invisible" title="' + lang.cluster.del_ip + '">×</span></a>';
			$this.html(primaryHtml);
		})
		.on('click','.js-edit-ip-confirm',function(ev){
			$this = $(this).closest('li');
			var primaryIp = $this.data('ip');
			var editIp = trim($this.find('input').val());
			var primaryHtml = '<a href="javascript:;" style="padding: 0">' + primaryIp + '<span class="close-ip delIpAddr js-del-dns-ip invisible" title="' + lang.cluster.del_ip + '">×</span></a>';
			var $li = $('.js-ip-edited').closest('li');
			//判断IP格式是否正确
			if(isIpAddr(editIp)){
				var domain = $this.closest('tr.js-normal-dns-row').data('domain');
				var ismonitor = 'False';
				var delPara = {
					'domain': domain,
					'ip': primaryIp,
					'ismonitor': ismonitor
				}
				var addPara = {
					'domain': domain,
					'ip': editIp,
					'ismonitor': ismonitor
				}
				var ip = editIp;
				var hasdomain=$('#otherdnslist').find('tr');
				for(var i=0;i<hasdomain.length;i++){
					var domainvalue=hasdomain.eq(i).data('domain');
					if(domain==domainvalue){
						var hasip=$(hasdomain.eq(i)).find('li');
						for(var i=0;i<=hasip.length;i++){
							var existip=hasip.eq(i).data('ip');
							if(ip==existip){
								DisplayTips(lang.cluster.ip_is_exist);
								return false;
							}
						}
					}
				}
				$this.LoadData('show');
				var delCallback = function (result) {
					if (result == undefined) {
						return;
					}
					else if (result.code == 200) {
						DataModel['addSingleIp'](addPara, addCallback, true, null);
					}
					else {
						DisplayTips(lang.cluster.edit_ip_fail);
						$this.LoadData('hide');
						$li.html(primaryHtml);
					}
				}

				var addCallback = function(result){
					$this.LoadData('hide');
					if (result == undefined) {
						return;
					}
					else if (result.code == 200) {
						var editedHtml = '<a href="javascript:;" style="padding: 0">' + editIp + '<span class="close-ip delIpAddr js-del-dns-ip invisible" title="' + lang.cluster.del_ip + '">×</span></a>';
						$li.data('ip',editIp);
						$li.html(editedHtml);
					}
					else {
						DisplayTips(lang.cluster.edit_ip_fail + ' ' + lang.cluster.this_ip_has_been_deleted);
						$li.remove();
					}
				}
				DataModel['delSingleIp'](delPara, delCallback, true, null);
			}
			else{
				DisplayTips( lang.cluster.confirm_ip_format);
				$li.html(primaryHtml);
			}
		})


	//添加元数据服务
	.on ( 'click', '.js-add-metadata', function (ev) {
		$this = $(this);
		$modal = $('#addMetaDataModal');
		//把页面上当前已添加的节点存起来
		$rows = $('.metadata-service').find('.js-meta-row');
		var arr = [];
		for (var j = 0; j < $rows.length; j++) {
			arr.push( $($rows[j]).data('host') );
		};
		if ( nodeLoaded == 'no' ) {
			showAvailNodeList( 'newmetadata' );
		} else {
			var nodes = nodeListData;
			var htm = "";
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				htm += '<option data-host="'+ node['hostname'] + '">' + node['hostname'] + '</option>';
			}
			$modal.find('#newmetadata').html( htm );
		}
		$modal.modal('show');
		$modal.data('hosts', arr);
	})
	.on ( 'click', '#addMetaDataModal .btn-primary', function (ev) {
		$modal = $('#addMetaDataModal');

		var mdsNodes = $modal.find('#newmetadata').find("option:selected").data('host');
		var hosts = $modal.data ( 'hosts');
		for (var i = 0; i < hosts.length; i++) {
			if (hosts[i] == mdsNodes) {
				DisplayTips(lang.cluster.meta_service_has_added);
				return;
			}
		};
		var para = {
			'mdsNodes': mdsNodes,
		}
		var callback = function (result) {
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.add_meta_service_success);
				$(".metadata-service").LoadData ("show");
				DataModel['listMetaData'](null, metaCallback, true, null);
			} else {
				DisplayTips(lang.cluster.add_meta_service_fail);
			}
			$modal.find('.modal-header').LoadData ("hide");
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['newmetadata'](para, callback, true, lang.cluster.add_meta_service);
	})
	//删除元数据服务
	.on ( 'click', '.js-del-meta-service', function (ev) {
		$row = $(this).closest('.js-meta-row');
		var hostname = $row.data('host');
		$row.siblings('.js-meta-row').removeClass('deling');
		$row.addClass('deling');
		$('#delMetaDataModel .modal-body p').html(lang.cluster.sureto_del_meta + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
		$('#delMetaDataModel').modal('show');
		$('#delMetaDataModel').data('host', hostname);
	})
	.on ( 'click', '#delMetaDataModel .btn-danger', function (ev) {
		$modal = $('#delMetaDataModel');
		var mdsNodes = $modal.data('host');
		var para = {
			'mdsNodes': mdsNodes,
		}
		var callback = function (result) {
			$row = $('.js-meta-row.deling');
			if (result == undefined) {
				$row.removeClass('deling');
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.del_meta_service_success);
				$row.remove();
				$(function (ev) {
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.col-lg-6',
						percentPosition: true
					});
				})
			} else {
				$row.removeClass('deling');
				DisplayTips(lang.cluster.del_meta_service_fail);
			}
			$modal.find('.modal-header').LoadData ("hide");
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['delMetadata'](para, callback, true, lang.cluster.del_meta_service);
	})
	//启动元数据服务
	.on ( 'click', '.js-start-meta-service', function (ev) {
		var hostname = $(this).closest('.js-meta-row').data('host');
		$row = $(this).closest('.js-meta-row');
		$row.siblings('.js-meta-row').removeClass('starting');
		$row.addClass('starting');
		$('#startMetaDataModal .modal-body p').html(lang.cluster.sureto_start_meta + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
		$('#startMetaDataModal').modal('show');
		$('#startMetaDataModal').data('host', hostname);
	})
	.on ( 'click', '#startMetaDataModal .btn-primary', function (ev) {
		$modal = $('#startMetaDataModal');
		var mons = $modal.data('host');
		var para = {
			'hostname': mons,
		}
		var callback = function (result) {
            $modal.find('.modal-header').LoadData('hide');
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.start_meta_service_success);
				$('.js-meta-row.starting').find('.js-status span').css('color', 'green').text(lang.running);
				$('.js-meta-row.starting').data('status', '1');
			} else {
				DisplayTips(lang.cluster.start_meta_service_fail);
			}
			$modal.modal('hide');
		}
        $modal.find('.modal-header').LoadData('show');
		DataModel['startMeta'](para, callback, true, lang.cluster.start_meta_service);
	})
	//暂停元数据服务
	.on ( 'click', '.js-stop-meta-service', function (ev) {
		var hostname = $(this).closest('.js-meta-row').data('host');
		$(this).closest('.metadata-service').find('.js-meta-row').removeClass('stoping');
		$(this).closest('.js-meta-row').addClass('stoping');
		$('#stopMetaDataModal .modal-body p').html(lang.cluster.sureto_stop_meta + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
		$('#stopMetaDataModal').modal('show');
		$('#stopMetaDataModal').data('host', hostname);
	})
	.on ( 'click', '#stopMetaDataModal .btn-primary', function (ev) {
		$modal = $('#stopMetaDataModal');
		var mons = $modal.data('host');
		var para = {
			'hostname': mons,
		}
		var callback = function (result) {
            $modal.find('.modal-header').LoadData('hide');
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.stop_meta_service_success);
				$('.js-meta-row.stoping').find('.js-status span').css('color', 'red').text(lang.stopped);
				$('.js-meta-row.stoping').data('status', '0');
			} else {
				DisplayTips(lang.cluster.stop_meta_service_fail);
			}
			$modal.modal('hide');
			$('.js-meta-row.stoping').removeClass('stoping');
		}
        $modal.find('.modal-header').LoadData('show');
		DataModel['stopMeta'](para, callback, true, lang.cluster.stop_meta_service);
	})
	//添加对象存储服务
	.on ( 'click', '.js-add-obj-storage', function (ev) {
		$this = $(this);
		var mCallback = function (result){
			if (result == undefined)
				return;
			if (result.code == 200) {
				$rows = $('.metadata-service').find('.js-meta-row');
				var arr = [];
				$('.js-add-obj-storage').data('loaded', 'yes');
				var data = result.result.nodes;
				var htm = '';
				for (var i = 0; i < data.length; i++) {
					htm += '<option data-ip="' + data[i].ip + '" data-host="' + data[i].hostname + '">' + data[i].hostname + '</option>';
				}
				$('#newobjstorage').html(htm);
			} else {
				DisplayTips(lang.cluster.load_storagenode_fail);
			}
		}
		var load = $this.data('loaded');
		if ( load != "yes" ) {
			DataModel['listAllNode'](null, mCallback, true, null);
		}
		//把页面上当前已添加的节点存起来
		$rows = $('.object-storage-service').find('.js-obj-row');
		var arr = [];
		for (var j = 0; j < $rows.length; j++) {
			arr.push( $($rows[j]).data('host') );
		};
		$('#addObjectStorageModal').modal('show');
		$('#addObjectStorageModal').data('hosts', arr);
	})
	.on ( 'click', '#addObjectStorageModal .btn-primary', function (ev) {
		$modal = $('#addObjectStorageModal');

		var ossNodes = $modal.find('#newobjstorage').find("option:selected").data('host');
		var ips = $modal.find('#newobjstorage').find("option:selected").data('ip');
		for (var i = 0; i < $('.js-obj-row').length; i++) {
			var hosts = $('.js-obj-row:eq('+i+')').data ( 'host');
			if (hosts == ossNodes) {
				DisplayTips(lang.cluster.storagenode_has_added);
				return;
			}
		};
		var para = {
			'ips': ips,
		}
		var callback = function (result) {
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				$('.bs-docs-grid').data('key', 'obj');
				DisplayTips(lang.cluster.add_obj_service_success);
				var htm = appendServiceInfo(result);
				$('.object-storage-service .basic_content_list').append(htm);
				$(function (ev) {
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.col-lg-6',
						percentPosition: true
					});
				})
				$(".objstorage-service").LoadData ("show");
				DataModel['listObj'](null, objCallback, true, null);
			} else {
				DisplayTips(lang.cluster.add_obj_service_fail);
			}
			$modal.find('.modal-header').LoadData ("hide");
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['addObj'](para, callback, true, lang.cluster.add_obj_service);
	})
	//删除对象存储服务
	.on ( 'click', '.js-del-obj-service', function (ev) {
		$row = $(this).closest('.js-obj-row');
		var hostname = $row.data('host');
		var ip = $row.data('ip');
		$row.siblings('.js-obj-row').removeClass('deling');
		$row.addClass('deling');
		$('#delObjectStorageModel .modal-body p').html(lang.cluster.sureto_del_obj + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
		$('#delObjectStorageModel').modal('show');
		$('#delObjectStorageModel').data('host', hostname);
		$('#delObjectStorageModel').data('ip', ip);
	})
	.on ( 'click', '#delObjectStorageModel .btn-danger', function (ev) {
		$modal = $('#delObjectStorageModel');
		var ips = $modal.data('ip');
		var para = {
			'ips': ips,
		}
		var callback = function (result) {
			$row = $('.js-obj-row.deling');
			if (result == undefined) {
				$row.removeClass('deling');
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.del_obj_service_success);
				$row.remove();
				$(function (ev) {
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.col-lg-6',
						percentPosition: true
					});
				})
			} else {
				$row.removeClass('deling');
				DisplayTips(lang.cluster.del_obj_service_fail);
			}
			$modal.find('.modal-header').LoadData ("hide");
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['delObj'](para, callback, true, lang.cluster.del_obj_service);
	})
	//启动对象存储服务
	.on ( 'click', '.js-start-obj-service', function (ev) {
		var hostname = $(this).closest('.js-obj-row').data('host');
		var ip = $(this).closest('.js-obj-row').data('ip');
		$row = $(this).closest('.js-obj-row');
		$row.siblings('.js-obj-row').removeClass('starting');
		$row.addClass('starting');
		$('#startObjectStorageModal .modal-body p').html(lang.cluster.sureto_start_obj + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
		$('#startObjectStorageModal').modal('show');
		$('#startObjectStorageModal').data('host', hostname);
		$('#startObjectStorageModal').data('ip', ip);
	})
	.on ( 'click', '#startObjectStorageModal .btn-primary', function (ev) {
		$modal = $('#startObjectStorageModal');
		var ipaddr = $modal.data('ip');
		var para = {
			'ips': ipaddr,
		}
		var callback = function (result) {
            $modal.find('.modal-header').LoadData('hide');
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.start_obj_service_success);
				$('.js-obj-row.starting').find('.js-status span').css('color', 'green').text(lang.running);
				$('.js-obj-row.starting').data('status', '1');
			} else {
				DisplayTips(lang.cluster.start_obj_service_fail);
			}
			$modal.modal('hide');
		}
        $modal.find('.modal-header').LoadData('show');
		DataModel['startObj'](para, callback, true, lang.cluster.start_obj_service);
	})
	//暂停对象存储服务
	.on ( 'click', '.js-stop-obj-service', function (ev) {
		var hostname = $(this).closest('.js-obj-row').data('host');
		var ip = $(this).closest('.js-obj-row').data('ip');
		$(this).closest('.object-storage-service').find('.js-obj-row').removeClass('stoping');
		$(this).closest('.js-obj-row').addClass('stoping');
		$('#stopObjectStorageModal .modal-body p').html(lang.cluster.sureto_stop_obj + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
		$('#stopObjectStorageModal').modal('show');
		$('#stopObjectStorageModal').data('host', hostname);
		$('#stopObjectStorageModal').data('ip', ip);
	})
	.on ( 'click', '#stopObjectStorageModal .btn-primary', function (ev) {
		$modal = $('#stopObjectStorageModal');
		var ipaddr = $modal.data('ip');
		var para = {
			'ips': ipaddr,
		}
		var callback = function (result) {
            $modal.find('.modal-header').LoadData('hide');
			if (result == undefined) {
				return;
			} else if (result.code == 200) {
				DisplayTips(lang.cluster.stop_obj_service_success);
				$('.js-obj-row.stoping').find('.js-status span').css('color', 'red').text(lang.stopped);
				$('.js-obj-row.stoping').data('status', '0');
			} else {
				DisplayTips(lang.cluster.stop_obj_service_fail);
			}
			$modal.modal('hide');
			$('.js-obj-row.stoping').removeClass('stoping');
		}
        $modal.find('.modal-header').LoadData('show');
		DataModel['stopObj'](para, callback, true, lang.cluster.stop_obj_service);
	})

	//nfs添加ip
	.on('click', '#js-trash-ip', function (ev) {
			$this = $(this);
			$this.closest('.js-machine').remove();
	})
	.on('click', '.ntpser_add', function (ev) {
			var machine = trim( $('#custom_ntpser').val());
			if (typeof(machine) === "undefined" || machine === "") {
				DisplayTips(lang.cluster.confirm_ip_or_domain_format);
				return;
			}
			//外部源格式判断
		    var domainarr=['.com','.net','.cn','.org'];
			if(!isIpAddr(machine) && !isDomain(machine)){
				DisplayTips(lang.cluster.confirm_ip_or_domain_format);
				return false;
			}else if(!isIpAddr(machine) && domainarr.indexOf(isDomain(machine)[1])==-1){
				DisplayTips(lang.cluster.confirm_ip_or_domain_format);
				return false;
			}
			var htm = '';
			//判断是否重复添加ip
			$ips = $('#editNtpServerModal .js-machine');
			var ison = true;
			$ips.each(function (i) {
				if (trim($(this).data('ip')) == machine) {
					ison = false;
					DisplayTips(lang.file.the_machineip_added);
					return;
				}
			})
			if (ison) {
				htm = '<div class="js-machine" data-ip="'+ machine +'" >'+
					'<span>'+ machine +'</span>'+
					'<a class="fl-rt" id="js-trash-ip">'+
					'<span class="glyphicon glyphicon-trash" style="color:red"></span>'+
					'</a>'+
					'</div>';
			}

			$('#editNtpServerModal .text-area-style').append(htm);
	});
	//添加某个服务之后，追加节点
	function appendServiceInfo (result) {
		var data = result.result;
		var key = $('.bs-docs-grid').data('key');
		var htm1 = '';
		for (var i = 0; i < data.length; i++) {
			if ( key == "stroagenode") {
				htm1 += '<div class="basic_cont_row js-storage-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['status'] +'" data-ip="'+ data[i]['ip'] +'">';
			} else  if( key == "monitor"){
				htm1 += '<div class="basic_cont_row js-monitor-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['server'] +'">';
			}  else  if( key == "meta"){
				htm1 += '<div class="basic_cont_row js-meta-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['server'] +'">';
			}  else  if( key == "nas"){
				htm1 += '<div class="basic_cont_row js-nas-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['server'] +'">';
			}  else  if( key == "obj"){
				htm1 += '<div class="basic_cont_row js-obj-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['server'] +'" data-ip="'+ data[i]['addr'] +'">';
			}
				htm1 += '<div class="col-lg-4 basic-lg-4 inlineblock">' +
			              '<span>' + data[i]['hostname'] + '</span>'+
			            '</div>'+
			        	'<div class="col-lg-4 basic-lg-4 inlineblock js-status">';
				if ( data[i]['status'] == 'normal' ) {
					htm1 += '<span style="color:green;">' + data[i]['status'] + '</span>' ;
				} else {
					htm1 += '<span style="color:red;">' + data[i]['status'] + '</span>' ;
				}

				if ( key == "stroagenode") {
					htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
				            '<a href="javascript:;" class="hidden js-start-storage-service" title="'+ lang.cluster.start_storage_service +'" style="margin-right:15px;">'+
				                '<span class="glyphicon glyphicon-play"></span>'+
				            '</a>'+
				            '<a href="javascript:;" class="hidden js-stop-storage-service" title="' + lang.cluster.stop_storage_service + '" style="margin-right:15px;">'+
				                '<span class="glyphicon glyphicon-pause"></span>'+
				            '</a>'+
				            '<a href="javascript:;" class="hidden js-del-storage-service" title="' + lang.cluster.del_storage_service+ '">'+
				                '<span class="glyphicon glyphicon-trash"></span>'+
				            '</a>'+
			            '</div>'+
			        '</div>';
				} else if( key == "monitor"){
					htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
				            '<a href="javascript:;" class="hidden js-start-monitor-service" title="'+ lang.cluster.start_monitor_service +'" style="margin-right:15px;">'+
				                '<span class="glyphicon glyphicon-play"></span>'+
				            '</a>'+
				            '<a href="javascript:;" class="hidden js-stop-monitor-service" title="' + lang.cluster.stop_monitor_service + '" style="margin-right:15px;">'+
				                '<span class="glyphicon glyphicon-pause"></span>'+
				            '</a>'+
				            '<a href="javascript:;" class="hidden js-del-monitor-service" title="' + lang.cluster.del_monitor_service+ '">'+
				                '<span class="glyphicon glyphicon-trash"></span>'+
				            '</a>'+
			            '</div>'+
			        '</div>';
				} else if( key == "meta"){
					htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
				            '<a href="javascript:;" class="hidden js-start-meta-service" title="'+ lang.cluster.start_meta_service +'" style="margin-right:15px;">'+
				                '<span class="glyphicon glyphicon-play"></span>'+
				            '</a>'+
				            '<a href="javascript:;" class="hidden js-stop-meta-service" title="' + lang.cluster.stop_meta_service + '" style="margin-right:15px;">'+
				                '<span class="glyphicon glyphicon-pause"></span>'+
				            '</a>'+
				            '<a href="javascript:;" class="hidden js-del-meta-service" title="' + lang.cluster.del_meta_service+ '">'+
				                '<span class="glyphicon glyphicon-trash"></span>'+
				            '</a>'+
			            '</div>'+
			        '</div>';
				} else if( key == "nas"){
					htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
				            '<a href="javascript:;" class="hidden js-start-nas-service" title="'+ lang.cluster.start_nas_service +'" style="margin-right:15px;">'+
				                '<span class="glyphicon glyphicon-play"></span>'+
				            '</a>'+
				            '<a href="javascript:;" class="hidden js-stop-nas-service" title="' + lang.cluster.stop_nas_service + '" style="margin-right:15px;">'+
				                '<span class="glyphicon glyphicon-pause"></span>'+
				            '</a>'+
				            '<a href="javascript:;" class="hidden js-del-nas-service" title="' + lang.cluster.del_nas_service+ '">'+
				                '<span class="glyphicon glyphicon-trash"></span>'+
				            '</a>'+
			            '</div>'+
			        '</div>';
		} else if( key == "obj"){
			// htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
			// 	'</div>'+
			// 	'</div>';
      htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
             '<a href="javascript:;" class="hidden js-start-obj-service" title="'+ lang.cluster.start_obj_service +'" style="margin-right:15px;">'+
                 '<span class="glyphicon glyphicon-play"></span>'+
             '</a>'+
             '<a href="javascript:;" class="hidden js-stop-obj-service" title="' + lang.cluster.stop_obj_service + '" style="margin-right:15px;">'+
                 '<span class="glyphicon glyphicon-pause"></span>'+
             '</a>'+
         '</div>'+
     '</div>';
		}

		}
		return htm1;
	}

	//列举各个服务的列表详情
	function showNodeServerList (result) {
	    var data = result.result;
	    var key = $('.bs-docs-grid').data('key');
	    var htm1 = '';
	    htm1 += '<div class="basic_cont_row">' +
	                '<div class="col-lg-6 basic-lg-6 inlineblock" style="padding: 0 !important;text-align: left !important;">'+
	                    '<span style="padding-left: 50px;">'+ lang.cluster.hostname +'</span>' +
	                '</div>' +
	                '<div class="col-lg-2 basic-lg-2 inlineblock left">' +
	                  '<span>' + lang.cluster.status +'</span>' +
	                '</div>' +
	                '<div class="col-lg-4 basic-lg-4 inlineblock">' +
	                '</div>'+
	            '</div>';
	    for (var i = 0; i < data.length; i++) {
	        if ( key == "stroagenode") {
	            htm1 += '<div class="basic_cont_row js-storage-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['status'] +'" data-ip="'+ data[i]['ip'] +'">';
	        } else  if( key == "monitor"){
	            htm1 += '<div class="basic_cont_row js-monitor-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['status'] +'">';
	        }  else  if( key == "meta"){
	            htm1 += '<div class="basic_cont_row js-meta-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['status'] +'">';
	        }  else  if( key == "nas"){
	            var type = data[i]['sstatus'];
	            sstatus = getCnasServiceState (type);
	            htm1 += '<div class="basic_cont_row js-nas-row" data-id="' + data[i]['id'] + '" data-host="' + data[i]['nodename'] + '" data-status="'+ sstatus +'" data-ip="'+ data[i]['ip'] +'">';
	        }  else if( key == "obj"){
	            htm1 += '<div class="basic_cont_row js-obj-row" data-host="' + data[i]['hostname'] + '" data-status="'+ data[i]['status'] +'" data-ip="'+ data[i]['addr'] +'">';
	        }
	        var hostname = "";
	        if (key == "nas") {
	            hostname = data[i]['nodename'];
	        } else{
	            hostname = data[i]['hostname'];
	        }
	        htm1 +=     '<div class="col-lg-6 basic-lg-6 inlineblock" style="padding: 0 !important;text-align: left !important;">' +
	                      '<span style="padding-left: 50px;">' + hostname + '</span>'+
	                    '</div>'+
	                    '<div class="col-lg-2 basic-lg-2 inlineblock js-status left">';
	            if (key == "nas") {
	                var nstatus = data[i]['nstatus'];
	                nstatus = getCnasNodeState (nstatus);
	                if ( nstatus == 'normal' ) {
	                    htm1 += '<span style="color:green;">' + nstatus + '</span>' ;
	                } else {
	                    htm1 += '<span style="color:red;">' + nstatus + '</span>' ;
	                }
	            } else{
	                if ( data[i]['status'] == 1 ) {
	                    htm1 += '<span style="color:green;">' + lang.running + '</span>' ;
	                } else {
	                    htm1 += '<span style="color:red;">' + lang.stopped + '</span>' ;
	                }
	            }

	            if ( key == "stroagenode") {
	                htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
		                        '<a href="javascript:;" class="hidden js-start-storage-service" title="'+ lang.cluster.start_storage_service +'" style="margin-right:15px;">'+
		                            '<span class="glyphicon glyphicon-play"></span>'+
		                        '</a>'+
		                        '<a href="javascript:;" class="hidden js-stop-storage-service" title="' + lang.cluster.stop_storage_service + '" style="margin-right:15px;">'+
		                            '<span class="glyphicon glyphicon-pause"></span>'+
		                        '</a>'+
		                        '<a href="javascript:;" class="hidden js-del-storage-service" title="' + lang.cluster.del_storage_service+ '">'+
		                            '<span class="glyphicon glyphicon-trash"></span>'+
		                        '</a>'+
		                    '</div>'+
		                '</div>';
	            } else if( key == "monitor"){
	                htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
	                        '<a href="javascript:;" class="hidden js-start-monitor-service" title="'+ lang.cluster.start_monitor_service +'" style="margin-right:15px;">'+
	                            '<span class="glyphicon glyphicon-play"></span>'+
	                        '</a>'+
	                        '<a href="javascript:;" class="hidden js-stop-monitor-service" title="' + lang.cluster.stop_monitor_service + '" style="margin-right:15px;">'+
	                            '<span class="glyphicon glyphicon-pause"></span>'+
	                        '</a>'+
	                        '<a href="javascript:;" class="hidden js-del-monitor-service" title="' + lang.cluster.del_monitor_service+ '">'+
	                            '<span class="glyphicon glyphicon-trash"></span>'+
	                        '</a>'+
	                    '</div>'+
	                '</div>';
	            } else if( key == "meta"){
	                htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
	                        '<a href="javascript:;" class="hidden js-start-meta-service" title="'+ lang.cluster.start_meta_service +'" style="margin-right:15px;">'+
	                            '<span class="glyphicon glyphicon-play"></span>'+
	                        '</a>'+
	                        '<a href="javascript:;" class="hidden js-stop-meta-service" title="' + lang.cluster.stop_meta_service + '" style="margin-right:15px;">'+
	                            '<span class="glyphicon glyphicon-pause"></span>'+
	                        '</a>'+
	                        '<a href="javascript:;" class="hidden js-del-meta-service" title="' + lang.cluster.del_meta_service+ '">'+
	                            '<span class="glyphicon glyphicon-trash"></span>'+
	                        '</a>'+
	                    '</div>'+
	                '</div>';
	            } else if( key == "nas"){
	                if (sstatus == 'unknown') {
	                    htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
	                                '<a href="javascript:;" class="hidden js-del-nas-service" title="' + lang.cluster.del_nas_service+ '">'+
	                                    '<span class="glyphicon glyphicon-trash"></span>'+
	                                '</a>'+
	                            '</div>'+
	                        '</div>';
	                } else{
	                    htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
	                            '<a href="javascript:;" class="hidden js-start-nas-service" title="'+ lang.cluster.start_nas_service +'" style="margin-right:15px;">'+
	                                '<span class="glyphicon glyphicon-play"></span>'+
	                            '</a>'+
	                            '<a href="javascript:;" class="hidden js-stop-nas-service" title="' + lang.cluster.stop_nas_service + '" style="margin-right:15px;">'+
	                                '<span class="glyphicon glyphicon-pause"></span>'+
	                            '</a>'+
	                            '<a href="javascript:;" class="hidden js-del-nas-service" title="' + lang.cluster.del_nas_service+ '">'+
	                                '<span class="glyphicon glyphicon-trash"></span>'+
	                            '</a>'+
	                        '</div>'+
	                    '</div>';
	                }

				} else if( key == "obj"){
					// htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
					// 	'</div>'+
					// 	'</div>';
          htm1 += '</div>' + '<div class="col-lg-4 basic-lg-4 inlineblock" style="height:30px;">' +
               '<a href="javascript:;" class="hidden js-start-obj-service" title="'+ lang.cluster.start_obj_service +'" style="margin-right:15px;">'+
                   '<span class="glyphicon glyphicon-play"></span>'+
               '</a>'+
               '<a href="javascript:;" class="hidden js-stop-obj-service" title="' + lang.cluster.stop_obj_service + '" style="margin-right:15px;">'+
                   '<span class="glyphicon glyphicon-pause"></span>'+
               '</a>'+
           '</div>'+
          '</div>';
				}
	    }
	    return htm1;
	}

	//列举可添加的节点
	function showAvailNodeList ( idname ) {
		nodeLoaded = 'yes';
		var nodeListCallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				nodeListData = result.result.nodes;
				var nodes = result.result.nodes;
				var count = result.result.count;
				var htm = "";
				if ( count > 0 ) {
					for (var i = 0; i < nodes.length; i++) {
						var node = nodes[i];
						htm += '<option data-host="'+ node['hostname'] + '">' + node['hostname'] + '</option>';
					}
				}
				$modal.find('#' + idname).html( htm );
			} else {
				DisplayTips( lang.cluster.list_avail_nodes_add_fail );
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel["listNode"](null, nodeListCallback, true, null);
	}

    //判断IP地址格式
    function isIpAddr(str){
        return (str.match(/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/g) !== null);
    }
    //判断url格式
    function isUrl(str){
        return (str.match(/[a-zA-z]+:\/[^\s]*/) !== null);
    }
    //判断域名格式
    function isDomain(str){
        return (str.match(/^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/));
    }
})
