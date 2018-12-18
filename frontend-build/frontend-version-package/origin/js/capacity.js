$(function (ev) {
    var hbeatipMap = { };  // 心跳记录心跳ip和主机名对应情况
    var expStep = {
        '0': lang.wizard.instruction,
        '1': lang.node.add_node ,
        '2': lang.node.add_ntp_service,
        '3': lang.storage.add_store_cluster,
        '4': lang.disk.add_disk,
        '5': lang.wizard.add_service,
        '6': lang.cluster.add_nas_cluster,
        '7': lang.node.add_dns,
        '8': lang.wizard.add_basic_service,
        '9': lang.node.confirm_info
    }
    var redStep = {
        '1': lang.node.remove_node,
        '2': lang.node.remove_nas_pub_ip
    }
    var selfHostname = '';
    var $modal = $('#capacityModal');
    var $wizardmodal=$('#wizardConfModal');
    var $destroymodal=$('#destroyClusterModal');
    var nodeList = [];
    var nameList = [];
    var ipList = [];
    var masterList = [];
    var storageList = [];
    var hostnameForDisk = '';
    var mdsList = [];
    var monList = [];
    var nasIpList = [];
    var nasNameList = [];
    var dnsIpList = [];
    var pubIpParaList = [];
    var domainName = '';
    var curMasters = '';

    var removeNodeIpList = [];
    var removePubIpList = [];
    var removeNodeNameList = [];

    //判断集群状态
    var clusterHealth = true;
    var hasNas = true;
    var hasNtp = true;

    //用于缓存已请求的数据
    var addDiskData = undefined;

    //屏蔽form提交后的默认刷新行为，避免按ENTER键自动刷新
    $('#addNodeForm').submit(function (ev) {
        ev.preventDefault();
    });

    $(document)
    .on('hidden.bs.modal', '#capacityModal', function (ev) {
        refresh();
    })
    .on('shown.bs.modal', '#capacityModal', function (ev) {
        $('#capacityModal #capacityHandler').focus();
    })
    //点击一行勾选
    .on('click', '#capacityModal .checkboxInRow', function (ev) {
        if (!$(ev.target).is('input')) {
            var checkbox = $(this).find('input');
            if (checkbox.prop('checked')) {
                checkbox.click();
            } else {
                checkbox.click();
            }
        }
    })
    //全选
    .on('click', '#capacityModal .js-sel-all', function (ev) {
        $(this).closest('.expand-step').find('#addDiskTable input[type="checkbox"]')
            .prop('checked', $(ev.target).prop('checked'));
    })
    //缩容节点只能选取一个
    .on('change', '#reomoveNodesTable .isNodeRemoved', function (ev) {
        $(this).closest('.checkboxInRow').siblings().find('.isNodeRemoved').each(function (ev) {
            $(this).prop('checked', false);
        });
    })
    .on('change', '#reomovePubIpTable .isPubIpRemoved', function (ev) {
        $(this).closest('.checkboxInRow').siblings().find('.isPubIpRemoved').each(function (ev) {
            $(this).prop('checked', false);
        });
    })
    //添加NAS相关
    .on('change', '.isNasNodeAdded', function (ev) {
        var $tr = $(this).closest('tr');
        $tr.find('.selectPort').toggleClass('disabled');
        $tr.find('.inputPublicIp').toggleClass('disabled');
        $tr.find('.inputNetMask').toggleClass('disabled');
    })
    .on('keypress', '#capacityModal #capacityHandler', function (ev) {
        if (ev.which === 13) {
            var handler = trim($(this).val()).toLowerCase();
            if (handler === 'expand' || handler === 'reduce') {
                //确认存储状态
                var getHealthCallback = function (result) {
                    $modal.find('.modal-header').LoadData('hide');

                    if (result.code !== 200) {
                        //集群未初始化，没有存储集群，跳过添加存储集群、添加磁盘和添加服务
                        clusterHealth = false;
                        //FIXME
                        $modal.find('#expandStep3').remove();
                        $modal.find('#expandStep4').remove();
                        $modal.find('#expandStep5').remove();
                        $modal.find('#expandStep8').remove();

                        nasCallback({code: 600});
                } else {
                        //集群初始化，检查有无NAS集群
                        DataModel['listNasInfo'](null, nasCallback, true, null);

                        $modal.find('#expandStep8').remove();
                    }
                }
                $modal.find('.modal-header').LoadData('show');
                DataModel['clusterState'](null, getHealthCallback, true, null);

                //确认NAS集群
                var nasCallback = function (result) {
                    $modal.find('.modal-header').LoadData('hide');
                    removeWaitMask();
                    if (result.code !== 200 || result.result.length === 0) {
                        hasNas = false;
                        //不存在NAS集群，跳过添加NAS集群
                        //$modal.find('#expandStep6').remove();
                        $modal.find('#reduceStep2').remove();
                    }
                }
                addWaitMask();
                $modal.find('.modal-header').LoadData('show');

                //确认NTP主节点是否初始化
                var ntpCallback = function (result) {
                    $modal.find('.modal-header').LoadData('hide');
                    if (result.code === 200) {
                        curMasters = result.result;
                    } if (result.code === 603) {
                        hasNtp = false;
                    }
                }
                $modal.find('.modal-header').LoadData('show');
                DataModel['getMaster'](null, ntpCallback, true, null);

                var curDnsCallback = function (result) {
                    if (result.code === 200) {
                        domainName = result.result.domain_name;
                    }
                }

                DataModel['listCurClusterDns'](null, curDnsCallback, true, null);

                if (handler === 'expand') {
                    //进入扩容页
                    $('#capacityModal #capacityIntro').toggle(200).siblings('#expandStep1').toggle(200, focusOn).addClass('curStep');
                    $('#capacityModal .modal-header .btn-primary').removeClass('hidden');
                    $modal.find('#capacityModalLabel').text(expStep['1']);
                    $modal.find('.btn-primary').attr('id','js-expand-' + '1');

                    //给下一步按钮添加disabled状态，直到有可用节点添加
                    $modal.find('#js-expand-1').attr('disabled', 'disabled');

                    DataModel['listNode'](null, function (result) {
                      if (result.code === 200) {
                        hbeatipMap = JSON.parse(JSON.stringify(result.result.nodes));
                      }
                    }, true, null);

                } else if (handler === 'reduce') {
                    //进入缩容页
                    $('#capacityModal #capacityIntro').toggle(200).siblings('#reduceStep1').toggle(200, focusOn).addClass('curStep');
                    $('#capacityModal .modal-header .btn-primary').removeClass('hidden');
                    $modal.find('#capacityModalLabel').text(redStep['1']);
                    $modal.find('.btn-primary').attr('id','js-reduce-' + '1');

                    var callback = function (result) {
                        $modal.find('.modal-header').LoadData('hide');
                        if (!result) {
                            return;
                        }
                        if (result.code === 200) {
                            hbeatipMap = JSON.parse(JSON.stringify(result.result.nodes));
                            //过滤自身节点
                            var nodesData = result.result.nodes.filter(function (node) {
                                return (node.hostname !== selfHostname);
                            });
                            var html = renderRemoveNodes(nodesData);
                            $modal.find('#reomoveNodesTable tbody').html(html);
                        } else {
                            DisplayTips( lang.cluster.list_avail_nodes_add_fail );
                        }
                    }

                    var selfCallback = function (result) {
                        $modal.find('.modal-header').LoadData('hide');
                        if (!result) {
                            return;
                        }
                        if (result.code === 200) {
                            selfHostname = result.result.hostname;
                            $modal.find('.modal-header').LoadData('show');
                            DataModel['listNode'](null, callback, true, null);
                        } else {
                            DisplayTips( lang.cluster.list_avail_nodes_add_fail );
                        }
                    }

                    $modal.find('.modal-header').LoadData('show');
                    DataModel['listBasic']({'host': '127.0.0.1'}, selfCallback, true, '');
                }
            }else if(handler==='setup'){
                $(document).off('hidden.bs.modal','#capacityModal');
                $('#capacityModal').modal('hide');
                $('#capacityModal').off('hidden.bs.modal');
                //$('#wizardConfModal').modal('show');
                var checkCallback = function (result) {
                    if (!result) {
                        return;
                    }
                    if (result.code === 200) {
                        //var $destroymodal = $('#destroyClusterModal');
                        $destroymodal.modal('show');
                    } else {
                        wizardModalShow();
                    }
                }
                DataModel['clusterState'](null, checkCallback, true, null);
            }
        }
    })
    //点击下一步
    .on('click', '#capacityModal .btn-primary', function (ev) {
        //限制下一步的条件
        var btnId = $(this).attr('id');
        //DNS信息必须填写
        // if (btnId === 'js-expand-7') {
        //     var domain = trim($modal.find('#inputDomain').val());
        //     if (!valifyDomain(domain)) {
        //         DisplayTips( lang.cluster.domian_name_error );
        //         return;
        //     }
        // }
        //缩容只能选择一个节点
        console.log(btnId);
        if (btnId === 'js-reduce-1') {
            var delLength = $modal.find('#reomoveNodesTable .isNodeRemoved:checked').length;
            if (delLength !== 1) {
                DisplayTips( lang.cluster.select_one_nodes );
                return;
            }
            //显示上一步按钮
            $('#capacityModal .js-capacity-priv').removeClass('hidden');
        } else if (btnId === 'js-reduce-submit') {
            if (trim($('#submitRuduce').val()).toLowerCase() !== 'confirm') {
                return;
            }
        } else if (btnId === 'js-expand-2') {
            //显示上一步按钮
            $('#capacityModal .js-capacity-priv').removeClass('hidden');
        } else if (btnId === 'js-expand-6') {
            var valifyPublicIp = $('.inputPublicIp').val();
            var valifyNetMask = $('.inputNetMask').val();
            if ($('.isNasNodeAdded').is(':checked') == true) {
                if (valifyPublicIp != '' && valifyNetMask == '') {
                    DisplayTips(lang.wizard.confirm_allnode_has_input_ipandnetmask);
                    return false;
                } else if (valifyPublicIp == '' && valifyNetMask != '') {
                    DisplayTips(lang.wizard.confirm_allnode_has_input_ipandnetmask);
                    return false;
                } else if (valifyPublicIp != '' && valifyNetMask != '') {
                    if (!valifyIP(valifyPublicIp)) {
                        DisplayTips(lang.wizard.your_cur_public_IP_format_error);
                        return false;
                    } else if (valifyNetMask <= 0) {
                        DisplayTips(lang.wizard.your_cur_netmask_format_error);
                        return false;
                    } else if (valifyNetMask >= 32) {
                        DisplayTips(lang.wizard.your_cur_netmask_format_error);
                        return false;
                    }
                } else if (valifyPublicIp == '' && valifyNetMask == '') {
                    DisplayTips(lang.wizard.confirm_allnode_has_input_ipandnetmask);
                    return false;
                }
            } else {
                hasNas = false;
            }
        }
        //curStep类标记当步骤，toFocus类标记默认焦点位置
        $modal.find('.curStep').toggle(200).removeClass('curStep')
                .next().toggle(200, focusOn).addClass('curStep');
        //改写标题，确认按钮上的类
        var $curent = $modal.find('.curStep');
        var step = $curent.data('step');
        if ($curent.hasClass('expand-step')) {
            //扩容流程
            $modal.find('#capacityModalLabel').text(expStep[step]);
            $modal.find('.btn-primary').attr('id','js-expand-' + step);
        } else if ($curent.hasClass('reduce-step')) {
            //缩容流程
            $modal.find('#capacityModalLabel').text(redStep[step]);
            $modal.find('.btn-primary').attr('id','js-reduce-' + step);
        }
    })
    //点击上一步
    .on('click', '#capacityModal .js-capacity-priv', function (ev) {
        var btnId = $('#capacityModal .btn-primary').attr('id');
        if (btnId === 'js-expand-3' || btnId === 'js-reduce-2') {
            //移除上一步按钮
            $('#capacityModal .js-capacity-priv').addClass('hidden');
        }
        if(!clusterHealth){
           if(btnId === 'js-reduce-submit'){
               $('#capacityModal .js-capacity-priv').addClass('hidden');
           }
        }

        $modal.find('.curStep').toggle(200).removeClass('curStep')
                .prev().toggle(200, focusOn).addClass('curStep');
        var $curent = $modal.find('.curStep');
        var step = $curent.data('step');
        if ($curent.hasClass('expand-step')) {
            //扩容流程
            $modal.find('#capacityModalLabel').text(expStep[step]);
            $modal.find('.btn-primary').attr('id','js-expand-' + step);
        } else if ($curent.hasClass('reduce-step')) {
            //缩容流程
            $modal.find('#capacityModalLabel').text(redStep[step]);
            $modal.find('.btn-primary').attr('id','js-reduce-' + step);
        }
    })
    .on('keypress', '#addNodeList', function (ev) {
        if (ev.which === 13) {
            //每次确认状态时更新节点列表
            nodeList = [];
            ipList = [];
            nameList = [];
            //确认按键添加disabled状态
            $modal.find('#js-expand-1').attr('disabled', 'disabled');

            var ipstr = trim($(this).val());
            if (ipstr === '') {
                return;
            }
            var iplist = ipstr.split(',');
            var verifyPassed = true;
            for (var i = 0; i < iplist.length; i++) {
                if (valifyIP(iplist[i]) === false) {
                    verifyPassed = false;
                    break;
                }
            }
            if (verifyPassed === false) {
                DisplayTips( lang.cluster.confirm_ip_format );
                return;
            }

            var para = {
                'ips': ipstr
            }
            var callback = function (result) {
                $modal.find('.modal-header').LoadData('hide');
                if (!result) {
                    return;
                }
                if (result.code === 200) {
                    var html = renderNodesStatus(result.result);
                    $('#selectToAddNodeTable tbody').html(html);
                } else {
                    DisplayTips( lang.node.cannot_get_nodes_status );
                }
            }
            $modal.find('.modal-header').LoadData('show');

            var checkHost = window.location.hostname;
            // 检查各个节点的授权
            DataModel['checkIpsActivation']({ips: checkHost}, function (rsp) {
              $modal.find('.modal-header').LoadData('hide');
    					if (rsp.code == 200) {
    						var activatedNodes = rsp.result.info.filter(function(node) {
    							return node.isActivated;
    						}).map(function (node) {
    							return node.ip;
    						});

                if (!activatedNodes.includes(checkHost)) {
                  DisplayTips(checkHost + lang.licence.no_license)
                }else {
                  $modal.find('.modal-header').LoadData('show');
                  DataModel['checkNodes'](para, callback, true, null);
                }

    					}else {
    						var errNodes = rsp.result.err.map(function(node) {
    							return node.ip;
    						});
    						DisplayTips(errNodes.join(',') + lang.licence.license_get_activated_nodes_fail);
    					}
    				}, true, null)
        }
    })
    //1 = 添加节点
    .on('click', '#js-expand-1', function (ev) {
        if (!hbeatipMap.length) {
          DataModel['listNode'](null, function (result) {
            if (result.code === 200) {
              hbeatipMap = JSON.parse(JSON.stringify(result.result.nodes));
              //渲染NTP选项
              var html = renderAddNtp(nodeList);
              $modal.find('#addNtpServiceTable tbody').html(html);

              //渲染NAS选项
              var html = renderAddNas(nodeList);
              $modal.find('#addNasTable tbody').html(html);

              //渲染DNS选项
              //var html = renderAddDns(nodeList);
              //$modal.find('#addDnsTable tbody').html(html);

              //添加到结果页
              var $target = $modal.find('#confirmNodes ul');
              for (var i = 0; i < nodeList.length; i++) {
                var node = nodeList[i];
                $target.append('<li>' + node.ip + '(' + node.hostname + ')' +'</li>');
              }
            }
          }, true, null);
        }else {

          //渲染NTP选项
          var html = renderAddNtp(nodeList);
          $modal.find('#addNtpServiceTable tbody').html(html);

          //渲染NAS选项
          var html = renderAddNas(nodeList);
          $modal.find('#addNasTable tbody').html(html);

          //渲染DNS选项
          //var html = renderAddDns(nodeList);
          //$modal.find('#addDnsTable tbody').html(html);

          //添加到结果页
          var $target = $modal.find('#confirmNodes ul');
          for (var i = 0; i < nodeList.length; i++) {
            var node = nodeList[i];
            $target.append('<li>' + node.ip + '(' + node.hostname + ')' +'</li>');
          }

        }
    })
    //2 = 添加NTP服务
    .on('click', '#js-expand-2', function (ev) {
        var html = renderAddStorage(nodeList);
        $modal.find('#addStorageTable tbody').html(html);

        //添加到结果页
        var $target = $modal.find('#confirmNtp ul');
        $target.empty();
        masterList = [];

        if (curMasters !== '') {
            masterList.push(curMasters);
        }

        $modal.find('#addNtpServiceTable .isNtpMaster:checked').each(function (index) {
            var $tr = $(this).closest('tr');
            var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
            $target.append(text);
            masterList.push($tr.data('ip'));
        });
    })
    //3 = 添加集群存储
    .on('click', '#js-expand-3', function (ev) {
        //加载磁盘信息
        var dpara = {
            'hostnames': ipList.join()
        }

        var dCallback = function (result) {
            $modal.find('.modal-header').LoadData('hide');
            if (!result) {
                return;
            }
            if (result.code === 200) {
                addDiskData = result;
                var diskData = result.result;
                // sortDiskInfo(diskData);
                var html = renderDiskInfo(diskData);
                $modal.find('#addDiskTable tbody').html(html);
            } else {
                DisplayTips( lang.cluster.list_avail_disks_add_fail );
            }
        }
        $modal.find('.modal-header').LoadData('show');
        DataModel["listDiskDetails"](dpara, dCallback, true, null);

        //添加到结果页
        var $target = $modal.find('#confrimStorage ul');
        $target.empty();
        storageList = [];
        $modal.find('#addStorageTable .isStorageAdded:checked').each(function (index) {
            var $tr = $(this).closest('tr');
            var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
            $target.append(text);
            storageList.push($tr.data('ip'));
        });
    })

    //4 = 添加磁盘
    .on('click', '#js-expand-4', function (ev) {
        var html = renderAddService(nodeList);
        $modal.find('#addServiceTable tbody').html(html);

        //添加到结果页
        $modal.find('#confirmDisk table tbody').empty();
        hostnameForDisk = '';

        var $nodeinputs = $modal.find('#addDiskTable .js-node');
        var result = addDiskInfo( $nodeinputs );
        $('.table-condensed .table-hover').css('margin-top','0');
        var diskHtml = result.htm;
        $modal.find('#confirmDisk table tbody').html(diskHtml);

        var hostListForDisk = result.arr;
        for (var i = 0; i < hostListForDisk.length; i++) {
			hostnameForDisk += hostListForDisk[i][2] + ':' + hostListForDisk[i][1] + ';';
		}
		hostnameForDisk = hostnameForDisk.substring(0 ,hostnameForDisk.length-1);
    })

    //5 = 添加服务
    .on('click', '#js-expand-5', function (ev) {

        //列举网口
        var $naspubiprows = $modal.find('#addNasTable tbody tr');
        $naspubiprows.each(function (i) {
            var host = $(this).data('ip');
            if (host == '') {$( $naspubiprows[i] ).find('.js-select-network').html('');}
            else{
                var para = {
                    'hosts': host,
                };
                var dncallback = function (res){
                    if(res.code == 200){
                        $modal.find('.modal-header').LoadData ("hide");
                        var htm2 = '';
                        var data = res.result.netlist;
                        for (var j = 0; j < data.length; j++) {
                            htm2 += '<option>' + data[j]['name'] + '</option>';

                        }
                        $( $naspubiprows[i] ).find('.selectPort').html(htm2);
                    } else {
                        DisplayTips( lang.cluster.list_netport_info_fail );
                    }
                }

                $modal.find('.modal-header').LoadData ("show");
                DataModel['listIpSelected'](para, dncallback, false, null);

            }
        });

        //添加到结果页
        monList = [];
        mdsList = [];
        mgrList = [];

        var $target = $modal.find('#confirmBasicSer ul');
        $target.empty();
        $modal.find('#addServiceTable .isBasicSerAdded:checked').each(function (index) {
            var $tr = $(this).closest('tr');
            var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
            $target.append(text);
        });

        $target = $modal.find('#confirmMonitor ul');
        $target.empty();
        $modal.find('#addServiceTable .isMonitorSerAdded:checked').each(function (index) {
            var $tr = $(this).closest('tr');
            var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
            $target.append(text);
            monList.push($tr.data('name'));
        });

        /* ------------------- mgr add to page ------------------- */
        $target = $modal.find('#confirmMgr ul');
        $target.empty();
        $modal.find('#addServiceTable .isMgrSerAdded:checked').each(function (index) {
            var $tr = $(this).closest('tr');
            var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
            $target.append(text);
            mgrList.push($tr.data('name'));
        });


        $target = $modal.find('#confirmMeta ul');
        $target.empty();
        $modal.find('#addServiceTable .isMetadataSerAdded:checked').each(function (index) {
            var $tr = $(this).closest('tr');
            var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
            $target.append(text);
            mdsList.push($tr.data('name'));
        });
    })
    //6 = 添加NAS集群
    .on('click', '#js-expand-6', function (ev) {

        //添加到结果页
        // $nasrows = $modal.find('#addNasTable tbody tr');
        // var isConfNasBool = true;//判断是否所有的公共IP和掩码都已输入
        // var isPubIPFormatBool = true;//判断公共IP格式是否错误
        // var nasnodeStr = '',
        //     hostStr = '',
        //     netportStr = '',
        //     ipaddrStr = '',
        //     netmaskStr = '';
        // var nashtm = '<table class="table table-condensed table-hover">' +
		// 					'<tbody>';
        // $nasrows.each(function (i) {
        //     var pubip = trim( $(this).find('.js-get-publicip').val() );
        //     var netmask = trim( $(this).find('.js-get-netmask').val() );
        //     if (pubip == '' || netmask == '') {
        //         isConfNasBool = false;
        //     }
        //     if (!valifyIP( pubip )) {
        //         isPubIPFormatBool = false;
        //         $(this).find('.js-get-publicip').css('border', '1px solid red');
        //     }

        //     var name = trim( $(this).data('name') ) ;
        //     var netport = trim( $(this).find('select.js-select-network').val() ) ;
        //     var ipaddr = trim( $(this).find('input.js-get-publicip').val() ) ;
        //     var netmask = trim( $(this).find('input.js-get-netmask').val() ) ;
        //     nashtm += '<tr>' +
        //                 '<td>'+ name +'</td>' +
        //                 '<td>'+ netport +'</td>' +
        //                 '<td>'+
        //                     '<span>' + ipaddr + '</span>'+
        //                     '<span>' + '/' + '</span>'+
        //                     '<span>' + netmask + '</span>'+
        //                 '</td>' +
        //             '</tr>';
        // });
        // nashtm += '</tbody>'+
        //         '</table>';
        // $modal.find('#confirmNas').append(nashtm);
        var $target = $modal.find('#confirmNas ul');
        $modal.find('#confirmPubIp ul').empty();
        $target.empty();
        nasIpList = [];
        nasNameList = [];
        pubIpParaList = [];

        $modal.find('#addNasTable .isNasNodeAdded:checked').each(function (index) {
            var $tr = $(this).closest('tr');
            var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
            $target.append(text);
            nasIpList.push($tr.data('ip'));
            nasNameList.push($tr.data('name'));

            var pubIp = trim($tr.find('.inputPublicIp').val());
            var port = $tr.find('.selectPort:eq(0)').val();
            var mask = trim($tr.find('.inputNetMask').val());
            if ( valifyIP(pubIp) && port && mask > 0 && mask < 32) {
                pubIpParaList.push({
                    'ipaddr': pubIp,
                    'netmask': mask,
                    'interface': port
                });

                var pubText = '<li>' + pubIp + ' / ' + mask + '</li>';
                $modal.find('#confirmPubIp ul').append(pubText);
            }
        });
            //dnsIpList = [];
            //var html = renderAddBacisSer(nodeList);
            //$modal.find('#addBasicSerTable tbody').html(html);
        var valifyPublicIp = $('.inputPublicIp').val();
        var valifyNetMask = $('.inputNetMask').val();
        if(valifyPublicIp != '' && valifyNetMask == ''){
            return false;
        }else if(valifyPublicIp == '' && valifyNetMask != ''){
            return false;
        }else if(valifyPublicIp != '' && valifyNetMask != ''){
            if(!valifyIP(valifyPublicIp)){
                return false;
            }else if(valifyNetMask <= 0){
                return false;
            }else if(valifyNetMask >= 32){
                return false;
            }else{
                $modal.find('#capacityModalLabel').text( lang.node.confirm_submit );
                $(this).attr('id', 'js-expand-submit');

                //添加到结果页
                var $target = $modal.find('#confirmDns ul');
                $target.empty();
                dnsIpList = [];

                $modal.find('#addDnsTable .isDnsSerAdded:checked').each(function (index) {
                    var $tr = $(this).closest('tr');
                    var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
                    $target.append(text);
                    dnsIpList.push($tr.data('ip'));
                });
                // domainName =  trim($modal.find('#inputDomain').val());
            }
        }else if(valifyPublicIp == '' && valifyNetMask == '') {
            if ($('.isNasNodeAdded').is(':checked') == true) {
                return false;
            } else{
                $modal.find('#capacityModalLabel').text( lang.node.confirm_submit );
                $(this).attr('id', 'js-expand-submit');

                //添加到结果页
                var $target = $modal.find('#confirmDns ul');
                $target.empty();
                dnsIpList = [];

                $modal.find('#addDnsTable .isDnsSerAdded:checked').each(function (index) {
                    var $tr = $(this).closest('tr');
                    var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
                    $target.append(text);
                    dnsIpList.push($tr.data('ip'));
                });
                // domainName =  trim($modal.find('#inputDomain').val());
            }
        }

    })
    //7 = 添加DNS
    //.on('click', '#js-expand-7', function (ev) {
    //    dnsIpList = [];
    //    var html = renderAddBacisSer(nodeList);
    //    $modal.find('#addBasicSerTable tbody').html(html);
    //
    //    $modal.find('#capacityModalLabel').text('确认提交');
    //    $(this).attr('id','js-expand-submit');
    //
    //    //添加到结果页
    //    var $target = $modal.find('#confirmDns ul');
    //    $target.empty();
    //    dnsIpList = [];
    //
    //    $modal.find('#addDnsTable .isDnsSerAdded:checked').each(function (index) {
    //        var $tr = $(this).closest('tr');
    //        var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
    //        $target.append(text);
    //        dnsIpList.push($tr.data('ip'));
    //    });
    //    // domainName =  trim($modal.find('#inputDomain').val());
    //})
    //8 = 添加基础服务
    // .on('click', '#js-expand-8', function (ev) {
    //     $modal.find('#capacityModalLabel').text('确认提交');
    //     $(this).attr('id','js-expand-submit');
    //     //添加到结果页
    //     var $target = $modal.find('#confirmBasicSer ul');
    //     $modal.find('#addBasicSerTable .isBasicSerAdded:checked').each(function (index) {
    //         var $tr = $(this).closest('tr');
    //         var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
    //         $target.append(text);
    //     });
    // })
    //扩容提交
    .on('click','#js-expand-submit', function (ev) {
        //去掉按钮的显示
        $(this).addClass('hidden');
        $('#capacityModal .js-capacity-priv').addClass('hidden');

        //标记正在进行的步骤
        var step = 1;
        var total = 8;
        //if (clusterHealth === false) {
        //    total -= 4;
        //}
        if (hasNas === false) {
            total -= 1;
        }
        $('.expand-result').css('display','block');
        $('.js-res-count').text(step);
        $('.js-step-meaning').text( lang.node.add_node );
        $('.js-total-step').text( ' ' + 7 + ' ' + lang.steps );
        var addNodePara = {
            'node': ipList.join()
        };

        var masterPara = {
            'ipaddrs': masterList.join()
        };
        var storagePara = {
            'nodes': storageList.join()
        };
        var diskPara = {
			'diskListStr': hostnameForDisk
		};
        var mdsPara = {
			'mdsNodes': mdsList.join()
		};
        var monitorPara = {
			     'mons': monList.join()
		    };

        var addMgrParam = {
          ip: window.location.hostname,
          action: 'add',
          hostname: mgrList.join(',')
        };

        // 错误显示到界面
        var renderErrorPage = function (error) {
          $('#capacityModal').find('#capacityErrorText').text(error);
        };

        /* ------------------- 获取心跳ip ------------------- */
        var ipToHbeatip = function (ip, hostname) {
          var _ip = ip;
          hbeatipMap.length && hbeatipMap.forEach(function (item) {
            if (item.hostname == hostname) {
              _ip = item.hbeatip;
            }
          });
          return _ip;
        }

        var nasPara = {
    			'ip': ipToHbeatip(nasIpList.join(), nasNameList.join()),
    			'hostname': nasNameList.join()
		    };
        var dnsPara = {
            'domain': domainName
            // 'iplist': dnsIpList.join()
        };

        //添加节点
        var addNodeCallback = function (result) {
            if (!result) {
                return;
            }
            if (result.code === 200) {
                step++;
                updateProgress(step, total, '#expandProgress');
                $('.js-res-count').text(step);
                $('.js-step-meaning').text( lang.node.add_ntp_service );
                //若用户不选择主节点，跳过设置
                if (masterPara.ipaddrs === '') {
                    setMasterCallback({code:200});
                } else {
                    DataModel['setMaster'](masterPara, setMasterCallback, true, null);
                }
                //设置主节点
            } else {
                removeWaitMask();
                DisplayTips( lang.node.add_node_fail );
                renderErrorPage(lang.node.add_node_fail);

            }
        }
        var setMasterCallback = function (result) {
            if (!result) {
                return;
            }
            if (result.code === 200) {
                step++;
                updateProgress(step, total, '#expandProgress');
                $('.js-res-count').text(step);
                $('.js-step-meaning').text( lang.cluster.set_cluster_stroage_node );
                //是否跳过存储集群相关设置
                if (clusterHealth === true) {
                    //添加存储集群 {string}ips
                    if(storagePara.nodes ===''){
                        addStorageCallback({code: 200});
                    }else{
                        DataModel['newStorage'](storagePara, addStorageCallback, true, lang.cluster.new_storagenode);
                    }
                } else {
                    //是否跳过NAS
                    if (hasNas === true) {
                        DataModel['newNas'](nasPara, addNasCallback, true, null);
                    } else if (dnsPara.domain && dnsPara.domain !== '') {
                        DataModel['createDnsList'](dnsPara, addDnscallback, true, null);
                    } else {
                        addDnscallback({code: 200});
                    }
                }
            } else {
                removeWaitMask();
                DisplayTips( lang.cluster.set_master_fail );
                renderErrorPage(lang.cluster.set_master_fail);
            }
        }
        var addStorageCallback = function (result) {
            if (!result) {
                return;
            }
            if (result.code === 200) {
                step++;
                updateProgress(step, total, '#expandProgress');
                $('.js-res-count').text(step);
                $('.js-step-meaning').text( lang.cluster.add_disk );
                //添加磁盘
                DataModel['addDisksWizard'](diskPara, diskCallback, true, '');
            } else {
                removeWaitMask();
                DisplayTips( lang.cluster.add_obj_service_fail );
                renderErrorPage( lang.cluster.add_obj_service_fail );
            }
        }
        var diskCallback = function (result) {
            if (!result) {
                return;
            }
            if (result.code === 200) {
                step++;
                updateProgress(step, total, '#expandProgress');
                $('.js-res-count').text(step);
                $('.js-step-meaning').text( lang.wizard.add_service );
                //元数据
                if(mdsPara.mdsNodes ===''){
                    mdsCallback({code: 200});
                }else{
                    DataModel['newmetadata'](mdsPara, mdsCallback, true, '');
                }
            } else {
                removeWaitMask();
                DisplayTips( lang.cluster.set_cluster_adddisk_fail );
                renderErrorPage( lang.cluster.set_cluster_adddisk_fail );
            }
        }
        var mdsCallback = function (result) {
            if (!result) {
                return;
            }
            if (result.code === 200) {
                //监控服务
                if(monitorPara.mons ===''){
                    monitorCallback({code: 200});
                }else{
                    DataModel['newMonitor'](monitorPara, monitorCallback, true, lang.cluster.new_monitor);
                }
            } else {
                removeWaitMask();
                DisplayTips( lang.cluster.add_meta_service_fail );
                renderErrorPage( lang.cluster.add_meta_service_fail );
            }
        }
        var monitorCallback = function (result) {
          // var addMgrParam = {
          //   ip: window.location.hostname,
          //   action: 'add',
          //   hostname: mgrList.join(',')
          // };
          if (addMgrParam.hostname) {
            step++;
            updateProgress(step, total, '#expandProgress');
            $('.js-res-count').text(step);
            $('.js-step-meaning').text( lang.node.add_mgr );

            DataModel['mgrManage'](addMgrParam, addMgrCallback, true, null);

          }else {
            addMgrCallback({code: 200});
          }

        }

        /* ------------------- mgr callback ------------------- */

        var addMgrCallback = function (result) {
          if (result.code !=  200) {
            DisplayTips(lang.node.add_mgr_fail);
            renderErrorPage(lang.node.add_mgr_fail);
          }
          step++;
          updateProgress(step, total, '#expandProgress');
          $('.js-res-count').text(step);
          $('.js-step-meaning').text( lang.cluster.set_nas_cluster );
          if (hasNas === true) {
              //添加nas
              DataModel['newNas'](nasPara, addNasCallback, true, null);

              var addPubIpCallback = function (result) {
                  if (result.code !== 200) {
                      removeWaitMask();
                      DisplayTips( lang.cluster.add_public_ip_fail );
                  }
              }
              for (var i = 0; i < pubIpParaList.length; i++) {
                  DataModel['addPubIp'](pubIpParaList[i], addPubIpCallback, false, null);
              }

          } else {
              // DataModel['createDnsList'](dnsPara, addDnscallback, true, null);
              addDnscallback({code: 200});
          }
        }

        /* ------------------- mgr end ------------------- */

        var addNasCallback = function (result) {
            if (!result) {
                return;
            }
            if (result.code === 200) {
                step++;
                updateProgress(step, total, '#expandProgress');
                if (hasNas === true) {
                    //添加DNS
                    // DataModel['createDnsList'](dnsPara, addDnscallback, true, null);
                    if(dnsPara.domain && dnsPara.domain !== ''){
                        DataModel['createCurClusterDns'](dnsPara, addDnscallback, true, null);
                    }else{
                        addDnscallback({code: 200});
                    }
                } else {
                    addDnscallback({code: 200});
                }
            } else {
                removeWaitMask();
                DisplayTips( lang.cluster.add_nas_service_fail );
                renderErrorPage( lang.cluster.add_nas_service_fail );
            }
        }

        var addDnscallback = function (result) {
            removeWaitMask();
            $modal.find('.modal-header').LoadData('hide');
            if (!result) {
                return;
            }
            if (result.code === 200) {
                DisplayTips( lang.storage.expand_capacity_success );

                setTimeout(function() {
                    refresh()
                }, 2e3);

            } else {
                DisplayTips( lang.cluster.add_dns_set_fail );
                renderErrorPage( lang.cluster.add_dns_set_fail );
            }
        }

        $modal.find('.modal-header').LoadData('show');
        addWaitMask();
        //添加节点 {string}ips
        DataModel['clusterLvmRemove']({ips: ipList.join()}, function (rsp) {
          if (rsp.code == 200) {
            DataModel['addNode'](addNodePara, addNodeCallback, true, null);
          }else {
            DisplayTips(rsp.result);
            renderErrorPage(rsp.result);
            $modal.find(".modal-body").LoadData ("hide");
          }
        }, true, null);

    })
    //缩容流程
    //1 = 移除节点
    .on('click', '#js-reduce-1', function (ev) {
        var callback = function (result) {
            $modal.find('.modal-header').LoadData('hide');
            if (!result) {
                return;
            }
            if (result.code === 200) {
                var html = renderRemovePubIp(result.result);
                $modal.find('#reomovePubIpTable tbody').html(html);
            } else {
                DisplayTips( lang.cluster.list_public_ip_fail );
            }
        }

        if ($modal.find('#reomoveNodesTable .isNodeRemoved:checked').length === 1) {
            //添加到结果页
            var $target = $modal.find('#confirmRemoveNodes ul');
            $target.empty();
            removeNodeIpList = [];
            removeNodeNameList = [];
            $modal.find('#reomoveNodesTable .isNodeRemoved:checked').each(function (index) {
                var $tr = $(this).closest('tr');
                var text = '<li>' + $tr.data('ip') + '(' + $tr.data('name') + ')' + '</li>';
                $target.append(text);
                removeNodeIpList.push($tr.data('ip'));
                removeNodeNameList.push($tr.data('name'));
            });

            //若无nas集群，跳过移除公共IP步骤
            if( !hasNas ) {
                $modal.find('#capacityModalLabel').text(lang.node.confirm_submit);
                $(this).attr('id','js-reduce-submit');

                // 移除空项
                $('#reduceComfirm>div').each(function () {
                    if ($(this).find('li').length === 0) {
                        $(this).remove();
                    }
                });

            } else {
                //列举公共IP
                $modal.find('.modal-header').LoadData('show');
                DataModel['listPublicIP'](null, callback, true, null);
            }
        }
    })
    //2 = 删除公共IP
    .on('click', '#js-reduce-2', function (ev) {
        $modal.find('#capacityModalLabel').text(lang.node.confirm_submit);
        $(this).attr('id','js-reduce-submit');

        //添加到结果页
        var $target = $modal.find('#confirmRemovePubIp ul');
        $target.empty();
        removePubIpList = [];
        $modal.find('#reomovePubIpTable .isPubIpRemoved:checked').each(function (index) {
            var $tr = $(this).closest('tr');
            var text = '<li>' + $tr.data('ip') + '</li>';
            $target.append(text);
            removePubIpList.push($tr.data('ip'));
        });
    })
    //缩容提交
    .on('click','#js-reduce-submit', function (ev) {
        if ( trim($('#submitRuduce').val()).toLowerCase() !== 'confirm' ) {
            for (var i = 0; i < 6; i++) {
                $('#reduceComfirm>p').fadeToggle(100);
            }
            return;
        }
        var that = this;
        $(that).addClass('hidden');

        // 检查故障域
        DataModel['reduceCheckFailureDomain'](null, function (rsp) {
          if (rsp.code === 200) {
            if (rsp.result) {
              //移除按钮
              $('#capacityModal .js-capacity-priv').addClass('hidden');

              var stopNasPara = {
                  'mdsNodes': removeNodeIpList.join()
              }

              var umountFsPara = {
          			'ipaddr': removeNodeIpList.join()
          		};

              var delMdsPara = {
          			'mdsNodes': removeNodeNameList.join()
          		};

              var delMonPara = {
                  'mons': removeNodeNameList.join()
              }

              var delStoragePara = {
          			'nodes': removeNodeIpList.join()
          		};

              var delNodePara = {
                  'node': removeNodeIpList.join()
              };

              var delMgrPara = {
                'action': 'delete',
                'hostname': removeNodeNameList.join(','),
                'ip': window.location.hostname
              };

              var delObjPara = {
                'ips': removeNodeNameList.join(',')
              }

              // var delMasterPara = {
              //     'ipaddrs': removeNodeIpList.join()
              // };

              var delPubIpPara = {
          			'ipaddr': removePubIpList.join()
          		}

              /* ------------------- 删除nas 改为心跳ip ------------------- */
              var ipToHbeatip = function (ip, hostname) {
                var _ip = ip;
                hbeatipMap.length && hbeatipMap.forEach(function (item) {
                  if (item.hostname == hostname) {
                    _ip = item.hbeatip;
                  }
                });
                return _ip;
              }
              var delNasPara = {
          			'ip': ipToHbeatip(removeNodeIpList.join(), removeNodeNameList.join()),
          			'name': removeNodeNameList.join()
          		};

              var resetSysdbPara = {
                  'ip': removeNodeIpList.join()
              };

              /* -------------------  ------------------- */


              var step = 0;
              var total = 9;
              //if (hasNas && delPubIpPara.ipaddr !== '') step += 1;
              $('.reduce-result').css('display','block');
              $('.js-res-count').text(1);
              $('.js-step-meaning').text( lang.node.remove_node );
              if(hasNas === false || delPubIpPara.ipaddr === ''){
                  $('.js-total-step').text( ' ' + 2 + ' ' + lang.steps );
              }else{
                  $('.js-total-step').text( ' ' + 3 + ' ' + lang.steps );
              }
              //卸载文件系统
              var stopNasCallback = function (result) {
                  step++;
                  updateProgress(step, total, '#reduceProgress');
                  DataModel['umount'](umountFsPara, umountCallback, true, null);
              }

              //移除MDS
              var umountCallback = function (result) {
                  step++;
                  updateProgress(step, total, '#reduceProgress');
                  DataModel['delMetadata'](delMdsPara, delMdsCallback, true, null);
              }

              //移除监控
              var delMdsCallback = function (result) {
                  step++;
                  updateProgress(step, total, '#reduceProgress');
                  DataModel['delMonitor'](delMonPara, delMgrCallback, true, null);
              }

              // 移除mgr
              var delMgrCallback = function (result) {
                step++;
                updateProgress(step, total, '#reduceProgress');
                DataModel['mgrManage'](delMgrPara, delMonCallback, true, null);
              };

              //移除存储节点
              var delMonCallback = function (result) {
                  step++;
                  updateProgress(step, total, '#reduceProgress');
                  DataModel['delStorage'](delStoragePara, delObjCallback, true, null);
              }

              // 移除对象存储节点
              var delObjCallback = function (result) {
                step++;
                updateProgress(step, total, '#reduceProgress');
                DataModel['delObjNode'](delObjPara, delStorageCallback, true, null);
              };

              //移除节点
              var delStorageCallback = function (result) {
                  step++;
                  updateProgress(step, total, '#reduceProgress');
                  DataModel['delNode'](delNodePara, delNodeCallback, true, null);
              }

              //删除公共IP
              var delNodeCallback = function (result) {
                  step++;
                  updateProgress(step, total, '#reduceProgress');
                  $('.js-res-count').text(2);
                  $('.js-step-meaning').text( lang.cluster.remove_nas_cluster );
                  //如果无NAS 跳过
                  if (hasNas === false) {
                      delNasCallback();
                  } else {
                      if (delPubIpPara.ipaddr === '') {
                          //用户不选择时跳过
                          delNasCallback();
                      } else {
                          //删除公共IP
                          DataModel['delPubIp'](delPubIpPara, refreshDNSCallback, true, null);
                      }
                  }
              }
              //如果有删除公共IP情况，刷新域名
              var refreshDNSCallback =function (result) {
                      DataModel['listCurClusterDns'](null, listCurcallback, true, null);
              }
              var listCurcallback = function (result) {
                  var editPara = {
                      'domain': result.result.domain_name
                  }
                  //domain值为空，直接跳过这一步
                  if(result.result.domain_name != undefined){
                  DataModel['createCurClusterDns'](editPara, delPubIpCallback, true, null);
                  }else{
                      delPubIpCallback();
                  }
              }
              // 移除NAS节点
              var delPubIpCallback = function (result) {
                  $('.js-res-count').text(3);
                  $('.js-step-meaning').text( lang.cluster.remove_public_ip );
                  DataModel['delNas'](delNasPara, delNasCallback, true, null);
              }

              //重置sysdb
              var delNasCallback = function (result) {
                  step++;
                  updateProgress(step, total, '#reduceProgress');
                  DataModel['resetSysdb'](resetSysdbPara, resetSysdbCallback, true, null);
              }

              var resetSysdbCallback = function (result) {
                  $modal.find('.modal-header').LoadData('hide');
                  removeWaitMask();
                  DisplayTips( lang.storage.shrink_capacity_success );

                  setTimeout(function() {
                      refresh();
                  }, 2e3);
              }

              /* ------------------- start ------------------- */

              //停止NAS服务
              $modal.find('.modal-header').LoadData('show');
              addWaitMask();
              DataModel['stopNas'](stopNasPara, stopNasCallback, true, null);

            }else {
              DisplayTips(lang.cluster.failure_domain_not_satisfied_after_reduce);
            }
          } else if(rsp.code === 602){
            DisplayTips(rsp.result);
          } else {
            DisplayTips(lang.cluster.check_failure_domain_failed);
          }
        }, true, null);
    })

    //在每页默认位置施加焦点
    var focusOn =  function () {
        $('.curStep .toFocus').focus();
    }

    var renderNodesStatus = function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr>' +
                        '<td class="col-lg-4" style="padding-top:10px!important;">' + data[i].ip + '</td>' +
                        '<td class="col-lg-4" style="padding-top:10px!important;">' + data[i].hostname + '</td>';
            if (data[i].result === 0) {
                html += '<td class="col-lg-4" style="color:red;padding-top:10px!important;">'+lang.disk.unavail+'</td>';
            } else {
                html += '<td class="col-lg-4" style="padding-top:10px!important;">'+lang.disk.avail+'</td>';
                nodeList.push({ip:data[i].ip, hostname:data[i].hostname});
                ipList.push(data[i].ip);
                nameList.push(data[i].hostname);

                //只要有一个可用节点，就将确认按钮的disabled状态移除
                $modal.find('#js-expand-1').removeAttr('disabled');
            }
            html += '</tr>';
        }
        return html;
    }

    var renderAddNtp = function (data) {
        var ipToHbeatip = function (ip, hostname) {
          var _ip = ip;
          hbeatipMap.length && hbeatipMap.forEach(function (item) {
            if (item.hostname == hostname) {
              _ip = item.hbeatip;
            }
          });
          return _ip;
        }

        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr data-ip="' + ipToHbeatip(data[i].ip, data[i].hostname) + '" data-name="' + data[i].hostname + '">' +
                        '<td class="col-lg-3" style="padding-top:10px;">' + data[i].hostname + '</td>' +
                        '<td class="col-lg-3" style="padding-top:10px;">' + ipToHbeatip(data[i].ip, data[i].hostname) + '</td>' +
                        '<td class="col-lg-3" style="padding-top:10px;"><input type="checkbox" checked disabled style="width: 16px;height: 16px;"></td>' +
                        '<td class="col-lg-3" style="padding-top:10px;"><input type="checkbox" class="isNtpMaster" style="width: 16px;height: 16px;"></td>' +
                    '</tr>';
        }
        return html;
    }

    var renderAddStorage = function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr class="checkboxInRow" data-ip="' + data[i].ip + '" data-name="' + data[i].hostname + '">' +
                        '<td class="col-lg-4" style="padding-top:10px;">' + data[i].hostname + '</td>' +
                        '<td class="col-lg-4" style="padding-top:10px;">' + data[i].ip + '</td>' +
                        '<td class="col-lg-4" style="padding-top:10px;"><input type="checkbox" class="isStorageAdded" checked disabled style="width:16px;height: 16px;"></td>' +
                    '</tr>';
        }
        return html;
    }

    /* ------------------- 添加mgr ------------------- */
    var renderAddMgr = function (data) {
      var html = '';
      html += '<tr class="checkboxInRow" data-ip="' + data.ip + '" data-name="' + data.hostname + '">' +
                  '<td class="col-lg-4" style="padding-top:10px;">' + data.hostname + '</td>' +
                  '<td class="col-lg-4" style="padding-top:10px;">' + data.ip + '</td>' +
                  '<td class="col-lg-4" style="padding-top:10px;"><input type="checkbox" class="isMgrAdded" checked disabled style="width:16px;height: 16px;"></td>' +
              '</tr>';

      return html;
    }

    var renderDiskInfo = function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var host = data[i];

            html +=  '<tr class="js-node" data-ip="'+ host['ip'] +'" data-name="'+ host['hostname'] +'">'+
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
                        '<td style="width:50%;padding-left:48px;">'+
                            '<input type="checkbox" class="sub-check-disk" style="float:left;width: 16px;height: 16px;margin-left:6px;margin-top:2px;" />'+
                        '</td>'+
                    '</tr>'+
                    '<tr class="subdisks hidden" data-ip="'+ host['ip'] +'" data-host="'+ host['hostname'] +'">'+
                        '<td colspan="2" style="padding:0;">'+
                            '<table class="table table-condensed table-hover" style="margin-left:1.5em;margin-top:0px;">'+
                                '<tbody>';
                    var disk = host['diskinfo']['available'];
                    if (disk.length > 0) {
                        for (var j = 0; j < disk.length; j++) {
                            (disk[j]['type']=='hdd')?(disk[j]['type']='HDD'):(disk[j]['type']='SSD');
                            html +=  '<tr class="js-disk" data-disk="'+ disk[j]['devicename'] +'">'+
                                        '<td class="showleftborder" style="width:50%;">'+
                                            '<div class="showcenterline" style="width:15px;float:left;"></div>'+
                                            '<span style="float:left;">'+ disk[j]['devicename'] +'（'+ disk[j]['size'] +'，'+ disk[j]['type'] +'）</span>'+
                                        '</td>'+
                                        '<td style="width:50%;padding-left: 21px;">'+
                                            '<input type="checkbox" class="sub-check-disk" style="float:left;width: 16px;height: 16px;margin-left:10px;margin-top:2px;">'+
                                        '</td>'+
                                    '</tr>';
                        };
                    } else{
                        html +=  '<tr class="js-disk">&nbsp;</tr>';
                    }


                        html +=	'</tbody>'+
                            '</table>'+
                        '</td>'+
                    '</tr>';
        }
        return html;
    }

    var renderAddService = function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr data-ip="' + data[i].ip + '" data-name="' + data[i].hostname + '">' +
                        '<td class="col-lg-1" style="padding-top: 10px;">' + data[i].hostname + '</td>' +
                        '<td class="col-lg-1" style="padding-top: 10px;">' + data[i].ip + '</td>' +
                        '<td class="col-lg-2" style="padding-top: 10px;"><input type="checkbox" class="isBasicSerAdded" checked style="width: 16px;height: 16px;"></td>' +
                        '<td class="col-lg-2" style="padding-top: 10px;"><input type="checkbox" class="isMonitorSerAdded" checked style="width: 16px;height: 16px;"></td>' +
                        '<td class="col-lg-2" style="padding-top: 10px;"><input type="checkbox" class="isMgrSerAdded" checked style="width: 16px;height: 16px;"></td>' +
                        '<td class="col-lg-2" style="padding-top: 10px;"><input type="checkbox" class="isMetadataSerAdded" checked style="width: 16px;height: 16px;"></td>' +
                    '</tr>';
        }
        return html;
    }

    var renderAddNas = function (data) {
        var ipToHbeatip = function (ip, hostname) {
          var _ip = ip;
          hbeatipMap.length && hbeatipMap.forEach(function (item) {
            if (item.hostname == hostname) {
              _ip = item.hbeatip;
            }
          });
          return _ip;
        }
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr data-ip="' + ipToHbeatip(data[i].ip, data[i].hostname) + '" data-name="' + data[i].hostname + '">' +
                        '<td class="col-lg-2">' + data[i].hostname + '</td>' +
                        '<td class="col-lg-2">' + ipToHbeatip(data[i].ip, data[i].hostname) + '</td>' +
                        '<td class="col-lg-2"><input type="checkbox" class="isNasNodeAdded" checked style="width: 16px;height: 16px;"></td>' +
                        '<td class="col-lg-2"><select class="form-control selectPort" style="width: 100px;height: 25px !important;"></select></td>' +
                        '<td class="col-lg-2"><input type="text" class="inputPublicIp" size="9" maxlength="15"><span> / </span>' +
                        '<input type="text" class="inputNetMask" size="1" maxlength="2">' +
                        '</td>' +
                    '</tr>';
        }
        return html;
    }

    var renderAddDns = function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr class="checkboxInRow" data-ip="' + data[i].ip + '" data-name="' + data[i].hostname + '">' +
                        '<td class="col-lg-4" style="padding-top:10px;">' + data[i].hostname + '</td>' +
                        '<td class="col-lg-4" style="padding-top:10px;">' + data[i].ip + '</td>' +
                        '<td class="col-lg-4" style="padding-top:10px;"><input type="checkbox" class="isDnsSerAdded" checked disabled style="width: 16px;height: 16px;"></td>' +
                    '</tr>';
        }
        return html;
    }

    var renderAddBacisSer = function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr class="checkboxInRow" data-ip="' + data[i].ip + '" data-name="' + data[i].hostname + '">' +
                        '<td class="col-lg-4" style="padding-top:10px;">' + data[i].hostname + '</td>' +
                        '<td class="col-lg-4" style="padding-top:10px;">' + data[i].ip + '</td>' +
                        '<td class="col-lg-4" style="padding-top:10px;"><input type="checkbox" class="isBasicSerAdded" checked style="width: 16px;height: 16px;"></td>' +
                    '</tr>';
        }
        return html;
    }

    var renderRemoveNodes = function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr class="checkboxInRow" data-ip="' + data[i].ip + '" data-name="' + data[i].hostname + '">' +
                        '<td class="col-lg-4" style="padding-top:10px!important;text-align: left"><input type="radio" class="isNodeRemoved" style="width: 16px;height: 16px;"></td>' +
                        '<td class="col-lg-4" style="padding-top:10px!important;text-align: left">' + data[i].hostname + '</td>' +
                        '<td class="col-lg-4" style="padding-top:10px!important;text-align: left">' + data[i].ip + '</td>' +
                    '</tr>';
        }
        return html;
    }

    var renderRemovePubIp = function (data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<tr class="checkboxInRow" data-ip="' + data[i].ipaddr + '">' +
                        '<td>' + data[i].ipaddr + '</td>' +
                        '<td><input type="radio" class="isPubIpRemoved" style="width: 16px;height: 16px;"></td>' +
                    '</tr>';
        }
        return html;
    }

    //更新进度条状态
    var updateProgress = function (cur, total, selector) { //selector: '#expandProgress' , etc.
        var percent = (cur / total * 100).toFixed(2) + '%';
        $modal.find(selector + ' .progress-bar').attr('aria-valuenow', percent);
        $modal.find(selector + ' .progress-bar').css('width', percent);
        $modal.find(selector + ' .progress-bar span').text(percent);
        $modal.find(selector + 'label').text(percent);
    }
    var wizardModalShow=function(){
        //var  $wizardmodal = $('#wizardConfModal');
        //$modal.find('.modal-header .btn-default').addClass('hidden');
        $wizardmodal.find('.modal-header .btn-primary').addClass('hidden');
        var num = 1;
        $wizardmodal.find('.wizard'+num).removeClass('hidden showing').addClass('showing');
        $wizardmodal.find('.wizard'+num).siblings().addClass('hidden').removeClass('showing');
        $('.js-cur-wizard-num').text(num);
        $('.js-wizard-nav'+num).removeClass('hidden');
        $('.js-wizard-nav'+num).siblings().addClass('hidden');
        //获取总的wizard的页数
        var totalwizardpage =  $wizardmodal.find('.wizardconf').length;
        $wizardmodal.find('.js-total-wizard').text(totalwizardpage);
        $left = $('#prew-wizard-left');
        $right = $('#prew-wizard-right');
        $wizardmodal.modal('show');
        //用来控制左右箭头居中显示
        var h = $wizardmodal.find('.modal-body').height();
        var alh = $left.height();
        var arh = $right.height();
        $left.css('top', h/2 - alh/2);
        $right.css('top', h/2 - arh/2);
        $('#prew-wizard-left').addClass('hidden');//一开始向左的'上一步'箭头不显示
        if ($('#prew-wizard-right.hidden').length > 0) {
            $right.removeClass('hidden');
        }
    }
})
