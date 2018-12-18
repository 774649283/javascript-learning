$(function (ev) {

  /* ************************* state全局私有状态 ************************* */
  var state = {
    dataMigraSwitch: 'error',  // 数据迁移状态
    dataMigraSwitchPending: false,  // 数据迁移请求标志
    clusterMaintenanceStatus: { // 集群运维状态(异步获取)
    },
    nodeMaintenanceStatus: {}, // 节点运维状态
    clusterMaintenanceServList: [],  // 集群运维服务列表
    serviceCloseNode: '', // 关闭服务节点数目
  };

  // 变量声明
  // 定时器： 节点重启、节点关机、节点服务开启、节点服务关闭
  // 定时器： 集群进入运维、集群关闭运维
  var nodeRebootTimer, nodeShutdownTimer, nodeStartServTimer, nodeStopServTimer;
  var clusterMaintenanceTimer, clusterStartTimer;


  /* ************************* 函数声明 ************************* */

  /* ------------------- 数据迁移相关 ------------------- */

  // 界面切换数据迁移状态开关
  var toggleSwitch = function (status) {
    if (status == 'on') {
      $('#dataMigraSwitch').removeClass('switch-wrapper-close');
      $('.data-migration-tips').each(function () {
        $(this).addClass('hidden');
      })
      state.dataMigraSwitch = 'on';
    }else if(status == 'off'){
      $('#dataMigraSwitch').addClass('switch-wrapper-close');
      $('.data-migration-tips').each(function () {
        $(this).removeClass('hidden')
      })
      state.dataMigraSwitch = 'off';
    }else if (status == 'error') {
      state.dataMigraSwitch = 'error';
    }
  };

  // 获取数据迁移状态
  var getDataMigraStatus = function () {
    // $('.maintenance > .m-nodelist-header').LoadData('show');
    DataModel['maintenanceBalanceStatus'](null, function (rsp) {
      // $('.maintenance > .m-nodelist-header').LoadData('hide');
      if (rsp.code == 200) {
        toggleSwitch(rsp.result);
      }else {
        DisplayTips(lang.maintenance.get_datamigra_status_fail)
        toggleSwitch('error');
      }
    }, true, null);
  }


  // 设置数据迁移状态
  var setDataMigraStatus = function (status) {

    if (state.dataMigraSwitchPending) return;

    var para = {
      'switch': status
    };

    $('.maintenance > .m-nodelist-header').LoadData('show');
    state.dataMigraSwitchPending = true;
    DataModel['maintenanceBalanceSwitch'](para, function (rsp) {
      $('.maintenance > .m-nodelist-header').LoadData('hide');
      state.dataMigraSwitchPending = false;

      if (rsp.code == 200) {
        toggleSwitch(status);
      } else if (rsp.code == 602) {
        DisplayTips(lang.maintenance.data_migra_tip);
        toggleSwitch('error');
      } else {
        DisplayTips(rsp.result || lang.maintenance.set_datamigra_fail);
        toggleSwitch('error');
      }
    }, true, null);
  };


  /* ------------------- 节点服务相关 ------------------- */
  /**
   * [节点开启服务]
   */
  var nodeStartService = function ($modal, para) {
    $modal.find('.modal-header').LoadData('show');
    DataModel['maintenanceStop'](para, function (rsp) {
      $modal.find('.modal-header').LoadData('hide');
      if (rsp.code == 200) {
        DisplayTips(lang.maintenance.start_node_service_process);
        setTimeout(function () {
          getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
        }, 2e3);
      }else {
        $modal.find('.modal-header').LoadData('hide');
        DisplayTips(lang.maintenance.start_node_service_fail);
        setTimeout(function () {
          getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
        }, 2e3);
      }
    }, true, null);

    setTimeout(function () {

      // 发送开启请求
      DataModel['maintenanceStatus'](para, function(rsp){
        if (rsp.code == 200) {

          showModalStepLoadding($modal, true);

          nodeStartServTimer = setInterval(function () {
            getMaintenanceStatus(para.ipaddr, function () {
              updateMaintenanceStep($modal, state.nodeMaintenanceStatus, {timer: nodeStartServTimer, finishText: lang.maintenance.start_node_service_success});
            });
            setTimeout(function () {
              clearInterval(nodeStartServTimer);
            }, 60e3)
          }, 5e3);

        }else {
          DisplayTips(lang.maintenance.start_node_service_fail);
        }
      }, true, null);
    }, 2e3);

  }

  /**
   * [节点关闭服务]
   */
  var nodeStopService = function ($modal, para) {
    $modal.find('.modal-header').LoadData('show');
    serviceCloseNode = para.hostname;
    var isBreak = false;

    DataModel['maintenanceStart'](para, function (rsp) {
      $modal.find('.modal-header').LoadData('hide');
      if (rsp.code == 200) {
        DisplayTips(lang.maintenance.stop_node_service_process);
        setTimeout(function () {
          getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
        }, 2e3);
      // pg不健康
      }else if(rsp.code == 602){
        isBreak = true;
        clearInterval(nodeStopServTimer);

        updateMaintenanceStep($modal, {process: {
            nas_service : 'warning',
            fs_mount : 'warning',
            storage_service : 'warning',
            system_service : 'warning'
          }
        }, {timer: nodeStopServTimer, finishText: lang.maintenance.pg_error});

        setTimeout(function () {
          getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
        }, 2e3);
      }else {

        isBreak = true;
        setTimeout(function () {
          getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
        }, 2e3);

        DisplayTips(lang.maintenance.stop_node_service_fail + ': ' + rsp.result);
      }
    }, true, null);

    // 发送开启请求
    setTimeout(function () {

      DataModel['maintenanceStatus'](para, function(rsp){
        if (rsp.code == 200) {

          showModalStepLoadding($modal, true);

          nodeStopServTimer = setInterval(function () {
            getMaintenanceStatus(para.ipaddr, function () {
              updateMaintenanceStep($modal, state.nodeMaintenanceStatus, {timer: nodeStopServTimer, finishText: lang.maintenance.stop_node_service_success, isBreak: isBreak});
            });
            setTimeout(function () {
              clearInterval(nodeStopServTimer);
            }, 120e3)
          }, 5e3);

        }else {
          DisplayTips(lang.maintenance.stop_node_service_fail);
        }
      }, true, null);

    }, 2e3);

  }

  /**
   * [节点重启]
   */
  var nodeReboot = function ($modal, para) {
    renderNodePage({
      status: 'shutdown',
      ipaddr: para.ipaddr
    });
    $modal.find('.modal-header').LoadData('show');
    DataModel['maintenaceNodeReboot'](para, function(rsp){
      if (rsp.code == 200 || rsp.code == 502) {
        DisplayTips(lang.maintenance.node_rebooting);
        resetMaintenanceStep($modal, 'success');
        setTimeout(function () {
          $modal.modal('hide');
        }, 2e3);

        // 开始check
        setTimeout(function () {
          DisplayTips( lang.node.reboot_soon );
          setTimeout(function () {
            checkTimer = setInterval(rebootCheck, 15e3);
          }, 15e3);
        }, 2e3);
      }else {
        $modal.find('.modal-header').LoadData('hide');
        DisplayTips(lang.maintenance.node_reboot_exception);
      }
    }, true, null);

    var checkTimer, tempTimer;
    var doneTimer;

    // 重启检测
    var rebootCheck = function() {
      DataModel['checkReboot'](para, function (result) {
        // 机器已经重启了，现在开始检测服务是否已经启动
        if (result && result.code == 200) {
          clearInterval(checkTimer);
          doneTimer = setInterval(rebootDone, 5e3);
        }
      }, true, null);

    }
    // 服务检测
    var rebootDone = function() {
      DataModel['checkService'](para, function (result) {
        // 机器服务已经正常，开始刷新网页
        if (result && result.code == 200) {
          $modal.find('.modal-header').LoadData('hide');
          clearInterval(doneTimer);
          DisplayTips( lang.node.reboot_done );
          setTimeout(function () {
            getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
          }, 2e3);
        }
      }, true, null);
    }
  }
  /**
   * [展示modal的loading效果]
   * @return {[type]} [description]
   */
  var showModalStepLoadding = function ($modal, status) {
    if (status) {
      $modal.find('.step').each(function () {
        $(this).prev().LoadData ("show", 'only-gif').css('top', '10px');
      })
    }else {
      $modal.find('.step').each(function () {
        $(this).prev().LoadData ("hide");
      })
    }
  };

  /**
   * [从界面上更新节点状态]
   * @return {[Object]} [描述对象]
   */
  var renderNodePage = function (info) {
    var status = info.status;
    var ipaddr = info.ipaddr;
    if (status == 'shutdown') {
      $('.m-nodelist-op[data-ipaddr="'+ipaddr+'"]').
        addClass('m-nodelist-op-disable').
        removeClass('m-nodelist-op');
    }
    if (status == 'close') {
      $('.m-nodelist-op[data-ipaddr="'+ipaddr+'"]').find('.close-service')
        .addClass('close-service-disable')
        .addClass('disable')
        .removeClass('close-service');

      $('.m-nodelist-op[data-ipaddr="'+ipaddr+'"]').find('.node-reboot')
          .addClass('node-reboot-disable')
          .addClass('disable')
          .removeClass('node-reboot');
    }
  };

  /**
   * [节点关机]
   */
  var nodeShutdown = function ($modal, para) {
    $modal.find('.modal-header').LoadData('show');
    // 发送关机请求
    DataModel['maintenanceNodeShutdown'](para, function(rsp){
      $modal.find('.modal-header').LoadData('hide');
      if (rsp.code == 200 || rsp.code == 502) {
        DisplayTips(lang.maintenance.node_shutdowning);
        resetMaintenanceStep($modal, 'success');
        renderNodePage({
          status: 'shutdown',
          ipaddr: para.ipaddr
        });
        setTimeout(function () {
          $modal.modal('hide');
        }, 2e3);
      }else {
        DisplayTips(lang.maintenance.node_shutdown_exception);
      }
    }, true, null);
  };


  /* ------------------- 集群操作相关 ------------------- */
  /**
   * [更新维护状态数据 node / cluster]
   * @param  {[Object]}   condition [指明是集群还是节点，如果是节点需要节点ip]
   * @param  {[Object]} result  [接口返回结果]
   */
  var updateMaintenanceStatus = function (result) {
    result && (state.nodeMaintenanceStatus = result);
  };


  /**
   * [更新集群服务列表]
   * @param  {[Object]}   result [集群服务列表数据]
   */
  var updateMaintenanceClusterStatus = function (result) {
    result && result.length && (state.clusterMaintenanceServList = result);
  }

  var updateMaintenanceClusterProcess = function (result) {
    result && result.action && (state.clusterMaintenanceStatus = result);
  };

  /**
   * [更新集群状态按钮]
   * @param  {[Object]} result [集群服务状态数据]
   */
  var renderClusterStatusButton = function (result) {
    // 更新集群状态按钮
    var isAllServiceClosed = true;
    result && result.length && result.forEach(function (item) {
      if (item.servicestat.online && item.servicestat.online.length) {
        isAllServiceClosed = false;
      }
    });

    if (isAllServiceClosed) {
      // $('.m-cluster-maintenance').addClass('hidden');
      // $('.m-cluster-start').removeClass('hidden');
    }else {
      // $('.m-cluster-maintenance').removeClass('hidden');
      // $('.m-cluster-start').addClass('hidden');
    }
  };

  /**
   * [渲染集群服务列表]
   */
  var renderMaintenanceClusterStatus = function () {
    var html = '';
    var result = state.clusterMaintenanceServList;
    var status = '', statusText = '', statusClass = 'm-nodelist-op', nodeStatusClass = ''; // 节点状态
    var clusterStatus = 'open';
    var powerstatus = 'on'; // 电源
    var fsStatus = 'true'; // 文件系统已挂载
    serviceCloseNode = ''; // 已关闭节点

    ( result && result.length ) && ( fsStatus = (result.shift())['fs'] ); // 返回的第一个参数是fsStatus

    // 渲染开机记录
    var renderRuntime = function (runtime) {
      var runterm = runtime ?  (runtime.runtime || 'unknown') : 'unknown';
      var boottime = runtime ?  (runtime.boottime || 'unknown') : 'unknown';
      var htm = '';
      htm = '<div class="abnormal-serv-tips hidden" style="right: -15rem; width: 18rem">';
        htm += '<p style="color: #576de2">';
        htm += '<span style="margin-right: .5rem">' + (lang.maintenance.boottime + '：') + '</span>';
        htm += '<span >' + (boottime) + '</span>';
        htm += '</p>';
        htm += '<p style="color: #576de2">';
        htm += '<span style="margin-right: .5rem">' + (lang.maintenance.runterm + '：') + '</span>';
        htm += '<span >' + (secondsToDay(runterm) + lang.maintenance.day) + '</span>';
        htm += '</p>';
      htm += '</div>';

      return htm;
    };

    // 渲染不正常服务
    var renderAbnormalServ = function (status, servList) {
      var htm = '';
      if (status == 'abnormal') {
        htm = '<div class="abnormal-serv-tips hidden">';
        servList.length && servList.forEach(function (serv) {
          htm += '<p>';
          htm += '<span title='+serv+' style="margin-right: .5rem;">' + serv + '</span>';
          htm += '<span style="color: #dd0909">' + lang.maintenance.close + '</span>';
          htm += '</p>';
        });
        htm += '</div>'
      }
      return htm;
    };


    result && result.length && result.forEach(function (item) {

      statusClass = 'm-nodelist-op';
      powerstatus = 'on';
      nodeStatusClass = '';

      if(item.servicestat && item.servicestat.offline && item.servicestat.online){
        // 执行一般过滤
        var index;
        if (item.servicestat.offline.length ) {
          index = item.servicestat.offline.indexOf('nfs');
          (index >= 0) && (item.servicestat.offline.splice(index, 1));
        }
        if (item.servicestat.online.length) {
          index = item.servicestat.online.indexOf('sysdb');
          (index >= 0) && (item.servicestat.online.splice(index, 1));
        }
        // 执行文件系统过滤
        if (fsStatus === 'False' || fsStatus === 'unknown') {
          index = item.servicestat.offline.indexOf('smb');
          (index >= 0) && (item.servicestat.offline.splice(index, 1));
          index = item.servicestat.offline.indexOf('ctdb');
          (index >= 0) && (item.servicestat.offline.splice(index, 1));
        }

        item.servicestat.offline.length && item.servicestat.online.length && (status = 'abnormal');
        !item.servicestat.offline.length && item.servicestat.online.length && (status = 'normal');
        item.servicestat.offline.length && !item.servicestat.online.length && (status = 'close');
      }else {
        status = 'known';
      }

      powerstatus = item.powerstatus;

      (status == 'known') && (statusText = (lang.maintenance.service+' '+lang.maintenance.unknown));
      (status == 'normal') && (statusText = (lang.maintenance.service+' <span style="color: green"> ' + lang.maintenance.normal + '</span>'));
      (status == 'close') && (statusText = (lang.maintenance.service+' '+lang.maintenance.close)) && (nodeStatusClass = '-disable disable');
      (status == 'close') && (serviceCloseNode = item.hostname);
      (status == 'abnormal') && (statusText = (lang.maintenance.service+' <span style="color: red"> '+lang.maintenance.abnormal+ '</span>'));
      (powerstatus == 'off') && (statusClass = 'm-nodelist-op-disable');

      html += '<tr>';
      html +=   '<td class="abnormal-tips-container">' + '<span>' + (item.hostname || 'none') + '</span>' + (renderRuntime(item.runtime) || '') + '</td>';
      html +=   '<td>' + (item.ip || 'none') + '</td>';
      html +=   '<td class="abnormal-tips-container">' + '<span>' + statusText + '</span>' + renderAbnormalServ(status, item.servicestat.offline || '') + '</td>';
      html +=   '<td class="'+statusClass+'" data-ipaddr="'+item.ip+'" data-hostname="'+item.hostname+'">';
      html +=     '<div class="op-option-wrapper" data-ipaddr="'+item.ip+'" data-hostname="'+item.hostname+'">';
      html +=       '<span class="close-service'+nodeStatusClass+'">'+lang.maintenance.close_service+'</span>';
      html +=       '<span class="start-service">'+lang.maintenance.start_service+'</span>';
      html +=       '<span class="node-reboot">'+lang.maintenance.reboot_node+'</span>';
      html +=       '<span class="node-shutdown">'+lang.maintenance.shutdown_node+'</span>';
      html +=     '</div>';
      html +=   '</td>';
      html += '</tr>';
    });

    $('#mNodeList').html(html);

    // 初始化tootips
    $('.abnormal-tips-container').each(function () {
      var htmlstr = $(this).find('.abnormal-serv-tips').html();
      if (!htmlstr) return;
      var target = $(this).find('> span:first-child');
      Utils.Tootips.init(target, {
        trigger: 'mouseover',
        type: 'html',
        value: htmlstr,
        direction: 'right',
        style: {
          'display': 'flex',
          'flex-direction': 'column',
          'align-items': 'left',
          'justify-content': 'center',
          'font-size': '.8rem',
          'min-width': '5rem',
          'border': 'solid 1px #cfd1d7',
          'padding': '10px 10px 5px',
          'background-color': 'white',
        },
        css: 'triangle-left abnormal-tips-container',
      });
    });

    // 更新集群状态按钮
    renderClusterStatusButton(result);

    delete html;
  };


  /**
   * [进入维护模式 node / cluster]
   * @param  {[Object]}   condition [指明是集群还是节点，如果是节点需要节点ip]
   * @param  {Function} callback  [回调函数]
   */
  var getIntoMaintenance = function (condition, callback) {
    var para = { area: condition.type, ip: condition.ip || null };
    DataModel['maintenanceStart'](para, function (rsp) {
      if (rsp.code == 200 && rsp.result == 'success') {
        callback && callback(para);
      }else {
        DisplayTips(lang.maintenance.enter_maintenance_mode_fail);
      }
    }, true, null);
  };


  /**
   * [获取当节点维护模式的状态]
   * @param  {Function} callback  [回调函数]
   */
  var getMaintenanceStatus = function (ipaddr, callback) {
    DataModel['maintenanceStatus']({ipaddr: ipaddr}, function (rsp) {
      if (rsp.code == 200) {
        updateMaintenanceStatus(rsp.result);
        callback && callback();
      }else {
        DisplayTips(lang.maintenance.get_maintenance_status_fail);
      }
    }, true, null);
  };

  /**
   * [获取当集群维护模式的状态]
   * @param  {Function} callback  [回调函数]
   */
  var getMaintenanceClusterStatus = function (callback) {
    $('.maintenance > .m-nodelist-header').LoadData('show');
    DataModel['maintenanceClusterServList'](null, function (rsp) {
      $('.maintenance > .m-nodelist-header').LoadData('hide');
      if (rsp.code == 200) {
        updateMaintenanceClusterStatus(rsp.result);
        callback && callback();
      }else {
        DisplayTips(lang.maintenance.get_maintenance_serv_fail);
      }
    }, true, null);
  };

  /**
   * [获取当集群维护执行步骤]
   * @param  {Function} callback  [回调函数]
   */
  var getMaintenanceClusterProcess = function (callback) {
    DataModel['maintenanceClusterProcess'](null, function (rsp) {
      if (rsp.code == 200) {
        updateMaintenanceClusterProcess(rsp.result);
        callback && callback(rsp.result);
      }else {
        DisplayTips(lang.maintenance.get_cluster_maintenance_status_fail);
      }
    }, true, null);
  }

  /**
   * [切换集群维护步骤状态]
   * @param  {[Object]} $_modal  [模态窗口对象]
   * @param  {[String]} txt  [完成后的提示信息]
   */
  var toggleMaintenanceClusterModal = function (type) {
    var $modal = $('#cluserMaintenanceModal');
    var lastAction = $modal.data('action');
    if (lastAction != type) {
      showModalStepLoadding($modal, false);
    }

    if (type == 'start') {
      $modal.find('.modal-title').text(lang.maintenance.cluster_maintenance);
    }else {
      $modal.find('.modal-title').text(lang.maintenance.cluster_start);
    }
    $modal.data('action', type);
    $modal.find('.cluster-sh').each(function () {
      if (type == 'start') {
        $(this).removeClass('hidden');
      }else {
        $(this).addClass('hidden');
      }
    });
    $modal.find('.cluster-st').each(function () {
      if (type == 'start') {
        $(this).addClass('hidden');
      }else {
        $(this).removeClass('hidden');
      }
    });
  };


  /**
   * [重置步骤弹窗状态]
   * @param  {[Object]} $_modal  [模态窗口对象]
   * @param  {[String]} txt  [完成后的提示信息]
   */
  var resetMaintenanceStep = function ($_modal, txt) {
    txt = txt ? txt : '';
    color = (txt == 'fail') ? 'red' : 'limegreen';
    $_modal.find(".step1").prev().LoadData ("hide");
    $_modal.find('.step1').css('color', color).text(txt);
    $_modal.find(".step2").prev().LoadData ("hide");
    $_modal.find('.step2').css('color', color).text(txt);
    $_modal.find(".step3").prev().LoadData ("hide");
    $_modal.find('.step3').css('color', color).text(txt);
    $_modal.find(".step4").prev().LoadData ("hide");
    $_modal.find('.step4').css('color', color).text(txt);
    $_modal.find(".step5").prev().LoadData ("hide");
    $_modal.find('.step5').css('color', color).text(txt);
    $_modal.find(".step6").prev().LoadData ("hide");
    $_modal.find('.step6').css('color', color).text(txt);
  }


  /**
   * [更新执行步骤]
   * @param  {[Object]} $_modal [弹窗对象]
   * @param  {[Object]} result  [运维状态数据]
   * @param  {[Object]} options [其它参数]
   */
  var updateMaintenanceStep = function ($_modal, result, options) {
    var allDone = true;
    var pgError = false;
    var ip = result.ip;
    result = result.process || {};

    if (options.isBreak) return;

    if (!result.nas_service && !result.fs_mount && !result.storage_service && !result.system_service) {
      result.nas_service = 'success';
      result.fs_mount = 'success';
      result.storage_service = 'success';
      result.system_service = 'success';
    }
    var setStep1 = function (error) {
      $_modal.find(".step1").prev().LoadData ("hide");
      if (error) {
        $_modal.find('.step1').css('color','#e8693a').text('warning');
      }else {
        $_modal.find('.step1').css('color','limegreen').text('done');
      }
    }

    if (result.nas_service == 'success') {
      setStep1();
      $_modal.find(".step2").prev().LoadData ("hide");
      $_modal.find('.step2').css('color','limegreen').text('done');

    }else if(result.nas_service == 'fail'){
      setStep1();
      $_modal.find('.step2').css('color','red').text('fail');
      $_modal.find(".step2").prev().LoadData ("hide");
      allDone = false;
    } else if (result.nas_service == 'warning') {
      setStep1(true);
      $_modal.find('.step2').css('color','#e8693a').text('warning');
      $_modal.find(".step2").prev().LoadData ("hide");
      pgError = true;
    }else {
      allDone = false;
    }

    if (result.system_service == 'success') {
      setStep1();
      $_modal.find('.step3').css('color','limegreen').text('done');
      $_modal.find(".step3").prev().LoadData ("hide");
    }else if(result.system_service == 'fail'){
      setStep1();
      $_modal.find('.step3').css('color','red').text('fail');
      $_modal.find(".step3").prev().LoadData ("hide");
      allDone = false;
    } else if (result.system_service == 'warning') {
      setStep1(true);
      $_modal.find('.step3').css('color','#e8693a').text('warning');
      $_modal.find(".step3").prev().LoadData ("hide");
    }else {
      allDone = false;
    }

    if (result.fs_mount == 'success') {
      setStep1();
      $_modal.find('.step4').css('color','limegreen').text('done');
      $_modal.find(".step4").prev().LoadData ("hide");
    }else if(result.fs_mount == 'fail'){
      setStep1();
      $_modal.find('.step4').css('color','red').text('fail');
      $_modal.find(".step4").prev().LoadData ("hide");
      allDone = false;
    } else if (result.fs_mount == 'warning') {
      setStep1(true);
      $_modal.find('.step4').css('color','#e8693a').text('warning');
      $_modal.find(".step4").prev().LoadData ("hide");
    }else {
      allDone = false;
    }

    if (result.storage_service == 'success') {
      setStep1();
      $_modal.find(".step5").prev().LoadData ("hide");
      $_modal.find('.step5').css('color','limegreen').text('done');
    }else if(result.storage_service == 'fail'){
      setStep1();
      $_modal.find('.step5').css('color','red').text('fail');
      $_modal.find(".step5").prev().LoadData ("hide");
      allDone = false;
    } else if (result.storage_service == 'warning') {
      setStep1(true);
      $_modal.find('.step5').css('color','#e8693a').text('warning');
      $_modal.find(".step5").prev().LoadData ("hide");
    }else {
      allDone = false;
    }

    if (allDone) {
      options.finishText ? (DisplayTips(options.finishText)) : null;
      options.timer ? (clearInterval(options.timer)) : null;
      // 更新集群状态
      setTimeout(function () {
        getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
        !pgError && ( $_modal.modal('hide') );
      }, 2e3)
    }

  };

  /**
   * [执行集群运维操作 开启/关闭]
   * @param {[String]} action [执行的操作]
   */
  var clusterMaintenanceAction = function ($modal, action) {
    $modal.find('.modal-header').LoadData('show');
    addWaitMask();
    var requestAction = (action == 'start') ? 'maintenanceStart' : 'maintenanceStop';
    var failText = (action == 'start') ? lang.maintenance.enter_maintenance_mode_fail : lang.maintenance.exit_maintenance_mode_fail;
    var successText = (action == 'start') ? lang.maintenance.enter_maintenance_mode_success : lang.maintenance.exit_maintenance_mode_success;
    var processText = (action == 'start') ? lang.maintenance.enter_maintenance_mode_process : lang.maintenance.exit_maintenance_mode_process;
    var para = {
      area: 'cluster',
      ipaddr: window.location.hostname
    };
    var isBreak = false;

    // 发送操作请求
    $modal.find('.modal-header').LoadData('show');
    DataModel[requestAction](para, function (rsp) {
      $modal.find('.modal-header').LoadData('hide');
      removeWaitMask();
      if (rsp.code == 200) {
        DisplayTips(processText);
        setTimeout(function () {
          getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
        }, 2e3);
      }else {
        isBreak = true;
        DisplayTips(rsp.result || failText);
      }
    }, true, null);

    // 发送查询请求
    setTimeout(function () {

      showModalStepLoadding($modal, true);

      clusterMaintenanceTimer = setInterval(function () {
        getMaintenanceClusterProcess(function () {
          updateMaintenanceStep($modal, {process: state.clusterMaintenanceStatus}, {timer: clusterMaintenanceTimer, finishText: successText, isBreak: isBreak});
        });
      }, 5e3);

      var tempTimer = setTimeout(function () {
        clearInterval(clusterMaintenanceTimer);
      }, 60e3);

    }, 2e3)
  };


  // MAIN //
  //   |
  //   |
  //   |
  //   |
  //   |
  //   |

  // 1. 获取集群服务状态列表
  getDataMigraStatus();
  getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
  getMaintenanceClusterProcess();
  //   |
  //   |
  //   |
  //   |
  //   |
  //   |
  // MAIN //



  /* ************************* 浏览器事件注册 ************************* */

  $(document)
  // 数据迁移开关
  .on('click', '#dataMigraSwitch', function (ev) {
    if (state.dataMigraSwitch == 'off') {
      setDataMigraStatus('on');
    }else if(state.dataMigraSwitch == 'on') {
      setDataMigraStatus('off');
    }else if (state.dataMigraSwitch == 'error') {
      DisplayTips(lang.maintenance.re_get_datamigra_status)
      getDataMigraStatus();
    }
  })

  // 集群进入维护模式
  .on('click', '.m-cluster-maintenance', function (ev) {
    $('#cluserMaintenanceModal').modal('show');
    $('#cluserMaintenanceModal').data('action', 'start');
    toggleMaintenanceClusterModal('start');
  })

  // 关闭集群维护模式
  .on('click', '.m-cluster-start', function (ev) {
    $('#cluserMaintenanceModal').modal('show');
    $('#cluserMaintenanceModal').data('action', 'stop');
    toggleMaintenanceClusterModal('stop');
  })

  // 执行集群运维操作 开启/关闭
  .on('click', '#cluserMaintenanceModal .btn-danger', function (ev) {
    var $modal = $('#cluserMaintenanceModal');
    var action = $modal.data('action');
    // 开始读取集群维护模式状态
    clusterMaintenanceAction($modal, action);
  })
  // 关闭集群
  .on('click', '.m-close-cluster', function (ev) {
    $('#clusterShutdownModal').modal('show');
  })

  // 节点关闭服务
  .on('click', '.m-nodelist-op .close-service', function (ev) {
    var $modal;
    if (serviceCloseNode) {
      $modal = $('#nodeCloseServiceBanModal');
      $modal.data('hostname', $(this).parent().data('hostname'))
      var tip = lang.maintenance.node + serviceCloseNode + lang.maintenance.node_close_service_ban;
      $modal.find('.tips').text(tip);
    }else {
      $modal = $('#nodeCloseServiceModal');
      $modal.data('ipaddr', $(this).parent().data('ipaddr'))
      $modal.data('hostname', $(this).parent().data('hostname'))
    }
    $modal.modal('show');
  })
  .on('click', '#nodeCloseServiceModal .btn-danger', function (ev) {
    $modal = $('#nodeCloseServiceModal');
    var para = {
      ipaddr: $modal.data('ipaddr'),
      hostname: $modal.data('hostname'),
      area: 'node',
    };
    resetMaintenanceStep($modal);
    nodeStopService($modal, para);

  })
  // 节点开启服务
  .on('click', '.m-nodelist-op .start-service', function (ev) {
    $modal = $('#nodeStartServiceModal');
    $modal.data('ipaddr', $(this).parent().data('ipaddr'))
    $modal.modal('show');
  })
  .on('click', '#nodeStartServiceModal  .btn-danger', function (ev) {
    $modal = $('#nodeStartServiceModal');
    var para = {
      ipaddr: $modal.data('ipaddr'),
      area: 'node'
    };
    resetMaintenanceStep($modal);
    nodeStartService($modal, para);

  })

  // 关闭节点
  .on('click', '.m-nodelist-op .node-shutdown', function (ev) {
    var $modal;
    $modal = $('#nodeShutdownModal');
    $modal.data('ipaddr', $(this).parent().data('ipaddr'));

    $modal.modal('show');
  })

  // 节点关机
  .on('click', '#nodeShutdownModal .btn-danger', function (ev) {

    $modal = $('#nodeShutdownModal');
    var para = {
      ipaddr: $modal.data('ipaddr')
    };
    nodeShutdown($modal, para);
	})

  // 重启节点弹窗
  .on('click', '.m-nodelist-op .node-reboot', function (ev) {
    var $modal = $('#nodeRebootModal');
    $modal.data('ipaddr', $(this).parent().data('ipaddr'));
    $modal.modal('show');
  })

  // 节点重启
  .on('click', '#nodeRebootModal .btn-danger', function (ev) {
    var $modal = $('#nodeRebootModal');
    var para = {
      ipaddr: $modal.data('ipaddr')
    }
    nodeReboot($modal, para);
  })

  // .on('mouseover', '.abnormal-tips-container', function (ev) {
  //   $(this).find('.abnormal-serv-tips').removeClass('hidden');
  // })
  // .on('mouseout', '.abnormal-tips-container', function (ev) {
  //   $(this).find('.abnormal-serv-tips').addClass('hidden');
  // })
  .on('click', '#maintainRefresh', function (ev) {
    getMaintenanceClusterStatus(renderMaintenanceClusterStatus);
  })

})
