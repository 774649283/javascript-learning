$(function (ev) {
	var nodeaddedData = '';//存储列举磁盘时候的参数
	var diskLoaded = 'no'; //判断磁盘是否加载，若已经加载则不再加载（配置向导上的）
	var nodeLoaded = 'no';//判断节点是否列举
	var pubIpLoaded = "no";//判断公共IP是否加载
  var hasActivitedNode = false; // 是否有激活节点
	var availcode = '';
	var allnodes = [];
	//配置向导
	$(document)
	//检测有无集群状态
	.on()
	.on ( 'mouseover', '.wizard-mag.dns-mag', function (ev) {
		$this = $(this);
		$this.find('.js-act-dns').removeClass('hidden');
	})
	.on ( 'mouseout', '.wizard-mag.dns-mag', function (ev) {
		$this = $(this);
		$this.find('.js-act-dns').addClass('hidden');
	})
	//启动主节点DNS服务
	.on ( 'click', '.js-set-dns-on', function (ev) {
		$modal = $('#startDnsModel');
		$pnode = $('.js-setdns-cont .js-primarynode-ip');
		var ip = trim( $pnode.text() );
		$modal.modal('show');
		$modal.data('node', ip);
	})
	.on ( 'click', '.js-act-dns .js-dns-on', function (ev) {
		$modal = $('#startDnsModel');
		$this = $(this);
		$row = $this.closest('.dns-mag');
		$('.dns-secondary-list').find('.dns-mag').removeClass('actactive');
		$row.addClass('actactive');
		var ip = $this.data('ip');
		$modal.modal('show');
		$modal.data('node', ip);
	})
	//确定启动DNS服务
	.on ( 'click', '#startDnsModel .btn-primary', function (ev) {
		$modal = $('#startDnsModel');
		var node = $modal.data('node');
		var parameter = {
			'nodes': node,
		};
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.cluster.start_dns_success );
				$modal.modal('hide');
				$row = $('.dns-mag.actactive');
				if ( $row.length > 0 ) {
					var htm = "";
					htm += '<a class="fl-rt js-dns-off" href="javascript:;" title="'+ lang.stop +'" data-ip="' + node + '">'+
					            '<span class="glyphicon glyphicon-pause"></span>'+
					        '</a>';
					$row.find('.basic-lg-2 span.js-act-dns').html(htm);
				} else{
					$server = $('.js-setdns-cont').find('.js-dns-on-off');
					$('.js-setdns-cont').find('.js-server-primarynode').text( lang.start );
					$server.find('.js-set-dns-on').addClass('hidden');
					$server.find('.js-set-dns-off').removeClass('hidden');
				}
			} else {
				DisplayTips( lang.cluster.start_dns_fail );
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['startDns'](parameter, dncallback, true, lang.cluster.start_dns);
	})
	//暂停主节点DNS服务
	.on ( 'click', '.js-set-dns-off', function (ev) {
		$modal = $('#stopDnsModel');
		$pnode = $('.js-setdns-cont .js-primarynode-ip');
		var ip = trim( $pnode.text() );
		$modal.modal('show');
		$modal.data('node', ip);
	})
	.on ( 'click', '.js-act-dns .js-dns-off', function (ev) {
		$modal = $('#stopDnsModel');
		$this = $(this);
		$row = $this.closest('.dns-mag');
		$('.dns-secondary-list').find('.dns-mag').removeClass('actactive');
		$row.addClass('actactive');
		var ip = $this.data('ip');
		$modal.modal('show');
		$modal.data('node', ip);
	})
	//确定暂停DNS服务
	.on ( 'click', '#stopDnsModel .btn-primary', function (ev) {
		$modal = $('#stopDnsModel');
		var node = $modal.data('node');
		var parameter = {
			'nodes': node,
		};
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.cluster.stop_dns_success );
				$modal.modal('hide');
				$row = $('.dns-mag.actactive');
				if ( $row.length > 0 ) {
					var htm = "";
					htm += '<a class="fl-rt js-dns-on" href="javascript:;" title="'+ lang.start +'" data-ip="' + node + '">'+
					            '<span class="glyphicon glyphicon-play"></span>'+
					        '</a>';
					$row.find('.basic-lg-2 span.js-act-dns').html(htm);
				} else{
					$('.js-setdns-cont').find('.js-server-primarynode').text( lang.stop );
					$server = $('.js-setdns-cont').find('.js-dns-on-off');
					$server.find('.js-set-dns-off').addClass('hidden');
					$server.find('.js-set-dns-on').removeClass('hidden');
				}
			} else {
				DisplayTips( lang.cluster.stop_dns_fail );
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['stopDns'](parameter, dncallback, true, lang.cluster.stop_dns);
	})
	//设置DNS主节点
	.on ( 'click', '.js-set-dns-primary', function (ev) {
		$modal = $('#setDnsPrimaryModel');
		$modal.modal('show');
	})
	.on( 'click', '#setDnsPrimaryModel .btn-primary', function (ev) {
		$modal = $('#setDnsPrimaryModel');
		var origin = trim( $modal.find('input.js-input-domain').val() );
		if ( origin == '' ) {
			DisplayTips( lang.cluster.input_domain_name );
			return;
		}
		if ( !valifyURL( origin ) ) {
			DisplayTips( lang.cluster.domian_name_error );
			return;
		}
		var node = trim ( $modal.find('#select_pri_node_ip').val() );
		if ( node == '' ) {
			DisplayTips( lang.cluster.select_primary_node );
			return;
		}
		var parameter = {
			'node': node,
			'origin': origin
		};
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.cluster.set_primargy_node_success );
				$modal.modal('hide');
			} else {
				DisplayTips( lang.cluster.set_primargy_node_fail );
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['setDnsPri'](parameter, dncallback, true, lang.cluster.set_primargy_node);
	})
	//设置DNS从节点
	.on ( 'click', '.js-set-dns-secondary', function (ev) {
		$modal = $('#setDnsSecondaryModel');
		$modal.modal('show');
	})
	.on ( 'change', '#setDnsSecondaryModel #select_pri_node_ip', function (ev) {
		$this = $(this);
		$modal = $('#setDnsSecondaryModel');
		var host = trim ( $this.val() );
		$inputs = $modal.find('ul#select_sec_node_ip').find('input');
		var name = '';
		$inputs.each(function (i) {
			$this = $(this);
			name = $this.data('name');
			if ( host == name ) {
				$this.attr( 'disabled', 'disabled' );
			} else {
				$this.removeAttr('disabled');
			}
		});
	})
	.on( 'click', '#setDnsSecondaryModel .btn-primary', function (ev) {
		$modal = $('#setDnsSecondaryModel');
		var origin = trim( $modal.find('input.js-input-domain').val() );
		if ( origin == '' ) {
			DisplayTips( lang.cluster.input_domain_name );
			return;
		}
		if ( !valifyURL( origin ) ) {
			DisplayTips( lang.cluster.domian_name_error );
			return;
		}
		var masterip = trim ( $modal.find('#select_pri_node_ip').val() );
		var node = "";
		if ( masterip == '' ) {
			DisplayTips( lang.cluster.select_primary_node );
			return;
		}
		$inputs = $modal.find('ul#select_sec_node_ip').find('input[type="checkbox"]:checked');
		if ($inputs.length <= 0) {
			DisplayTips( lang.cluster.select_second_node );
			return;
		}
		for (var i = 0; i < $inputs.length; i++) {
			$li = $($inputs[i]).closest('li');
			var ip = $li.data('ip');
			node += ip + ',';
		};
		node = node.substring( 0, node.length-1);
		var parameter = {
			'node': node,
			'origin': origin,
			'masterip': masterip,
		};
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips( lang.cluster.set_sec_node_success );
				$modal.modal('hide');
			} else {
				DisplayTips( lang.cluster.set_sec_node_fail );
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['setDnsSec'](parameter, dncallback, true, lang.cluster.set_sec_node);
	})
	//清除集群
	.on('click', '#destroyClusterModal .btn-danger', function (ev) {
		$modal = $('#destroyClusterModal');
		var confirmText = trim($modal.find('#submitDestroy').val()).toLowerCase();

		if (confirmText !== 'confirm') {
			DisplayTips(lang.cluster.confirm_input_confirm);
			return;
		}


		var desCallback = function (result) {
			$modal.find('.modal-header').LoadData('hide');
			if (!result) {
				return;
			}
			$modal.modal('hide');
			if (result.code === 200) {
				setTimeout(function() {
					showWizardModal();
				}, .5e3);
			} else {
				DisplayTips(lang.cluster.destroy_cluster_fail);
			}
		}

		$modal.find('.modal-header').LoadData('show');
		DataModel['clusterDestroy'](null, desCallback, true, null);
    // desCallback({code: 200});
	})
	//集群关机
	.on('click', '#clusterShutdownModal .btn-danger', function (ev) {

		$modal = $('#clusterShutdownModal');
		var Callback1 = function (result) {
			$(".step1").prev().LoadData ("hide");
			if (result.code === 200) {
				if(result.result.unavail.join() == ''){
					$modal.modal('show');
					availcode = result.result.avail.join();
					$modal.find('.step1').css('color','limegreen').text('done');
					para2.ips = availcode;
					para3.ips = availcode;
					para4.ips = availcode;
					para5.ips = availcode;
					para6.ips = availcode;
					$(".step2").prev().LoadData ("show").css('top','10px');
					DataModel['shutdownPrework2'](para2, Callback2, true, null);
				}else{
					$modal.modal('hide');
					$('#ignoreNodeModal').modal('show');
					$('#ignoreNodeModal .ignore-message').html(lang.cluster.shutdown_ignore + result.result.unavail.join() + '?')
					$(document)
						.on('click', '#ignoreNodeModal .btn-danger', function (ev) {
							$('#ignoreNodeModal').modal('hide');
							$modal.modal('show');
							availcode = result.result.avail.join();
							$modal.find('.step1').css('color','limegreen').text('done');
							para2.ips = availcode;
							para3.ips = availcode;
							para4.ips = availcode;
							para5.ips = availcode;
							para6.ips = availcode;
							$(".step2").prev().LoadData ("show").css('top','10px');
							DataModel['shutdownPrework2'](para2, Callback2, true, null);
						})
				}
			} else{
				DisplayTips( lang.wizard.shutdown_err );
				$modal.modal('hide');
			}
		}
		var Callback2 = function (result) {
			$(".step2").prev().LoadData ("hide");
			$('#manualShutdownServiceModal .modal-header').LoadData('hide');
			var erronum = result.result.length;
			if (result.code === 200 ) {
				for(var i= 0;i<result.result.length;i++){
					if(result.result[i].result != 0){
						$('#manualShutdownServiceModal').css('z-index',10000).modal('show');
						$modal.modal('hide');
						$('#manualShutdownServiceModal .manual-step').html('2');
						$('#manualShutdownServiceModal .manual-message').html( result.result[i].node + lang.cluster.nodes + result.result[i].detail.failed.join() + lang.cluster.service_fail );
						$(document)
							.on('click', '#manualShutdownServiceModal .btn-danger', function (ev) {
								para2.force = true;
								$('#manualShutdownServiceModal .modal-header').LoadData('show');
								DataModel['shutdownPrework2'](para2, Callback2, true, null);
							})
							.on('click', '#manualShutdownServiceModal .btn-primary', function (ev) {
								$('#manualShutdownServiceModal .modal-header').LoadData('show');
								DataModel['shutdownPrework2'](para2, Callback2, true, null);
							})
					}else{
						erronum--
					}
				}
			   if(erronum == 0){
					$modal.modal('show');
					$modal.find('.step2').css('color','limegreen').text('done');
					$(".step3").prev().LoadData ("show").css('top','10px');
					DataModel['shutdownPrework3'](para3, Callback3, true, null);
				}
			}
		}
		var Callback3 = function (result) {
			$('#manualShutdownServiceModal').modal('hide');
			$(".step3").prev().LoadData ("hide");
			if (result.code === 200) {
				$modal.find('.step3').css('color','limegreen').text('done');
				$(".step4").prev().LoadData ("show").css('top','10px');
				DataModel['shutdownPrework4'](para4, Callback4, true, null);
			} else {

			}
		}
		var Callback4 = function (result) {
			$(".step4").prev().LoadData ("hide");
			$('#manualShutdownServiceModal .modal-header').LoadData('hide');
			var erronum = result.result.length;
			if (result.code === 200) {
				for(var i= 0;i<result.result.length;i++) {
					if (result.result[i].result != 0) {
						$('#manualShutdownServiceModal').modal('show');
						$modal.modal('hide');
						$('#manualShutdownServiceModal .manual-step').html('4');
						$('#manualShutdownServiceModal .manual-message').html(result.result[i].node + ' ' + result.result[i].detail.failed[0]);
						$(document)
							.on('click', '#manualShutdownServiceModal .btn-danger', function (ev) {
								para4.force = true;
								$('#manualShutdownServiceModal .modal-header').LoadData('show');
								DataModel['shutdownPrework4'](para4, Callback4, true, null);
							})
							.on('click', '#manualShutdownServiceModal .btn-primary', function (ev) {
								$('#manualShutdownServiceModal .modal-header').LoadData('show');
								DataModel['shutdownPrework4'](para4, Callback4, true, null);
							})
					}else{
						erronum--
					}
				}
				if(erronum == 0) {
					$modal.modal('show');
					$modal.find('.step4').css('color', 'limegreen').text('done');
					$(".step5").prev().LoadData("show").css('top', '10px');
					DataModel['shutdownPrework5'](para5, Callback5, true, null);
				}
			}
		}
		var Callback5 = function (result) {
			$('#manualShutdownServiceModal').modal('hide');
			$(".step5").prev().LoadData ("hide");
			if (result.code === 200) {
				$modal.find('.step5').css('color','limegreen').text('done');
				$modal.find('.step6').css('color','limegreen').text('done');
				DisplayTips( lang.cluster.shutdown_cluster_success );
				DataModel['clusterShutdown'](para6, Callback6, true, null);
			} else {

			}
		}
		var Callback6 = function (result) {
			$(".step6").prev().LoadData ("hide");
			$modal.find('.step6').css('color','limegreen').text('done');
			DisplayTips( lang.cluster.shutdown_cluster_success );
      // 集群界面状态更新
      $('.m-nodelist-op').each(function () {
        $(this).addClass('m-nodelist-op-disable');
        $(this).removeClass('m-nodelist-op');
      })

			setTimeout(function() {
				$modal.modal('hide');
			}, 2e3);
		}
		var para1 = {
			'ips' : '',
			'step' : 1,
			'force':false
		}
		var para2 = {
			'ips' : availcode,
			'step' : 2,
			'force':false
		}
		var para3 = {
			'ips' : availcode,
			'step' : 3,
			'force':false
		}
		var para4 = {
			'ips' : availcode,
			'step' : 4,
			'force':false
		}
		var para5 = {
			'ips' : availcode,
			'step' : 5,
			'force':false
		}
		var para6 = {
			'ips' : availcode
		}
		$('#clusterShutdownModal .btn-default').addClass('hidden');
		$('#clusterShutdownModal .btn-danger').addClass('hidden');
		$(".step1").prev().LoadData ("show").css('top','0');
		DataModel['shutdownPrework'](para1, Callback1, true, null);

	})

	.on('click', '.js-wizard-conf', function (ev) {
		var checkCallback = function (result) {
			if (!result) {
				return;
			}
			if (result.code === 200) {
				$modal = $('#destroyClusterModal');
				$modal.modal('show');
			} else {
				showWizardModal();
			}
		}

		DataModel['clusterState'](null, checkCallback, true, null);
	})
	.on('shown.bs.modal', '#wizardConfModal', function (ev) {
		$(this).find('#getnextpasswd').focus();
	})
	.on('hidden.bs.modal', '#wizardConfModal', function (ev) {
		var path1="css/image/xz.png";
		var path2="css/image/wxz.png";
		var objImg=$('#wizardConfModal .list-inline').find('img');
		objImg.eq(0).attr('src',path1);
		for(var i=1;i<objImg.length;i++){
			objImg.eq(i).attr('src',path2);
		}
		})
	//点击跳过
	.on ( 'click', '.js-mds-jump', function (ev) {
		var curnum = $('.mds-wizardconf').prevAll('.wizardconf').length + 1;
		var total = $('#wizardConfModal .modal-body').find('.wizardconf').length;
		$('.mds-wizardconf').addClass('hidden jumping').removeClass('showing');
		$('.submit-wizardconf').removeClass('hidden').addClass('showing');
		$('ul.wizard-nav-ul li.js-wizard-nav:eq('+ curnum +')').addClass('hidden');
		$('ul.wizard-nav-ul li.js-wizard-nav:eq('+ total +')').removeClass('hidden');
		$('.js-cur-wizard-num').text(total);
		$('.js-total-wizard').text(total);
		//$('.modal-footer .btn-default').removeClass('hidden');
		$('.modal-footer .js-submit-all').removeClass('hidden');
		$(this).addClass('hidden');
		$('#wizardConfModal').data('disks', 'no');
		$('#prew-wizard-right').addClass('hidden');
		$('.js-wizard-nav5').addClass('hidden');
		$('.js-wizard-nav8').removeClass('hidden');
	})
	.on ( 'mouseover', '.ip-dns-wizardconf .js-setdns-cont', function (ev) {
		$this = $(this);
		$this.find('.js-set-dns-secondary').removeClass('hidden');
		$this.find('.js-set-dns-primary').removeClass('hidden');
		$this.find('.js-dns-on-off ').removeClass('hidden');
	})
	.on ( 'mouseout', '.ip-dns-wizardconf .js-setdns-cont', function (ev) {
		$this = $(this);
		$this.find('.js-set-dns-secondary').addClass('hidden');
		$this.find('.js-set-dns-primary').addClass('hidden');
		$this.find('.js-dns-on-off ').addClass('hidden');
	})
	.on ( 'focus', '.js-get-publicip', function (ev) {
		$this = $(this);
		$this.css( 'border', '0' );
	})
	//右 点击'下一步'
	.on ( 'click', '#prew-wizard-right', function (ev) {
		$this = $(this);
		$modal = $('#wizardConfModal');
		var total = $modal.find('.form-horizontal.wizardconf').length;
		$curW = $modal.find('.form-horizontal.showing');//当前显示的配置向导
		var num = $curW.data('num');
    var licenseInfo = [];  // license信息

    /* ------------------- 切换配置步骤 ------------------- */

    var switchSteps = function () {

      $('.wizard-nav-ul .js-wizard-nav'+num).addClass('hidden');
      num ++;
      changeBg(num,'next');
      //判断，如果num>1，"上一步"箭头显示
      if (num > 1 || num > "1") {
        $('#prew-wizard-left').removeClass('hidden');
      }
      //当前显示的配置向导隐藏，下一个显示
      $curW.removeClass('showing').addClass('hidden');
      $('.form-horizontal.wizard'+num).removeClass('hidden').addClass('showing');
      //当前步骤数加1
      $('.js-cur-wizard-num').text(num);
      //ul 标题也要切换成相应的
      $('.wizard-nav-ul .js-wizard-nav'+num).removeClass('hidden');
      //判断右箭头就消失
      if (num == total) {
        $this.addClass('hidden');
      }
      //让鼠标聚焦到 节点选项
      $('.showing .js-storagenodeslist').find('input').eq(0).focus();

    };


    if ( num == 1) {
			//第一步的时候，判断是否输入了confirm
			var passwd = $("#getnextpasswd").val ();
			if (passwd.toLowerCase() != "confirm") {
				DisplayTips(lang.cluster.confirm_input_confirm);
				return false;
			}

      // 判断节点的激活情况
      var listCallback = function (res) {
          $('#wizardConfModal').find('.modal-content').LoadData('hide');
          if (res.code === 200) {
              var data = res.result;
              licenseInfo = data;
              var tbodyContent = "";
              for (var i = 0; i < data.length; i++) {
                  data[i].actived && (hasActivitedNode = true);
              }

              if (hasActivitedNode) {
                switchSteps();
                $(".wizard2").LoadData ("show");
                DataModel["listNode"](null, nodeCallback, true, null);
                // if ( nodeLoaded == 'no') {
          			// 	$(".wizard2").LoadData ("show");
          			// 	DataModel["listNode"](null, nodeCallback, true, null);
          			// 	nodeLoaded = 'yes';
          			// }
              }else {
                DisplayTips(lang.licence.run_wizard_license_tips);
              }

          } else {
              DisplayTips(lang.licence.get_list_fail);
          }
      }

			// 获取集群激活节点
			var getClusterActivedNodes = function (nodes, callback) {
				DataModel['getClusterActivedNodes'](null, function (rsp) {
					if (rsp.code == 200) {
						var activatedNodes = rsp.result.info.filter(function(node) {
							return node.isActivated;
						}).map(function (node) {
							return node.ip;
						});
						callback(nodes.filter(function (node) {
							return activatedNodes.includes(node.ip);
						}));
					}else {
						var errNodes = rsp.result.err.map(function(node) {
							return node.ip;
						});
						DisplayTips(errNodes.join(',') + lang.licence.license_get_activated_nodes_fail);
						callback([]);
					}
				}, true, null)
			};

      DataModel['licenseList'](null, listCallback, true, null);
      $('#wizardConfModal').find('.modal-content').LoadData('show');

			//加载出配置向导中的节点信息
			var nodeCallback = function (result){
				$(".wizard2").LoadData ("hide");
				if (result == undefined)
					return;
				if (result.code == 200) {
					var data = result.result.nodes;
          getClusterActivedNodes(data, function (data) {
            if (!data.length) {
              return DisplayTips(lang.licence.activited_node_not_found);
            }
            //下面是加载存储节点、监控节点、元数据节点 ntp节点
            var storagehtm = nodeLoadHtml('storagenode', data);
            var monitorhtm = nodeLoadHtml('monitornode', data);
            var mgrhtm = nodeLoadHtml('monitornode', data);
            var mdshtm = nodeLoadHtml('mdsnode', data);
            var dnshtm = nodeLoadHtml('dnsnode', data);
            //ntp节点
            var ntphtm = nodeLoadHtml('dnsnode', data, 'ntp');
            // var ntphtm = nodeLoadHtml('dnsnode', data);
            $('.ntp-wizardconf').find('ul.js-storagenodeslist').html(ntphtm).find('input').eq(0).focus();
            $('.ntp-wizardconf').find('ul.js-storagenodeslist>li').each(function(index){
              if(index>1){
                $(this).find('input:checked').prop('checked',false);
              }
            });
            //ntp节点
            $('.storage-wizardconf').find('ul.js-storagenodeslist').html(storagehtm);
            $('.monitor-wizardconf').find('ul.js-storagenodeslist').html(monitorhtm);
            $('.mgr-wizardconf').find('ul.js-storagenodeslist').html(mgrhtm);
            $('.mds-wizardconf').find('ul.js-storagenodeslist').html(mdshtm);
            $('.dns-wizardconf').find('ul.js-storagenodeslist').html(dnshtm);

            //加载NAS网关服务
            var nashtm = "";
            for (var i = 0; i < data.length; i++) {
              var node = data[i];
              allnodes.push(data[i].ip);
              nashtm += 	'<tr data-ip="'+ node['hbeatip'] +'" data-name="'+ node['hostname'] +'">'+
              '<td>' + node['hostname'] + '</td>'+
              '<td>'+
              '<select class="none-border-input js-select-network" style="margin-left:-5px;">'+
              '</select>'+
              '</td>'+
              '<td>'+
              '<input type="text" class="none-border-input js-get-publicip" placeholder="'+ lang.cluster.please_input_publicip +'" style="padding-right: 15px;">'+
              '<span>/</span>'+
              '<input type="text" class="none-border-input js-get-netmask" placeholder="'+ lang.cluster.please_input_netmask +'" style="padding-left: 15px;width:100px;">'+
              '</td>'+
              '</tr>';
              nodeaddedData += node['ip'] + ',';
            };
            nodeaddedData = nodeaddedData.substring(0, nodeaddedData.length-1);
            $('.nas-wizardconf').find('.nas-pubip-service tbody').html(nashtm);

          });

				} else {
					DisplayTips( lang.cluster.list_avail_nodes_add_fail );
				}
			}
      // if ( nodeLoaded == 'no') {
			// 	$(".wizard2").LoadData ("show");
			// 	DataModel["listNode"](null, nodeCallback, true, null);
			// 	nodeLoaded = 'yes';
			// }
		} else if ( num == 2 ) {
			//判断勾选节点数量，选取1到3个节点
			$inputs = $modal.find('.ntp-wizardconf .js-storagenodeslist').find(':checked');
			if ( $inputs.length < 1 || $inputs.length > 3) {
				DisplayTips(lang.cluster.select_nodes_for_ntp);
				return false;
			}
			//外部源格式判断|| (valifyDomain(clockSource)) 域名验证暂时不用
			var clockSource = trim($('#wizardClockSource').val());
            if ( isIpAddr(clockSource) || (valifyDomain(clockSource))  ) {
        	} else if ( clockSource == '') {

        	} else{
        		DisplayTips(lang.cluster.confirm_ip_format);
        		return false;
        	}
        	//把NTP主节点及外部时钟源设置显示到确认页面上
        	var ntpnotechecked = $modal.find('.wizard2 .js-storagenodeslist').find('li input[type="checkbox"]:checked');
        	var ntphtmconfirm = addNodeInfo(ntpnotechecked);
        	$('.ntp-node-selected').html(ntphtmconfirm);
        	$('.ntp-alock').html(clockSource);

      switchSteps();
		} else if ( num == 3 ) {
			// 第二步判断是否有三个或者三个以上的存储节点
			//1、设置集群存储节点,获取相关参数
			$snodeinputs = $modal.find('.storage-wizardconf .js-storagenodeslist').find('li input[type="checkbox"]:checked');
			if ($snodeinputs.length < 1) {
				DisplayTips(lang.cluster.select_three_stroage_node);
				return false;
			} else {
				//把所选存储节点显示到确认提交页面上
				var shtm = addNodeInfo($snodeinputs);
				$('.submit-wizardconf .s-node-selected').html(shtm);
			}

      switchSteps();

		} else if ( num == 4 ) {
			//监控节点大于等于3
			$mnodeinputs = $modal.find('.monitor-wizardconf .js-storagenodeslist').find('li input[type="checkbox"]:checked');
			if ($mnodeinputs.length < 1) {
				DisplayTips(lang.cluster.select_three_monitor_node);
				return false;
			} else {
				//把所选监控节点显示到确认提交页面上
				var shtm = addNodeInfo($mnodeinputs);
				$('.submit-wizardconf .s-monitor-service').html(shtm);
			}

			//这里加载磁盘
			var dpara = {
				'hostnames': nodeaddedData
			};
			var dCallback = function (result){
				$(".disksadd-wizardconf").LoadData ("hide");
				if (result == undefined)
					return;
				if (result.code == 200) {
					var data = result.result;
					// sortDiskInfo(data);
					var htm = "";
					for (var i = 0; i < data.length; i++) {
						var host = data[i];

						htm +=  '<tr class="js-node" data-ip="'+ host['ip'] +'" data-name="'+ host['hostname'] +'">'+
									'<td class="left" style="width:50%;">'+
										'<a href="javascript:;" class="js-plus-subdisks" data-ip="'+ host['ip'] +'" data-name="'+ host['hostname'] +'">'+
											'<span class="glyphicon glyphicon-plus-sign"></span>'+
										'</a>'+
										'<a href="javascript:;" class="js-minus-subdisks hidden" data-ip="'+ host['ip'] +'">'+
											'<span class="glyphicon glyphicon-minus-sign">'+
											'</span>'+
										'</a>'+
										'<span style="margin-left:10px;">' + host['hostname'] + '</span>'+
										'<span>（'+ host['ip'] +'）</span>'+
									'</td>'+
									'<td style="width:50%;padding-left:41px;">'+
										'<input type="checkbox" class="sub-check-disk" style="float:left;width:16px;height:16px;" />'+
									'</td>'+
								'</tr>'+
								'<tr class="subdisks hidden" data-ip="'+ host['ip'] +'" data-host="'+ host['hostname'] +'">'+
									'<td colspan="2" style="padding:0;">'+
										'<table class="table table-condensed table-hover" style="margin-left:2em;margin-bottom:0;">'+
											'<tbody>';
								var disk = host['diskinfo']['available'];
								if (disk.length > 0) {
									for (var j = 0; j < disk.length; j++) {
										(disk[j]['type']=='hdd')?(disk[j]['type']='HDD'):(disk[j]['type']='SSD');
										htm +=  '<tr class="js-disk" data-disk="'+ disk[j]['devicename'] +'">'+
													'<td class="showleftborder" style="width:50%;">'+
														'<div class="showcenterline" style="width:15px;float:left;"></div>'+
														'<span style="float:left;">'+ disk[j]['devicename'] +'（'+ disk[j]['size'] +'，'+ disk[j]['type'] +'）</span>'+
													'</td>'+
													'<td style="width:50%;padding-left: 9px;">'+
														'<input type="checkbox" class="sub-check-disk" style="float:left;width:16px;height:16px;">'+
													'</td>'+
												'</tr>';
									};
								} else{
									htm +=  '<tr class="js-disk">&nbsp;</tr>';
								}


									htm +=	'</tbody>'+
										'</table>'+
									'</td>'+
								'</tr>';
					};
					$('.disksadd-wizardconf .wizard-disk-body tbody').html(htm);
				} else {
					DisplayTips( lang.cluster.list_avail_disks_add_fail );
				}
			}

			if (diskLoaded == 'no') {
				diskLoaded = 'yes';
				$(".disksadd-wizardconf").LoadData ("show");
				DataModel["listDiskDetails"](dpara, dCallback, true, null);
			}

      switchSteps();

      // 添加mgr
		} else if (num == 5) {
      //监控节点大于等于3
      $mnodeinputs = $modal.find('.mgr-wizardconf .js-storagenodeslist').find('li input[type="checkbox"]:checked');
      console.log($mnodeinputs);

      if ($mnodeinputs.length < 1) {
        DisplayTips(lang.cluster.select_three_monitor_node);
        return false;
      } else {
        //把所选监控节点显示到确认提交页面上
        var shtm = addNodeInfo($mnodeinputs);
        $('.submit-wizardconf .s-mgr-service').html(shtm);
      }

      switchSteps();

    }

    else if( num == 6 ) {
			//添加磁盘
			$diskinputs = $('.wizard-disk-body').find('.js-disk input[type="checkbox"]:checked');
			//1、获取页面上所有被选中的js-node
			$nodeinputs = $('.wizard-disk-body').find('.js-node');
			if ($diskinputs.length < 1) {
				//如果没有选择磁盘，则提示用户“当前未选择磁盘，请选择磁盘进入“下一步”或者点击“跳过”到最后一页
				//DisplayTips( lang.storage.please_select_disks );
				//return false;
			} else {
				//"跳过"按钮出现
				//$('.js-mds-jump').removeClass('hidden');

				var htm = "";
				var result = addDiskInfo( $nodeinputs );
				htm = result.htm;

				var hostList = result.arr;
				var diskhostname = "";
				for (var i = 0; i < hostList.length; i++) {
					diskhostname += hostList[i][2] + ':' + hostList[i][1] + ';';
				}
				diskhostname = diskhostname.substring(0 ,diskhostname.length-1);
				var diskpara = {
					'diskListStr': diskhostname,
				};
				$('.submit-wizardconf .disk-list table tbody').html(htm);
			}

      switchSteps();

		} else if( num == 7 ) {
			//把所选元数据服务节点显示到确认提交页面上
			$mdsnodeinputs = $modal.find('.mds-wizardconf .js-storagenodeslist').find('li input[type="checkbox"]:checked');
			//if ( $mdsnodeinputs.length < 1 ) {
			//	DisplayTips(lang.cluster.mds_node_select_two_or_no);
			//	return false;
			//}
			$('.js-mds-jump').addClass('hidden');
			var shtm = addNodeInfo($mdsnodeinputs);
			$('.submit-wizardconf .metadata-service').html(shtm);

			var hostsarr = '';
			$naspubiprows = $('.nas-wizardconf .nas-pubip-service tbody').find('tr');
			$naspubiprows.each(function (i) {

				//hostsarr += $(this).data('name') + ',';

				var host = $(this).data('name');
				if (host == '') {$( $naspubiprows[i] ).find('.js-select-network').html('');}
				else{
					var para = {
						'hosts': host,
					};
					var dncallback = function (res){
				        if(res.code == 200){
				        	$modal.find(".nas-pubip-service").LoadData ("hide");
				            var htm2 = "";
							var data = res.result.netlist;
							for (var j = 0; j < data.length; j++) {
								htm2 += '<option>' + data[j]['name'] + '</option>';

							}
							$( $naspubiprows[i] ).find('.js-select-network').html(htm2);
				        }else{
				            DisplayTips( lang.cluster.list_netport_info_fail );
				        }
				    }

				    $modal.find(".nas-pubip-service").LoadData ("show");
		    		DataModel['listIpSelected'](para, dncallback, false, null);

				}
			});
      switchSteps();

			// hostsarr = hostsarr.substring(0, hostsarr.length-1);
			// var para = {
			// 	'hosts': hostsarr
			// };
			// var dncallback = function (res){
		 //        if(res.code == 200){
		 //        	$modal.find(".nas-pubip-service").LoadData ("hide");
		 //            var htm1 = "",
		 //            	host = "",
		 //            	eths;
			// 		var data = res.result;
			// 		for (var i = 0; i < data.length; i++) {
			// 			eths = data[i]['netinfo']['netlist'];
			// 			htm1 = "";
			// 			for (var j = 0; j < eths.length; j++) {
			// 				htm1 += '<option>' + eths[j]['name'] + '</option>';
			// 				$( $naspubiprows[i] ).find('.js-select-network').html(htm1);
			// 			}
			// 		}
		 //        }else{
		 //            DisplayTips( lang.cluster.list_netport_info_fail );
		 //        }
		 //    }

		    // if (pubIpLoaded == 'no') {
		    // 	pubIpLoaded = "yes";
		    // 	$modal.find(".nas-pubip-service").LoadData ("show");
		    // 	DataModel['listIpSelected'](para, dncallback, true, null);
		    // }
		}
		else if ( num == 8 ) {
			//把所选NAS服务节点显示到确认提交页面上
			$nasnodeinputs = $modal.find('.nas-wizardconf .js-storagenodeslist').find('li input[type="checkbox"]:checked');
			var shtm = addNodeInfo($nasnodeinputs);
			$('.submit-wizardconf .nas-getway-service').html(shtm);
			$nasrows = $('.nas-wizardconf .nas-pubip-service tbody').find('tr');
			// var isConfNasBool = true;//判断是否所有的公共IP和掩码都已输入
			// var isPubIPFormatBool = true;//判断公共IP格式是否错误
			var nasnodeStr = '',
				hostStr = '',
				netportStr = '',
				ipaddrStr = '',
				netmaskStr = '';
			var nashtm = "";
			nashtm += '<table class="table table-condensed">' +
							'<tbody>';

			for(n = 0; n < $('.js-get-publicip').length;n++){
				var iplist = $('.js-get-publicip:eq(' + n + ')').val();
				var netmasklist = trim( $('.js-get-netmask:eq(' + n + ')').val() );
				if (iplist == '' && netmasklist == '') {
					// isConfNasBool = false;
					$(this).find('.js-get-publicip').val('');
					$(this).find('.js-get-netmask').val('');
				}
				else{
					if(!valifyIP( iplist )){
						DisplayTips( lang.wizard.your_cur_public_IP_format_error );
						return
					}else if((netmasklist <= 0) || (netmasklist >= 32)){
						DisplayTips( lang.network.mask_input_error );
						return
					}
				}
			}

			$nasrows.each(function (i) {
				var pubip = trim( $(this).find('.js-get-publicip').val() );
				var netmask = trim( $(this).find('.js-get-netmask').val() );
				if (pubip == '' && netmask == '') {
					// isConfNasBool = false;
					$(this).find('.js-get-publicip').val('');
					$(this).find('.js-get-netmask').val('');
				}
				//else if (!valifyIP( pubip )) {
				//		DisplayTips( lang.wizard.your_cur_public_IP_format_error );
				//		return;
				//		// isPubIPFormatBool = false;
				//		// $(this).find('.js-get-publicip').css('border', '1px solid red');
				//		//$(this).find('.js-get-publicip').val('');
				//}

				var name = trim( $(this).data('name') ) ;
				var netport = trim( $(this).find('select.js-select-network').val() ) ;
				var ipaddr = trim( $(this).find('input.js-get-publicip').val() ) ;
				var netmask = trim( $(this).find('input.js-get-netmask').val() ) ;
				nashtm += '<tr>' +
				        	'<td>'+ name +'</td>' +
				        	'<td>'+ netport +'</td>' +
				        	'<td>'+
				        		'<span>' + ipaddr + '</span>'+
				        		'<span>' + '/' + '</span>'+
				        		'<span>' + netmask + '</span>'+
				        	'</td>' +
				        '</tr>';
			});
			nashtm += '</tbody>'+
					'</table>';
			$('.submit-wizardconf .nas-getway-service').html(nashtm);
			nasnodeStr = nasnodeStr.substring(0, nasnodeStr.length-1 );
			hostStr = hostStr.substring(0, hostStr.length-1 );
			netportStr = netportStr.substring(0, netportStr.length-1 );
			ipaddrStr = ipaddrStr.substring(0, ipaddrStr.length-1 );
			netmaskStr = netmaskStr.substring(0, netmaskStr.length-1 );

			// if ( !isConfNasBool ) {
			// 	DisplayTips( lang.wizard.confirm_allnode_has_input_ipandnetmask + '（' + lang.wizard.red_means_ip_format_error + '）' );
			// 	return false;
			// }
			// if ( !isPubIPFormatBool ) {
			// 	DisplayTips( lang.wizard.your_cur_public_IP_format_error );
			// 	return false;
			// }
      switchSteps();

		} else if ( num == 9 ) {
			//把配置dns服务8节点显示到确认提交页面上
			//$onodeinputs = $modal.find('.dns-wizardconf .js-storagenodeslist').find('li input[type="checkbox"]:checked');
			//if ( $onodeinputs.length < 1) {
			//	DisplayTips(lang.wizard.confirm_check_two_or_more);
			//	return false;
			//}
			var domainname = trim ( $('.js-get-originname').val() );
			//if ( domainname == '' ) {
			//	DisplayTips( lang.cluster.input_domain_name );
			//	return false;
			//}
			if ( !valifyDomain( domainname , 3 ) && domainname != '') {
				DisplayTips( lang.cluster.domian_name_error );
				return false;
			}
			//var shtm = addNodeInfo($onodeinputs);
			//$('.submit-wizardconf .dns-service').html(shtm);
			//shtm += domainhtm;
			var domainhtm ='<span>' + domainname + '</span>';
			$('.submit-wizardconf .domain-name').html(domainhtm);

			//最后一步的时候，提交、取消按钮出现
			//$('.modal-header .btn-default').removeClass('hidden');
			//$('.modal-header .btn-primary').removeClass('hidden');
			//$('.modal-footer .btn-default').removeClass('hidden');
			$('.modal-footer .btn-primary').removeClass('hidden');
      switchSteps();

		} else if ( num == 10 ) {
      switchSteps();
		}

	})
	//左 点击'上一步'
	.on ( 'click', '#prew-wizard-left', function (ev) {
		$this = $(this);
		$modal = $('#wizardConfModal');
		var total = $modal.find('.form-horizontal.wizardconf').length;
		$curW = $modal.find('.form-horizontal.showing');//当前显示的配置向导
		var num = $curW.data('num');
		$('.wizard-nav-ul .js-wizard-nav'+num).addClass('hidden');
		changeBg(num,'prev');
		num --;
		//判断，"下一步"箭头显示
		if (num < total) {
			$('#prew-wizard-right').removeClass('hidden');
		}

		if ( $('.mds-wizardconf.jumping').length > 0 && num == 7) {
			//则说明未选择磁盘，此时点击“上一步”应该跳到 磁盘
			$curW.removeClass('showing').addClass('hidden');
			$('.mds-wizardconf').removeClass('hidden jumping').addClass('showing');
			$('.js-cur-wizard-num').text(5);
			//ul 标题也要切换成相应的
			$('.wizard-nav-ul .js-wizard-nav5').removeClass('hidden');
			//$modal.find('.modal-footer').find('.btn-info.js-mds-jump').removeClass('hidden');
		}  else {
			//当前显示的配置向导隐藏，上一个显示
			$curW.removeClass('showing').addClass('hidden');
			$('.form-horizontal.wizard'+num).removeClass('hidden').addClass('showing');
			//当前步骤数减1
			$('.js-cur-wizard-num').text(num);
			//ul 标题也要切换成相应的
			$('.wizard-nav-ul .js-wizard-nav'+num).removeClass('hidden');

			if( num == 5 ) {
				//$('.js-mds-jump').removeClass('hidden');
			} else {
				$('.js-mds-jump').addClass('hidden');
			}
		}
		$modal.find('.js-submit-all').addClass('hidden');
		//$modal.find('.btn-default').addClass('hidden');
		//判断如果num=1，向左箭头就消失
		if (num == 1 || num == '1') {
			$this.addClass('hidden');
		}
	})
	.on ( 'mouseover', '#prew-wizard-right', function (ev) {
		$this = $(this);
		$this.find('a').css( 'color', '#fff');
	})
	.on ( 'mouseout', '#prew-wizard-right', function (ev) {
		$this = $(this);
		$this.find('a').css( 'color', '#D8D8D8');
	})
	//设置NFP主节点，最多设置三个为主节点
	// .on ( 'click', '.ntp-wizardconf ul li input', function (ev) {
	// 	$this = $(this);
	// 	if ( $this.prop('checked') == true ) {
	// 		$this.closest('li').addClass('ntpchecked');
	// 		$this.closest('li').removeClass('ntpnotchecked');
	// 		$this.closest('li').siblings('li').addClass('ntpnotchecked');
	// 		$this.closest('li').siblings('li').removeClass('ntpchecked');
	// 		$this.closest('li').siblings('li').find('input').prop("checked", false);
	// 	}
	// })


	// 提交初始化配置请求
	.on ( 'click', '.js-submit-all', function (ev) {
		//点击提交的时候，提交、取消按钮消失，进度条出现,左箭头消失
		$modal = $('#wizardConfModal');
		$modal.find('.modal-body').css('overflow', 'hidden');
		$modal.find('#prew-wizard-left').addClass('hidden');
		$modal.find('.js-submit-all').addClass('hidden');
		$('.submit-wizardconf .all-selected-content').css('display', 'none');
		$('.submit-wizardconf .submit-title').text("");
		$('#prew-wizard-left a').css('cursor', 'not-allowed');
		//总共要执行的步数
		if ( $('.mds-wizardconf.jumping').length > 0 ) {
			//则一律当成没选择磁盘，只执行 1、设置存储节点2、设置集群节点把集群创建起来即可
			var num = 3;
		} else{
			var num = $modal.find('.wizardconf').length - 1;
		}
		$('.js-total-step').text( ' ' + num + ' ' + lang.steps + '，');
		//显示当前完成的步数
		var curNum = 0;
		var percent = 0;//当前完成的百分比

		$pres = $modal.find('.wizard-r-p');//显示完成进度
		$pres.find('.js-progress-bar').css('width', curNum);
		$pres.find('.js-progress-bar span').text(curNum);
		addWaitMask();

		//1、设置NTP服务器
		$ntpul = $('.ntp-wizardconf').find('.js-storagenodeslist');
		var ntpserverpara = '',
			ipaddrntppara = '';
		ntpserverpara = $ntpul.find('li.ntpchecked').data('ip');
		$ntpnotcheckedinputs = $ntpul.find('li.ntpnotchecked');
		for (var i = 0; i < $ntpnotcheckedinputs.length; i++) {
			ipaddrntppara += $($ntpnotcheckedinputs[i]).data('ip') + ',';
		};
		ipaddrntppara = ipaddrntppara.substring( 0, ipaddrntppara.length-1 );
		var ntppara = {
			'node': ipaddrntppara,
			'ntpserver': ntpserverpara
		};
        var masters = [];
        var clockSrc = trim ($('#wizardClockSource').val());
        for(var i = 0;$ntpul.find(':checked:eq(' + i + ')').closest('li').data('ip');i++){
            masters[i] = $ntpul.find(':checked:eq(' + i + ')').closest('li').data('ip');
        }
        var ipaddrs = masters.join();
        var allnodesStr = allnodes.join(',');
        var mastersPara = {
            'ipaddrs': ipaddrs,
            'nodes':allnodesStr
        };
        var srcPara = {
            'clock_src': clockSrc,
            'nodes':allnodesStr
        };
        var startPara = {
        	'nodes':allnodesStr,
        };

        //主节点设置
        var masterCallback = function(result) {
            if(result == undefined)
                return;
            if(result.code == 200){
                DataModel["setClockSrc"](srcPara, srcCallback, true, null);
            }
            else{
                DisplayTips( lang.cluster.set_ntp_server_fail  + '(' + result.result + ')');
								$modal.find('#wizardConfError').text(lang.cluster.set_ntp_server_fail  + '(' + result.result + ')');
                $modal.find(".modal-body").LoadData ("hide");
            }
        }

        //外部源设置
  		var srcCallback = function (result) {
  			if (result == undefined)
  				return;
  			if (result.code == 200) {
  				DataModel["clockStart"](startPara, startCallback, true, null);
  			} else {
					DisplayTips( lang.cluster.set_ntp_server_fail  + '(' + result.result + ')');
  				$modal.find('#wizardConfError').text( lang.cluster.set_ntp_server_fail  + '(' + result.result + ')');
          $modal.find(".modal-body").LoadData ("hide");
  			}
  		}

        /* ------------------- 启动服务 ------------------- */
        var startCallback = function(result){
            $modal.find('.modal-header').LoadData ("hide");
            if(result == undefined)
                return;
            if(result.code == 200){
                $modal.find(".modal-body").LoadData ("hide");
        				$modal.find('.center-button').addClass('hidden');
        				$pres.removeClass('hidden');
        				//存储节点设置成功
        				//则已完成步数1 完成进度 1/num
        				++curNum;
        				percent = ( curNum*100 )/num ;
        				percent = percent.toFixed(2);
        				$pres.find('.js-progress-bar').attr('aria-valuenow', percent);
        				$pres.find('.js-progress-bar').css('width', percent + '%');
        				$pres.find('.js-progress-bar span').text(percent + '%');
        				$('.js-res-count').text(curNum);
        				$('.js-step-meaning').text( $('li.js-wizard-nav'+ (curNum+1) ).text() );
        				//接下来执行下一步操作
        				$modal.find(".modal-body").LoadData ("show");
        				DataModel['newStorage'](spara, sCallback, true, '');
            }
            else{
                DisplayTips(lang.cluster.start_clock_update_service_fail  + '(' + result.result + ')');
								$modal.find('#wizardConfError').text(lang.cluster.start_clock_update_service_fail  + '(' + result.result + ')');
            }
        }


    /**
    ||
    || START
    ||*/
    $modal.find(".modal-body").LoadData ("show");
    DataModel['clusterLvmRemove']({ips: allnodes.join(',')}, function (rsp) {
      if (rsp.code == 200) {
        DataModel['setMaster'](mastersPara, masterCallback, true, '');
      }else {
        DisplayTips(rsp.result);
				$modal.find('#wizardConfError').text(rsp.result);
        $modal.find(".modal-body").LoadData ("hide");
      }
    }, true, null);
    /*
    ||
    ||
    ||
    ||
    ||
     */



		var snodesip = '';//存 存储节点ip
		var snodesname = '';//存 存储节点ip

		$snodeinputs.each(function (i) {
			snodesip += $(this).closest('li').data('ip') + ',';
			snodesname += $(this).closest('li').data('name') + ',';
		})
		snodesip = snodesip.substring(0, snodesip.length-1);
		snodesname = snodesname.substring(0, snodesname.length-1);
		//2、添加存储节点
		var spara = {
			'nodes': snodesip
		};
		var sCallback = function (result){
			if (result == undefined)
				return;
			if (result.code == 200) {
				$modal.find(".modal-body").LoadData ("hide");
				$modal.find('.center-button').addClass('hidden');
				$pres.removeClass('hidden');
				//存储节点设置成功
				//则已完成步数2 完成进度 2/num
				++curNum;
				percent = ( curNum*100 )/num ;
				percent = percent.toFixed(2);
				$pres.find('.js-progress-bar').attr('aria-valuenow', percent);
				$pres.find('.js-progress-bar').css('width', percent + '%');
				$pres.find('.js-progress-bar span').text(percent + '%');
				$('.js-res-count').text(curNum);
				$('.js-step-meaning').text( $('li.js-wizard-nav'+ (curNum+1) ).text() );
				//接下来执行下一步操作
				$modal.find(".modal-body").LoadData ("show");
				DataModel['createCluster'](mpara, mCallback, true, '', rollback);
			} else {
				removeWaitMask();
				DisplayTips(lang.cluster.set_cluster_snode_fail + '(' + result.result + ')');
				$modal.find('#wizardConfError').text(lang.cluster.set_cluster_snode_fail + '(' + result.result + ')');
			}
		}


		// $modal.find(".modal-body").LoadData ("show");
    // DataModel['clusterLvmRemove']({ips: allnodes.join(',')}, function (rsp) {
    //   if (rsp.code == 200) {
    //     console.log('done 2');
    //     return;
    //     DataModel['newStorage'](spara, sCallback, true, '', rollback);
    //   }else {
    //     DisplayTips(rsp.result);
    //     $modal.find(".modal-body").LoadData ("hide");
    //   }
    // }, true, null);



		//3、获取监控服务节点
		var mnode = '';
		var mnodes = '';//存 监控节点
		$mnodeinputs.each(function (i) {
			mnodes += $(this).closest('li').data('name') + ',';
		})
		mnodes = mnodes.substring(0, mnodes.length-1);
		var mpara = {
			'mons': mnodes,
			'datanodes': snodesname
		};
		var mCallback = function (result){
			if (result == undefined)
				return;
			if (result.code == 200) {
				$modal.find(".modal-body").LoadData ("hide");
				//监控节点设置成功
				//则已完成步数3 完成进度 3/num
				++curNum;
				percent = ( curNum*100 )/num ;
				percent = percent.toFixed(2);
				$pres.find('.js-progress-bar').attr('aria-valuenow', percent);
				$pres.find('.js-progress-bar').css('width', percent + '%');
				$pres.find('.js-progress-bar span').text(percent + '%');
				$('.js-res-count').text(curNum);
				$('.js-step-meaning').text( $('li.js-wizard-nav'+ (curNum+1) ).text() );

				$modal.find(".modal-body").LoadData ("show");
				DataModel['addDisksWizard'](diskpara, diskCallback, true, '', rollback);
			} else {
				removeWaitMask();
				DisplayTips( lang.cluster.set_cluster_mnode_fail + '(' + result.result + ')' );
				$modal.find('#wizardConfError').text( lang.cluster.set_cluster_mnode_fail + '(' + result.result + ')' );
			}
		}

		//4、添加磁盘
		$disknodeinputs = $('.wizard-disk-body').find('.js-node');
		var htm = "";
		var result = addDiskInfo( $disknodeinputs );
		var hostList = result.arr;
		var diskhostname = "";
		for (var i = 0; i < hostList.length; i++) {
			diskhostname += hostList[i][2] + ':' + hostList[i][1] + ';';
		}
		diskhostname = diskhostname.substring(0 ,diskhostname.length-1);
		var diskpara = {
			'diskListStr': diskhostname,
		};
		var diskCallback = function (result){
			if (result == undefined)
				return;
			if (result.code == 200) {
				//监控节点设置成功
				//则已完成步数4 完成进度 4/num
				$modal.find(".modal-body").LoadData ("hide");
				++curNum;
				percent = ( curNum*100 )/num ;
				percent = percent.toFixed(2);
				$pres.find('.js-progress-bar').attr('aria-valuenow', percent);
				$pres.find('.js-progress-bar').css('width', percent + '%');
				$pres.find('.js-progress-bar span').text(percent + '%');
				$('.js-res-count').text(curNum);
				$('.js-step-meaning').text( $('li.js-wizard-nav'+ (curNum+1) ).text() );
				if ( $('.mds-wizardconf.jumping').length > 0 ) {
					$modal.find(".modal-body").LoadData ("hide");

          DataModel['setClusterInitStatus'](null, function () {}, true, null);

					DisplayTips( lang.cluster.init_wizard_success );
					setTimeout(function() {
						window.location.reload();
					}, 2e3);
				} else{
					$modal.find(".modal-body").LoadData ("show");
					DataModel['newmetadata'](mdspara, mdsCallback, true, '', rollback);
				}
			} else {
        DisplayTips( lang.cluster.set_cluster_adddisk_fail + '(' + result.result + ')' );
				$modal.find('#wizardConfError').text( lang.cluster.set_cluster_adddisk_fail + '(' + result.result + ')' );
				removeWaitMask();
			}
		}

		//5、配置元数据服务
		$mnodeinputs = $modal.find('.mds-wizardconf .js-storagenodeslist').find('li input[type="checkbox"]:checked');
		if ($mnodeinputs.length < 1 && $mnodeinputs.length > 0) {
			DisplayTips(lang.cluster.mds_node_select_two_or_no);
			return false;
		}
		var mdsnode = '';//存 监控节点
		$mnodeinputs.each(function (i) {
			mdsnode += $(this).closest('li').data('name') + ',';
		})
		mdsnode = mdsnode.substring(0, mdsnode.length-1);
		var mdspara = {
			'mdsNodes': mdsnode
		};
		var mdsCallback = function (result){
			if (result == undefined)
				return;
			else {
				$modal.find(".modal-body").LoadData ("hide");
				//mds设置成功
				//则已完成步数5 完成进度 5/num
				++curNum;
				percent = ( curNum*100 )/num ;
				percent = percent.toFixed(2);
				$pres.find('.js-progress-bar').attr('aria-valuenow', percent);
				$pres.find('.js-progress-bar').css('width', percent + '%');
				$pres.find('.js-progress-bar span').text(percent + '%');
				$('.js-res-count').text(curNum);
				$('.js-step-meaning').text( $('li.js-wizard-nav'+ (curNum+1) ).text() );
				//执行下一步
				$modal.find(".modal-body").LoadData ("show");
				DataModel['mgrManage'](mgrParams, mgrCallback, true, null);
			}
		}

    // 添加mgr服务
    var mgrNodes = [];
    $('.s-mgr-service > div').each(function () {
      mgrNodes.push($(this).find('span:first').text().trim());
    });
    var mgrCallback = function (rsp) {
      if (rsp.code != 200) {
        ++curNum;
        percent = ( curNum*100 )/num ;
        percent = percent.toFixed(2);
        $pres.find('.js-progress-bar').attr('aria-valuenow', percent);
        $pres.find('.js-progress-bar').css('width', percent + '%');
        $pres.find('.js-progress-bar span').text(percent + '%');
        $('.js-res-count').text(curNum);
        $('.js-step-meaning').text( $('li.js-wizard-nav'+ (8) ).text() );

        $modal.find(".modal-body").LoadData ("show");
        DataModel['addNasPubIp'](naspara, nasCallback, true, '', rollback);
				$modal.find('#wizardConfError').text( lang.node.add_mgr_fail);
        return DisplayTips( lang.node.add_mgr_fail);
      }
      $modal.find(".modal-body").LoadData ("hide");

      //mds设置成功
      //则已完成步数5 完成进度 5/num
      ++curNum;
      percent = ( curNum*100 )/num ;
      percent = percent.toFixed(2);
      $pres.find('.js-progress-bar').attr('aria-valuenow', percent);
      $pres.find('.js-progress-bar').css('width', percent + '%');
      $pres.find('.js-progress-bar span').text(percent + '%');
      $('.js-res-count').text(curNum);
      $('.js-step-meaning').text( $('li.js-wizard-nav'+ (8) ).text() );
      //执行下一步
      $modal.find(".modal-body").LoadData ("show");

      DataModel['addNasPubIp'](naspara, nasCallback, true, '', rollback);
    };
    var mgrParams = {
      ip: window.location.host,
      action: 'add',
      hostname: mgrNodes.join(',')
    };


		//6、配置NAS网关服务
		$nasrows = $('.nas-wizardconf .nas-pubip-service tbody').find('tr');
		var nasnodeStr = '',
			hostStr = '',
			netportStr = '',
			ipaddrStr = '',
			netmaskStr = '';
		var pubIpArr = [];
		var portArr = [];
		var maskArr = [];
		$nasrows.each(function (i) {
			var pubIp = trim( $(this).find('input.js-get-publicip').val() );
			var port = trim( $(this).find('select.js-select-network').val() );
			var mask = trim( $(this).find('input.js-get-netmask').val() );
			if(pubIp !== '' && mask !== '') {
				nasnodeStr += trim( $(this).data('ip') ) + ',' ;
				hostStr += trim( $(this).data('name') ) + ',' ;
				pubIpArr.push(pubIp);
				portArr.push(port);
				maskArr.push(mask);
			}
		});
		nasnodeStr = nasnodeStr.substring(0, nasnodeStr.length-1 );
		hostStr = hostStr.substring(0, hostStr.length-1 );
		netportStr = portArr.join();
		ipaddrStr = pubIpArr.join();
		netmaskStr = maskArr.join();

		var nasnode = '';
		$nasnodeinputs = $modal.find('.nas-wizardconf .js-storagenodeslist').find('li input[type="checkbox"]:checked');
		var nasnode = '';//存 监控节点
		var nasnodename = '';//存 监控节点

		$nasnodeinputs.each(function (i) {
			nasnode += $(this).closest('li').data('ip') + ',';
			nasnodename += $(this).closest('li').data('name') + ',';
		})
		nasnode = nasnode.substring(0, nasnode.length-1);
		nasnodename = nasnodename.substring(0, nasnodename.length-1);

		var naspara = {
			'ip': nasnodeStr,
			'hostname': hostStr,
			'ipaddr': ipaddrStr,
			'netmask': netmaskStr,
			'interface': netportStr
		};
		var nasCallback = function (result){
			if (result == undefined)
				return;
			if (result.code == 200) {
				$modal.find(".modal-body").LoadData ("hide");
				//mds设置成功
				//则已完成步数6 完成进度 6/num
				++curNum;
				percent = ( curNum*100 )/num ;
				percent = percent.toFixed(2);
				$pres.find('.js-progress-bar').attr('aria-valuenow', percent);
				$pres.find('.js-progress-bar').css('width', percent + '%');
				$pres.find('.js-progress-bar span').text(percent + '%');
				$('.js-res-count').text(curNum);
				$('.js-step-meaning').text( $('li.js-wizard-nav'+ (curNum+1) ).text() );

				$modal.find(".modal-body").LoadData ("show");
				if(trim( $('.js-get-originname').val()) == ''){
					dnsCallback({code:200});
				}else{
					DataModel['createCurClusterDns'](dnspara, dnsCallback, true, '', rollback);
				}
			} else {
				removeWaitMask();
				DisplayTips( lang.cluster.set_nas_service_fail + '(' + result.result + ')' );
				$modal.find('#wizardConfError').text( lang.cluster.set_nas_service_fail + '(' + result.result + ')' )
			}
		}

		var clockStartCallback = function (result) {
			if (result == undefined)
				return;
			if (result.code == 200) {
				DataModel['clockStart'](null, srcCallback, true, '', rollback);
			} else {
				removeWaitMask();
				DisplayTips(lang.wizard.clock_start_fail);
			}
		}

		//7、DNS配置
		var dnsnode = '';
		// $dnsnodeinputs = $modal.find('.dns-wizardconf .js-storagenodeslist').find('li input');
		var dnsnode = '',origin;//存 监控节点
		var dnsnodename = '';//存 监控节点

		// $dnsnodeinputs.each(function (i) {
		// 	dnsnode += $(this).closest('li').data('ip') + ',';
		// 	dnsnodename += $(this).closest('li').data('name') + ',';
		// })
		// dnsnode = dnsnode.substring(0, dnsnode.length-1);
		// dnsnodename = dnsnodename.substring(0, dnsnodename.length-1);
		origin = trim( $('.dns-wizardconf').find('input.js-get-originname').val() );
		//现在要传的是dns配置前一步中输入的公共 IP
		var dnspara = {
        	//'iplist': ipaddrStr,
			'domain': origin
		};
		var dnsCallback = function (result){
			removeWaitMask();
			if (result == undefined)
				return;
			if (result.code == 200) {
				//mds设置成功
				//则已完成步数7 完成进度 7/num
				++curNum; //最后一步不需++
				percent = ( curNum*100 )/num ;
				percent = percent.toFixed(2);
				$pres.find('.js-progress-bar').attr('aria-valuenow', percent);
				$pres.find('.js-progress-bar').css('width', percent + '%');
				$pres.find('.js-progress-bar span').text(percent + '%');
				$('.js-res-count').text(curNum);
				$('.js-step-meaning').text( $('li.js-wizard-nav'+ (curNum+1) ).text() );

        DataModel['setClusterInitStatus'](null, function () {}, true, null);

				DisplayTips( lang.cluster.init_wizard_success );
				setTimeout(function() {
					window.location.reload();
				}, 2e3);
			} else {
				DisplayTips( lang.cluster.set_dns_service_fail + '(' + result.result + ')' );
				$modal.find('#wizardConfError').text( lang.cluster.set_dns_service_fail + '(' + result.result + ')' );
			}
			$modal.find(".modal-body").LoadData ("hide");
		}



	});



  /*
  |
  |
  | main
  |
  |
   |
   */


	//XHR失败后的回滚措施
	function rollback (xhr) {
		$modal = $('#wizardConfModal');
		DisplayTips( lang.wizard.overtime_rollback);
		$('.js-step-meaning').closest('div')
			.text( lang.wizard.overtime_rollback )
			.css('color','#FF7777');

		var desCallback = function (result) {
			if (!result) {
				return;
			}
			$modal.modal('hide');
			if (result.code === 200) {
				DisplayTips( lang.wizard.rollback_success );
			} else {
				DisplayTips( lang.wizard.rollback_fail );
			}
			setTimeout(function() {
				window.location.reload();
			}, 2e3);
		}

		DataModel['clusterDestroy'](null, desCallback, true, null);
	}

	//添加相关的html
	function addHtml (nodeData) {
		var htm = "";
		var diskhtm = "";
		for (var i = 0; i < nodeData.length; i++) {
	    	htm +=  '<li data-ip="'+nodeData[i].ip+'">'+
        				'<input type="checkbox" name="snode" value="" style="margin:0;"/>' +
        				'<span>' + nodeData[i].hostname + '</span>' +
        				'<span>' + '（' +nodeData[i].ip + '）' +'</span>' +
        			'</li>';
        	diskhtm += 	'<tr class="js-node" data-ip="' + nodeData[i].ip + '" data-name="'+ nodeData[i].hostname +'">'+
							'<td class="left" style="width:50%;">'+
								'<a href="javascript:;" class="js-plus-subdisks" data-ip="' + nodeData[i].ip + '" data-name="'+ nodeData[i].hostname +'">'+
									'<span class="glyphicon glyphicon-plus-sign"></span>'+
								'</a>'+
								'<a href="javascript:;" class="js-minus-subdisks hidden" data-ip="' + nodeData[i].ip + '">'+
									'<span class="glyphicon glyphicon-minus-sign">'+
									'</span>'+
								'</a>'+
								'<span>'+ nodeData[i].hostname +'</span>'+
								'<span>' + '（' +nodeData[i].ip + '）' +'</span>' +
							'</td>'+
							'<td style="width:50%;padding-left:28px;">'+
							'<input type="checkbox" class="sub-check-disk" style="width:16px;height:16px;"/>'+
							'</td>'+
						'</tr>';
		}
		return {
			htm: htm,
			diskhtm: diskhtm
		}
	}

	function showWizardModal () {
		$modal = $('#wizardConfModal');
		//$modal.find('.modal-header .btn-default').addClass('hidden');
		$modal.find('#wizardConfError').text('');
		$modal.find('.js-submit-all').addClass('hidden');
		var num = 1;
		$modal.find('.wizard'+num).removeClass('hidden showing').addClass('showing');
		$modal.find('.wizard'+num).siblings().addClass('hidden').removeClass('showing');
		$('.js-cur-wizard-num').text(num);
		$('.js-wizard-nav'+num).removeClass('hidden');
		$('.js-wizard-nav'+num).siblings().addClass('hidden');
		//获取总的wizard的页数
		var totalwizardpage = $modal.find('.wizardconf').length;
		$modal.find('.js-total-wizard').text(totalwizardpage);
		$left = $('#prew-wizard-left');
		$right = $('#prew-wizard-right');
		$modal.modal('show');
		//用来控制左右箭头居中显示
		var h = $modal.find('.modal-body').height();
		var alh = $left.height();
		var arh = $right.height();
		$left.css('top', h/2 - alh/2);
		$right.css('top', h/2 - arh/2);
		$('#prew-wizard-left').addClass('hidden');//一开始向左的'上一步'箭头不显示
		if ($('#prew-wizard-right.hidden').length > 0) {
			$right.removeClass('hidden');
		}
	}

	//获取被勾选的checkbox,不展开
	function getSelectedDisk ($that) {
		var loaded = $that.data('loaded');
		if (loaded == 'yes' ) {
			$that.closest('tr').next('tr.subdisks').removeClass('hidden');
			$that.siblings('.js-minus-subdisks').removeClass('hidden');
			$that.addClass('hidden');
			return;
		}
		//若还未加载
		$that.data('loaded', 'yes');
		$tr = $that.closest('tr');
		var hostname = $that.data('ip');
		var parameter = {
			'hostname': hostname
		};
		var dncallback = function (result) {
			if (result == undefined)
				return;
			if (result.code == 200) {
				var data = result.result.total;
				var os = result.result.os;
				var idisk = result.result.idisk;
				$.merge(os, idisk);
				$.unique(os);
				var tempdisk = [];//临时数组1
				var diskarr = []; //符合条件的可以添加的磁盘数组
				for (var i = 0; i < os.length; i++) {
					tempdisk[os[i]] = true;
				}
				for (var i = 0; i < data.length; i++) {
					if (!tempdisk[data[i]]) {
            			diskarr.push(data[i]);
            		}
				};
				var htm = '';
				var temp = '';
				htm += '<tr class="subdisks" data-ip="' + hostname + '">' +
							'<td colspan="2" style="padding:0;">' +
								'<table class="table table-condensed" style="margin-left:2em;margin-bottom: 0;">' +
									'<tbody>';
				for (var i = 0; i < diskarr.length; i++) {
						temp += '<tr class="js-disk">' +
									'<td class="showleftborder" style="width:50%;">'+
										'<div class="showcenterline" style="width:15px;float:left;"></div>'+
										'<span style="float:left;">' + diskarr[i] + '</span>'+
									'</td>' +
									'<td style="width:50%;">';
									if ( $tr.find('.sub-check-disk').prop('checked') == true ) {
										temp += '<input type="checkbox" class="sub-check-disk" checked="checked" style="width:16px;height:16px;">';
									} else {
										temp += '<input type="checkbox" class="sub-check-disk" style="width:16px;height:16px;">';
									}
							temp  +='</td>'+
								'</tr>';
				};
				if ( temp == '' || temp == null ) {
					htm += '<tr>&nbsp;' + '</tr>';
				} else {
					htm += temp;
				}
		htm += 				'</tbody>'+
						'</table>'+
					'</td>'+
				'</tr>';

				$tr.after(htm);
			} else {
				DisplayTips( result.result );
			}
		}
		DataModel["listDisk"](parameter, dncallback, true);
	}

	//把所选节点添加到提交页面的相应位置上
	function addNodeInfo ( $el ) {
		var shtm = '';
		for (var i = 0; i < $el.length; i++) {
			$input = $($el[i]);
			$li = $input.closest('li');
			var ip = $li.data('ip');
			// var host = trim($input.next('span').text());
			var host = $li.data('name');
			shtm += '<div>' +
						'<span>' + host + '</span>'+
						'<span>' + '(' + ip + ')' + '</span>'+
					'</div>';
		}
		return shtm;
	}

	function nodeLoadHtml ( type, data ,ntp) {
		var htm = "";
    var isNtp = (ntp === 'ntp');
		for (var i = 0; i < data.length; i++) {
			var node = data[i];
			var name = node['hostname'];
			if ( name == '' ) {
				name = lang.unknown;
			}
			//htm += 	'<li data-ip="' + node['ip'] + '" data-name="' + node['hostname'] + '" class="fl-lt">' +
        		//		'<img src="css/image/'+ type +'.png" style="height:60px;" class="fl-lt">' +
        		//		'<div class="left">' +
			//				'<span style="margin-left:4px;">' + name + '</span>' ;
			//				if (type == 'dnsnode' && i >= 3) {
			//					htm += '<input type="checkbox" name="snode" value=""/>' ;
			//				} else if (type == 'mdsnode' && i >= 2) {
			//					htm += '<input type="checkbox" name="snode" value=""/>' ;
			//				} else{
			//					htm += '<input type="checkbox" name="snode" checked value=""/>' ;
			//				}
			//htm +=				'<span>' + node['ip'] + '</span>' +
			//			'</div>'+
			//		'</li>';
			htm += 	'<li data-ip="' + (isNtp ? node['hbeatip'] : node['ip']) + '" data-name="' + node['hostname'] + '" class="fl-lt col-lg-4">' +
				       '<img src="css/image/'+ type +'.png" style="height:30px;" class="fl-lt">';
				       //'<div class="left">';
			            if (type == 'dnsnode' && i >= 3) {
				              htm += '<div class="col-lg-1"><input type="checkbox" name="snode" value="" style="margin-bottom:4px;margin-left:0px;width: 20px;height:20px;"/></div>' ;
						   } else if (type == 'monitornode' && i >= 3) {
							htm += '<div class="col-lg-1"><input type="checkbox" name="snode" value="" style="margin-bottom:4px;margin-left:0px;width: 20px;height:20px;"/></div>' ;
						   } else if (type == 'mdsnode' && i >= 2) {
							   htm += '<div class="col-lg-1"><input type="checkbox" name="snode" value="" style="margin-bottom:4px;margin-left:0px;width: 20px;height:20px;"/></div>' ;
						   } else if (type == 'storagenode') {
							htm += '<div class="col-lg-1"><input type="checkbox" name="snode" checked value="" disabled="disabled" style="margin-bottom:4px;margin-left:0px;width: 20px;height:20px;"/></div>' ;
						   } else{
				               htm += '<div class="col-lg-1"><input type="checkbox" name="snode" checked value="" style="margin-bottom:4px;margin-left:0px;width: 20px;height:20px;"/></div>' ;
						   }
			htm +=        '<div class="col-lg-2" style="font-size:16px;margin-left:5px;margin-top:2px;">' + name + '('+(isNtp ? node['hbeatip'] : node['ip'])+')'+'</div>'+
				        //'</div>'+
				     '</li>';
		};

		return htm;
	}

    //判断IP地址格式
    function isIpAddr(str){
        return (str.match(/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/g) !== null);
    }
	//modal-header处图片背景变化
	function changeBg(num,type){
		var objImg=$('#wizardConfModal .list-inline').find('img');
		var nextPath="css/image/xz.png";
		var prevPath="css/image/wxz.png";
		if(type=='next'){
			objImg.eq(num-1).attr('src',nextPath);
		}else if(type='prev'){
			objImg.eq(num-1).attr('src',prevPath);
		}
	}

})
