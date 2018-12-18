$(function (ev) {
    //获取授权列表信息
    getLicenseList();

    var licenseParseError = function (code) {
      return (lang.licence[code] || lang.licence.analysis_licence_fail);
    };

    // 解析授权规格
    var parseLicenseLimit = function(type, value) {
      switch (type) {
        case 'NIL':
          return '--';
        break;
        case 'TIM':
          return value ? ( (parseInt(value) / 60 / 60 / 24).toFixed(0) + lang.licence.day) : '--';
        break;
        case 'CAP':
          return value ? ( (parseInt(value) / 1024).toFixed(1) + 'TB') : '--';
        break;
        case 'AGT':
          return value ? value : 0;
        break;
        default:
          return '--';
        break;
      }
    };

    // 正式和测试授权license 共存的问题
    function licenseFilter(data) {
      var hasTest = false;
      var hasNormal = false;
      var activedTestNode = 0;
      var activedNormalNode = 0;
      data.forEach(function (d) {
        if (d.type === 'TST') {
          hasTest = true;
          if (d.actived) {
            activedTestNode += 1;
          }
        } else {
          hasNormal = true;
          if (d.actived) {
            activedNormalNode += 1;
          }
        }
      });
      if (hasNormal && hasTest) {
        return data.filter(function (d) {
          return (d.type !== 'TST');
        });
      }
      return data;
    };

    function getLicenseList(callback) {
        var listCallback = function (res) {
            $(".basic_content_list").LoadData('hide');
            callback && callback();
            if (res.code === 200) {
                var data = res.result;
                var tbodyContent = "";
                data = licenseFilter(data);
                for (var i = 0; i < data.length; i++) {
                    tbodyContent += "<tr data-type='" + data[i].type + "'>" +
                        "<td class='license-p'>" + data[i].license + "</td>" +
                        "<td style='text-align: center'>" + data[i].limit_type + "</td>" +
                        "<td style='text-align: center'>" + data[i].description + "</td>" +
                        "<td style='text-align: center' class='license_term'>" + ( (data[i].type === 'TST') ? parseLicenseLimit(data[i].limit_type, data[i].limit) : lang.licence.indefinite ) + "</td>" +
                        "<td style='text-align: center'>" + parseLicenseLimit(data[i].limit_type, data[i].limit) + "</td>" +
                        "<td style='text-align: center'>" + data[i].copy + "</td>" +
                        "<td style='text-align: center'><a class='js-add-node-detail' data-copy='"+data[i].copy+"' data-license='" + data[i].license + "'>" + data[i].auth + "</a></td>" +
                        "<td style='text-align: center'><a class='js-active-node-detail' data-licensetype='"+ data[i].type +"' data-license='" + data[i].license + "'>" + data[i].actived + "</a></td>" +
                        "<td style='text-align: center'><a class='js-delete-license' data-license='"+ data[i].license +"'data-licensetype='"+ data[i].limit_type +"'><span class='glyphicon glyphicon-trash'></span></a></td>" +
                        "<td style='text-align: center'><a class='js-active-license' data-license='" + data[i].license + "'><span class='glyphicon glyphicon-flash'></span></a></td>" +
                        "</tr>";
                }
                $("#licenseList").html(tbodyContent);

            } else {
                DisplayTips(lang.licence.get_list_fail);
            }
        }

        $(".basic_content_list").LoadData('show');
        DataModel['licenseList'](null, listCallback, true, null);
    }

    var addedNodesCallback = function (res) {
        if (res.code === 200) {
            var tbody = "";
            for (var i = 0; i < data.length; i++) {
                tbody += "<tr>" +
                    "<td>" + data[i].node + "</td>" +
                    "<td>" + data[i].hwcode + "</td>" +
                    "<td>" + data[i].time + "</td>" +
                    "<td><a class='js-remove-node hidden' data-node=" + data[i].node + "><span class='glyphicon glyphicon-remove-circle'></a></span></td>" +
                    "</tr>";
            }

            $("#nodesDetail").htm(tbody);
        } else {
            DisplayTips(lang.licence.addnode_list_fail);
        }
    }

    //列举已添加节点详情
    function getAddedNodesDetail(license) {
        var para = {
            license: license
        }
        var Callback = function (res) {
            removeWaitMask();
            $('#nodesDetailModal .modal-header').LoadData('hide');
            if (res.code === 200) {
            var tbody ='';
            var authnode;
            var addednode;
            var exitnode;
            var reslength = res.result.length;
            for(var i=0;i<reslength;i++){
                var data = res.result[i];
                tbody += "<tr data-host='"+data.node+"' data-activated='"+data.activated+"'><td>" + data.node + "</td>" +
                    "<td class='license-p'>" + data.hwcode + "</td>" +
                    "<td>" + data.activation_time + "</td>" +
                    "<td>" + (data.activated ? lang.licence.has_active : lang.licence.no_active) + "</td>" +
                    "<td><a class='js-remove-node hidden' data-node=" + data.node + " data-ip=" + data.ip + "><span class='glyphicon glyphicon-remove'></a></span>" +
                    "</td>" +
                    "</tr>";
            }
            $('#licenseList tr').each(function (ev) {
                if($(this).find('td:first').html() == license){
                     authnode = $(this).find('td:eq(5)').html();
                }
            })
                $('#addednodes').html(reslength + '/' + authnode);
                $('#nodesDetail').html(tbody);
                if ($('#nodesDetailModal .modal-header .modify-nodes-detail').hasClass('hidden')) {
                    $('.js-remove-node').removeClass('hidden');
                }
            } else {
                DisplayTips(lang.licence.get_status_fail);
            }
        }
        addWaitMask();
        $('#nodesDetailModal .modal-header').LoadData('show');
        DataModel['licenseAddedNodeList'](para, Callback, true, null);
    }

    //已激活节点列表
    var activedCallback = function (res, licensetype) {
        $('#activedNodesModal .modal-content').LoadData('hide');
        var ips = [];
        removeWaitMask();
        if (res.code === 200) {
            var activedTbody = "";
            var unactivedTbody = "";
            var data = res.result;

            for (var i = 0; i < data.length; i++) {
                if (data[i].actived == 1) {
                  ips.push(data[i].ip);
                    activedTbody += "<tr data-ip='"+data[i].ip+"'>" +
                        "<td>" + data[i].node + "</td>" +
                        "<td class='license-p'>" + data[i].hwcode + "</td>" +
                        "<td>" + data[i].time + "</td>" +
                        "<td class='remaining_days' style='text-align: center'>" + lang.licence.indefinite + "</td>" +
                        "</tr>";
                } else {
                    unactivedTbody += "<tr>" +
                        "<td>" + data[i].node + "</td>" +
                        "<td class='license-p'>" + data[i].hwcode + "</td>" +
                        "<td style='text-align: center'>"+'----'+"</td>"+
                        "</tr>";
                }
            }

            $('#actived-nodes').html(activedTbody);
            $('#unactived-nodes').html(unactivedTbody);
            var actived_count = $('#actived-nodes').find('tr').length + lang.licence.node;
            var inactived_count = $('#unactived-nodes').find('tr').length + lang.licence.node;
            $('.node-actived').html(actived_count);
            $('.node-inactivated').html(inactived_count);

            // 测试授权查询剩余天数
            if (licensetype == 'TST') {
              $('#actived-nodes').find('.remaining_days').text('--');
              DataModel['licenseGetTrialAll']({ips: ips.join(',')}, function (rsp) {
                if (rsp.code === 200) {
                  rsp.result.forEach(function (res) {
                    if (res.code == 200) {
                      var remaining = (parseInt(res.result) / 60 / 60 / 24).toFixed(1);
                      remaining = remaining + lang.licence.day;
                      $('#actived-nodes').find('tr[data-ip="'+res.ip+'"]').find('.remaining_days').text(remaining);
                    }else {
                      $('#actived-nodes').find('tr[data-ip="'+res.ip+'"]').find('.remaining_days').text('--');
                    }
                  });
                }else {
                  $('#actived-nodes').find('.remaining_days').text('--');
                  DisplayTips(lang.licence.license_get_trial_fail);
                }
              }, true, null);
            }

        } else {
            DisplayTips(lang.licence.get_status_fail);
        }
    }

    //列举已激活节点信息
    function getActivedNodesDetail(license, type) {
        var para = {
            license: license,
        };

        $('#actived-nodes').html('');
        $('#unactived-nodes').html('');
        addWaitMask();
        $('#activedNodesModal .modal-content').LoadData('show');
        DataModel['licenseActivedDetail'](para, function (rsp) {
          activedCallback(rsp, type);
        }, true, null);
    }

    //激活回调（包括手动、自动激活）
    var manualActiveCallback = function (res) {
        removeWaitMask();
        $('#activeLicenseModal .modal-header').LoadData('hide');
        var hwcodeTd = $('#activeLicenseModal .table thead th').eq(3);
        var noactCount = 0;
        if (res.code === 200) {
            var data = res.result;
            var totalNodesNum = data.length;
            var activedNodesNum = 0;
            for(var j = 0; j< totalNodesNum; j++) {
                if(data[j].actived === 1) {
                    activedNodesNum+=1;
                }
            }

            $('#active-ratio').html(activedNodesNum+'/'+totalNodesNum);
            var manualTbody = "";
            var autoTbody = '';
            for (var i = 0; i < data.length; i++) {
                manualTbody += "<tr>" +
                    "<td>"+ data[i].id +"</td>" +
                    "<td>" + data[i].node + "</td>" +
                    "<td><span class='license-p' id='hwCode"+i+"'>" + data[i].hwcode +"</span><a title='copy HWcode' class='copyHWcode' data-clipboard-action='copy' data-clipboard-target='#hwCode"+ i +"'><span class='glyphicon glyphicon-file'></span></a></td>";
                if (data[i].actived == 0) {
                    noactCount++;
                    manualTbody += '<td><input type="text" id="active'+i+'"/></td><td><a class="active-node-inline" data-nodeip="'+ data[i].ip +'" data-activeindex="'+i+'">'+lang.licence.is_actived+'</a></td>';
                } else {
                    manualTbody += '<td>' + '' +
                    '</td><td><span data-nodeip="'+data[i].ip+'" data-activeindex="'+i+'">'+lang.licence.has_active+'</span></td>';
                }
                "<tr>";
            }
            if (noactCount == 0) {
                hwcodeTd.html('');
            }else{
                hwcodeTd.html(lang.licence.activation_code);
            }

            //自动
            autoTbody += "<thead>" +
                "<tr>" +
                "<th>ID</th>" +
                "<th>"+lang.licence.node+"</th>" +
                "<th>"+lang.licence.has_active+"： "+activedNodesNum+'/'+totalNodesNum+"</th>" +
                "</tr>" +
                "</thead>" +
                "<tbody>";

                for (var i = 0; i < totalNodesNum; i++) {
                autoTbody += "<tr data-Ip='"+ data[i].ip +"'>" +
                    "<td>" + data[i].id + "</td>" +
                    "<td>" + data[i].node + "</td>";
                if (data[i].actived === 0) {
                    autoTbody += "";
                } else {
                    autoTbody += "<td>"+lang.licence.has_active+"</td>";
                }
                "<tr>";
            }
            autoTbody += "</tbody>";

            // 更新自动激活按钮
            if (activedNodesNum === totalNodesNum) {
              $(".js-active-all-nodes").addClass('hidden');
              $(".js-active-all-nodes-disable").removeClass('hidden');
            }else {
              $(".js-active-all-nodes").removeClass('hidden');
              $(".js-active-all-nodes-disable").addClass('hidden');
            }

            $('#manualActive').find('tbody').html(manualTbody);
            $('#autoActive').find('table').html(autoTbody);
        } else {
            DisplayTips(lang.licence.get_active_fail);
        }
    }

    //激活节点列表（包括手动、自动激活列表）
    function getManualActiveList(license) {
        var para = {
            license: license,
        };
        $('#activeLicenseModal .modal-header').LoadData('show');
        addWaitMask();
        DataModel['licenseActivedDetail'](para, manualActiveCallback, true, null);
    }

    //离线激活跳转
    $(".actcode_active").popover({html : true });

    /* ------------------- 更新已添加节点 ------------------- */
    function getAllFiltedNodes() {
      // 激活节点筛选
      var activedNodeFilter = function (data) {
        return data.filter(function (idata) {
          var isAdded = false;
          $('#nodesDetail').find('tr').each(function () {
            if ($(this).data('host') == idata.hostname) {
              isAdded = true;
            }
          });
          return !isAdded;
        });
      }

      var brotherNodesList = $('.check-nodes');
      var nodeCallback = function (res) {
          if (res.code === 200) {
              var data = res.result;
              var nodeHtml = "";
              brotherNodesList.find('span.licencenode').each(function() {
                  $(this).remove();  //解决append bug
              });

              data.nodes = activedNodeFilter(data.nodes || []);
              data.count = data.nodes.length;

              for (var i = 0; i < data.count; i++) {

                  nodeHtml += '<span class="col-sm-4 col-md-3 col-lg-2 licencenode"><input name="node" type="checkbox" value=' + data.nodes[i].ip + ' />' + data.nodes[i].hostname + '</span>'
              }
              brotherNodesList.append(nodeHtml);
          } else {
              DisplayTips(lang.licence.get_node_fail);
          }
      }
      DataModel['listNode'](null, nodeCallback, true, null);
    }

    $(document)
        //添加按钮效果
        .on('mouseover','.licenseCont',function(ev){
            $('.js-init-license').removeClass('hidden');
            $('.js-create-license').removeClass('hidden');
        })
        .on('mouseout','.licenseCont',function(ev){
            $('.js-create-license').addClass('hidden');
            $('.js-init-license').addClass('hidden');
        })

        // 初始化授权
        .on('click', '.js-init-license', function (ev) {
          $(".basic_content_list").LoadData('show');
          DataModel['licenseInit'](null, function (rsp) {
            $(".basic_content_list").LoadData('show');
            if (rsp.code === 200) {
              var failNode = [];
              rsp.result.length && rsp.result.forEach(function (re) {
                if (re.code !== 200 ) {
                  failNode.push(re.ip);
                }
              });
              if (failNode.length) {
                DisplayTips(failNode.join(',') + ' ' + lang.licence.init_license_fail + ' ' + (lang.licence[rsp.result[0].code] || '') );
              }else {
                DisplayTips(lang.licence.init_license_success);
                getLicenseList();
              }
            }else {
              DisplayTips(lang.licence.init_license_fail);
            }
          },true, null);
        })

        //已添加节点详情
        .on('click', '.js-add-node-detail', function (ev) {
            $this = $(this);
            $modal = $('#nodesDetailModal');
            var license = $this.data('license');
            var copy = $this.data('copy');
            $modal.data('license', license);
            $modal.data('copy', parseInt(copy));

            $modal.modal('show');
            $('.close-modify').addClass('hidden');
            $('.modify-nodes-detail').removeClass('hidden');
            $('.check-nodes').addClass('hidden');
            $('#nodesDetail').html('');
            getAddedNodesDetail(license);
        })

        //已添加节点全选
        .on('click', '#select-all', function(ev) {
            if (!$(this).prop('checked')) {
                //取消全选
                $('.check-nodes span.licencenode').each(function(){
                    $(this).find('input').prop('checked',false);
                })
            }else{
                //全选
                $('.check-nodes span.licencenode').each(function(){
                    $(this).find('input').prop('checked',true);
                })
            }
        })

        //打开已激活节点详情框
        .on('click', '.js-active-node-detail', function (ev) {
            $modal = $('#activedNodesModal');
            $modal.modal('show');
            var license = $(this).data('license');
            var licensetype = $(this).data('licensetype');
            getActivedNodesDetail(license, licensetype);
        })

        .on('click', '.modify-nodes-detail', function (ev) {
            $this = $(this);
            $this.addClass('hidden');
            $('.close-modify, .check-nodes, .js-remove-node').removeClass('hidden');

            $modal = $('#nodesDetailModal');
            $modal.find('.nav-tabs').removeClass('hidden');

            getAllFiltedNodes();

        })

        .on('click', '.close-modify', function (ev) {
          $modal = $('#nodesDetailModal');
            $('.close-modify, .check-nodes, .js-remove-node').addClass('hidden');
            $('.modify-nodes-detail').removeClass('hidden');
            $modal.find('.nav-tabs').addClass('hidden');
        })

        .on('click', '.add-nodes', function (ev) {
            var license = $('#nodesDetailModal').data('license');
            var copy = parseInt($('#nodesDetailModal').data('copy'));
            var ipsArr = [];
            $('#nodesDetailModal input[name="node"]:checked').each(function (ev) {
                ipsArr.push($(this).val());
            })

            var ips = ipsArr.join(',');
            var para = {
                ips: ips,
                license: license,
            }

            var isadd = false;
            $('#nodesDetail>tr').each(function(){
                var ip = $(this).find('td').eq(3).find('a').data('ip');
                copy--;
                if ($.inArray(ip,ipsArr) >-1 ) {
                    DisplayTips(ip + lang.licence.already_add);
                    isadd = true;
                }
            })
            if (isadd) {
                isadd = false;
                return;
            }
            if (copy == 0) {
              return DisplayTips(lang.licence.add_node_no_more);
            }
            if (ipsArr.length > copy) {
              return DisplayTips(lang.licence.selected_nodes_too_many);
            }

            var addNodeCallback = function (res) {
                if (res.code === 200) {
                    getAddedNodesDetail(license);
                    getLicenseList(getAllFiltedNodes);
                    var sucIp = [];
                    var failIp = [];
                    var errorInfo = '';
                    for (var i = 0; i < res.result.length; i++) {
                        var resi = res.result[i];
                        if (resi.result) {
                            sucIp.push(resi.ip);
                        }else{
                            failIp.push(resi.ip);
                            errorInfo += ' ; Error =>【 ' + resi.ip + lang.licence[resi.code] + ' 】';
                        }
                    }
                    var sucIpjoin = sucIp.join(',');
                    var failIpjoin = failIp.join(',');
                    var str = '';
                    if (!empty(sucIp) && empty(failIp)) {
                        str = sucIpjoin + lang.licence.add_suc;
                    }else if (empty(sucIp) && !empty(failIp)) {
                        str = failIpjoin + lang.licence.add_fail + errorInfo;
                    }else if (!empty(sucIp) && !empty(failIp)) {
                        str = sucIpjoin + lang.licence.add_suc + ',' + failIpjoin + lang.licence.add_fail + errorInfo;
                    }
                    DisplayTips(str);
                } else {
                    DisplayTips(lang.licence.add_node_fail);
                }
            }

            DataModel['licenseAdd'](para, addNodeCallback, true, null);
        })

        .on('click', '#nodesDetail .js-remove-node', function (ev) {
            var license = $('#nodesDetailModal').data('license');
            var ip = $(this).data('ip');

            var para = {
                ip: ip,
                license: license,
            }

            var delNodeCallback = function (res) {
                if (res.code === 200) {
                    getAddedNodesDetail(license);
                    getLicenseList(getAllFiltedNodes);
                    DisplayTips(ip + lang.licence.delete_success);
                } else {
                    DisplayTips(lang.licence.del_node_fail);
                }

            }

            DataModel['licenseAddedNodeRemove'](para, delNodeCallback, true, null);
        })

        .on('click', '.js-create-license', function (ev) {
            $modal = $('#createLicenseModal');
            $modal.modal('show');
            $modal.find('form>div.form-group').eq(0).removeClass('hidden');
            $modal.find('form>div.form-group').eq(1).addClass('hidden');
            $modal.find('form>div.form-group').eq(2).addClass('hidden');
        })

        //隐藏新建授权码弹框
        .on('click', '#createLicenseModal .btn-default', function (ev) {
            $modal = $('#createLicenseModal');
            $modal.modal('hide');
        })

        //新建授权码
        .on('click', '#createLicenseModal .btn-primary', function (ev) {
            $modal = $('#createLicenseModal');
            var ipsArr = [];
            var license_push = [];
            var licenseCopy = parseInt($('#createLicenseModal').find('.license-copy').text());
            $('input[name="node"]:checked').each(function (e) {
                ipsArr.push(($(this).val()));
            })
            $('#licenseList>tr').each(function(){
                    var license = $(this).find('td').eq(0).text().trim();
                    license_push.push(license);
            })

            var license = $("#parseTable").find('td:first').text();
            if ( $.inArray(license,license_push) > -1) {
                DisplayTips(license + ',' + lang.licence.already_have);
                return;
            }
            if (ipsArr.length<1) {
                DisplayTips(lang.licence.node_select);
                return;
            }
            if (ipsArr.length > licenseCopy) {
              DisplayTips(lang.licence.selected_nodes_too_many)
              return;
            }

            var para = {
                ips: ipsArr.join(','),
                license: license,
            }

            var addCallback = function (res) {
                $modal.find('.modal-header').LoadData("hide");
                if (res.code === 200 && !empty(res.result)) {
                    var arrFalse = [];
                    var arrSuc = [];
                    var errorInfo = '';
                    $.each(res.result,function(i){
                        if(res.result[i].result == 0){
                            arrFalse.push(res.result[i].ip)
                            errorInfo += ' Error =>【 ' + res.result[i].ip + lang.licence[res.result[i].code] + ' 】';
                        }else{
                            arrSuc.push(res.result[i].ip);
                        }
                    })
                    var arrfailjoin = arrFalse.join(',');
                    var arrsucjoin = arrSuc.join(',');
                    if(!empty(arrFalse) &&  !empty(arrSuc)){
                        DisplayTips(arrsucjoin + lang.licence.add_suc + ' ' + arrfailjoin+lang.licence.add_licence_fail + errorInfo);
                        getLicenseList();
                    }else if(!empty(arrSuc) && empty(arrFalse)){
                        getLicenseList();
                        DisplayTips(arrsucjoin+ lang.licence.add_suc);
                    }else if(empty(arrSuc) && !empty(arrFalse)){
                        DisplayTips(arrfailjoin+ lang.licence.add_licence_fail + errorInfo);
                    }
                    setTimeout(function(){
                            $("#createLicenseModal").modal('hide');
                       },1000);
                } else {
                    DisplayTips(res.result);
                }
            }
            $modal.find('.modal-header').LoadData("show");
            DataModel['licenseAdd'](para, addCallback, true, null);

        })

        //解析输入的授权码
        .on('click', '.js-license-parse', function (ev) {
            $this = $(this);
            var brotherTable = $this.parent().next();
            var brotherNodesList = brotherTable.next();
            var licensearr = [];

            //parse license
            var license = $('#new_license_name').val().trim();
            var para = {
                license: license,
                host : window.location.host,
            }

            if (!license) {
              return DisplayTips(lang.licence.please_input_license)
            }

            //去除全选
            $('.allNodesList .check_all_nodes').prop("checked",false);
            $('#licenseList tr').each(function(){
                var licensei = $(this).find('td').eq(0).text().trim();
                licensearr.push(licensei);
            })

            var pattern = /^[\w\d_-]*$/;
            if ($.inArray(license,licensearr)>-1) {
                DisplayTips(license + ',' +lang.licence.already_have);
                return;
            }else if(!pattern.test(license)){
                DisplayTips(lang.licence.type_rong);
                return;
            }

            var parseCallback = function (res) {
                if (res.code === 200) {
                    $this.parent().addClass('hidden');
                    brotherTable.removeClass('hidden');
                    brotherNodesList.removeClass('hidden');
                    brotherNodesList.find('span.licencenode').each(function() {
                        $(this).remove();   //去除下面append累加的bug
                    });
                    var data = res.result;
                    var tbody = "<tr><td class='license-p' style='width:52%;'>" + license + "</td>" +
                        "<td style='text-align: center'>" + data.limit_type + "</td>" +
                        "<td style='text-align: center'>" +  parseLicenseLimit(data.limit_type, data.limit) + "</td>" +
                        "<td class='license-copy' style='text-align: center'>" + data.copy + "</td>" +
                        "<td style='text-align: center'><span class='glyphicon glyphicon-trash cursorPointer' title='"+ lang.delete +"'></td>";
                    "</tr>";
                    $('#parseTable').html(tbody);
                } else
                  DisplayTips(licenseParseError(res.code));
            }

            var nodeCallback = function (res) {
                if (res.code === 200) {
                    var data = res.result;
                    var nodeHtml = "";
                    for (var i = 0; i < data.count; i++) {
                        nodeHtml += '<span class="col-sm-4 col-md-3 col-lg-2 licencenode"><input name="node" type="checkbox" value=' + data.nodes[i].ip + ' />' + data.nodes[i].hostname + '</span>'
                    }
                    brotherNodesList.append(nodeHtml);
                } else {
                    DisplayTips(lang.licence.get_node_fail);
                }
            }

            DataModel['licenseParse'](para, parseCallback, true, null);
            DataModel['listNode'](null, nodeCallback, true, null);
        })

        //移除正在新建的授权码
        .on('click', '#parseTable .glyphicon-trash', function (ev) {
            $('#new_license_name').val('')
            $('.allNodesList').prev().prev().removeClass('hidden');
            $('.allNodesList').prev().addClass('hidden');
            $('.allNodesList').addClass('hidden').find('.licencenode').remove();
        })

        //全选授权节点
        .on('click', '.allNodesList .check_all_nodes', function (ev) {
            if($('.allNodesList .check_all_nodes').is(':checked') == true){
                $('.allNodesList .licencenode input').prop('checked',true)
            }else{
                $('.allNodesList .licencenode input').prop('checked',false)
            }
        })

        //全选按钮与节点一致
        .on('click', '.allNodesList .licencenode input', function(event) {
            var inputarr = [];
            $('.allNodesList .licencenode input').each(function() {
                if($(this).prop('checked')){
                    inputarr.push(1);
                }
            });
            if (inputarr.length == $('.allNodesList .licencenode input').length) {
                $('.allNodesList .check_all_nodes').prop('checked',true)
            }else{
                $('.allNodesList .check_all_nodes').prop('checked',false)
            }
        })

        //打开确认删除授权码弹框
        .on('click', '.js-delete-license', function (ev) {
            $this = $(this);
            var license = $this.data('license');
            var licenseType = $this.data('licensetype');

            $modal = $('#delLicenseModal');
            $modal.modal('show');
            $modal.find('.modal-body input').val('');

            $modal.find('.license').next('span').html(license);
            $modal.find('.licenseType').next('span').html(licenseType);

        })

        //删除授权码
        .on('click', '#delLicenseModal .btn-danger', function (ev) {
            $modal = $('#delLicenseModal');
            $this = $this.closest('td').closest('tr');
            var sureToDel = $("input[name='sureToDel']").val();
            var license = $modal.find('.license').next('span').html();
            var para = {
              license: license,
            }

            var delCallback = function (res) {
              $modal.find('.modal-header').LoadData('hide');
              if (res.code === 200) {
                $modal.modal('hide');
                getLicenseList();
                // $this.remove();
              } else {
                DisplayTips(lang.licence.del_licence_fail);
              }
            }
            $modal.find('.modal-header').LoadData('show');
            DataModel['licenseRemove'](para, delCallback, true, null);
        })

        //打开激活授权码弹框
        .on('click', '.js-active-license', function (ev) {
            //打开到手动激活
            $('.manActive').trigger('click');

            $this = $(this);
            var license = $this.data('license');
            $modal = $('#activeLicenseModal');
            $('#license-code').html(license);
            $modal.modal('show');
            $('#manualActive table tbody').html('');
            getManualActiveList(license);
        })

        //隐藏/展示手动激活tab
        .on('click', '.manActive', function (ev) {
            $(this).closest('li').addClass('active');
            $(this).closest('li').next('li').removeClass('active');

            $('#manualActive').removeClass('hidden');
            $('#autoActive').addClass('hidden');
        })

        //隐藏/展示自动激活tab
        .on('click', '.auActive', function (ev) {
            $(this).closest('li').addClass('active');
            $(this).closest('li').prev('li').removeClass('active');

            $('#autoActive').removeClass('hidden');
            $('#manualActive').addClass('hidden');
        })

        //复制机器码
        .on('click', '.copyHWcode', function(ev) {
            var clipboard = new Clipboard('.copyHWcode');
            clipboard.on('success', function(e) {
                DisplayTips(lang.licence.copy_success);
            });
        })

        //行内手动激活
        .on('click', '.active-node-inline', function(ev) {
            $this= $(this);
            var nodeIP = $this.data('nodeip');
            var activeId = "#active"+$this.data('activeindex');
            var license = $('#license-code').html();
            var activeCode = $(activeId).val();

            if ( activeCode == '' ) {
                DisplayTips(lang.licence.no_actcode);
                return;
            }
            var singleActiveCallback = function(res) {
                $('#manualActive .table').LoadData('hide');
                if(res.code === 200) {
                    getManualActiveList(license);
                    getLicenseList();
                    DisplayTips(nodeIP + lang.licence.act_success);
                }else{
                    DisplayTips(lang.licence[res.code] || lang.licence.active_fail);
                }
            }

            var para ={
                activeInfo: nodeIP+','+license+','+activeCode,
            }

            $('#manualActive .table').LoadData('show');
            DataModel['licenseActive'](para, singleActiveCallback, true, null);
        })

        //自动激活所有
        .on('click', '.js-active-all-nodes', function(ev) {
            var license = $('#license-code').html();
            var ips = [];
            $('#autoActive tbody tr').each(function(){
                    var ip = $(this).data('ip');
                    ips.push(ip);
            })
            var para = {
                license: license,
                ip : ips.join(',')
            }

            var activeCount = $('#autoActive thead th').eq(2).html();
            activeCount = activeCount.replace(/[^0-9]/ig,"");
            var countlength = activeCount.length;
            var activeCount1 = activeCount.slice(0,countlength/2);
            var activeCount2 = activeCount.slice(countlength/2,countlength);
            if (activeCount1 == activeCount2) {
                DisplayTips(lang.licence.all_active);
                return;
            }

            var ActiveAllCallback = function(res){
                $('#manualActive .table').LoadData('hide');
                if (res.code == 200) {
                    getManualActiveList(license);
                    getLicenseList();
                    $('.auActive').trigger('click');
                    var suc = [];
                    var fail = [];
                    for (var i = 0; i < res.result.length; i++) {
                        var resi = res.result[i];
                        if (resi.result) {
                            suc.push(resi.ip);
                        }else{
                            fail.push(resi.ip);
                        }
                    }
                    var sucjoin = suc.join(',');
                    var failjoin = fail.join(',');
                    var str = '';
                    if (!empty(suc) && empty(fail)) {
                        str = lang.licence.online_active;
                    }else if(empty(suc) && ! empty(fail) ){
                        str = lang.licence.online_active_fail;
                    }else if (!empty(suc) && !empty(fail)) {
                        str = sucjoin + lang.licence.act_success + ',' + failjoin + lang.licence.active_fail;
                    }
                    DisplayTips(str);
                }else{
                    DisplayTips(lang.licence.online_active_fail);
                }
            }
            $('#manualActive .table').LoadData('show');
            DataModel['licenseActiveAll'](para, ActiveAllCallback, true, null);
        })

    $("[data-toggle='popover']").popover();

})
