$(function (ev) {
    var earthnetInfo = {};	// { ipaddr: result , ... } 用于存储earthnet信息
    var nodeLoaded = false;
    var nodeListData = null;
    var sstatasArr = [];
    //加载NAS网关相关信息
    var nasCallback = function (result) {
        $(".nas_service_info").LoadData('hide');
        if (result == undefined)
            return;
        if (result.code == 200) {
            // var htm = '';
            // htm += showNasList (result);
            var htm = showNasTable(result);
            $('#naspubliciplist').html(htm);
            var data = result.result;
            for (var i = 0; i < data.length; i++) {
                if (data[i].sstatus === 1) {
                    sstatasArr.push(data[i].nodename)
                }
            }
            autoHeightPermit();
        }
    }
    $(".nas_service_info").LoadData('show');
    DataModel['listNasPubIPInfo'](null, nasCallback, true, null);

    //加载公共IP
    var pipCallback = function (result) {
        $('.iplist_nasinfo').LoadData('hide');
        if (!result) {
            return;
        }
        if (result.code === 200) {
            var htm = showPubIpInfo(result);
            $('#pubIpTable').html(htm);
            autoHeightPermit();
        }
    }
    $('.iplist_nasinfo').LoadData('show');
    DataModel['listPublicIP'](null, pipCallback, true, null);

    //加载NAS节点列表
    var nodeCallback = function (result) {
        $('.nodelist_nasinfo').LoadData('hide');
        if (!result) {
            return;
        }
        if (result.code === 200) {
            var htm = showNasNodeInfo(result);
            $('#nasNodeTable').html(htm);
            autoHeightPermit();
        }
    }
    $('.nodelist_nasinfo').LoadData('show');
    DataModel['listNasInfo'](null, nodeCallback, true, null);


    $(document)
        .on('mouseover', '.js-pubdir-cont .pubip-mag', function (ev) {
            $this = $(this);
            $this.find('.js-remove-pubip').removeClass('hidden');
            $this.find('.js-edit-pubip').removeClass('hidden');

        })
        .on('mouseout', '.js-pubdir-cont .pubip-mag', function (ev) {
            $this = $(this);
            $this.find('.js-remove-pubip').addClass('hidden');
            $this.find('.js-edit-pubip').addClass('hidden');
        })
        .on('mouseover', '.grid-publicip-con', function (ev) {
            $this = $(this);
            $this.find('.js-add-pubip').removeClass('hidden');
        })
        .on('mouseout', '.grid-publicip-con', function (ev) {
            $this = $(this);
            $this.find('.js-add-pubip').addClass('hidden');
        })
        .on('mouseover', '.js-pubip-row', function (ev) {
            $this = $(this);
            $this.find('.js-del-pubip').removeClass('hidden');
        })
        .on('mouseout', '.js-pubip-row', function (ev) {
            $this = $(this);
            $this.find('.js-del-pubip').addClass('hidden');
        })
        .on('mouseover', '.nas_service_info', function (ev) {
            $this = $(this);
            $this.find('.c_basic_right').removeClass('hidden');
        })
        .on('mouseout', '.nas_service_info', function (ev) {
            $this = $(this);
            $this.find('.c_basic_right').addClass('hidden');
        })
        .on('mouseover', '.iplist_nasinfo', function (ev) {
            $this = $(this);
            $this.find('.c_basic_right').removeClass('hidden');
        })
        .on('mouseout', '.iplist_nasinfo', function (ev) {
            $this = $(this);
            $this.find('.c_basic_right').addClass('hidden');
        })
        .on('mouseover', '.nodelist_nasinfo', function (ev) {
            $this = $(this);
            $this.find('.c_basic_right').removeClass('hidden');
        })
        .on('mouseout', '.nodelist_nasinfo', function (ev) {
            $this = $(this);
            $this.find('.c_basic_right').addClass('hidden');
        })
        .on('mouseover', '.js-node-row', function (ev) {
            $this = $(this);
            $this.find('.js-del-nasnode').removeClass('hidden');
        })
        .on('mouseout', '.js-node-row', function (ev) {
            $this = $(this);
            $this.find('.js-del-nasnode').addClass('hidden');
        })
        //删除单个公共IP
        .on('click', '.js-del-pubip', function (ev) {
            $row = $(this).closest('.js-pubip-row');
            var pubip = $row.data('pubip');
            $modal = $('#delPublicIpModel');
            $modal.data('pubip', pubip);
            $modal.find('.modal-body>p').text(lang.cluster.confirm_del_public_ip + ' ' + pubip + ' ?');
            $modal.modal('show');
        })
        .on('click', '#delPublicIpModel .btn-danger', function (ev) {

            $modal = $('#delPublicIpModel');
            var para = {
                'ipaddr': $modal.data('pubip')
            }

            var callback = function (result) {
                $modal.find('.modal-header').LoadData('hide');
                if (!result) {
                    return;
                }
                if (result.code === 200) {
                    DisplayTips(lang.cluster.del_public_ip_success);
                    refresh();
                } else {
                    DisplayTips(lang.cluster.del_public_ip_fail);
                }
                $modal.modal('hide');
            }
            $modal.find('.modal-header').LoadData('show');
            DataModel['delPubIp'](para, callback, true, null);
        })
        //添加公共IP
        .on('click', '.js-add-pubip', function (ev) {
            $modal = $('#addPubIpModal');
            $modal.find('.modal-header').LoadData('show');
            $modal.modal('show');
        })
        .on('show.bs.modal', '#addPubIpModal', function (ev) {
            $modal = $('#addPubIpModal');
            var callback = function (result) {
                $modal.find('.modal-header').LoadData('hide');
                if (!result) {
                    return;
                }
                if (result.code === 200) {
                    nodeLoaded = true;
                    nodeListData = result;
                    var html = '';
                    var data = result.result.nodes;
                    for (var i = 0; i < data.length; i++) {
                        html += '<option value="' + data[i].hbeatip + '">' +
                            data[i].hostname + ' (' + data[i].hbeatip + ')' +
                            '</option>';
                    }
                    // for (var i = 0; i < data.length; i++) {
                    //     html += '<option value="' + data[i].ip + '">' +
                    //         data[i].hostname + ' (' + data[i].ip + ')' +
                    //         '</option>';
                    // }
                    $modal.find('#select_node').html(html);

                    //激活change事件，加载第一个option的网卡
                    $modal.find('#select_node').change();
                } else {
                    DisplayTips(lang.cluster.list_nas_node_fail);
                }
            }

            $modal.find('.modal-header').LoadData('show');
            if (!nodeLoaded) {
                DataModel['listNode'](null, callback, true, null);
            } else {
                callback(nodeListData);
            }
        })
        //根据选择的节点加载出网口信息
        .on('change', '#addPubIpModal #select_node', function (ev) {
            $modal = $('#addPubIpModal');
            var ipaddr = $(this).val();
            var para = {
                'hosts': ipaddr
            }

            var callback = function (result) {
                $modal.find('.modal-header').LoadData('hide');
                if (!result) {
                    return;
                }
                if (result.code === 200) {
                    earthnetInfo[ipaddr] = result;
                    var netList = result.result.netlist;
                    var html = '';
                    for (var i = 0; i < netList.length; i++) {
                        html += '<option value="' + netList[i].name + '">' +
                            netList[i].name +
                            '</option>';
                    }
                    $modal.find('.js-input-netport').html(html);
                } else {
                    DisplayTips( lang.cluster.list_netport_info_fail );
                }
            }
            $modal.find('.modal-header').LoadData('show');
            if (earthnetInfo[ipaddr] === undefined) {
                DataModel['listIpSelected'](para, callback, true, null);
            } else {
                callback(earthnetInfo[ipaddr]);
            }
        })
        .on('click', '#addPubIpModal .btn-primary', function (ev) {
            $modal = $('#addPubIpModal');
            var pubip = trim($modal.find('.js-input-public-ip').val());
            if (!valifyIP(pubip)) {
                DisplayTips(lang.cluster.public_ip_format_error);
                return false;
            }
            var mask = trim($modal.find('.js-input-mask').val());
            //if (['8', '16', '24', '32'].indexOf(mask) === -1) {
            //    DisplayTips(lang.wizard.your_cur_netmask_format_error);
            //    return false;
            //}
            if (mask <= 0) {
                DisplayTips(lang.wizard.your_cur_netmask_format_error);
                return false;
            } else if (mask >= 32) {
                DisplayTips(lang.wizard.your_cur_netmask_format_error);
                return false;
            }
            var netport = trim($modal.find('.js-input-netport').val());
            if (netport === '') {
                DisplayTips(lang.cluster.please_input_netport);
                return false;
            }

            var para = {
                'ipaddr': pubip,
                'netmask': mask,
                'interface': netport
            }

            var callback = function (result) {
                $modal.find('.modal-header').LoadData('hide');
                if (!result) {
                    return;
                }
                if (result.code === 200) {
                    DisplayTips(lang.cluster.add_public_ip_success);
                    refresh();
                } else {
                    DisplayTips(lang.cluster.add_public_ip_fail);
                }
                $modal.modal('hide');
            }

            $modal.find('.modal-header').LoadData('show');
            DataModel['addPubIp'](para, callback, true, null);
        })
        //删除单个NAS节点
        .on('click', '.js-del-nasnode', function (ev) {
            $row = $(this).closest('.js-node-row');
            var ip = $row.data('ip');
            var hostname = $row.data('hostname');
            $modal = $('#delNasNodeModel');
            $modal.data('ip', ip);
            $modal.data('hostname', hostname);
            $modal.find('.modal-body>p').text(lang.cluster.confirm_del_nas_node + ' ' + hostname + '(' + ip + ')' + ' ?');
            $modal.modal('show');
        })
        .on('click', '#delNasNodeModel .btn-danger', function (ev) {
            $modal = $('#delNasNodeModel');
            var para = {
                'ip': $modal.data('ip'),
                'name': $modal.data('hostname')
            }

            var callback = function (result) {
                $modal.find('.modal-header').LoadData('hide');
                if (!result) {
                    return;
                }
                if (result.code === 200) {
                    DisplayTips(lang.cluster.del_nas_node_success);
                    refresh();
                } else {
                    DisplayTips(lang.cluster.del_nas_node_fail);
                }
                $modal.modal('hide');
            }
            $modal.find('.modal-header').LoadData('show');
            DataModel['delNas'](para, callback, true, null);
        })
        //添加NAS节点
        .on('click', '.nodelist_nasinfo .js-add-nasnode', function (ev) {
            $modal = $('#addNasNodeModal');
            $modal.find('.modal-header').LoadData('show');
            $modal.modal('show');

            var callback = function (result) {
                $modal.find('.modal-header').LoadData('hide');
                if (!result) {
                    return;
                }
                if (result.code === 200) {
                    nodeLoaded = true;
                    nodeListData = result;
                    var html = '';
                    var data = result.result.nodes;
                    var $curRows = $('.nodelist_nasinfo .js-node-row');
                    var existedNodes = [];

                    $curRows.each(function (index) {
                        existedNodes.push($(this).data('ip'));
                    });

                    for (var i = 0; i < data.length; i++) {
                        if (existedNodes.indexOf(data[i].hbeatip) === -1) {
                            html += '<div class="checkbox"><label>' +
                                '<input class="nodesToAdd" type="checkbox" data-ip="' + data[i].hbeatip + '" data-hostname="' + data[i].hostname + '">';
                        } else {
                            html += '<div class="checkbox disabled"><label>' +
                                '<input type="checkbox" checked>';
                        }
                        html += data[i].hostname + ' (' + data[i].hbeatip + ')' +
                            '</label></div>';
                    }
                    // for (var i = 0; i < data.length; i++) {
                    //     if (existedNodes.indexOf(data[i].ip) === -1) {
                    //         html += '<div class="checkbox"><label>' +
                    //             '<input class="nodesToAdd" type="checkbox" data-ip="' + data[i].ip + '" data-hostname="' + data[i].hostname + '">';
                    //     } else {
                    //         html += '<div class="checkbox disabled"><label>' +
                    //             '<input type="checkbox" checked>';
                    //     }
                    //     html += data[i].hostname + ' (' + data[i].ip + ')' +
                    //         '</label></div>';
                    // }
                    $modal.find('#checkNasNode').html(html);
                } else {
                    DisplayTips(lang.cluster.list_nas_node_fail);
                }
            }
            if (!nodeLoaded) {
                DataModel['listNode'](null, callback, true, null);
            } else {
                callback(nodeListData);
            }
        })
        .on('click', '#addNasNodeModal .btn-primary', function (ev) {
            $modal = $('#addNasNodeModal');
            var ipList = [];
            var nameList = [];
            var $checked = $modal.find('.nodesToAdd:checked');

            if ($checked.length === 0) {
                DisplayTips(lang.cluster.please_select_avail_nodes);
                return;
            }

            $checked.each(function (index) {
                ipList.push($(this).data('ip'));
                nameList.push($(this).data('hostname'));
            });

            var para = {
                'ip': ipList.join(),
                'hostname': nameList.join()
            }

            var callback = function (result) {
                $modal.find('.modal-header').LoadData('hide');
                if (!result) {
                    return;
                }
                if (result.code === 200) {
                  DisplayTips(lang.cluster.add_nas_node_success);
                  refresh();
                } else if (result.code === 0){
                  DisplayTips(lang.cluster.check_license_fail);
                } else {
                  DisplayTips(result.result || lang.cluster.add_nas_node_fail);
                }
            }

            $modal.find('.modal-header').LoadData('show');
            DataModel['newNas'](para, callback, true, null);
        })
        .on('click', '.js-edit-nas-service', function (ev) {
            $this = $(this);
            $modal = $('#editNasPubModel');
            $pubiprow = $this.closest('.js-nas-row');
            var pubip = $pubiprow.data('pubip');
            var netmask = $pubiprow.data('netmask');
            var netport = $pubiprow.data('netport');
            var ipaddr = $pubiprow.data('ip');
            //列举当前的节点对应的网口
            var para = {
                'node': ipaddr
            };
            var callback = function (result) {
                $modal.find(".modal-body").LoadData("hide");
                if (result == undefined)
                    return;
                if (result.code == 200) {
                    $modal.find('.btn-primary').removeAttr('disabled');
                    var data = result.result;
                    var netlist = data.earthnet.netlist;
                    var htm = "";
                    for (var i = 0; i < netlist.length; i++) {
                        if (netlist[i]['name'] === 'bond1') {
                            htm += '<option selected>' + netlist[i]['name'] + '</option>';
                        } else {
                            htm += '<option>' + netlist[i]['name'] + '</option>';
                        }
                    }
                    ;
                    $modal.find('.js-input-netport').html(htm);
                    $modal.data('ip', pubip);
                } else {
                    DisplayTips(lang.cluster.list_netport_info_fail + '(' + result.result + ')');
                }
            }
            $modal.find('.btn-primary').attr('disabled', 'disabled');
            $modal.find(".modal-body").LoadData("show");
            DataModel['listNet'](para, callback, true, null);

            $modal.modal('show');
            $modal.find('.js-input-public-ip').val(pubip);
            $modal.find('.js-input-mask').val(netmask);
            $modal.find('.js-input-netport').val(netport);
        })
        .on('shown.bs.modal', '#editNasPubModel', function (ev) {
            $('#editNasPubModel').find(':text:first').focus();
        })
        .on('click', '#editNasPubModel .btn-primary', function (ev) {
            var ipaddr = '',
                netmask = '',
                interfaceport = '',
                newipaddr = '',
                debug = true;
            $modal = $('#editNasPubModel');
            ipaddr = $modal.data('ip');
            newipaddr = trim($modal.find('.js-input-public-ip').val());
            netmask = trim($modal.find('.js-input-mask').val());
            interfaceport = trim($modal.find('.js-input-netport').val());
            if (!valifyURL(newipaddr)) {
                DisplayTips(lang.cluster.public_ip_format_error);
                return;
            }
            if (newipaddr === ipaddr) {
                DisplayTips(lang.cluster.ip_not_edited);
                return;
            }
            var para = {
                'ipaddr': ipaddr,
                'netmask': netmask,
                'interface': interfaceport,
                'newipaddr': newipaddr,
                'debug': debug
            };
            var callback = function (result) {
                $modal.find(".modal-header").LoadData("hide");
                if (result == undefined)
                    return;
                if (result.code == 200) {
                    DisplayTips(lang.cluster.edit_public_ip_success);
                    $modal.modal("hide");
                    refresh();
                } else {
                    DisplayTips(lang.cluster.edit_public_ip_fail + '(' + result.result + ')');
                }
            }
            $modal.find(".modal-header").LoadData("show");
            DataModel['modifyPubIp'](para, callback, true, null);
        })
        .on('mouseover', '.js-nas-row', function (ev) {
            $this = $(this);
            var sstatus = $this.data('sstatus');
            if (sstatus == 1) {
                //说明已启动，就显示“暂停”按钮
                $this.find('.js-stop-nas-service').removeClass('hidden');
            } else {
                //显示"启动"按钮
                $this.find('.js-start-nas-service').removeClass('hidden');
            }
            if (sstatus != 1)
                $this.find('.js-del-nas-service').removeClass('hidden');
            $this.find('.js-edit-nas-service').removeClass('hidden');
        })
        .on('mouseout', '.js-nas-row', function (ev) {
            $this = $(this);
            $this.find('.js-start-nas-service').addClass('hidden');
            $this.find('.js-stop-nas-service').addClass('hidden');
            $this.find('.js-del-nas-service').addClass('hidden');
            $this.find('.js-edit-nas-service').addClass('hidden');
        })
        .on('change', '.js-select-nasnode', function (ev) {
            $option = $modal.find('.js-select-nasnode').find('option:selected');
            var ipaddr = $option.data('host');
            var para = {
                'node': ipaddr
            };
            var callback = function (result) {
                $modal.find(".modal-body").LoadData("hide");
                if (result == undefined)
                    return;
                if (result.code == 200) {
                    var data = result.result;
                    var netlist = data.earthnet.netlist;
                    var htm = "";
                    for (var i = 0; i < netlist.length; i++) {
                        htm += '<option>' + netlist[i]['name'] + '</option>';
                    }
                    ;
                    $modal.find('.js-input-netport').html(htm);
                } else {
                    DisplayTips(lang.cluster.list_netport_info_fail + '(' + result.result + ')');
                }
            }
            $modal.find(".modal-body").LoadData("show");
            DataModel['listNet'](para, callback, true, null);
        })
        //添加nas服务
        // .on ( 'click', '#create-nasip-service', function (ev) {
        // 	$this = $(this);
        // 	$modal = $('#addNasPubModel');
        // 	//把页面上当前已添加的节点存起来
        // 	$rows = $('#naspubliciplist').find('.js-nas-row');
        // 	$option = $modal.find('.js-select-nasnode').find('option:eq(0)');
        // 	var ipaddr = '',
        // 		arr = [];
        // 	for (var j = 0; j < $rows.length; j++) {
        // 		arr.push( $($rows[j]).data('host') );
        // 	};

        // 	var nodeListCallback = function (result) {
        // 		$modal.find('.modal-header').LoadData ("hide");
        // 		if (result == undefined)
        // 			return;
        // 		if (result.code == 200) {
        // 			nodeListData = result.result.nodes;
        // 			var nodes = result.result.nodes;
        // 			var count = result.result.count;
        // 			var htm = "";
        // 			if ( count > 0 ) {
        // 				for (var i = 0; i < nodes.length; i++) {
        // 					var node = nodes[i];
        // 					htm += '<option data-host="'+ node['ip'] + '">' + node['hostname'] + '</option>';
        // 				}
        // 			}
        // 			$modal.find('.js-select-nasnode').html( htm );

        // 			//列举当前可用的网口信息
        // 			ipaddr = nodeListData[0]['ip'];
        // 			var para = {
        // 				'node': ipaddr
        // 			};
        // 			$modal.find(".modal-body").LoadData ("show");
        // 			DataModel['listNet'](para, callback, true, null);
        // 		} else {
        // 			DisplayTips( lang.cluster.list_avail_nodes_add_fail );
        // 		}
        // 	}
        // 	$modal.find('.modal-header').LoadData ("show");
        // 	DataModel["listNode"](null, nodeListCallback, true, null);
        // 	var callback = function (result){
        // 		$modal.find(".modal-body").LoadData ("hide");
        // 		if (result == undefined)
        // 			return;
        // 		if (result.code == 200) {
        // 			var data = result.result;
        // 			var netlist = data.earthnet.netlist;
        // 			var htm = "";
        // 			for (var i = 0; i < netlist.length; i++) {
        // 				htm += '<option>' + netlist[i]['name'] + '</option>';
        // 			};
        // 			$modal.find('.js-input-netport').html(htm);
        // 		} else {
        // 			DisplayTips( lang.cluster.list_netport_info_fail + '(' + result.result + ')' );
        // 		}
        // 	}
        // 	$modal.modal('show');
        // 	$modal.data('hosts', arr);
        // })
        // .on('shown.bs.modal','#addNasPubModel',function(ev){
        // 	$('#addNasPubModel').find(':text:first').focus();
        // })
        // .on ( 'click', '#addNasPubModel .btn-primary', function (ev) {
        // 	$modal = $('#addNasPubModel');
        // 	$option = $modal.find('.js-select-nasnode').find("option:selected");
        // 	var mdsNodes = $option.data('host');
        // 	var hostname = trim( $option.val() );
        // 	var hosts = $modal.data ( 'hosts');
        // 	// $nasrows = $('#naspubliciplist').find('.js-nas-row');
        // 	// if ( $nasrows.length < 1 ) {
        // 	// 	DisplayTips( lang.cluster.no_nasnode_not_add_publicip );
        // 	// 	return false;
        // 	// }
        // 	var ipaddr = trim( $modal.find('.js-input-public-ip').val() );
        // 	var netmask = trim( $modal.find('.js-input-mask').val() );
        // 	var netport = trim( $modal.find('.js-input-netport').val() );
        // 	if ( !valifyIP(ipaddr) || ipaddr == '' ) {
        // 		DisplayTips(lang.cluster.publicip_null_errorformat);
        // 		return;
        // 	}
        // 	if ( netmask == '' ) {
        // 		DisplayTips(lang.cluster.please_input_netmask);
        // 		return;
        // 	}
        // 	if ( netport == '' ) {
        // 		DisplayTips(lang.cluster.please_input_netport);
        // 		return;
        // 	}

        // 	for (var i = 0; i < hosts.length; i++) {
        // 		if (hosts[i] == mdsNodes) {
        // 			DisplayTips(lang.cluster.storagenode_has_added);
        // 			return;
        // 		}
        // 	};
        // 	var para = {
        // 		'ip': mdsNodes,
        // 		'hostname': hostname,
        // 		'ipaddr': ipaddr,
        // 		'netmask': netmask,
        // 		'interface': netport
        // 	}
        // 	var callback = function (result) {
        // 		if (result == undefined) {
        // 			return;
        // 		} else if (result.code == 200) {
        // 			$modal.find('.modal-body').LoadData ("hide");
        // 			DisplayTips(lang.cluster.add_nas_service_success);
        // 			refresh();
        // 		} else {
        // 			DisplayTips(lang.cluster.add_nas_service_fail + '(' + result.result + ')');
        // 		}
        // 		$modal.find('.modal-body').LoadData ("hide");
        // 		$modal.modal('hide');
        // 	}
        // 	$modal.find('.modal-body').LoadData ("show");
        // 	DataModel['addNasPubIp'](para, callback, true, lang.cluster.add_nas_service);
        // })
        //删除NAS服务
        .on('click', '.js-del-nas-service', function (ev) {
            $modal = $('#delNASModel');
            $row = $(this).closest('.js-nas-row');
            var hostname = $row.data('host');
            var ip = $row.data('ip');
            var ipaddr = $row.data('ipaddr');

            $row.siblings('.js-nas-row').removeClass('deling');
            $row.addClass('deling');
            $modal.find('.modal-body p').html(lang.cluster.sureto_del_nas + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
            $modal.modal('show');
            $modal.data('host', hostname);
            $modal.data('ip', ip);
            $modal.data('ipaddr', ipaddr);
        })
        .on('click', '#delNASModel .btn-danger', function (ev) {
            $modal = $('#delNASModel');
            var mdsNodes = $modal.data('host');
            var ip = $modal.data('ip');
            var ipaddr = $modal.data('ipaddr');
            var para = {
                'name': mdsNodes,
                'ip': ip,
                'ipaddr': ipaddr
            };
            var callback = function (result) {
                removeWaitMask();
                $row = $('.js-nas-row.deling');
                if (result == undefined) {
                    $row.removeClass('deling');
                    return;
                } else if (result.code == 200) {
                    DisplayTips(lang.cluster.del_nas_service_success);
                    $row.remove();
                } else {
                    $row.removeClass('deling');
                    DisplayTips(lang.cluster.del_nas_service_fail);
                }
                $modal.find('.modal-body').LoadData("hide");
                $modal.modal('hide');
            }
            $modal.find('.modal-body').LoadData("show");
            addWaitMask();
            DataModel['delNasPubIp'](para, callback, true, lang.cluster.del_nas_service);
        })
        //启动NAS服务
        .on('click', '.js-start-nas-service', function (ev) {
            var id = $(this).closest('.js-nas-row').data('ip');
            $row = $(this).closest('.js-nas-row');
            $row.siblings('.js-nas-row').removeClass('starting');
            $row.addClass('starting');
            var hostname = $row.data('host');
            $('#startNASModal .modal-body p').html(lang.cluster.sureto_start_nas + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
            $('#startNASModal').modal('show');
            $('#startNASModal').data('host', id);
        })
        .on('click', '#startNASModal .btn-primary', function (ev) {
            $modal = $('#startNASModal');
            var mons = $modal.data('host');
            var para = {
                'node': mons
            }
            var callback = function (result) {
                removeWaitMask();
                if (result == undefined) {
                    return;
                } else if (result.code == 200) {
                    DisplayTips(lang.cluster.start_nas_service_success);
                    setTimeout(function () {
                        refresh();
                    }, 2e3);
                } else {
                    DisplayTips(result.result || lang.cluster.start_nas_service_fail);
                }
                $modal.find('.modal-body').LoadData("hide");
                $modal.modal('hide');
            }
            $modal.find('.modal-body').LoadData("show");
            addWaitMask();
            DataModel['startNas'](para, callback, true, lang.cluster.start_nas_service);
        })
        //暂停NAS服务
        .on('click', '.js-stop-nas-service', function (ev) {
            $row = $(this).closest('.js-nas-row');
            var id = $row.data('ip');
            $(this).closest('.nas-service').find('.js-nas-row').removeClass('stoping');
            $(this).closest('.js-nas-row').addClass('stoping');
            var hostname = $row.data('host');
            $('#stopNASModal .modal-body p').html(lang.cluster.sureto_stop_nas + '<span style="color:red;">&nbsp;' + hostname + '</span>' + '?');
            $('#stopNASModal').modal('show');
            $('#stopNASModal').data('host', id);
        })
        .on('click', '#stopNASModal .btn-primary', function (ev) {
            $modal = $('#stopNASModal');
            var mons = $modal.data('host');
            var para = {
                'mdsNodes': mons,
            }
            var callback = function (result) {
                removeWaitMask();
                if (result == undefined) {
                    return;
                } else if (result.code == 200) {
                    DisplayTips(lang.cluster.stop_nas_service_success);
                    setTimeout(function () {
                        refresh();
                    }, 1.5e3);
                    // $('.js-nas-row.stoping').find('.js-status span').css('color', 'red').text('停用');
                    // $('.js-nas-row.stoping').data('nstatus', '6');
                } else {
                    DisplayTips(lang.cluster.stop_nas_service_fail + '(' + result.result + ')');
                }
                $modal.find('.modal-body').LoadData("hide");
                $modal.modal('hide');
                $('.js-nas-row.stoping').removeClass('stoping');
            }
            $modal.find('.modal-body').LoadData("show");
            addWaitMask();
            DataModel['stopNas'](para, callback, true, lang.cluster.stop_nas_service);
        })
        //启动所有NAS网关服务
        .on('click', '#nasStartAll', function (ev) {
            $modal = $('#startAllNASModal');
            var nasIpArr = [];
            $('.js-nas-row').each(function (index) {
                if ($(this).data('sstatus') === 0) {
                    nasIpArr.push($(this).data('ip'));
                }
            });
            if (nasIpArr.length < 1) {
                DisplayTips(lang.cluster.all_nas_have_started);
                return;
            }
            $modal.data('ips', nasIpArr);
            $modal.modal('show');
        })
        .on('click', '#startAllNASModal .btn-primary', function (ev) {
            $modal = $('#startAllNASModal');
            $modal.find('.modal-header').LoadData('show');
            var nasIpArr = $modal.data('ips');
            var param = {
                'ips': nasIpArr.join(),
            }
            var callback = function (result) {
                removeWaitMask();
                if (result == undefined) {
                    return;
                } else if (result.code == 200) {
                    DisplayTips(lang.cluster.start_nas_service_success);
                    setTimeout(function() {
                        refresh();
                    }, 2e3);
                } else {
                    DisplayTips(result.result || lang.cluster.start_nas_service_fail);
                    $modal.modal("hide");
                    setTimeout(function() {
                        refresh();
                    }, 3e3);
                }
            }
            addWaitMask();
            DataModel['startAllNas'](param, callback, true, lang.cluster.start_nas_service);
        })
        //停止所有NAS服务
        .on('click', '#nasStopAll', function (ev) {
            $modal = $('#stopAllNASModal');
            var nasIpArr = [];
            $('.js-nas-row').each(function (index) {
                if ($(this).data('sstatus') === 1) {
                    nasIpArr.push($(this).data('ip'));
                }
            });
            if (nasIpArr.length < 1) {
                DisplayTips(lang.cluster.all_nas_have_stopped);
                return;
            }
            $modal.data('ips', nasIpArr);
            $modal.modal('show');
        })
        .on('click', '#stopAllNASModal .btn-primary', function (ev) {
            $modal = $('#stopAllNASModal');
            $modal.find('.modal-header').LoadData('show');
            var nasIpArr = $modal.data('ips');
            var param = {
                'ips': nasIpArr.join(),
            }
            var callback = function (result) {
                removeWaitMask();
                if (result == undefined) {
                    return;
                } else if (result.code == 200) {
                    DisplayTips(lang.cluster.stop_nas_service_success);
                    setTimeout(function() {
                        refresh();
                    }, 2e3);
                } else {
                    DisplayTips(lang.cluster.stop_nas_service_fail);
                    $modal.modal("hide");
                    setTimeout(function() {
                        refresh();
                    }, 2e3);
                }
            }
            addWaitMask();
            DataModel['stopAllNas'](param, callback, true, lang.cluster.stop_nas_service);
        })
        //整体配置
        .on('click', '#nasConfAll', function (ev) {
            $modal = $('#confNASModal');
            $modal.find('.modal-header').LoadData('show');
            $modal.modal('show');
        })
        .on('shown.bs.modal', '#confNASModal', function (ev) {
            $modal = $('#confNASModal');
            $modal.find('.modal-header').LoadData('hide');
            var nashtm = '';
            for (i = 0; i < $('.js-pubip-row').length; i++) {
                var pubip = $('.js-pubip-row:eq(' + i + ')').data('pubip');
                var netmask = $('.js-pubip-row:eq(' + i + ')').data('mask');
                var port = $('.js-pubip-row:eq(' + i + ')').data('port');
                nashtm += '<tr data-pubip="' + pubip + '">' +
                    '<td>' +
                    '<input type="text" value="' + pubip + '" class="none-border-input right js-get-publicip" size="15" placeholder="' + lang.cluster.please_input_publicip + '" style="padding-right: 15px;">' +
                    '<span>/</span>' +
                    '<input type="text" class="none-border-input js-get-netmask" placeholder="' + lang.cluster.please_input_netmask + '" style="padding-left: 15px;width: 50px" value="' + netmask + '">' +
                    '</td>' +
                    '<td>' +
                    '<select class="form-control js-input-netport"><option value="' + port + '">' + port + '</option></select>' +
                    '</td>' +
                    '</tr>';
            }
            $modal.find("#nasoption-list").html(nashtm);
            if (sstatasArr.length > 0) {
                $('#nasoption-list .js-input-netport').attr('disabled', 'true');
            }
            var html = '';
            var netport = [];
            for (var k = 0; k < $('#nasNodeTable tr').length; k++) {
                var ip = $('#nasNodeTable tr:eq(' + k + ')').data('ip');
                var para = {
                    'hosts': ip
                };
                var callback = function (result) {
                    if (result === undefined)
                        return;
                    if (result.code === 200) {
                        earthnetInfo[ip] = result;
                        var netList = result.result.netlist;
                        for (m = 0; m < netList.length; m++) {
                            if (netport.indexOf(netList[m].name) === -1) {
                                netport.push(netList[m].name);
                            }
                        }
                        if (k === $('#nasNodeTable tr').length - 1) {
                            var num = netport.length;
                            for (j = 0; j < num; j++) {
                                html += '<option value="' + netport[j] + '">' +
                                    netport[j] +
                                    '</option>';
                            }
                            $modal.find('.js-input-netport').html(html);
                        }
                    } else {
                        DisplayTips(lang.cluster.list_netport_info_fail + '(' + result.result + ')');
                    }
                }
                if (earthnetInfo[ip] === undefined && sstatasArr.length === 0) {
                    DataModel['listIpSelected'](para, callback, false, null);
                } else if (earthnetInfo[ip] !== undefined && sstatasArr.length === 0) {
                    callback(earthnetInfo[ip]);
                }
            }
        })
        //整体配置 = 重置公共IP
        .on('click', '#confNASModal #add-nas', function (ev) {
            $nasrows = $('#confNASModal #nasoption-list>tr');
            var isConfNasBool = true;//判断是否所有的公共IP和掩码都已输入
            var isPubIPFormatBool = true;//判断公共IP格式是否错误
            var isNetMaskBool = true;//判断子网掩码是否错误
            $nasrows.each(function (i) {
                var pubip = trim($(this).find('.js-get-publicip').val());
                var netmask = trim($(this).find('.js-get-netmask').val());
                if (pubip === '' || netmask === '') {
                    isConfNasBool = false;
                }
                if (!valifyIP(pubip)) {
                    isPubIPFormatBool = false;
                    $(this).find('.js-get-publicip').css('border', '1px solid red');
                }
                if (isNaN(netmask)) {
                    isNetMaskBool = false;
                }
                if (netmask <= 0 || netmask >= 32) {
                    isNetMaskBool = false;
                }
            });
            if (!isConfNasBool) {
                DisplayTips(lang.wizard.confirm_allnode_has_input_ipandnetmask + '（' + lang.wizard.red_means_ip_format_error + '）');
                return false;
            }
            if (!isPubIPFormatBool) {
                DisplayTips(lang.wizard.your_cur_public_IP_format_error);
                return false;
            }
            if (!isNetMaskBool) {
                DisplayTips(lang.wizard.your_cur_netmask_format_error);
                return false;
            }

            var ipList = [];
            var netmaskList = [];
            var netportList = [];

            $nasrows.each(function (index) {
                ipList.push(trim($(this).find('.js-get-publicip').val()));
                netmaskList.push(trim($(this).find('.js-get-netmask').val()));
                netportList.push(trim($(this).find('option:selected').val()));
            });

            var naspara = {
                'ipaddr': ipList.join(),
                'netmask': netmaskList.join(),
                'interface': netportList.join()
            };
            var nasCallback = function (res) {
                removeWaitMask();
                if (res.code == 200) {
                    DisplayTips(lang.wizard.set_nas_success);
                    $('#confNASModal').modal('hide');
                    refresh();
                } else {
                    DisplayTips(lang.wizard.set_nas_fail)
                }
            }
            addWaitMask();
            DataModel['resetPubIp'](naspara, nasCallback, true, '');

        });
    //添加公共IP 和列举公共IP使用
    function addPublicIpRow(ipaddr, netport, netmask, node) {
        var htm = "";
        if (node == undefined) {
            node = 'unkonwn';
        }
        htm = '<div class="pubip-mag wizard-mag" data-ip="' + ipaddr + '" data-netmask="' + netmask + '" data-netport="' + netport + '">' +
            '<div class="col-lg-3 basic-lg-3 inlineblock">' +
            '<span>' + node + '</span>' +
            '</div>' +
            '<div class="col-lg-3 basic-lg-3 inlineblock">' +
            '<span>' + netport + '</span>' +
            '</div>' +
            '<div class="col-lg-4 basic-lg-4 inlineblock">' +
            '<span>' + ipaddr + ' / ' + netmask + '</span>' +
            '</div>' +
            '<div class="col-lg-2 basic-lg-2 inlineblock" style="height:30px;">' +
            '<a href="javascript:;" class="js-remove-pubip hidden" style="margin-right:5px;" title="' + lang.cluster.del_public_ip + '">' +
            '<span class="glyphicon glyphicon-trash"></span>' +
            '</a>' +
            '<a href="javascript:;" class="js-edit-pubip hidden" title="' + lang.cluster.edit_public_ip + '">' +
            '<span class="glyphicon glyphicon-edit"></span>' +
            '</a>' +
            '</div>' +
            '</div>';
        return htm;
    }

    //列举NAS和公共IP
    // function showNasList (result) {
    // 	var data = result.result;
    //     var htm1 = '';
    //     for (var i = 0; i < data.length; i++) {
    //     	var nasrow = data[i];
    //     	var type = nasrow['nstatus'];
    //         nstatus = getCnasNodeState (type);
    //         sstatus = getCnasServiceState(nasrow['sstatus']);
    //     	htm1 += '<div class="naspublip-mag js-nas-row" data-sstatus="' + nasrow['sstatus'] + '" data-nstatus= "'+ type +'" data-id="'+ nasrow['id'] +'" data-host= "'+ nasrow['nodename'] +'" data-ip="'+ nasrow['ip'] +'" data-ipaddr="'+ nasrow['ipaddr'] +'" data-netport="'+ nasrow['interface'] +'" data-netmask="' + nasrow['netmask'] + '">'+
    // 		            '<div class="col-lg-2 basic-lg-2 inlineblock col-format-row">'+
    // 		              '<span>' + nasrow['nodename'] + '</span>'+
    // 		            '</div>'+
    // 		            '<div class="col-lg-2 basic-lg-2 inlineblock col-format-row">'+
    // 		              '<span>' + nasrow['interface'] + '</span>'+
    // 		            '</div>'+
    // 		            '<div class="col-lg-2 basic-lg-2 inlineblock col-format-row">'+
    // 		              '<span>' + nasrow['ipaddr'] + ' / ' + nasrow['netmask'] + '</span>'+
    // 		            '</div>' +
    // 	            	'<div class="col-lg-2 basic-lg-2 inlineblock col-format-row js-nstatus">';
    // 	            if (type == 1) {
    // 	    		htm1 += '<span style="color:green;">' + nstatus + '</span>'+
    // 	            	'</div>';
    // 	            } else{
    // 	    		htm1 += '<span style="color:red;">' + nstatus + '</span>'+
    // 	            	'</div>';
    // 	            }
    // 	        htm1 += '<div class="col-lg-2 basic-lg-2 inlineblock col-format-row js-sstatus">';
    // 	        	if (nasrow['sstatus'] == 1) {
    // 	    		htm1 += '<span style="color:green;">' + sstatus + '</span>'+
    // 	            	'</div>';
    // 	            } else{
    // 	    		htm1 += '<span style="color:red;">' + sstatus + '</span>'+
    // 	            	'</div>';
    // 	            }

    // 	            if (nstatus == 'unknown') {
    //             htm1 += '<div class="col-lg-2 basic-lg-2 inlineblock col-format-row" style="height:30px;">' +
    //                         '<a href="javascript:;" class="hidden js-del-nas-service" title="' + lang.cluster.del_nas_service+ '" style="margin-right:15px;">'+
    //                             '<span class="glyphicon glyphicon-trash"></span>'+
    //                         '</a>'+
    //                         '<a href="javascript:;" class="hidden js-edit-nas-service" title="' + lang.cluster.edit_nas_service+ '">'+
    //                             '<span class="glyphicon glyphicon-edit"></span>'+
    //                         '</a>'+
    //                     '</div>'+
    //                 '</div>';
    //                 } else {
    //         	htm1 += '<div class="col-lg-2 basic-lg-2 inlineblock col-format-row" style="height:30px;">' +
    // 	                    '<a href="javascript:;" class="hidden js-start-nas-service" title="'+ lang.cluster.start_nas_service +'" style="margin-right:15px;">'+
    // 	                        '<span class="glyphicon glyphicon-play"></span>'+
    // 	                    '</a>'+
    // 	                    '<a href="javascript:;" class="hidden js-stop-nas-service" title="' + lang.cluster.stop_nas_service + '" style="margin-right:15px;">'+
    // 	                        '<span class="glyphicon glyphicon-pause"></span>'+
    // 	                    '</a>'+
    // 	                    '<a href="javascript:;" class="hidden js-del-nas-service" title="' + lang.cluster.del_nas_service+ '" style="margin-right:15px;">'+
    // 	                        '<span class="glyphicon glyphicon-trash"></span>'+
    // 	                    '</a>'+
    // 	                    '<a href="javascript:;" class="hidden js-edit-nas-service" title="' + lang.cluster.edit_nas_service+ '">'+
    // 	                        '<span class="glyphicon glyphicon-edit"></span>'+
    // 	                    '</a>'+
    // 	                '</div>'+
    // 	            '</div>';
    //             }
    //     };
    //     return htm1;
    // }

    function showNasTable(result) {
        var data = result.result;
        var html = '';

        for (var i = 0; i < data.length; i++) {
            var nasrow = data[i];
            // var type = nasrow['nstatus'];
            var nstatus = getCnasNodeState(nasrow['nstatus']);
            var sstatus = getCnasServiceState(nasrow['sstatus']);
            html += '<tr class="js-nas-row" data-sstatus="' + nasrow['sstatus'] +
                '" data-nstatus= "' + nasrow['nstatus'] +
                '" data-id="' + nasrow['id'] +
                '" data-host= "' + nasrow['nodename'] +
                '" data-ip="' + nasrow['ip'] +
                '" data-pubips="' + nasrow['pubips'].join() +
                '" data-netport="' + nasrow['interface'] +
                '" data-netmask="' + nasrow['netmask'] + '">' +
                '<td>' + nasrow['nodename'] + '</td>' +
                '<td>' + nasrow['interface'] + '</td>' +
                '<td>';
            if (nasrow['pubips'][0] === '-') {
                html += '-';
            } else {
                var pubiplist = [];
                for (var j = 0; j < nasrow['pubips'].length; j++) {
                    pubiplist.push(nasrow['pubips'][j] + ' / ' + nasrow['netmask']);
                }
                html += pubiplist.join('<br>');
            }
            html += '</td>';
            if (nasrow['nstatus'] === 1) {
                html += '<td style="color:green;">' + nstatus + '</td>';
            } else {
                html += '<td style="color:red;">' + nstatus + '</td>';
            }
            if (nasrow['sstatus'] === 1) {
                html += '<td style="color:green;">' + sstatus + '</td>';
            } else {
                html += '<td style="color:red;">' + sstatus + '</td>';
            }

            //code 0 = unknown
            // if (nasrow['nstatus'] === 0) {
            // 	html += '<td>' +
            // 				'<a href="javascript:;" class="hidden js-del-nas-service" title="' + lang.cluster.del_nas_service+ '" style="margin-right:15px;">' +
            //                     '<span class="glyphicon glyphicon-trash"></span>' +
            //                 '</a>' +
            // 			'</td>';
            // } else {
            // 	html += '<td>' +
            // 				'<a href="javascript:;" class="hidden js-start-nas-service" title="'+ lang.cluster.start_nas_service +'" style="margin-right:15px;">' +
            //                     '<span class="glyphicon glyphicon-play"></span>' +
            //                 '</a>' +
            //                 '<a href="javascript:;" class="hidden js-stop-nas-service" title="' + lang.cluster.stop_nas_service + '" style="margin-right:15px;">' +
            //                     '<span class="glyphicon glyphicon-pause"></span>' +
            //                 '</a>' +
            //                 '<a href="javascript:;" class="hidden js-del-nas-service" title="' + lang.cluster.del_nas_service+ '" style="margin-right:15px;">' +
            //                     '<span class="glyphicon glyphicon-trash"></span>' +
            //                 '</a>' +
            // 			'</td>';
            // }

            html += '<td>' +
                '<a href="javascript:;" class="hidden js-start-nas-service" title="' + lang.cluster.start_nas_service + '" style="margin-right:15px;">' +
                '<span class="glyphicon glyphicon-play"></span>' +
                '</a>' +
                '<a href="javascript:;" class="hidden js-stop-nas-service" title="' + lang.cluster.stop_nas_service + '" style="margin-right:15px;">' +
                '<span class="glyphicon glyphicon-pause"></span>' +
                '</a>' +
                '</td>';
            html += '</tr>';
        }
        return html;
    }

    //列举公共IP信息
    function showPubIpInfo(result) {
        var data = result.result;
        var html = '';

        for (var i = 0; i < data.length; i++) {
            var iprow = data[i];
            html += '<tr class="js-pubip-row" data-pubip="' + iprow['ipaddr'] + '" data-mask="' + iprow['netmask'] + '" data-port="' + iprow['interface'] + '">' +
                '<td>' +
                iprow['ipaddr'] + ' / ' + iprow['netmask'] + ' ' +
                '</td>' +
                '<td>' + iprow['interface'] + '</td>' +
                '<td>' +
                '<a class="js-del-pubip hidden" href="javascript:;" title="' + lang.cluster.del_public_ip + '">' +
                '<span class="glyphicon glyphicon-minus-sign"></span>' +
                '</a>' +
                '<td>' +
                '</tr>';
        }
        return html;
    }

    //列举NAS节点信息
    function showNasNodeInfo(result) {
        var data = result.result;
        var html = '';

        for (var i = 0; i < data.length; i++) {
            var noderow = data[i];
            html += '<tr class="js-node-row" data-ip="' + noderow['ip'] + '" data-hostname="' + noderow['nodename'] + '">' +
                '<td>' + noderow['nodename'] + '</td>' +
                '<td>' + noderow['ip'] + '</td>' +
                '<td>' +
                '<a class="js-del-nasnode hidden" href="javascript:;" title="' + lang.cluster.del_nas_node + '">' +
                '<span class="glyphicon glyphicon-minus-sign"></span>' +
                '</a>' +
                '</td>' +
                '</tr>';
        }
        return html;
    }

    autoHeightPermit();
    //自适应列表高度
    function autoHeightPermit() {
        var h1 = $('.magtable_list_third').height();
        var h2 = $('.magtable_list_parent').height();
        if (h1 <= 0) {
            html = '<div class="no-record-parent">' +
                '<span class="no-record">' +
                lang.user.no_record +
                '</span>' +
                '</div>';
            $('.magtable_list_third').append(html);
        }
        if (h1 < h2) {
            $('.all_table_list_third').css('height', 'auto');
            $('.magtable_list_parent').css('overflow', 'hidden');
        }
    }

    //获取nas的节点状态
    function getCnasNodeState(nstatus) {
        if (nstatus == 1) {
            nstatus = lang.normal;
        } else if (nstatus == 2) {
            nstatus = lang.lost_contact;
        } else if (nstatus == 3) {
            nstatus = lang.disable;
        } else if (nstatus == 4) {
            nstatus = lang.initialization_unhealthy;
        } else if (nstatus == 5) {
            nstatus = lang.breakdown;
        } else if (nstatus == 6) {
            nstatus = lang.disabled;
        } else if (nstatus == 7) {
            nstatus = lang.network_anomaly;
        } else if (nstatus == 8) {
            nstatus = lang.no_join;
        } else {
            nstatus = lang.unknown;
        }
        return nstatus;
    }

    //获取nas的服务状态
    function getCnasServiceState(type) {
        switch (type) {
            case 0:
                return lang.stopped;
            case 1:
                return lang.running;
            default:
                return lang.unknown;
        }
    }
})
