$(function (ev) {
    var backupDgData = [];  // 磁盘组备份数据 -- 用于dg数据的编辑更新操作
    var originDgData = {}; // 第一次获取的磁盘组原始数据 -- 用于恢复未完成编辑而损坏的dg数据
    var hasEdit = false;  // 当前是否已经被编辑
    var hostdiskData;
    var hostdiskCode;
    var hostdiskMsg;
    var dgnamearr = [];
    var listLoaded = false;
    var allStorages = [];
    var totaldgnamearr = [];
    var pooldgnamearr = [];
    var addlevelarr = [];
    var addavailarr = [];
    var exitdisknum = [];
    var trashFn;  // 公用删除方法
    var basicLevel; // 允许编辑的层级
    var make, makeTree, makeTreeEdit;  // 创建树 -- fn
    var nowEditExitLevel = [];  // 记录某个磁盘组编辑的时候自定义层级的情况
    var nowEditExitLevelRender; // 根据自定义层级渲染页面''
    var nowCreateExitLevelRender;
    var isDgLoad = false, isDiskDetailLoad = false, toggleTimer, isDiskDetailTimer;
    var poolStatusCheckTimer;  // 1分钟检测一下存储池状态，用于判断是否能更改故障域操作
    var htmln = '';

    $('#pool-mgm-act').next().css('display', 'block');
    var dgrankarr=['datacenter','room','rack','chassis','host','disk'];
    var addLevelMap = {  // 添加层级按钮
      datacenter: '<div class="col-sm-12 js-add-level datacenter" data-level="datacenter" style="line-height:24px;;margin-left: 30px"><a style="float:left;color: #0c7fc1">+'+lang.storage.add +lang.storage.datacenter+'</a></div>',
      room: '<div class="col-sm-12 js-add-level room" data-level="room" style="line-height:24px;;margin-left: 60px"><a style="float:left;color: #0c7fc1">+'+lang.storage.add +lang.storage.room+'</a></div>',
      rack: '<div class="col-sm-12 js-add-level rack" data-level="rack" style="line-height:24px;;margin-left: 90px"><a style="float:left;color: #0c7fc1">+'+lang.storage.add +lang.storage.rack+'</a></div>',
      chassis: '<div class="col-sm-12 js-add-level chassis" data-level="chassis" style="line-height:24px;;margin-left: 120px"><a style="float:left;color: #0c7fc1">+'+lang.storage.add +lang.storage.chassis+'</a></div>',
      host: '<div class="col-sm-12 js-add-level host" data-level="host" style="line-height:24px;;margin-left: 150px"><a style="float:left;color: #0c7fc1">'+lang.storage.add +lang.storage.host+'</a></div>'
    }

    //列举每个节点下磁盘的详细信息
    var dataDiskByType = '';
    var diskcallback = function (result) {
        // 磁盘已经载入标志
        isDiskDetailLoad = true;

        hostdiskCode = result.code;
        $('#createStoragepoolModal').find('.modal-header').LoadData('hide');
        if (result == undefined)
            return;
        if (result.code == 200) {
            hostdiskData = result.result;
            for (var i = 0; i < $('.storage-pool-detail').length; i++) {
                var disknum = $('.storage-pool-detail:eq(' + i + ')');
                var rowlength = disknum.find('.js-subdiskmgm-row').length;
                disknum.find('.diskBadge').html(rowlength);
            }
        } else {
            hostdiskMsg = result.result;
        }
    }
    $('.bs-disk-grid').css('display', 'block');
    $('.bs-docs-grid').css('display', 'none');
    $('.dt_g_left_bar .active >ul>li.sub-menu:first').addClass('active');
    $('.dt_g_left_bar .active:first').addClass('activel').removeClass('active');
    $('.bottom-icons-act').removeClass('hidden').attr('title',lang.storage.create_diskgroup).children().removeClass('js-create-stpool').addClass('js-create-dg');
    //DG列表
    var para;
    para = {
        'name': '',
        'detail': 'yes'
    };
    var callback = function (result) {
        listLoaded = true;
        if(!Number(localStorage.poolfresh)) {
          $('.dt_g_right_subdiv_second').LoadData('hide');
        }
        if (result == undefined)
            return;
        if (result.code == 200) {

            backupDgData = JSON.parse(JSON.stringify(result.result));

            // 取消层级标识
            backupDgData.forEach(formatLevelDiskgroup.undo);

            originDgData = JSON.parse(JSON.stringify({
              code: 200,
              result: backupDgData
            }));

            makeTree = function (parentObj, treeJson, dgname) {
                var ulObj = $("<ul style='font-size: 14px'></ul>");
                for (var i = 0; i < treeJson.length; i++) {
                    var childHtml = '<li class="'+treeJson[i].type+'show">';
                    if(treeJson[i].type == 'disk'){
                        if( treeJson[i].detail != undefined){
                            var diskstr = treeJson[i].name + ' (ID:' + treeJson[i].detail.id + ' Path:' + treeJson[i].detail.usage.device + ')';
                        }else{
                            var diskstr = treeJson[i].name
                        }
                        var aHtml = '<a style="color:#5a5b5c">' + '<span class="glyphicon glyphicon-hdd"></span>&nbsp;' + formatDiskGroup(treeJson[i].type) + '</a>&nbsp;<span>' +diskstr+'</span>'
                    }else if(treeJson[i].type == 'root'){
                        var aHtml = '';
                    }else{
                        var aHtml = '<span class="caretdg"></span><a style="color:#5a5b5c">' + formatDiskGroup(treeJson[i].type) + '</a>&nbsp;<span>' + treeJson[i].name + '</span>'
                    }
                    childHtml += aHtml;
                    childHtml += '</li>';
                    var childObj = $(childHtml);
                    if (treeJson[i].items != null && treeJson[i].items.length > 0) {
                        makeTree(childObj, treeJson[i].items, dgname);
                    }
                    $(ulObj).append(childObj);
                }
                $(parentObj).append($(ulObj));
            };
           // removeArray =  ['host','disk'];
           basicLevel = ['host','disk'];
            makeTreeEdit = function (parentObj, treeJson, dgname) {
                for (var i = 0; i < treeJson.length; i++) {
                    var childHtml = '';
                    var aHtml= ''
                    var diskstr = '';
                    var maginlevel = 30*levelToRank(treeJson[i].type)+30;
                    var glyphicon = treeJson[i].type
                    if(treeJson[i].type == 'disk' && treeJson[i].detail != undefined){
                        var index = treeJson[i].detail.usage.device.lastIndexOf("\/");
                        var strname  = treeJson[i].detail.usage.device.substring(index + 1, treeJson[i].detail.usage.device.length);
                        diskstr = strname + '(' + treeJson[i].detail.usage.type.toUpperCase() + ',' + formatCapacityKB(treeJson[i].detail.usage.size) + ')';
                        aHtml += '<div class="col-sm-12 js-add-level '+treeJson[i].type+'" data-level="'+treeJson[i].type+'" style="line-height:24px;;margin-left: '+maginlevel+'px">'+
                            '<a style="float:left;color: #0c7fc1">+'+lang.wizard.add+''+formatDiskGroup(treeJson[i].type)+'</a>'+
                            '</div>'+
                            '<span class="col-sm-12 '+treeJson[i].type+'-list" style="line-height:24px;margin-left: '+maginlevel+'px">'+
                            '<span style="margin-left:10px" data-mark="'+treeJson[i].type+'" data-name="'+treeJson[i].name+'" class="js-level-mark '+treeJson[i].type+'-name">'+diskstr+'</span>'+
                            '<span class="glyphicon glyphicon-pencil '+((basicLevel.indexOf(treeJson[i].type) >= 0) ? 'hidden' : '') + '" style="margin-left:10px;cursor:pointer;" data-edit="yes"></span>'+
                            '<span class="glyphicon glyphicon-trash" style="margin-left:10px;cursor:pointer;color: red"></span>'+
                            '</span>'
                    }else if(treeJson[i].type == 'root'){
                        var aHtml = '';
                    }else{
                        aHtml += '<div class="col-sm-12 js-add-level '+treeJson[i].type+'" data-level="'+treeJson[i].type+'" style="line-height:24px;;margin-left: '+maginlevel+'px">'+
                            ( '<a style="float:left;color: #0c7fc1">+'+lang.wizard.add+''+formatDiskGroup(treeJson[i].type)+'</a>')+
                            '</div>'+
                            '<span class="col-sm-12 '+treeJson[i].type+'-list" style="line-height:24px;;margin-left: '+maginlevel+'px">'+
                            '<span class="caretdgadd"></span><span style="margin-left:10px" data-mark="'+treeJson[i].type+'" data-name="'+treeJson[i].name+'" class="js-level-mark '+treeJson[i].type+'-name">'+treeJson[i].name.replace(dgname+'_', '')+'</span>'+
                            ( '<span class="glyphicon glyphicon-pencil '+((basicLevel.indexOf(treeJson[i].type) >= 0) ? 'hidden' : '') + '" style="margin-left:10px;cursor:pointer;" data-edit="yes"></span><span class="glyphicon glyphicon-trash" style="margin-left:10px;cursor:pointer;color: red;"></span>') +
                            '</span>'
                    }
                    childHtml += aHtml;
                    var childObj = $(childHtml);
                    htmln += childHtml
                    if (treeJson[i].items != null && treeJson[i].items.length > 0) {
                        makeTreeEdit(childObj, treeJson[i].items, dgname);
                    }
                }
            };

            /* ------------------- 生成编辑树和结构树 ------------------- */

              var htm='<div class="row show-grid grid js-masonry">';
              for (var n = 1; n < result.result.length; n++) {
                htm += '<div class="col-xs-12 col-md-5 col-lg-6  box-shadow grid-item grid-item-style spool-diskinfo-list">' +
                '<div class="basic_header">' +
                '<img src="css/image/obj_storage.png">' +
                '<span class="diskgroup-name">' + result.result[n].name + '</span>' +
                '<span class="c_right c_basic_right fl-rt hidden">' +
                '<a class="del_disk_group" data-title="' + result.result[n].name + '" title="' + lang.delete + '">' +
                '<img src="css/image/delete.png" style="width:43px" class="test">' +
                '</a>' +
                '<a class="fl-rt js-expand-capacity-spool edit-htm"  data-title="' + result.result[n].name + '" title="' + lang.edit + '">' +
                '<img src="css/image/edit.png" style="width:43px" class="test">' +
                '</a>' +
                '<a class="fl-rt js-copy-capacity-spool edit-htm"  data-title="' + result.result[n].name + '" title="' + lang.copy + '">' +
                '<img src="css/image/copy.png" style="width:43px" class="test">' +
                '</a>' +
                '</span>' +
                '</div>' +
                '<div class="basic_content_listu basic_content" style="font-size:14px; color: #5a5b5c">' +
                '<div>' +
                '<div style="margin-bottom:10px; color: black; padding-left: .5rem; border-left: solid 4px #31aaf7">' + lang.storage.dg_level + '</div>' +
                '<div style="margin-bottom:20px; padding-left: 10px;word-break:break-all" class="dglist-level" data-dglevel="' + result.result[n].name + '"></div>' +
                '<div style="margin-bottom:10px; color: black; border-left: solid 4px #31aaf7; padding-left: .5rem">' + lang.storage.dg_level_detail + '</div>' +
                '<div class="basic_content_listm">' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>'
              }
              htm+='</div>';
              $('.bs-disk-grid').html(htm);



              for (var n = 1; n < result.result.length; n++) {
                var parentObj = $('.spool-diskinfo-list:eq(' + (n-1) + ') .basic_content_listm');
                var ary = [];
                ary.push( formatLevelDiskgroup.undo(result.result[n]) );

                makeTree($(parentObj), ary, result.result[n].name);

                $('.rootshow:eq('+(n-1)+')').children().children().children('ul').addClass('hidden');
                $('.basic_content_listm').children().css({'padding-left':0,'margin-left':0}).children().children().css({'padding-left':0,'margin-left':0});
                htmln= '' ;

                makeTreeEdit($(parentObj), ary, result.result[n].name);

                $('.spool-diskinfo-list:eq(' + (n-1) + ') .edit-htm').data('htmln',htmln);
                $('.spool-diskinfo-list:eq(' + (n-1) + ') .copy-htm').data('htmln',htmln);
                var str = '';
                var strfaultdomain = '';
                for(var i=0;i<6;i++){
                  if($('.spool-diskinfo-list:eq('+(n-1)+') .'+dgrankarr[i]+'show').length!= 0){
                    str = str+''+formatDiskGroup(dgrankarr[i])+'';
                    var showlength = $('.spool-diskinfo-list:eq('+(n-1)+') .'+dgrankarr[i]+'show').length;
                    str = str+'('+showlength+')'+' ';
                    strfaultdomain = strfaultdomain + dgrankarr[i] + ','
                  }
                }
                if(str == ''){
                  str = '-';
                }
                strfaultdomain = strfaultdomain.substr(0,strfaultdomain.length-1)
                $('.dglist-level:eq('+(n-1)+')').text(str);
                $('.dglist-level:eq('+(n-1)+')').data('strfaultdomain',strfaultdomain)
              }


                for (var m = 0; m < $('.spool-diskinfo-list span').length; m++) {
                  dgnamearr.push($('.spool-diskinfo-list span:eq(' + m + ')').text())
                }
                for (var i = 0; i < dgnamearr.length; i++) {
                  if (dgnamearr[i] == "" || typeof(dgnamearr[i]) == "undefined") {
                    dgnamearr.splice(i, 1);
                    i = i - 1;
                  }
                }
                for (var j = 0; j < $('.basic_header .diskgroup-name').length; j++) {
                  totaldgnamearr.push($('.basic_header .diskgroup-name:eq(' + j + ')').text())
                  if($('.basic_header:eq(' + j + ')').parent().find('.diskshow').text() == ''){
                    pooldgnamearr.push($('.basic_header .diskgroup-name:eq(' + j + ')').text());
                  }
                }

              var callback = function (result) {
                $('.grid').masonry({
                  itemSelector: '.grid-item',
                  columnWidth: '.col-lg-6',
                  percentPosition: true,
                });
                for(var i= 0;i<result.result.count;i++){
                  for(var j= 0;j<$('.hostshow').length;j++){
                    if ($('.hostshow:eq('+j+') span:eq(1)').text().indexOf(result.result.nodes[i].hostname) >= 0) {
                      $('.hostshow:eq('+j+') span:eq(1)').text($('.hostshow:eq('+j+') span:eq(1)').text() + '('+result.result.nodes[i].ip+')')
                    }
                  }
                }


                if (localStorage.poolfresh == 1) {
                  // localStorage.poolfresh = 0;
                  $('.dt_g_left_bar .activel >ul>li.sub-menu:last').trigger('click');
                }else {

                  // 展开树
                  $('.spool-diskinfo-list').each(function () {
                    $(this).find(' .basic_content_listm > ul > li > ul > li').each(function () {
                      $(this).find(' > .caretdg').click();
                    })
                  })

                }
              }
              isDgLoad = true;
              DataModel['listNode'](null, callback, true, null);

        }
        else {
            // DisplayTips(result.result)
        }
    }

    if (!Number(localStorage.poolfresh)) {
      $('.dt_g_right_subdiv_second').LoadData('show');
    }
    DataModel['listDiskgroup'](para, callback, true, null);


    /* ************************* nojsja - 磁盘组编辑和创建重构代码 ************************* */

    /**
     * [生成编辑树结构]
     */
    var makeAllTree = function (result, dgname) {

      for (var n = 1; n < result.result.length; n++) {
        if (result.result[n].name !== dgname) continue;

        var parentObj = $('.spool-diskinfo-list:eq(' + (n-1) + ') .basic_content_listm');

        var ary = [];
        ary.push(result.result[n]);

        htmln= '' ;
        makeTreeEdit($(parentObj), ary, result.result[n].name);

        $('.spool-diskinfo-list:eq(' + (n-1) + ') .edit-htm').data('htmln',htmln);
        $('.spool-diskinfo-list:eq(' + (n-1) + ') .copy-htm').data('htmln',htmln);

        // 重新渲染数据
        $modal = $('#expandCapacityModal');
        $modal.find('.create-level').empty();
        $modal.find('.create-level').html(
          '<label id="level-name" class="col-sm-4 control-label left">〉'+lang.storage.create_topology+'</label>' +
          '<div class="col-sm-4 clear-wrapper" style="text-align: right;"><span title="'+lang.storage.clear_level+'" style="color:#3e8ce7" id="clearLevelCopy">'+lang.storage.clear+'</span></div>'
        );
        $modal.find('.create-level').append(htmln);

        var str = '';
        var strfaultdomain = '';
        for(var i=0;i<6;i++){
          if($('.spool-diskinfo-list:eq('+(n-1)+') .'+dgrankarr[i]+'show').length!= 0){
            str = str+''+formatDiskGroup(dgrankarr[i])+'';
            var showlength = $('.spool-diskinfo-list:eq('+(n-1)+') .'+dgrankarr[i]+'show').length;
            str = str+'('+showlength+')'+' ';
            strfaultdomain = strfaultdomain + dgrankarr[i] + ','
          }
        }
        if(str == ''){
          str = '-';
        }
        strfaultdomain = strfaultdomain.substr(0,strfaultdomain.length-1)
        $('.dglist-level:eq('+(n-1)+')').text(str);
        $('.dglist-level:eq('+(n-1)+')').data('strfaultdomain',strfaultdomain);


        // edit modal ------------
        var that;
        $('.spool-diskinfo-list').each(function (i,item) {
          if ($(item).find('.diskgroup-name').text() == dgname) {
            that = $(item).find('.js-expand-capacity-spool');
          }
        });

        updateEditModal(that);
      }
    }

    /**
     * [rollBackDiskgroup 点击取消和验证失败时回滚diskgroup数据]
     * @param {[String]} dgName [需要回滚数据的磁盘组名字]
     */
    var rollBackDiskgroup = function (dgName) {
      backupDgData, originDgData;
      for (var i = 0; i < backupDgData.length; i++) {
        if (backupDgData[i].name == dgName) {
          for (var j = 0; j < originDgData.result.length; j++) {
            if (originDgData.result[j].name == dgName ) {
              backupDgData[i] = JSON.parse( JSON.stringify(originDgData.result[j]) );
              break;
            }
          }
          break;
        }
      }
    };

    /**
     * [checkCreateLevelData 创建磁盘组检查层级数据是否添加完了]
     * @return {[Bool]}
     */
    var checkCreateLevelData = function () {
      var $modal = $('#createDiskGroupModal');
      var isOK = true;  // 合法

      // $modal.find('.click-diskgroup-level').each(function () {
      //   if (!$(this).find('span').hasClass('hidden')) {
      //     allLevels.push($(this).data('level'));
      //   }
      // });

      $modal.find('.js-add-level').each(function () {
        var levelName = $(this).data('level');
        if (!$(this).next().hasClass(levelName+'-list')) {
          isOK = false;
        }
      });

      return isOK;
    };


    /**
     * [renderDiskgroup 将保存的磁盘组数据渲染到页面上(复用make方法)]
     * @param {[String]} dgname [磁盘组名字]
     */
    var renderDiskgroup = function (dgname) {
      backupDgData;  // data
      makeAllTree({result: backupDgData}, dgname);  // render
      nowEditExitLevelRestore();

      var isCopy = $('#expandCapacityModal').data('copy') == 'yes';
      if (!isCopy) {
        $('#expandCapacityModal').find('.glyphicon-pencil').addClass('hidden');
        $modal.find('#clearLevelCopy').addClass('hidden');
      }else {
        checkCopyToplogyEmpty();
      }
    };

    /**
     * [磁盘组创建时生成高性能和普通性能组模板]
     * @param  {[String]} performance [性能组别]
     * @param  {[Array]} disksData   [所有磁盘数据]
     */
    var createDiskgroupTemplate = function (performance, hostDiskData) {
      var $modal = $('#createDiskGroupModal');
      // 清除缓存
      $modal.find('.create-level-host').remove();
      $('#clearLevel').click();

      var diskType = performance == 'general' ? 'hdd' : 'ssd';
      var diskHtml = '<div class="form-group create-level-host">'+
                        '<div class="col-sm-12 host markhost" data-level="host" style="line-height:24px;;margin-left: 150px;margin-top: -15px">'+
                        '<a style="float:left;color: #0c7fc1">+'+lang.disk.add_host+'</a>'+
                      '</div>';

      if (!hostDiskData || !hostDiskData.length) {
        return;
      }

      function renderHtml(hostname, ip, diskdata, isLast) {
        var html = '';

        if (!hostname || !ip || !diskdata.length) {
          return '';
        }

        html += '<span class="col-sm-12 host-list" style="line-height:24px;;margin-left:150px">'+
                  '<span class="caretdgadd"></span>'+
                  '<span style="margin-left:10px" data-mark="host" data-name="'+hostname+'" class="js-level-mark host-name">'+(hostname+"("+ip+")")+'</span>'+
                  '<span class="glyphicon glyphicon-trash" style="margin-left:10px;cursor:pointer;color: red;"></span>'+
                '</span>';
        if (isLast) {
          html += '<div class="col-sm-12 disk markdisk" data-level="disk" style="line-height:24px;;padding-left:15px;margin-left: 180px">'+
                    '<a style="float:left;color: #0c7fc1">'+lang.disk.add_disk+'</a>'+
                  '</div>';
        }else {
          html += '<div class="col-sm-12 disk" data-level="disk" style="line-height:24px;;padding-left:15px;margin-left: 180px">'+
                    '<a style="float:left;color: #0c7fc1">'+lang.disk.add_disk+'</a>'+
                  '</div>';
        }

        diskdata.forEach(function (disk) {
          var disksizehtml = disk.usage.device.split('dev/').pop()+"("+disk.usage.type+","+formatCapacityKB(disk.usage.size)+")";
          html += '<span class="col-sm-12 disk-list" style="line-height:24px;;padding-left:15px;margin-left: 180px">'+
                    '<span style="margin-left:10px" data-mark="disk" data-name="'+disk.id+'" class="js-level-mark disk-name">'+disksizehtml+'</span>'+
                    '<span class="glyphicon glyphicon-trash" style="margin-left:10px;cursor:pointer; color: red;"></span>'+
                  '</span>';
        });

        return html;
      }

      var isFoundSSD = false;
      // 构造html
      hostDiskData.forEach(function (host, i) {
        var ip = host.ip,
        isLast = i == hostDiskData.length - 1;
        hostname = host.hostname,
        disks = host.all.filter(function (disk) {
          return disk.usage.type === diskType;
        });
        (disks.length) && (diskType == 'ssd') && (isFoundSSD = true);
        diskHtml += renderHtml(hostname, ip, disks, isLast);
      });

      diskHtml += '</div>';

      // 添加到页面上
      $modal.find('form').append($(diskHtml));
      // ssd提示
      (diskType == 'ssd') && (!isFoundSSD) && (DisplayTips(lang.storage.ssd_not_found));
      // 更新按钮状态
      checkTopologyEmpty();
    };

    /**
     * [检查各个分支的拓扑结构是否相同，且都要包含host-disk层级]
     * @param  {[Object]} diskgroup        [需要检测的磁盘组数据结构]
     * @param  {[Array]} nowEditExitLevel [当前所有选中的层级]
     * @return {[Bool]}                  [是否合法]
     */
    var checkDiskgroup = function (diskgroup, nowEditExitLevel) {

      var legal = true;
      nowEditExitLevel.unshift('root');

      function roll(dg) {
        if (dg.type !== 'disk' && dg.items.length === 0) {
          legal = false;
        }
        if (legal && dg.items && dg.items.length) {
          if ( (nowEditExitLevel.indexOf(dg.items[0].type) - 1) !== (nowEditExitLevel.indexOf(dg.type)) ) {
            // (dg.type !== 'root') && (legal = false);
            legal = false
          }
          legal && dg.items.forEach(function (dgitem, i) {
            roll(dgitem);
          });
        }
      }

      roll(diskgroup);

      return legal;
    }

    /**
     * [拿到一个已用的dg数据并引用]
     * @param  {[Object]} data   [总的diskgroup数据]
     * @param  {[String]} dgname [磁盘组名]
     */
    var pickOneDiskgroup = function (data, dgname) {
      var diskgroup;
      data.length && data.forEach(function (item) {
        if (item.name === dgname) {
          diskgroup = item;
        }
      })
      return diskgroup;
    };

    /**
     * [复制磁盘组的时候更新清除按钮状态]
     */
    var checkCopyToplogyEmpty = function () {
      var $modal = $('#expandCapacityModal');
      var $button = $modal.find('#clearLevelCopy');
      var isEmpty = true;

      // 检测
      var dgname = $modal.find('.root-name').val();
      var checkDg = pickOneDiskgroup(backupDgData, dgname);
      if (checkDg.items && checkDg.items.length) {
        isEmpty = false;
      }

      if (isEmpty) {
        $button.parent().append($('<span title="'+lang.storage.clear_level+'" style="color:grey" id="clearLevelCopy">'+lang.storage.clear+'</span>'))
        $button.remove();
      }else {
        $button.parent().append($('<span title="'+lang.storage.clear_level+'" style="color:#4ca4e4" id="clearLevelCopy">'+lang.storage.clear+'</span>'))
        $button.remove();
      }

    };

    /**
     * [创建磁盘组的时候更新清除按钮状态]
     */
    var checkTopologyEmpty = function () {
      var $modal = $('#createDiskGroupModal');
      var $button = $modal.find('#clearLevel');
      var levels = ['datacenter', 'room', 'rack', 'chassis', 'host', 'disk'];
      var isEmpty = true;
      var length = 0;
      levels.forEach(function (level) {
        length = $modal.find('.'+level+'-list').length;
        if (length) {
          isEmpty = false;
        }
      })
      if (isEmpty) {
        $button.parent().append($('<span title="'+lang.storage.clear_level+'" style="color:grey" id="clearLevel">'+lang.wipe+'</span>'))
        $button.remove();
      }else {
        $button.parent().append($('<span title="'+lang.storage.clear_level+'" style="color:#4ca4e4" id="clearLevel">'+lang.wipe+'</span>'))
        $button.remove();
      }
    }

    /**
     * [formatLevelDiskgroup 格式化磁盘组数据添加和撤销level标识]
     * @return  {[Function]} undo        [添加层级标识]
     * @return  {[Function]} do        [撤销层级标识]
     */
    var formatLevelDiskgroup = (function () {
      var handleLevel = {
        root: 0, datacenter: 1, room: 1, rack: 1, chassis: 1, host: 1, disk: 0,
      };
      var dgname = '';

      // 去掉磁盘组磁盘级冗余数据
      function clearDisk(diskgroup, isItemsHide) {
        var roll = function (dg) {
          if (dg.type == 'disk') {
            delete dg.detail;
            dg.items = [];
            isItemsHide && (delete dg.items);
          }else {
            dg.items && dg.items.length && dg.items.forEach(roll);
          }
        };

        diskgroup && roll(diskgroup);
        return diskgroup;
      }

      // 添加层级标识
      function _do(diskgroup, isAddDgname, isRemoveLevel) {

        var roll = function (dg) {
          if (dg.type === 'root') {
            dgname = dg.name;
          }
          if (handleLevel[dg.type]) {
            dg.name = dg.name.replace(new RegExp((dgname+'_'),'g'), '');
            !isRemoveLevel && ( dg.name = (dg.type + '_') + dg.name );
            isRemoveLevel && (dg.type == 'host') && ( dg.name = (dg.type + '_') + dg.name );
            isAddDgname && ( dg.name = (dgname+'_') + dg.name );
            dg.name;
          }
          dg.items && dg.items.length && dg.items.forEach(roll);
        };

        dgname = '';
        diskgroup && roll(diskgroup);

        return diskgroup;
      }

      // 撤销层级标识
      function undo(diskgroup) {

        var roll = function (dg) {
          if (dg.type === 'root') {
            dgname = dg.name;
          }
          if (handleLevel[dg.type]) {
            dg.name = dg.name.replace((dg.type+'_'), '');
            dg.name = dg.name.replace((dgname+'_'), '');
          }
          dg.items && dg.items.length && dg.items.forEach(roll);
        };

        dgname = '';
        diskgroup && roll(diskgroup);

        return diskgroup;
      }

      return {
        do: _do,
        undo: undo,
        clearDisk: clearDisk
      };
    })();

    /**
     * [编辑和创建的时候统计每个level的名字，用于重复比较，磁盘组编辑和磁盘组创建共用]
     * @return  {[Function]} clear        [清除所有层级统计数据]
     * @return  {[Function]} add        [添加某个层级名字]
     * @return  {[Function]} delete        [添加某个层级名字]
     * @return  {[Function]} checkDiskgroup        [检测给定的磁盘组数据中是否重名]
     *
     */
    var dgLevelMap = (function () {
      var levelMap = { datacenter: {},room: {},rack: {},chassis: {} };

      // 清除所有统计
      function clear() {
        levelMap = { datacenter: {},room: {},rack: {},chassis: {} };
      }

      // 检查名字是否在那个层级map中 -- 创建
      function check(level, name) {
        // if (!levelMap[level]) {
        //   return true;
        // }
        // if (levelMap[level][name]) {
        //   return false;
        // }
        // return true;
        var isOK = true;
        var $allLevelMark = $('#createDiskGroupModal .js-level-mark');

        $allLevelMark.each(function () {
          if ($(this).data('name') == name && $(this).data('mark') == level) {
            isOK = false;
          }
        });

        return isOK;
      }

      // 给出一个磁盘组数据，检查某个层级是否已经存在那个name
      function checkDiskgroup(diskgroup, level, name) {
        var isExists = false;

        var roll = function (dg) {
          if (dg.type === level && dg.name === name) {
            isExists = true;
          }
          !isExists && dg.items && dg.items.length && dg.items.forEach(roll);
        }
        roll(diskgroup);

        return !isExists;
      }

      // 添加统计层级
      function add(level, name) {
        levelMap[level] && (levelMap[level][name] = 1);
      }

      // 删除统计层级
      function _delete(level, name) {
        levelMap[level] && (delete levelMap[level][name]);
      }

      return {
        clear: clear,
        add: add,
        check: check,
        checkDiskgroup: checkDiskgroup,
        delete: _delete
      };

    })();

    /**
     * [磁盘组编辑层级改名]
     * @param  {[type]} dgname [description]
     * @param  {[Object]} item [层级信息]
     *  @param  {[String]} item.name   [新名字]
     *  @param  {[String]} item.old   [老名字]
     *  @param  {[String]} item.type   [层级类型]
     */
    var updateLevelName =  function(dgname, item) {
      var diskgroup;
      backupDgData.forEach(function (data) {
        if (data.name == dgname) {
          diskgroup = data;
        }
      });

      if (diskgroup) {
        function rollFun(data) {
          if (data.name === item.old && data.type === item.type) {
            data.name = item.name;
            return;
          }
          data.items && data.items.length && data.items.forEach(function (level) {
            rollFun(level);
          });
        };
        rollFun(diskgroup);
      }

    };

    /**
     * [编辑时用于界面render后 恢复已选层级数据 防止出现不能添加层级的情况]
     */
    var nowEditExitLevelRestore = function () {
      nowEditExitLevel;

      nowEditExitLevel.forEach(function (level) {
        if ($('.click-diskgroup-level-edit[data-level='+level+']').find('span').hasClass('hidden')) {
          $('.click-diskgroup-level-edit[data-level='+level+']').click();
        }
      });
      if (!$('#expandCapacityModal .js-add-level.host').length) {
        $('#expandCapacityModal .create-level').append($(addLevelMap['host']));
      }
    };

    /**
     * [磁盘组创建时，当只存在一个分支时，如果继续点击删除按钮，可能会导致此层级下的 其它层级添加按钮 一并被删除]
     */
    var nowCreateLevelRestore = function (level) {
      var targetSelector,
      targetListSelector,
      nowCreateExitLevel = [];
      // -- 在界面添加那个level
      // $('#expandCapacityModal .js-add-level.room').remove();
      // $('#expandCapacityModal .room-list').remove();
      for (var i = 0; i < $('#createDiskGroupModal .click-diskgroup-level').length; i++) {
        if( $('#createDiskGroupModal .click-diskgroup-level:eq('+i+')').find('span').hasClass('hidden') ){
          continue;
        }
        nowCreateExitLevel.push($('#createDiskGroupModal .click-diskgroup-level:eq('+i+')').data('level'));
      }

      // 确定添加目标
      for (var i = 0; i < nowCreateExitLevel.length; i++) {
        if(nowCreateExitLevel[i] === level) {
          if (i === 0) {
            targetSelector = '#createDiskGroupModal .create-level-host'
          }else {
            targetSelector = '#createDiskGroupModal .js-add-level.'+nowCreateExitLevel[i-1];
            targetListSelector = '#createDiskGroupModal .'+nowCreateExitLevel[i-1]+'-list';
          }
          break;
        }
      }

      // 添加
      for (var j = 0; j < $(targetSelector).length; j++) {
        if (targetSelector == '#createDiskGroupModal .create-level-host') {
          $(targetSelector).after($(addLevelMap[level]));
        }else {
          if ( $(targetSelector+':eq('+j+')').next().is('span') ){
            $(targetSelector+':eq('+j+')').next().after($(addLevelMap[level]));
          }else {
            $(targetSelector+':eq('+j+')').after($(addLevelMap[level]));
          }
        }
      }

      if (targetListSelector) {
        // 进行添加补全
        for (var k = 0; k < $(targetListSelector).length; k++) {
          if ($(targetListSelector+':eq('+k+')').next().hasClass(level)) continue;
          $(targetListSelector+':eq('+k+')').after($(addLevelMap[level]));
        }
      }

    };

    /**
     * [编辑时删除磁盘组的一个层级]
     * @param  {[String]} dgname [磁盘组名]
     * @param  {[String]} level  [层级]
     */
    var removeDgLevel = function (dgname, level) {
      backupDgData;
      var diskgroup;
      backupDgData.forEach(function (dg) {
        if (dg.name === dgname) {
          diskgroup = dg;
        }
      });

      if (diskgroup) {
        function rollFun(dglevel) {
          var isFound = false;
          var levelArray = [];
          if (!dglevel.items) return;

          for (var w = 0; w < dglevel.items.length; w++) {
            if (dglevel.items[w].type === level) {
              isFound = true;
              levelArray = levelArray.concat(dglevel.items[w].items);
            }else {
              rollFun(dglevel.items[w]);
            }
          }
          (isFound) && (dglevel.items = levelArray);
        }

        rollFun(diskgroup);
      }

    };


    /**
     * diskgroupEditDelete [本地更新磁盘组编辑数据 -- 删除]
     * @param  {[String]} dgName    [磁盘组名字]
     * @param  {[String]} itemName  [需要更新的item名字，add动作操作子级items，delete动作操作本级]
     * @param  {[String]} itemLevel [item级别(host/disk/...)]
     */
    var diskgroupEditDelete = function (dgName, itemName, itemLevel) {
      var dgData, isFound = false;
      for (var i = 0; i < backupDgData.length; i++) {
        if (backupDgData[i].type == 'root' && backupDgData[i].name == dgName) {
          dgData = backupDgData[i];
          break;
        }
      }

      // 更新数据/数据验证 -- 不允许存在层级不带host-disk层级的情况、磁盘组最少层级root-host-disk
      var checkedLevel = ['datacenter','room','rack','chassis'];
      var checkMark = 0;
      function rollFun(data) {
        if (data.items && data.items.length) {
          for (var j = 0; j < data.items.length; j++) {
            if (data.items[j].name == itemName && data.items[j].type == itemLevel) {
              // 更新数据
              data.items.splice(j, 1);
              j--;
              isFound = true;

              break;
            }
          }
        }

        !isFound && data.items && data.items.forEach(function (item) {
            rollFun(item);
        });
      }
      // get into rollFun
      if (dgData) {
        rollFun(dgData);
      }
    };


    /**
     * [更新编辑时的 新增磁盘组层级数据 到缓存数据]
     * @param  {[String]} dgname [磁盘组名]
     * @param  {[Object]} tData  [目标数据]
     */
    var addCheckdataToBackup = function (dgname, tData) {
      var diskgroup;  // 当前磁盘组
      var nowCheckItem;  // 当前检查项
      backupDgData;  // 所有磁盘组缓存数据

      // 字符串转化obj
      tData = JSON.parse(tData);
      // 确定磁盘组
      backupDgData.forEach(function (item) {
        if (item.name == dgname) {
          diskgroup = item;
        }
      });

      /**
       * [检测添加结构是否是disk，disk级需要补全diskdetail信息[listDetailBytype]]
       * @param {[Array]} hostdiskData [所有主机和磁盘的详细数据]
       */
      (function diskCheck(checkData, hdData, dgname) {
        var targetDisk, target;

        function rollCheck(father, data) {
          if (data.type !== 'disk') {
            data.items && data.items.length && data.items.forEach(function (item) {
              rollCheck(data.name, item);
            });
          }else {
            if (!data.detail) {
              targetDisk = data.name;
              target = data;
              hdData && hdData.forEach(function (hdItem) {
                if (hdItem.hostname == father.replace(dgname+'_', '') ) {
                  hdItem.all && hdItem.all.forEach(function (disk) {
                    if (disk.id == targetDisk) {
                        target.detail = JSON.parse(JSON.stringify(disk));
                    }
                  });
                }
              });
            }
          }
        }
        rollCheck('', checkData);

      })(tData, hostdiskData, dgname);

      // 递归对比每一级的数据 -- 用于更改当前树数据结构
      if (diskgroup) {

        function rollFun(data) {

          // 插入添加
          if (data.items[0] && data.items[0].type !== nowCheckItem.type) {
            nowCheckItem.items = [].concat(data.items);
            data.items = [nowCheckItem];
            return;
          }

          // 普通添加
          if (!nowCheckItem.items.length) {

            var isFound = false;
            data.items.forEach(function (someItem) {
              if (someItem.name == nowCheckItem.name && someItem.type == nowCheckItem.type) {
                isFound = true;
              }
            });
            (!isFound) && data.items.unshift(nowCheckItem);
            return;
          }

          data.items.forEach(function (item) {
            if (item.name == nowCheckItem.name && item.type == nowCheckItem.type) {

              nowCheckItem = nowCheckItem.items[0];
              rollFun(item);
            }
          });
        }

        nowCheckItem = tData.items[0];
        rollFun(diskgroup);
      }
    };

    /* ------------------- 更新编辑磁盘组模态框 ------------------- */
    var updateEditModal = function (that, isCopy) {
      $modal = $('#expandCapacityModal');
      // $modal.modal('show');
      $('.js-expand-capacity-spool').removeClass('expandactive');
      $(that).addClass('expandactive');
      var htm=$(that).closest('.spool-diskinfo-list').find('.basic_content_listu').html();
      var dgname = $(that).closest('.spool-diskinfo-list').find('.dglist-level').data('dglevel')
      $modal.find('.expand_capacity').html(htm);

      $modal.find('.root-name').val(dgname).addClass('disabled');
      if (!$modal.find('.root-name-copy').val()) {
        $modal.find('.root-name-copy').val(dgname);
      }

      $modal.find('.create-level').html('<label id="level-name" class="col-sm-4 control-label left">〉'+lang.storage.create_topology+'</label>');
      $modal.find('.create-level').
        append($('<div class="col-sm-8 clear-wrapper" style="text-align: right;"><span title="'+lang.storage.clear_level+'" style="color:#4ca4e4" id="clearLevelCopy">'+lang.storage.clear+'</span></div>')).
        append($(that).data('htmln'));

      for(k=0;k<4;k++){
          $modal.find('.click-diskgroup-level span:eq('+k+')').addClass('hidden');
          $modal.find('.click-diskgroup-level:eq('+k+')').removeClass('disabled');
          $modal.find('.click-diskgroup-level-edit span:eq('+k+')').addClass('hidden');
      }
      for(var i=0;i<$modal.find('.create-level .js-add-level').length;i++){
        var name = $modal.find('.create-level .js-add-level:eq('+i+')').data('level');
        if(name == 'datacenter'){
          $modal.find('.click-diskgroup-level span:eq(0)').removeClass('hidden');
          $modal.find('.click-diskgroup-level-edit span:eq(0)').removeClass('hidden');
          $modal.find('.click-diskgroup-level:eq(0)').addClass('disabled');
        }else if(name == 'room'){
          $modal.find('.click-diskgroup-level span:eq(1)').removeClass('hidden');
          $modal.find('.click-diskgroup-level-edit span:eq(1)').removeClass('hidden');
          $modal.find('.click-diskgroup-level:eq(1)').addClass('disabled');
        }else if(name == 'rack') {
          $modal.find('.click-diskgroup-level span:eq(2)').removeClass('hidden');
          $modal.find('.click-diskgroup-level-edit span:eq(2)').removeClass('hidden');
          $modal.find('.click-diskgroup-level:eq(2)').addClass('disabled');
        }else if(name == 'chassis'){
          $modal.find('.click-diskgroup-level span:eq(3)').removeClass('hidden');
          $modal.find('.click-diskgroup-level-edit span:eq(3)').removeClass('hidden');
          $modal.find('.click-diskgroup-level:eq(3)').addClass('disabled');
        }
      }
      var exitlevelarr=[];
      for(var n=0;n<$modal.find('.diskgroup-level .disabled').length;n++){
          exitlevelarr.push(formatToDiskGroup($modal.find('.diskgroup-level .disabled:eq('+n+') input').val()));
      }
      for(var m=0;m<$('#expandCapacityModal .js-level-mark').length;m++){
          var html = '';
          var $mark = $('#expandCapacityModal .js-level-mark:eq('+m+')');
          var position = exitlevelarr.indexOf($mark.data('mark'));
          var nextlevel = $mark.parent().next().data('level')
          for(var j=position;j<exitlevelarr.length;j++) {
              if(j == exitlevelarr.length-1){
                  $mark.parent().after(html);
                  break
              }
              if (nextlevel != exitlevelarr[j + 1]) {
                  if(exitlevelarr[j + 1] != 'disk'){
                      html += '<div class="col-sm-12 js-add-level ' + exitlevelarr[j + 1] + '" data-level="' + exitlevelarr[j + 1] + '" style="line-height:24px;;margin-left: ' + $('.' + exitlevelarr[j + 1] + '').css('margin-left') + '">' +
                          '<a style="float:left;color: #0c7fc1">' + lang.wizard.add + '' + formatDiskGroup(exitlevelarr[j + 1]) + '</a>' +
                          '</div>'
                  }else{
                      html += '<div class="col-sm-12 js-add-level ' + exitlevelarr[j + 1] + '" data-level="' + exitlevelarr[j + 1] + '" style="line-height:24px;;margin-left:180px">' +
                          '<a style="float:left;color: #0c7fc1">' + lang.wizard.add + '' + formatDiskGroup(exitlevelarr[j + 1]) + '</a>' +
                          '</div>'
                  }
              }else {
                  $mark.parent().after(html);
                  break
              }
          }
      }
      for(var k=$('.js-add-level').length-1;k>0;k--) {
          if(levelToRank($('.js-add-level:eq('+k+')').data('level')) <= levelToRank($('.js-add-level:eq('+(k-1)+')').data('level'))){
              $('.js-add-level:eq('+k+')').remove();
          }
      }
      for(var n=$('#expandCapacityModal .disk').length-1;n>=0;n--) {
          if($('#expandCapacityModal .disk:eq('+n+')').prev('.host-list').text() == ''){
              $('#expandCapacityModal .disk:eq('+n+')').remove();
          }
      }
      var html='<div style="margin-bottom:.5rem; padding-left: .5rem;border-left: solid 4px #31aaf7">'+lang.storage.root_name+'：</div>'+
          '<div style="margin-bottom: 1.5rem; padding-left: .5rem">' + dgname + '</div>';
      $modal.find('.dglist-level').prev().before(html);
      var $addlevel = $(that).parent().parent().next();
      DataModel['listDetailBytype'](null, diskcallback, true, null);
      addlevelarr=[];
      for(var i=0;i<$addlevel.find('li').length;i++){
          if(addlevelarr.indexOf($addlevel.find('li:eq(' + i + ')').attr('class')) < 0) {
              addlevelarr.push($addlevel.find('li:eq(' + i + ')').attr('class'))
          }
      }
    }

    /* ************************* nojsja - 磁盘组编辑和创建重构代码 - END ************************* */


    $(document)
        // 磁盘组创建时模板载入
        .on('click', '.create_dg_template', function () {
          var performance = $(this).data('performance');
          var listDiskDetailCallback = function (rsp) {
            $('#createDiskGroupModal .modal-title').LoadData('hide');
            if (rsp.code == 200) {
              createDiskgroupTemplate(performance, rsp.result);
            }
          };

          // listDiskDetailCallback(diskDetailData);
          $('#createDiskGroupModal .modal-title').LoadData('show');
          isDiskDetailTimer = setInterval(function () {
            if (isDiskDetailLoad) {
              clearInterval(isDiskDetailTimer);
              DataModel['listDetailBytype'](null, listDiskDetailCallback, true, null);
            }
          }, 2e3);

        })

        // 复制 -- 针对已有拓扑结构
        .on('click', '.js-copy-capacity-spool', function () {
          $modal = $('#expandCapacityModal');
          $modal.modal('show');
          $modal.data('copy', 'yes');
          $modal.find('#expandCapacityModalLabel').text(lang.copy);
          $modal.find('.root-name-copy').removeClass('hidden');
          $modal.find('#clearLevelCopy').removeClass('hidden');
          $modal.find('.root-name').addClass('hidden');
          $modal.find('.dg_edit_tip').addClass('hidden');
          $modal.find('.root-name-copy').val('');
          // 清空dgLevelMap缓存
          dgLevelMap.clear();

          // 生成html
          updateEditModal(this, true);

          // 更新编辑模态框的选中层级数据
          for (var i = 0; i < $('.click-diskgroup-level-edit').length; i++) {
            if( $('.click-diskgroup-level-edit:eq('+i+')').find('span').hasClass('hidden') ){
              continue;
            }
            nowEditExitLevel.push($('.click-diskgroup-level-edit:eq('+i+')').data('level'));
          }

        })

        // 编辑 -- 层级选择/取消
        .on('click', '.click-diskgroup-level-edit', function () {
          var level = $(this).data('level');
          var isChecked = $(this).find('span').hasClass('hidden');
          var dgname = $('#expandCapacityModal .root-name').val();
          nowEditExitLevel;

          !nowEditExitLevelRender && (nowEditExitLevelRender = function (that, level, isChecked, dgname) {

            var targetSelector, targetListSelector;

             if (isChecked) {
               $(that).find('span').removeClass('hidden');
               nowEditExitLevel = [];
               // -- 在界面添加那个level
               // $('#expandCapacityModal .js-add-level.room').remove();
               // $('#expandCapacityModal .room-list').remove();
               for (var i = 0; i < $('.click-diskgroup-level-edit').length; i++) {
                 if( $('.click-diskgroup-level-edit:eq('+i+')').find('span').hasClass('hidden') ){
                   continue;
                 }
                 nowEditExitLevel.push($('.click-diskgroup-level-edit:eq('+i+')').data('level'));
               }

               // 确定添加目标
               for (var i = 0; i < nowEditExitLevel.length; i++) {
                 if(nowEditExitLevel[i] === level) {
                   if (i === 0) {
                     targetSelector = '#expandCapacityModal .clear-wrapper'
                   }else {
                     targetSelector = '#expandCapacityModal .js-add-level.'+nowEditExitLevel[i-1];
                     targetListSelector = '.'+nowEditExitLevel[i-1]+'-list';
                   }
                   break;
                 }
               }

               // 添加
               for (var j = 0; j < $(targetSelector).length; j++) {
                 if (targetSelector == '#expandCapacityModal .clear-wrapper') {
                   $(targetSelector).after($(addLevelMap[level]));
                 }else {
                   if ( $(targetSelector+':eq('+j+')').next().is('span') ){
                     $(targetSelector+':eq('+j+')').next().after($(addLevelMap[level]));
                   }else {
                     $(targetSelector+':eq('+j+')').after($(addLevelMap[level]));
                   }
                 }
               }

               if (targetListSelector) {
                 // 进行添加补全
                 for (var k = 0; k < $(targetListSelector).length; k++) {
                   if ($(targetListSelector+':eq('+k+')').next().hasClass(level)) continue;
                   $(targetListSelector+':eq('+k+')').after($(addLevelMap[level]));
                 }
               }

             }else {
               $(that).find('span').addClass('hidden');
               // 操作数据驱动界面变化
               // $('#expandCapacityModal .js-add-level.'+level).remove();
               // $('#expandCapacityModal .'+level+'-list').remove();
               if (nowEditExitLevel && nowEditExitLevel.indexOf(level) >= 0) {
                  nowEditExitLevel.splice(nowEditExitLevel.indexOf(level), 1);
               }
               removeDgLevel(dgname, level);
               renderDiskgroup(dgname);
             }

          });

          nowEditExitLevelRender(this, level, isChecked, dgname);

        })
        // 取消编辑 -> 回退数据 ------
        .on('click', '#expandCapacityModal .btn-default', function () {
          nowEditExitLevel = [];
          var dgname = $('#expandCapacityModal .root-name').val();
          rollBackDiskgroup(dgname);
          renderDiskgroup(dgname);
        })

        // 点击保存磁盘组的编辑数据 -----
        .on('click', '#expandCapacityModal .btn-primary', function (ev){

            // 发送请求 --
            //  1. 前端检测树的结构是否合法
            //  2. 先验证是否编辑的结构是否满足当前业务模式
            //  3. 如果满足则向后台发送编辑请求，请求完成后刷新页面
            //  4. 如果不满足则回滚已经被编辑的磁盘组数据

            nowEditExitLevel = [];
            // 更新选中层级数据
            for (var i = 0; i < $('.click-diskgroup-level-edit').length; i++) {
              if( $('.click-diskgroup-level-edit:eq('+i+')').find('span').hasClass('hidden') ){
                continue;
              }
              nowEditExitLevel.push($('.click-diskgroup-level-edit:eq('+i+')').data('level'));
            }

            var dgname = $('#expandCapacityModal .root-name').val();
            var isCopy = $('#expandCapacityModal').data('copy') == 'yes';
            var diskgroup;
            backupDgData;

            backupDgData.forEach(function (dgdata) {
              if (dgdata.name === dgname) {
                diskgroup = dgdata;
              }
            });

            if (diskgroup) {

              if (!checkDiskgroup(diskgroup, nowEditExitLevel)) {
                return DisplayTips(lang.storage.dg_edit_tip3);
              }

              // 开始进行后台验证
              if (isCopy) { // -- copy ---//

                var copyData;  // 要提交的数据
                var copyName = $('#expandCapacityModal .root-name-copy').val();
                // 检测是否存在磁盘组重名
                for (var i = 0; i < backupDgData.length; i++) {
                  if (copyName == backupDgData[i].name) {
                    return DisplayTips(lang.storage.dg_copy_dgname_check);
                  }
                  // if(backupDgData[i].name == dgname){
                  //   copyData = JSON.parse(JSON.stringify(backupDgData[i]));
                  //   console.log('origin: ', copyData);
                  // }
                }
                copyData = JSON.parse(JSON.stringify( pickOneDiskgroup(backupDgData, dgname) )) ;


                // 复制完成后需要回退数据
                rollBackDiskgroup(dgname);

                if (copyData) {
                  // 字符验证
                  if (!valifyUsername(copyName)) {
                      return DisplayTips( lang.storage.dg_name_format_error  );
                  }
                  // 关键字验证
                  var reg = valifyKeyWord(copyName);
                  if (reg) {
                    return DisplayTips( lang.storage.dgname_key_word_error  );
                  }


                  var newDgname = copyName;
                  var oldDgname = dgname;

                  // 去除磁盘details信息
                  formatLevelDiskgroup.clearDisk(copyData, true);


                  // 开始替换所有diskgroupname编辑前缀
                  function rollFun(data) {
                    if(data.type == 'root'){
                      data.name = copyName
                    }else {
                      ( data.name = data.name.replace(oldDgname+'_', '') );
                    }
                    data.items && data.items.length && data.items.forEach(function (item) {
                      rollFun(item);
                    });
                  };
                  rollFun(copyData);

                  // 添加level标识
                  formatLevelDiskgroup.do(copyData, true);


                  var copyPara = {info: JSON.stringify(copyData)};

                  // 验证复用
                  $('#expandCapacityModal').find('.modal-header').LoadData('show');
                  DataModel['dgRepeatDiskCheck'](copyPara, function (rsp) {
                    $('#expandCapacityModal').find('.modal-header').LoadData('hide');

                    copyPara.info = JSON.stringify(
                      formatLevelDiskgroup.clearDisk(
                        JSON.parse(copyPara.info)
                      )
                    )

                    if (rsp.code == 200) {
                      if (rsp.result === false) {
                        // 提交创建请求
                        $('#expandCapacityModal').find('.modal-header').LoadData('show');
                        addWaitMask();
                        DataModel['createDiskgroup'](copyPara, function (result) {
                          $('#expandCapacityModal').find('.modal-header').LoadData('hide');
                          removeWaitMask();
                          if (result == undefined)
                              return;
                          if (result.code == 200) {
                              DisplayTips(result.result);
                              $('#expandCapacityModal').modal('hide');
                              setTimeout(function () {
                                  refresh();
                              }, 2000);
                          }else{
                              DisplayTips(result.result);
                          }
                        }, true, null);
                        // 回滚数据
                        nowEditExitLevel = [];

                      }else {
                         $('#confirmToReuse .modal-body > p').text(lang.storage.dg_disk_reuse_tips);
                         $('#confirmToReuse').data('data', copyPara);
                         $('#confirmToReuse').data('action', 'copy');
                         $('#confirmToReuse').modal('show');
                      }
                    }else {
                      DisplayTips(lang.storage.dg_reuse_check_fail);
                    }
                  }, true, null);



                }



              }else {  // --- edit --- //

                // 提交数据
                var editData = JSON.parse(JSON.stringify( pickOneDiskgroup(backupDgData, dgname) ));
                // 添加level标识
                formatLevelDiskgroup.do(editData, true);
                formatLevelDiskgroup.clearDisk(editData, true);

                editData = JSON.stringify(editData);
                // 磁盘复用验证
                $('#expandCapacityModal').find('.modal-body').LoadData('show');
                DataModel['dgRepeatDiskCheck']({info: editData}, function (rsp) {

                  editData = formatLevelDiskgroup.clearDisk(JSON.parse(editData));

                  $('#expandCapacityModal').find('.modal-body').LoadData('hide');
                    if (rsp.code == 200) {
                      if (rsp.result === false) {


                        $('#expandCapacityModal').find('.modal-body').LoadData('show');
                        DataModel['editDiskGroup']({info: JSON.stringify(editData)}, function (rsp) {
                          $('#expandCapacityModal').find('.modal-body').LoadData('hide');
                          if (rsp.code == 200) {
                            DisplayTips(rsp.result)
                            $('#expandCapacityModal').modal('hide');
                            setTimeout(function () {
                              refresh();
                            }, 2e3);
                          }else {
                            DisplayTips(rsp.result)
                          }
                        }, true, null);
                        // 回滚数据
                        nowEditExitLevel = [];

                      }else {
                         $('#confirmToReuse .modal-body > p').text(lang.storage.dg_disk_reuse_tips);
                         $('#confirmToReuse').data('data', {info: JSON.stringify(editData)});
                         $('#confirmToReuse').data('action', 'edit');
                         $('#confirmToReuse').modal('show');
                      }
                    }else {
                      DisplayTips(lang.storage.dg_reuse_check_fail)
                    }
                }, true, null);


              }


            }


        })

        .delegate('.spool-diskinfo-list', 'mouseover', function (ev) {
            $this = $(this);
            $this.find('.c_basic_right').removeClass('hidden');
        })
        .delegate('.spool-diskinfo-list', 'mouseout', function (ev) {
            $this = $(this);
            $this.find('.c_basic_right').addClass('hidden');
        })
        //新建磁盘组
        .on('click', '.js-create-dg', function (ev) {
            $modal = $('#createDiskGroupModal');

            // 清空dgLevelMap缓存
            dgLevelMap.clear();

            for(var i= 0;i<4;i++){
                $('#createDiskGroupModal .click-diskgroup-level:eq('+i+')').find('span').addClass('hidden');
            }
            $('#expandCapacityModal .create-level').html(
              '<label id="level-name" class="col-sm-4 control-label left">〉'+lang.storage.create_topology+'</label>' +
              '<div class="col-sm-4"><input type="button" value="'+lang.storage.hi_perform+'" class="create_dg_template" title="'+lang.storage.high_performance_group+'" data-performance="high" /><input type="button" class="create_dg_template" value="'+lang.storage.ge_perform+'" title="'+lang.storage.general_performance_group+'" data-performance="general" /></div>'+
              '<div class="col-sm-4 clear-wrapper" style="text-align: right;">'+
                '<span title="'+lang.storage.clear_level+'" style="color: #4ca4e4" id="clearLevel">'+lang.wipe+'</span>'+
              '</div>'
            );
            $modal.find('.create-level').html(
              '<label id="level-name" class="col-sm-4 control-label left">〉'+lang.storage.create_topology+'</label>' +
              '<div class="col-sm-4"><input type="button" value="'+lang.storage.hi_perform+'" class="create_dg_template" title="'+lang.storage.high_performance_group+'" data-performance="high" /><input type="button" class="create_dg_template" value="'+lang.storage.ge_perform+'" title="'+lang.storage.general_performance_group+'" data-performance="general" /></div>'+
              '<div class="col-sm-4 clear-wrapper" style="text-align: right;">'+
                '<span title="'+lang.storage.clear_level+'" style="color: #4ca4e4" id="clearLevel">'+lang.wipe+'</span>'+
              '</div>'
            );
            // 更新按钮状态
            checkTopologyEmpty();

            $modal.find('.create-level-host').html('<div class="col-sm-12 host" data-level="host" style="line-height:24px;;margin-left: 150px;margin-top: -15px"><a style="float:left;color: #0c7fc1">+'+lang.storage.add +lang.storage.host +'</a></div>');
            $modal.find('.root-name').val('');
            $modal.modal('show');
            setTimeout(function () {
                $("#storage_pool_name").focus();
            }, 500);
            DataModel['listDetailBytype'](null, diskcallback, true, null);
        })
        .on ('input', '.root-name', function (ev) {

            if (!valifyUsername($(this).val())) {
                DisplayTips( lang.storage.name_format_error  );
                var val = $(this).val();
                $(this).val(val.slice(0, -1));
                return;
            }
            /* ------------------- keyword ------------------- */
            var reg = valifyKeyWord($(this).val());
            if (reg) {
              DisplayTips( lang.storage.key_word_error  );
              var val = $(this).val();
              $('#createDiskGroupModal .btn.btn-primary').addClass('disabled');
              // $(this).val(val.replace(reg, ''));
              return;
            }else{
              $('#createDiskGroupModal .btn.btn-primary').removeClass('disabled');
                // for(var i=0;i<$('.host-name').length;i++){
                //     var $hostname = $('.host-name:eq('+i+')');
                //     $hostname.text($(this).val()+'_'+$hostname.text().split('_')[1])
                //     $hostname.attr('data-name',$(this).val()+'_'+$hostname.text().split('_')[1].split('(')[0])
                // }
            }
        })
        //选择层级（反选）
        .on('click', '.click-diskgroup-level', function (ev) {
          var level = $(this).data('level');
          var isChecked = $(this).find('span').hasClass('hidden');
          var dgname = $('#expandCapacityModal .root-name').val();
          nowEditExitLevel;

          !nowCreateExitLevelRender && (nowCreateExitLevelRender = function (that, level, isChecked, dgname) {

            var targetSelector, targetListSelector;

             if (isChecked) {
               $(that).find('span').removeClass('hidden');
               nowEditExitLevel = [];
               // -- 在界面添加那个level
               // $('#expandCapacityModal .js-add-level.room').remove();
               // $('#expandCapacityModal .room-list').remove();
               for (var i = 0; i < $('#createDiskGroupModal .click-diskgroup-level').length; i++) {
                 if( $('#createDiskGroupModal .click-diskgroup-level:eq('+i+')').find('span').hasClass('hidden') ){
                   continue;
                 }
                 nowEditExitLevel.push($('#createDiskGroupModal .click-diskgroup-level:eq('+i+')').data('level'));
               }

               // 确定添加目标
               for (var i = 0; i < nowEditExitLevel.length; i++) {
                 if(nowEditExitLevel[i] === level) {
                   if (i === 0) {
                     targetSelector = '#createDiskGroupModal .clear-wrapper'
                   }else {
                     targetSelector = '#createDiskGroupModal .js-add-level.'+nowEditExitLevel[i-1];
                     targetListSelector = '.'+nowEditExitLevel[i-1]+'-list';
                   }
                   break;
                 }
               }

               // 添加
               for (var j = 0; j < $(targetSelector).length; j++) {
                 if (targetSelector == '#createDiskGroupModal .clear-wrapper') {
                   $(targetSelector).after($(addLevelMap[level]));
                 }else {
                   if ( $(targetSelector+':eq('+j+')').next().is('span') ){
                     $(targetSelector+':eq('+j+')').next().after($(addLevelMap[level]));
                   }else {
                     $(targetSelector+':eq('+j+')').after($(addLevelMap[level]));
                   }
                 }
               }

               if (targetListSelector) {
                 // 进行添加补全
                 for (var k = 0; k < $(targetListSelector).length; k++) {
                   if ($(targetListSelector+':eq('+k+')').next().hasClass(level)) continue;
                   $(targetListSelector+':eq('+k+')').after($(addLevelMap[level]));
                 }
               }

             }else {
               $(that).find('span').addClass('hidden');
               // 操作数据驱动界面变化
               $('#createDiskGroupModal .js-add-level.'+level).remove();
               $('#createDiskGroupModal .'+level+'-list').remove();
             }

          });

          nowCreateExitLevelRender(this, level, isChecked, dgname);

        })

        // 清除复制层级
        .on('click', '#clearLevelCopy', function (ev) {
          var $modal = $('#expandCapacityModal');
          var dgname = $modal.find('.root-name').val();
          var targetDg = pickOneDiskgroup(backupDgData, dgname);
          targetDg.items = [];
          renderDiskgroup(dgname);
        })


        // 清除层级
        .on('click', '#clearLevel', function (ev) {
          // $('.create-level').find('div').remove();
          // $('.create-level').find('span').remove();
          var $checkedLevel = $('#createDiskGroupModal  .diskgroup-level > .click-diskgroup-level');
          var html = (
            '<label id="level-name" class="col-sm-4 control-label left">〉'+lang.storage.create_topology+'</label>' +
            '<div class="col-sm-4"><input type="button" value="'+lang.storage.hi_perform+'" class="create_dg_template" title="'+lang.storage.high_performance_group+'" data-performance="high" /><input type="button" class="create_dg_template" value="'+lang.storage.ge_perform+'" title="'+lang.storage.general_performance_group+'" data-performance="general" /></div>'+
            '<div class="col-sm-4 clear-wrapper" style="text-align: right;">'+
              '<span title="'+lang.storage.clear_level+'" style="color: grey" id="clearLevel">'+lang.wipe+'</span>'+
            '</div>'
          );
          $checkedLevel.each(function () {
            if ($(this).find('span').attr('class') === 'glyphicon glyphicon-ok-sign') {
              var diskgrouplevel = $(this).find('input').val();
              if (diskgrouplevel === lang.storage.host || diskgrouplevel === lang.storage.disk) {
                return;
              }

              html += addLevelMap[formatToDiskGroup(diskgrouplevel)];
            }
          });

          $('#createDiskGroupModal .create-level').html(html);
          var hostDiskHtml = '<div class="col-sm-12 host" data-level="host" style="line-height:24px;;margin-left: 150px;margin-top: -15px">'+
                                '<a style="float:left;color: #0c7fc1">+'+(lang.storage.add+lang.storage.host)+'</a>'+
                            '</div>';
          $('#createDiskGroupModal .create-level-host').html(hostDiskHtml);

        })
        //添加层级
        .on('click', '.datacenter a', function (ev) {
            if($('.datacenter-input').length == 1){
                DisplayTips(lang.storage.input_only_one);
                return;
            }
            var htm='';
            htm+='<div class="col-sm-12 datacenter-input" style="line-height:24px;;margin-left: '+$('.create-level .datacenter').css('margin-left')+'">'+
                '<span class="caretdgadd"></span><input type="text" style="margin-left:10px">'+
                '<span class="glyphicon glyphicon-ok" style="margin-left:10px;cursor:pointer;"></span><span class="glyphicon glyphicon-remove" style="margin-left:10px;cursor:pointer;"></span>'+
                '</div>'
            $(this).parent().after(htm);
        })
        .on('click', '.room a', function (ev) {
            if($('.room-input').length == 1){
                DisplayTips(lang.storage.input_only_one);
                return;
            }
            var htm='';
            htm+='<div class="col-sm-12 room-input" style="line-height:24px;;margin-left: '+$('.create-level .room').css('margin-left')+'">'+
                '<span class="caretdgadd"></span><input type="text" style="margin-left:10px">'+
                '<span class="glyphicon glyphicon-ok" style="margin-left:10px;cursor:pointer;"></span><span class="glyphicon glyphicon-remove" style="margin-left:10px;cursor:pointer;"></span>'+
                '</div>'
            $(this).parent().after(htm);
        })
        .on('click', '.rack a', function (ev) {
            if($('.rack-input').length == 1){
                DisplayTips(lang.storage.input_only_one);
                return;
            }
            var htm='';
            htm+='<div class="col-sm-12 rack-input" style="line-height:24px;;margin-left: '+$('.create-level .rack').css('margin-left')+'">'+
                '<span class="caretdgadd"></span><input type="text" style="margin-left:10px">'+
                '<span class="glyphicon glyphicon-ok" style="margin-left:10px;cursor:pointer;"></span><span class="glyphicon glyphicon-remove" style="margin-left:10px;cursor:pointer;"></span>'+
                '</div>'
            $(this).parent().after(htm);
        })
        .on('click', '.chassis a', function (ev) {
            if($('.chassis-input').length  == 1){
                DisplayTips(lang.storage.input_only_one);
                return;
            }
            var htm='';
            htm+='<div class="col-sm-12 chassis-input" style="line-height:24px;;margin-left: '+$('.create-level .chassis').css('margin-left')+'">'+
                '<span class="caretdg"></span><input type="text" style="margin-left:10px">'+
                '<span class="glyphicon glyphicon-ok" style="margin-left:10px;cursor:pointer;"></span><span class="glyphicon glyphicon-remove" style="margin-left:10px;cursor:pointer;"></span>'+
                '</div>'
            $(this).parent().after(htm);
        })
        .on('click', '.host a', function (ev) {
            if($(this).closest('#createDiskGroupModal').attr('class') != undefined){  // create -
                var $thismodal = $('#createDiskGroupModal');
                $('#addHostModal').data('modalid',$('#createDiskGroupModal'));
                // if ($thismodal.find('.root-name').val() == '') {
                //     DisplayTips(lang.storage.input_dg_name);
                //     return;
                // }
                // if (dgnamearr.indexOf($thismodal.find('.root-name').val()) >= 0) {
                //     DisplayTips(lang.storage.dg_name_check);
                //     return
                // }
            }else{  // edit -
                $('#addHostModal').data('modalid',$('#expandCapacityModal'));
                var $thismodal = $('#expandCapacityModal');
            }
            $('.host').removeClass('markhost');
            $(this).parent().addClass('markhost');
            $modal = $('#addHostModal');
            $modal.find('.modal-header').LoadData('show');
            $modal.modal('show');

            var callback = function (result) {
                $modal.find('.modal-header').LoadData('hide');
                if (!result) {
                    return;
                }
                if (result.code === 200) {
                    nodeListData = result;
                    var html = '';
                    var data = result.result.nodes;
                    var $curRows = $('.host-name');
                    var existedNodes = [];

                    $curRows.each(function (index) {
                        existedNodes.push($(this).text());
                    });

                    for (var i = 0; i < data.length; i++) {
                        if (existedNodes.join().indexOf(data[i].hostname) === -1) {
                            html += '<div class="checkbox"><label>' +
                                '<input class="nodesToAdd" type="checkbox" data-ip="' + data[i].ip + '" data-hostname="' + (data[i].hostname) + '">';
                        } else {
                            html += '<div class="checkbox disabled"><label>' +
                                '<input type="checkbox" checked>';
                        }
                        html += data[i].hostname + ' (' + data[i].ip + ')' +
                            '</label></div>';
                    }
                    $modal.find('#checkNasNode').html(html);
                } else {
                    DisplayTips(lang.cluster.list_nas_node_fail);
                }
            }
            DataModel['listNode'](null, callback, true, null);
        })
        .on('click', '.disk a', function (ev) {
            $modal = $('#selectDiskModal');
            if($(this).closest('#createDiskGroupModal').attr('class') != undefined){
                $('#selectDiskModal').data('modalid',$('#createDiskGroupModal'));
            }else{
                $('#selectDiskModal').data('modalid',$('#expandCapacityModal'));
            }
            $('.disk').removeClass('markdisk');
            $(this).parent().addClass('markdisk');
            if (hostdiskCode !== 200) {
                if (hostdiskData === '' || hostdiskData === undefined) {
                    DisplayTips(lang.storage.wait_for_load_diskinfo);
                    return;
                }
                DisplayTips(lang.storage.list_selected_disk_fail + '（' + hostdiskMsg + '）');
                return false;
            }
            var htm = '';
            var avaihostdiskData = hostdiskData.slice();
            var hostname = $(this).parent().prev().find('.host-name').text();
            $modal.data('hostname', hostname);
            for(var i=hostdiskData.length-1;i>=0;i--){
                if(hostname.indexOf(avaihostdiskData[i].hostname) < 0){
                    avaihostdiskData.splice(i,1);
                }
            }
            htm += showDiskList(avaihostdiskData, 'all');
            $('.disk-pool-body table.wizard-disk-body tbody').html(htm);
            $modal.modal('show').css('z-index', '10000');
            exitdisknum = [];
            function exitDisk(a){
                if(a.attr('class') == 'col-sm-12 disk-list'){
                    exitdisknum.push(a.find('.disk-name').data('name'))
                    exitDisk(a.next())
                }else{
                    return
                }
            }
            exitDisk($('.markdisk').next());
            $('#selectDiskModal thead th:last input').attr("checked", false);
            for(var k=$('#selectDiskModal .subdisks .js-disk').length-1;k>=0;k--) {
                if( exitdisknum.indexOf($('.js-disk:eq('+k+')').data('id')) >= 0 ){
                    $('.js-disk:eq('+k+')').remove();

                }
            }
        })




        //确定和取消输入名称
        .on('click', '.glyphicon-ok', function (ev) {
            var addvailname = $(this).prev().val();

            addavailarr.push(addvailname);
            // 字符合法
            if (!valifyUsername(addvailname)) {
                DisplayTips( lang.storage.name_format_error  );
                return
            }

            var addlevel= $(this).parent().attr('class');
            var arr = addlevel.split(' ');
            addlevel = arr[arr.length - 1].split('-')[0];
            var nextposition ;
            var bgnextlevel;
            var plusarr=[];
            var firstaddlevel = 0;
            var editposition = 0
            for(var i=0;i<$('.js-add-level').length;i++){
                if( plusarr.indexOf($('.js-add-level:eq('+i+')').data('level')) < 0){
                    plusarr.push($('.js-add-level:eq('+i+')').data('level'));
                }
                if(plusarr[i]==addlevel && firstaddlevel == 0){
                    nextposition = i;
                    firstaddlevel++
                    if($(this).closest('#createDiskGroupModal').attr('class') == undefined) {
                        editposition = dgrankarr.indexOf(plusarr[i])-nextposition;
                    }
                }
            }

            if($(this).closest('#createDiskGroupModal').attr('class') == undefined){  // edit
                var diskgroupname = $(this).parent().find('input').val();
                var dgname = $('#expandCapacityModal .root-name').val();

                // 检测重名情况
                if (!dgLevelMap.checkDiskgroup( pickOneDiskgroup(backupDgData, dgname), addlevel, diskgroupname) ) {
                  return DisplayTips(lang.storage.dg_levelname_no_same);
                }

                var htm='';
                htm+='<span class="col-sm-12 '+addlevel+'-list" style="line-height:24px;;margin-left: '+$('.create-level .'+addlevel+'').css('margin-left')+'">'+
                    '<span class="caretdgadd"></span><span style="margin-left:10px;" data-mark="'+addlevel+'" data-name="'+diskgroupname+'" class="js-level-mark '+addlevel+'-name">'+diskgroupname+'</span>'+
                    '<span class="glyphicon glyphicon-pencil '+((basicLevel.indexOf(addlevel) >= 0) ? 'hidden' : '')+'" style="margin-left:10px;cursor:pointer;" data-edit="yes"></span><span class="glyphicon glyphicon-trash" style="margin-left:10px;cursor:pointer; color: red"></span>'+
                    '</span>'

                $(this).parent().after(htm);
                $('.js-add-level').removeClass('marklevel');
                $(this).parent().prev().addClass('marklevel');

                //  -- 磁盘组重构更改
                var checkData = expandToDisk({diskgroupname: diskgroupname, addlevel: addlevel},'',0);
                // 更新缓存数据
                addCheckdataToBackup(dgname, checkData);
                // 渲染到页面
                renderDiskgroup(dgname);

                editposition = editposition+2;

            }else{ // create
                var diskgroupname = $(this).parent().find('input').val();

                // 检测重名情况
                if (!dgLevelMap.check(addlevel, addlevel+'_'+diskgroupname) ) {
                  return DisplayTips(lang.storage.dg_levelname_no_same);
                }
                // else {
                //   dgLevelMap.add(addlevel, diskgroupname);
                // }

                var htm='';
                htm+='<span class="col-sm-12 '+addlevel+'-list" style="line-height:24px;;margin-left: '+$('.create-level .'+addlevel+'').css('margin-left')+'">'+
                    '<span class="caretdgadd"></span><span style="margin-left:10px;" data-mark="'+addlevel+'" data-name="'+(addlevel + '_' + diskgroupname)+'" class="js-level-mark '+addlevel+'-name">'+diskgroupname+'</span>'+
                    '<span class="glyphicon glyphicon-pencil" style="margin-left:10px;cursor:pointer;"></span><span class="glyphicon glyphicon-trash" style="margin-left:10px;cursor:pointer; color: red"></span>'+
                    '</span>'
                $(this).parent().after(htm);
                $('.js-add-level').removeClass('marklevel');
                $(this).parent().prev().addClass('marklevel');
                // 更新按钮状态
                checkTopologyEmpty();
            }

            $(this).parent().remove();
            var html='';
            if($('.create-level .'+addlevel+'-list').length != 1 && $('.create-level .marklevel').next().next().attr('class').indexOf(plusarr[nextposition+1]) < 0){
                for(var i=0;i<plusarr.length-nextposition-editposition;i++){
                    bgnextlevel = plusarr[nextposition+i+1];
                    if($('.create-level .marklevel').next().next().attr('class') != 'col-sm-12 host') {
                        if (bgnextlevel != undefined) {
                            html += '<div class="col-sm-12 js-add-level ' + bgnextlevel + '" data-level="' + bgnextlevel + '" style="line-height:24px;;margin-left: ' + $('.' + bgnextlevel + '').css('margin-left') + '">' +
                                '<a style="float:left;color: #0c7fc1">+' + lang.wizard.add + '' + formatDiskGroup(bgnextlevel) + '</a>' +
                                '</div>'
                        } else {
                          var tempLevel = $('.create-level .marklevel').next().next().data('level');
                          if ( tempLevel != 'host' ) {
                            html += '<div class="col-sm-12 host" data-level="host" style="line-height:24px;;margin-left:150px">' +
                            '<a style="float:left;color: #0c7fc1">+' + lang.wizard.add + '' + formatDiskGroup('host') + '</a>' +
                            '</div>'
                          }
                        }
                    }
                }
            }

            $('.create-level .marklevel').next().after(html);

        })

        .on('click', '.glyphicon-remove', function (ev) {
            $(this).parent().remove();
        })
        //添加host级
        .on('click', '#addHostModal .btn-primary', function (ev) {
           var isEdit = $('#expandCapacityModal').attr('class') == 'modal fade in';
            var addlevel= 'host';
            var bgnextlevel ='disk';
            var htm = '';
            var hostresult = '';
            var _dgname = $('#addHostModal').data('modalid').find('.root-name').val();


            if ($('.nodesToAdd:checked').length === 0) {
                DisplayTips(lang.cluster.please_select_avail_nodes);
                return;
            }
            for(var i=0;i<$('.nodesToAdd:checked').length;i++) {
              var diskgroupip = $('.nodesToAdd:checked:eq('+i+')').data('ip');

              if (isEdit) {  // edit ---
                var diskgroupname = _dgname +'_'+ $('.nodesToAdd:checked:eq('+i+')').data('hostname');
                diskgroupip = '';

              }else {
                var diskgroupname =$('.nodesToAdd:checked:eq('+i+')').data('hostname');
                diskgroupip = '('+''+diskgroupip+')';
              }

              // '<span class="caretdgadd"></span><span style="margin-left:10px" data-mark="host" data-name="' + diskgroupname + '" class="js-level-mark ' + addlevel + '-name">' + diskgroupname.replace(_dgname+'_', '')+'('+''+diskgroupip+')' + '</span>' +
                htm += '<span class="col-sm-12 ' + addlevel + '-list" style="line-height:24px;;margin-left:150px">' +
                    '<span class="caretdgadd"></span><span style="margin-left:10px" data-mark="host" data-name="' + diskgroupname + '" class="js-level-mark ' + addlevel + '-name">' + diskgroupname.replace(_dgname+'_', '')+ diskgroupip + '</span>' +
                    '<span class="glyphicon glyphicon-trash" style="margin-left:10px;cursor:pointer;color: red;"></span>' +
                    '</span>'+
                    '<div class="col-sm-12 '+bgnextlevel+'" data-level="'+bgnextlevel+'" style="line-height:24px;;padding-left:15px;margin-left: 180px">'+
                    '<a style="float:left;color: #0c7fc1">'+lang.wizard.add+''+formatDiskGroup(bgnextlevel)+'</a>'+
                    '</div>'
                if(hostresult == ''){
                    hostresult += '{"type":"'+addlevel+'","name":"'+diskgroupname+'","items":[]}';
                }else{
                    hostresult = '{"type":"'+addlevel+'","name":"'+diskgroupname+'","items":[]},'+hostresult+'';
                }
            }
            $('#addHostModal').modal('hide');
            $('.markhost').after(htm);

            // 提交请求
            if($('#addHostModal').data('modalid').attr('id') == 'expandCapacityModal' && hostresult!=''){  // edit 过程 ---

              //  -- 磁盘组重构更改

                var checkData =  expandToDisk($('.markhost').next().find('.js-level-mark').data('name'),hostresult,1);
                // 更新缓存数据
                addCheckdataToBackup(_dgname, checkData);
                // 渲染到页面
                renderDiskgroup(_dgname);
            }else {
              checkTopologyEmpty();
            }
        })
        //添加disk级
        .on('click', '#selectDiskModal .btn-primary', function (ev) {
            var addlevel= 'disk';
            var htm = '';
            var choosedisknum = 0;
            var diskresult = '';
            var disks = [];  // 所有磁盘
            var hostname = $('#selectDiskModal').data('hostname');
            for(var k=0;k<$('#selectDiskModal .subdisks .js-disk').length;k++) {
                if( $('.js-disk:eq('+k+') td:eq(5) input').is(':checked') == true ){
                    var diskname = $('.js-disk:eq('+k+') .flex').text();
                    var disktype = $('.js-disk:eq('+k+') td:eq(2)').text();
                    var diskvolume = $('.js-disk:eq('+k+') td:eq(4)').text();
                    var diskid = $('.js-disk:eq('+k+')').data('id');
                    disks.push({
                      id: diskid,
                      name: diskname,
                      hostname: hostname
                    });
                    htm += '<span class="col-sm-12 ' + addlevel + '-list" style="line-height:24px;;padding-left:15px;margin-left: 180px">' +
                        '<span style="margin-left:10px" data-mark="disk" data-name="'+diskid+'" class="js-level-mark ' + addlevel + '-name">' + diskname+'('+''+disktype+''+','+''+diskvolume+''+')' + '</span>' +
                        '<span class="glyphicon glyphicon-trash" style="margin-left:10px;cursor:pointer; color: red;"></span>' +
                        '</span>'
                    diskresult += '{"type":"'+addlevel+'","name":"'+diskid+'","items":[]}';

                    $('.markdisk').after(htm);
                    htm = "";

                    if($('#selectDiskModal').data('modalid').attr('id') == 'expandCapacityModal'&& diskresult !=''){  // edit ---
                      var checkData = expandToDisk($('.markdisk').prev().find('.js-level-mark').data('name'),diskresult,2, disks);
                      var dgname = $('#expandCapacityModal .root-name').val();
                      // 更新缓存数据
                      addCheckdataToBackup(dgname, checkData);
                      disks = [];
                      diskresult = "";
                      htm = "";
                    }

                    // 渲染到页面
                    // if(diskresult == ''){
                    // }else{
                    //     diskresult = '{"type":"'+addlevel+'","name":"'+diskid+'","items":[]},'+diskresult+'';
                    // };
                }
            }
            $('#selectDiskModal').modal('hide');

            if($('#selectDiskModal').data('modalid').attr('id') == 'expandCapacityModal'&& diskresult !=''){  // edit ---
              //  -- 磁盘组重构更改
                renderDiskgroup(dgname);
            }
        })

        //删除和编辑名称
        .on('click', '.glyphicon-trash', function (ev) {

          var that = this;
          // $('#confirmToTrash').modal('show');
            trashFn = function () {
              $('#confirmToTrash').LoadData('hide');
              $('#confirmToTrash').modal('hide');
              $(that).parent().addClass('delete-soon');
              function removeTrash(result){
                  if(result.next().text() !=''){
                      var markdiskgoupname = result.next().find('.js-level-mark').data('mark');
                      if(result.next().find('.js-level-mark').data('mark') == undefined || levelToRank(markdiskgoupname) > levelToRank(result.find('.js-level-mark').data('mark'))){
                          result.next().remove();
                          if($('.'+markdiskgoupname+'-name').text() == ''){
                              $('.click-diskgroup-level span:eq('+levelToRank(markdiskgoupname)+')').addClass('hidden');
                          }
                          removeTrash(result)
                      }else {
                          return
                      }
                  }else {
                      return
                  }
              }

              if($(that).closest('#expandCapacityModal').attr('class') != undefined){  // 此时位于编辑模态框中


                  var shrinkdgname = $('#expandCapacityModal .root-name').val();
                  var shrinktype = $(that).parent().find('.js-level-mark').data('mark');
                  var shrinkname = $(that).parent().find('.js-level-mark').data('name');
                  var parameter = {
                      'dname': shrinkdgname,
                      'type':shrinktype,
                      'name':shrinkname,
                  };


                  diskgroupEditDelete(shrinkdgname, shrinkname, shrinktype);

                  renderDiskgroup(shrinkdgname);



              }else{  // 此时位于创建模态框中
                  /* ------------------- 检测最后一级host/disk是否删除 ------------------- */
                  var parentClass = ($(that).parent().prop('class')).replace('delete-soon', '');
                  var tempClass = '';
                  parentClass.split(' ').forEach(function (item, i) {
                    if (item) {
                      tempClass += '.';
                      tempClass += item;
                    }
                  });
                  parentClass = tempClass;

                  var markText = $(that).parent().find('.js-level-mark').text();

                  var $allTarget = $('#createDiskGroupModal ' + parentClass);

                  $allTarget.each(function (index, target) {
                    if (index == $allTarget.length - 1) {
                      if ($(target).find('.js-level-mark').text() == markText) {
                        if ($(target).find('.js-level-mark').data('mark') == 'disk' || $(target).find('.js-level-mark').data('mark') == 'host') {
                          return;
                        }
                        $('.create-level-host .host-list').remove();
                        $('.create-level-host .disk-list').remove();
                        $('.create-level-host .disk').remove();
                        // $('.create-level-host .host').remove();
                      }
                    }
                  });

                  /* ------------------- remove ------------------- */

                  // 删除这个层级levelMap记录数据
                  // dgLevelMap.delete(
                  //   $(that).parent().find('.js-level-mark').data('mark'),
                  //   $(that).parent().find('.js-level-mark').data('name')
                  // );

                  trashFn = undefined;
                  removeTrash($(that).parent());
                  $(that).parent().remove();

                  // 更新按钮状态
                  checkTopologyEmpty();
              }

            }

            trashFn();

            /* ------------------- 检测是否有 添加层级按钮 ------------------- */
            for (var i = 0; i < $('#createDiskGroupModal .click-diskgroup-level').length; i++) {
              if( $('#createDiskGroupModal .click-diskgroup-level:eq('+i+')').find('span').hasClass('hidden') ){
                continue;
              }
              var level = $('#createDiskGroupModal .click-diskgroup-level:eq('+i+')').data('level');
              if (level == 'disk' || level == 'host') {
                continue;
              }
              if (!$('#createDiskGroupModal .js-add-level.' + level).length) {
                nowCreateLevelRestore(level);
              }
            }


        })


        .on('click', '.glyphicon-pencil', function (ev) {
          var isEdit = $(this).data('edit');  // 编辑模态中
          var isCopy = $('#expandCapacityModal').data('copy');  // 复制拓扑
          var dgname = $('#expandCapacityModal .root-name').val();

            if($(this).prev().val()=='' && $(this).prev().attr('class')!=undefined){
                $(this).prev().addClass('hide');
                $(this).before($('<input type="text" style="margin-left:10px">').val($(this).prev().text()));
            }else if($(this).prev().val()=='' && $(this).prev().attr('class')==undefined){

            }
            else{
                var newname = String($(this).prev().val());
                var oldname = String($(this).parent().find('.js-level-mark').data('name'));
                var type = $(this).parent().find('.js-level-mark').data('mark');

                // if (dgnamearr.indexOf(newname) >= 0 ) {
                //     DisplayTips(lang.storage.check_dg_name + '(' + newname + ')');
                //     return
                // }
                if (!valifyUsername(newname)) {
                    DisplayTips( lang.storage.name_format_error  );
                    return
                }

                // if (oldname == newname) {
                //   // addavailarr.splice(addavailarr.indexOf(oldname), 1);
                // }

                // if(addavailarr.indexOf(newname) >= 0){
                //   DisplayTips(lang.storage.check_dg_name + '('+newname+')');
                //   return
                // }

                // if (addavailarr.indexOf(oldname) >= 0) {
                //   addavailarr.splice(addavailarr.indexOf(oldname), 1);
                // }

                if (isEdit) {
                  if (!dgLevelMap.checkDiskgroup( pickOneDiskgroup(backupDgData, dgname),type, newname) ) {
                    return DisplayTips(lang.storage.dg_levelname_no_same);
                  }
                }else {
                  // dgLevelMap.add(type, newname);
                  // dgLevelMap.delete(type, oldname);
                  if (!dgLevelMap.check(type, newname)) {
                    if (oldname == newname) {
                      // 未更新名字
                    }else {
                      return DisplayTips(lang.storage.dg_levelname_no_same);
                    }
                  }
                }


                // addavailarr.push(newname);
                $(this).prev().remove();
                $(this).prev().removeClass('hide').text(newname);
                $(this).prev().attr('data-name',newname)
                $(this).parent().find('.js-level-mark').data('name', newname);

                /* ------------------- 编辑中需要更新数据重新渲染 ------------------- */
                if (isEdit) {
                  newname = (dgname+'_') + newname;
                  oldname;dgname;
                  var type = $(this).prev().data('mark');

                  if( (newname !== oldname) && newname && type ) {
                    updateLevelName(dgname, {name: newname, old: oldname, type: type});
                    renderDiskgroup(dgname);
                  }
                }
            }

        })
        .on('click', '.caretdg', function (ev) {
            if (!($(this).siblings('ul').attr('class') == undefined || $(this).siblings('ul').attr('class') == '')) {
                $(this).siblings('ul').removeClass('hidden');
                $(this).parent().find('.caretdg').css('transform', 'none');
                $('.grid').masonry({
                    itemSelector: '.grid-item',
                    columnWidth: '.col-lg-6',
                    percentPosition: true,
                });
            } else {
                $(this).siblings('ul').addClass('hidden');
                $(this).parent().find('.caretdg').css('transform', 'rotate(-90deg)');
                $('.grid').masonry({
                    itemSelector: '.grid-item',
                    columnWidth: '.col-lg-6',
                    percentPosition: true,
                });
            }
        })

        // 确认复用模态弹窗
        .on('click', '#confirmToReuse .btn-primary', function (ev) {

          var $modal = $('#confirmToReuse');
          var action = $modal.data('action');
          var data = $modal.data('data');
          $modal.modal('hide');

          /* ------------------- 编辑 ------------------- */
          if (action == 'edit') {
            $('#expandCapacityModal').find('.modal-body').LoadData('show');
            DataModel['editDiskGroup'](data, function (rsp) {
              $('#expandCapacityModal').find('.modal-body').LoadData('hide');
              if (rsp.code == 200) {
                DisplayTips(rsp.result);
                $('#expandCapacityModal').modal('hide');
                setTimeout(function () {
                  refresh();
                }, 2e3);
              }else {
                DisplayTips(rsp.result)
              }
            }, true, null);

          /* ------------------- 复制 ------------------- */
          }else if (action == 'copy') {

            // 提交创建请求
            $('#expandCapacityModal').find('.modal-header').LoadData('show');
            addWaitMask();
            DataModel['createDiskgroup'](data, function (result) {
              $('#expandCapacityModal').find('.modal-header').LoadData('hide');
              removeWaitMask();
              if (result == undefined)
                  return;
              if (result.code == 200) {
                  DisplayTips(result.result);
                  $('#expandCapacityModal').modal('hide');
                  setTimeout(function () {
                      refresh();
                  }, 2000);
              }else{
                  DisplayTips(result.result);
              }
            }, true, null);

          /* ------------------- 创建 ------------------- */
          }else if (action == 'create') {

            $('#createDiskGroupModal').find('.modal-header').LoadData('show');
            addWaitMask();
            DataModel['createDiskgroup'](data, function (result) {
              $('#createDiskGroupModal').find('.modal-header').LoadData('hide');
              removeWaitMask();
              if (result == undefined)
                  return;
              if (result.code == 200) {
                  DisplayTips(result.result);
                  $('#createDiskGroupModal').modal('hide');
                  setTimeout(function () {
                      refresh();
                  }, 2000);
              }else{
                  DisplayTips(result.result);
              }
            }, true, null);

          /* ------------------- 创建存储池 ------------------- */
          } else if (action == 'createPool') {

            $('#createStoragepoolModal').find('.modal-header').LoadData("show");
            DataModel['createStoragePool'](data, function (result) {
              $('#createStoragepoolModal').find('.modal-header').LoadData("hide");
              if (result == undefined)
                  return;
              if (result.code == 200) {
                  DisplayTips(result.result);
                  $('#createStoragepoolModal').modal('hide');
                  $('.dt_g_left_bar .activel >ul>li.sub-menu:last').trigger('click')
              } else {
                  DisplayTips(result.result);
              }
            }, true, lang.storage.create_storagepool);
          }

        })


        /* ------------------- 创建磁盘组 ------------------- */
        .on('click', '#createDiskGroupModal .btn-primary', function (ev) {
            $modal = $('#createDiskGroupModal');
            diskNameInput = $('.spool-diskinfo-create  .root-name').val();

            //  磁盘组创建检测  //
            if (diskNameInput.indexOf('~') !== -1) {
              DisplayTips(lang.storage.diskgroup_name_illegal);
              return ;
            }

            if ($modal.find('.root-name').val() == '') {
                DisplayTips(lang.storage.input_dg_name);
                return;
            }
            // 检测重名
            var dgNameArray = [];
            $('.spool-diskinfo-list').each(function () {
              dgNameArray.push($(this).find('.diskgroup-name').text());
            })
            if (dgNameArray.indexOf($modal.find('.root-name').val()) >= 0) {
                DisplayTips(lang.storage.dg_name_check);
                return
            }

            if($('.host-list').text() == ''){
                DisplayTips(lang.storage.dg_name_must_host);
                return
            }
            // 检测层级数据是否已经添加完全
            if(!checkCreateLevelData()){
              return DisplayTips(lang.storage.dg_edit_tip3);
            }

            var result = "";
            var lastrank = 6;
            var undonelevel = [];
            var pisition = 0 ;
            for(var i=$('.js-level-mark').length-1;i>=0;i--){
                var disklevel = $('.js-level-mark:eq('+i+')').data('mark');
                var diskgroupname = $('.js-level-mark:eq('+i+')').data('name');
                if(levelToRank(disklevel) < lastrank){
                    result='{"type":"'+disklevel+'","name":"'+diskgroupname+'","items":['+result+']}';
                    lastrank = levelToRank(disklevel);
                }else if(levelToRank(disklevel) == lastrank){
                    result='{"type":"'+disklevel+'","name":"'+diskgroupname+'","items":[]},'+result+'';
                    lastrank = levelToRank(disklevel);
                }else{
                    undonelevel.push(i);
                }
            }

            var undoneresult = "";
            for(var m=undonelevel.length-1;m>=0;m--){
                var disklevel = $('.js-level-mark:eq('+(undonelevel[m])+')').data('mark');
                var $diskgroup = $('.js-level-mark:eq('+(undonelevel[m])+')');
                var diskgroupnamediffer ='';
                var diskgroupname = String($diskgroup.data('name'));
                function uppperLevel(a){
                    if(levelToRank(a.find('.js-level-mark').data('mark'))>=levelToRank(disklevel) || a.find('.js-level-mark').data('mark') ==undefined){
                        uppperLevel(a.prev());
                    }else{
                        return diskgroupnamediffer = String(a.find('.js-level-mark').data('name'));
                    }
                }
                uppperLevel($diskgroup.parent());
                var keylength = result.indexOf(diskgroupnamediffer)+11+diskgroupnamediffer.length;
                String.prototype.insert = function (index, item) {
                    var temp = [];
                    for (var i = 0; i < this.length; i++) {
                        temp.push(this[i]);
                    }
                    temp.splice(index, 0, item);
                    return temp.join("")
                }
                undoneresult = '{"type":"'+disklevel+'","name":"'+diskgroupname+'","items":[]}'
                result = result.insert(keylength, undoneresult);
                undoneresult = '';
            }
            result = '{"type":"root","name":"'+$modal.find('.root-name').val()+'","items":['+result+']}';
            function insertcomma(r){
                if(r.indexOf("}{")>=0){
                    r = r.insert(r.indexOf("}{")+1, ",");
                    insertcomma(r)
                }else{
                    return result = r
                }
            }
            insertcomma(result);
            var para;
            para = {
                'info': result,
            };

            /* ------------------- 检测主机是否对应磁盘 ------------------- */
            var dgdata = JSON.parse(result);

            // 更新编辑模态框的选中层级数据
            var nowCreateExitLevel = [];
            for (var i = 0; i < $('#createDiskGroupModal .click-diskgroup-level').length; i++) {
              if( $('#createDiskGroupModal .click-diskgroup-level:eq('+i+')').find('span').hasClass('hidden') ){
                continue;
              }
              nowCreateExitLevel.push($('#createDiskGroupModal .click-diskgroup-level:eq('+i+')').data('level'));
            }

            if (!checkDiskgroup(dgdata, nowCreateExitLevel)) {
              return DisplayTips(lang.storage.dg_edit_tip3);
            }

            /* ------------------- 对数据添加level标识 ------------------- */
            para.info = JSON.stringify(
              formatLevelDiskgroup.clearDisk(
                formatLevelDiskgroup.do(dgdata, true, true),
                true
              )
            );

            // 验证复用
            $('#createDiskGroupModal').find('.modal-header').LoadData('show');
            DataModel['dgRepeatDiskCheck'](para, function (rsp) {
              $('#createDiskGroupModal').find('.modal-header').LoadData('hide');

              para.info = JSON.stringify(
                formatLevelDiskgroup.clearDisk(
                  JSON.parse(para.info)
                )
              );

              if (rsp.code == 200) {
                if (rsp.result === false) {

                  $('#createDiskGroupModal').find('.modal-header').LoadData('show');
                  addWaitMask();
                  DataModel['createDiskgroup'](para, function (result) {
                    $('#createDiskGroupModal').find('.modal-header').LoadData('hide');
                    removeWaitMask();
                    if (result == undefined)
                        return;
                    if (result.code == 200) {
                        DisplayTips(result.result);
                        $modal.modal('hide');
                        setTimeout(function () {
                            refresh();
                        }, 2000);
                    }else{
                        DisplayTips(result.result);
                    }
                  }, true, null);

                }else {
                   $('#confirmToReuse .modal-body > p').text(lang.storage.dg_disk_reuse_tips);
                   $('#confirmToReuse').data('data', para);
                   $('#confirmToReuse').data('action', 'create');
                   $('#confirmToReuse').modal('show');
                }
              }else {
                DisplayTips(lang.storage.dg_reuse_check_fail)
              }
            }, true, null);


        })
        //删除磁盘组
        .on('click', '.del_disk_group', function (ev) {
            $modal = $('#delDiskGroupModal');
            $modal.modal('show');
            var scallback = function (result) {
                $modal.find('.modal-header').LoadData("hide");
                removeWaitMask();
                if (!result)
                    return;
                if (result.code == 200) {
                    var usedgnum = 0
                    var diskgroupstr = ''
                    for(var i=0;i<result.result.length;i++){
                        if(result.result[i].dg_name == $('.delactive').data('title')){
                            usedgnum++;
                            diskgroupstr+= result.result[i].name + ' '
                        }
                    }
                    if(usedgnum != 0){
                        $modal.find('.btn-primary').addClass('hidden');
                        $modal.find('p').text(''+lang.storage.del_dg1+''+usedgnum+''+lang.storage.del_dg2+''+$('.delactive').data('title')+''+lang.storage.del_dg3+'')
                        $modal.find('.delete-diskinfo').text(''+lang.storage.del_dg4+''+diskgroupstr+'')
                    }else{
                        $modal.find('.btn-primary').removeClass('hidden');
                        $modal.find('p').text(''+lang.storage.del_dg5+'')
                    }
                }
                else {
                    DisplayTips(result.result);
                }
            }
            $('.del_disk_group').removeClass('delactive');
            $(this).addClass('delactive');
            addWaitMask();
            $modal.find('p').text('');
            $modal.find('.delete-diskinfo').text('');
            $modal.find('.modal-header').LoadData("show");
            DataModel['listAllStorages'](null, scallback, true, null);
        })
        .on('click', '#delDiskGroupModal .btn-primary', function (ev) {
            $modal = $('#delDiskGroupModal');
            var parameter = {
                'name': $('.delactive').data('title'),
            };
            var callback = function (result) {
                $modal.find('.modal-header').LoadData("hide");
                removeWaitMask();
                if (!result)
                    return;
                if (result.code == 200) {
                    DisplayTips(result.result);
                    $modal.modal('hide');
                    setTimeout(function () {
                        refresh();
                    }, 2000);
                }
                else {
                    DisplayTips(result.result);
                }
            }
            $modal.find('.modal-header').LoadData('show');
            addWaitMask();
            DataModel['deleteDiskgroup'](parameter, callback, true, lang.disk_rescan);
        })

// 编辑
        .on('click', '.js-expand-capacity-spool', function (ev) {
          $modal = $('#expandCapacityModal');
          $modal.modal('show');
          $modal.data('copy', 'no');
          $modal.find('#expandCapacityModalLabel').text(lang.edit);
          $modal.find('.root-name-copy').addClass('hidden');
          $modal.find('.root-name').removeClass('hidden');
          $modal.find('.dg_edit_tip').removeClass('hidden');
          updateEditModal(this);

          // 清空dgLevelMap缓存
          dgLevelMap.clear();

          // 禁用编辑
          var isCopy = $('#expandCapacityModal').data('copy') == 'yes';
          if (!isCopy) {
            $('#expandCapacityModal').find('.glyphicon-pencil').addClass('hidden');
            $modal.find('#clearLevelCopy').addClass('hidden');
          }

          // 更新选中层级数据
          for (var i = 0; i < $('.click-diskgroup-level-edit').length; i++) {
            if( $('.click-diskgroup-level-edit:eq('+i+')').find('span').hasClass('hidden') ){
              continue;
            }
            nowEditExitLevel.push($('.click-diskgroup-level-edit:eq('+i+')').data('level'));
          }

        })

        /* ------------------- DG mgm ------------------- */
        .on('click', '.dt_g_left_bar .activel >ul>li.sub-menu:first', function (ev) {
            localStorage.poolfresh = 0;
            isDgLoad = false;
            $(this).parent().find('li').removeClass('active');
            $(this).addClass('active');
            refresh();
        })
        /* ------------------- Pool mgm ------------------- */
        .on('click', '.dt_g_left_bar .activel >ul>li.sub-menu:last', function (ev) {
            $('.dt_g_right_subdiv_second').LoadData('hide');
            localStorage.poolfresh = 1;
            listLoaded = false;
            var that = this;
            $('.bs-docs-grid').css('display', 'block');
            $('.bs-disk-grid').css('display', 'none');
            $(this).parent().find('li').removeClass('active');
            $(this).addClass('active');
            $('.bottom-icons-act').removeClass('hidden').attr({'data-original-title':lang.storage.create_storagepool,'title':lang.storage.create_storagepool}).children().addClass('js-create-stpool').removeClass('js-create-dg');
            //列举出所有的存储池信息
            var scallback = function (result) {
                $('.bs-docs-grid').LoadData('hide');
                DataModel['listDetailBytype'](null, diskcallback, true, null);
                if (result == undefined)
                    return;
                if (result.code == 200) {
                    //for start
                    var ret = result.result;
                    allStorages = JSON.parse(JSON.stringify(ret)); // 缓存所有存储池数据

                    var htm = '';
                    for(var i=0,len=ret.length;i<len;i++){
                        var retval = ret[i];
                        htm += '<div class="col-xs-12 col-md-5 col-lg-6  box-shadow grid-item grid-item-style storage-pool-detail"data-poolname="'+
                            retval.name +'"data-basepool="'+ retval['is_tier']['basepool'] +'"data-tierpool="'+ retval.has_tier.tierpool +'"><div class="basic_content"><div class="share_header">';
                        var img ='';
                        if(!isEmptyObj(retval.has_tier)){
                            if(!isEmptyObj(retval.is_tier)){
                                img = '<img src="css/image/tier1.png" style="width:43px">';
                            }else{
                                img = '<img src="css/image/tier2.png" style="width:43px">';
                            }
                        }else{
                            if (!isEmptyObj(retval.is_tier)) {
                                img = '<img src="css/image/tier3.png" style="width:43px">';
                            } else {
                                img ='<img src="css/image/tier4.png" style="width:43px">';
                            }
                        }
                        htm += img + '<span class="ellipsis"title="'+ retval.name +'">'+
                        retval.name +'</span><div class="hidden js-storagepool-act"style="display:inline;"><a class="fl-rt js-delete-pool"href="javascript:;"title="'+
                        lang.storage.del_storagepool +'"><img src="css/image/delete.png"style="width:43px"class="test"></a><a class="fl-rt js-set-quota"href="javascript:;"title="'+ lang.storage.allocation_size +'"style="margin-right: 8px;"><img src="css/image/setting.png"style="width:43px"class="test"></a>';

                        if(retval.is_avail == 'available' || retval.is_avail == 'unavailable'){
                            // htm += '<a class="fl-rt js-edit-tier" href="javascript:;" style="margin-right: 8px;"><img src="css/image/edit.png"style="width:43px"class="test"title="'+
                            // lang.storage.add_cache_tier +'"></a><a class="fl-rt js-delete-tier" href="javascript:;" style="margin-right: 8px;"><img src="css/image/minus.png"style="width:43px"class="test"title="'+
                            // lang.storage.remove_cache_tier +'"></a>';
                        }
                        htm += '</div></div>';
                        var totalBy = formatCapacity(retval.used_bytes + retval.avail_bytes);
                        var useBy = formatCapacity(retval.used_bytes);
                        var availbleBy = formatCapacity(retval.avail_bytes);
                        var quota = '';
                        if(retval.quota_max_bytes != undefined){
                             quota  = formatCapacity(retval.quota_max_bytes);
                        }else{
                            quota  = '-';
                        }

                        htm += '<div style="text-align:left;"><div class="basic_cont_row"><div class="fl-lt">'+ lang.storage.storage_total_capacity +'：</div><div class="fl-lt"><span>'+ totalBy +'</span></div></div><div class="basic_cont_row"><div class="fl-lt">'+ lang.storage.storage_used_capacity +'：</div><div class="fl-lt">'+ useBy +'</div></div><div class="basic_cont_row"><div class="fl-lt">'+
                        lang.storage.storage_avail_capacity +'：</div><div class="fl-lt">'+ availbleBy +'</div></div><div class="basic_cont_row"><div class="fl-lt">'+ lang.storage.diskgroup +'：</div><div class="fl-lt">'+ retval.dg_name +'</div></div><div class="basic_cont_row"><div class="fl-lt">'+ lang.storage.allocation_size +'：</div><div class="fl-lt"><input type="text"class="none-border-input"style=""value="'+ quota +'"disabled="disabled"/></div></div>';
                        if( !isEmptyObj(retval.is_tier)){
                            htm += '<div class="basic_cont_row"><div class="fl-lt">'+
                            lang.storage.is_tier_name +'：</div><div class="fl-lt">'+
                            retval.is_tier.basepool +'</div></div><div class="basic_cont_row"><div class="fl-lt">'+ lang.storage.is_tier_mode +'：</div><div class="fl-lt">'+ retval.is_tier.tier_mode +'</div></div>';
                        }
                        if(!isEmptyObj(retval.has_tier)){
                            htm += '<div class="basic_cont_row"><div class="fl-lt">'+
                            lang.storage.has_tier_name +'：</div><div class="fl-lt is_tier_pool">'+ retval.has_tier.tierpool +'</div></div><div class="basic_cont_row"><div class="fl-lt">'+
                            lang.storage.has_tier_mode +'：</div><div class="fl-lt">'+
                            retval.has_tier.tier_mode +'</div></div>';
                        }
                        htm += '<div class="basic_cont_row"><div class="fl-lt">'+lang.storage.fault_domain +'：</div><select class="fault-domain-select none-border-input"style="margin-top: -5px">'
                        var htmloption = '<option value="'+retval.failure_domain+'">'+retval.failure_domain+'</option>';

                        var arroption;
                        if(retval.dg_name == 'default'){
                            arroption =['host','disk']
                        }else{
                            $('.dglist-level').each(function () {
                                if($(this).data('dglevel') == retval.dg_name){
                                    arroption = $(this).data('strfaultdomain') ? $(this).data('strfaultdomain').split(",") : ['host', 'disk'];
                                }
                            })
                        }
                        arroption.splice(arroption.indexOf(retval.failure_domain),1);
                        for(var m=0;m<arroption.length;m++){
                            htmloption += '<option value="'+arroption[m]+'">'+arroption[m]+'</option>'
                        }

                        htm += htmloption+'</select></div><div class="basic_cont_row"><div class="fl-lt">'+lang.storage.data_protection_policy +'：</div><div class="fl-lt">';
                        var replicated = ' ';
                        var erasure = ' ';
                        if(retval.type == 'replicated'){
                            htm += '<span>'+ lang.storage.duplicate +'</span>';
                            replicated = '<div class="basic_cont_row"><div class="fl-lt">'+
                            lang.storage.totalData +'：</div><div class="fl-lt"><input type="text"class="none-border-input"style=""value="'+ retval.size +'"disabled="disabled"/></div></div>';
                        }else{
                            htm += '<span>'+ lang.storage.erasure_code +'</span>'
                            erasure = '<div class="basic_cont_row"><div class="fl-lt">'+
                             lang.storage.erasure_code +'：</div><div class="fl-lt"><span>k=</span><input type="text"class="none-border-input"style=""value="'+ retval.ksize +'"disabled="disabled"/></div><div class="fl-lt"><span>m=</span><input type="text"class="none-border-input"style="width:50px"value="'+ retval.msize +'"disabled="disabled"/></div></div>';
                        }

                        // applicationType
                        var applicationStr = "";
                        retval.application.forEach(function (appl, index) {
                          if (index === retval.application.length - 1) {
                            applicationStr += lang.storage[appl];
                          }else {
                            applicationStr += lang.storage[appl];
                            applicationStr += ',';
                          }
                        });
                        var applicationType =
                          '<div class="basic_cont_row">' +
                              '<div class="fl-lt">'+ lang.storage.application_type + '：' +
                              '</div>'+
                              '<div class="fl-lt">'+
                                  '<span>'+ applicationStr +'</span>'+
                              '</div>'+
                          '</div>';

                        htm += '</div></div>' + erasure + replicated + applicationType +'</div></div></div>';
                    }
                    //end for
                    // $('.dt_g_right_subdiv_second').find('.bs-docs-grid').css('padding-bottom', '25px');
                    var html = '<div class="row show-grid grid js-masonry">' + htm + '</div>';
                    $('.dt_g_right_subdiv_second').find('.bs-docs-grid').html(html);

                    for (var i = 0; i < $('.storage-pool-detail .ellipsis').length; i++) {
                        var poolname = $('.storage-pool-detail .ellipsis:eq(' + i + ')');
                        if (poolname.text().length > 16) {
                            var poolnamestr = poolname.text().substr(0, 16) + '...';
                            poolname.html(poolnamestr);
                        }
                    }

                    // 这边开始定时做poolstatus检测
                    poolStatusCheck();
                    !poolStatusCheckTimer && ( poolStatusCheckTimer = setInterval(poolStatusCheck, 60e3) );

                    setTimeout(function () {
                      $('.grid').masonry({
                        itemSelector: '.grid-item',
                        columnWidth: '.col-lg-6',
                        percentPosition: true,
                      });
                    }, 500);
                }  //if结束
            }
            $('.bs-docs-grid').LoadData('show');

            clearInterval(toggleTimer);
            toggleTimer = setInterval(function () {
              if (isDgLoad) {
                clearInterval(toggleTimer);
                DataModel['listAllStorages'](null, scallback, true, null);
              }
            }, 2e3);

            // var result = {};
            // scallback(result);
            $('#createStoragepoolModal').find('.modal-header').LoadData('show');

            $(document)
            //新建存储池时，对已选择的磁盘计数
                .on('click', '#selectDiskModal .js-sel-all, #selectDiskModal .sub-check-disk, #selectDiskModal .sub-check-disk', function (ev) {
                    $('#selectDiskModal .js-node .badge').each(function (i) {
                        var hadChoose;
                        hadChoose = $(this).closest('tr').next('.subdisks').find('input:checked').length;
                        var total = $(this).closest('tr').next('.subdisks').find('input').length;
                        $(this).text(hadChoose + '/' + total);
                    });
                })
                .on('click', '#addCacheTierModal .js-sel-all, #addCacheTierModal .sub-check-disk', function (ev) {
                    $('#addCacheTierModal .js-node .badge').each(function (i) {
                        var hadChoose = $(this).closest('tr').next('.subdisks').find('input:checked').length;
                        var total = $(this).closest('tr').next('.subdisks').find('input').length;
                        $(this).text(hadChoose + '/' + total);
                    });
                })
                .on('mouseover', '.storage-pool-detail', function (ev) {
                    $this = $(this);
                    var hasCache = ($this.closest('.storage-pool-detail').find('.cache-diskinfo-list').length !== 0);
                    $this.find('.js-storagepool-act').removeClass('hidden');
                    if (hasCache) {
                        $this.find('.js-shrink-capacity-cache').removeClass('hidden');
                        $this.find('.js-expand-capacity-cache').removeClass('hidden');
                    }
                    $this.find('.js-unfold-cacheosds').removeClass('hidden');
                    $this.find('.js-unfold-osds').removeClass('hidden');
                })
                .on('mouseout', '.storage-pool-detail', function (ev) {
                    $this = $(this);
                    $this.find('.js-storagepool-act').addClass('hidden');
                    $this.find('.js-unfold-cacheosds').addClass('hidden');
                    $this.find('.js-unfold-osds').addClass('hidden');
                })
                .on('click', '.storage-pool-detail', function (ev) {
                    $this = $(this);
                    $('.js-popver-expand').addClass('hidden');
                    $('.js-popver-shrink').addClass('hidden');
                })
                .on('click', '.js-create-stpool', function (ev) {
                    $modal = $('#createStoragepoolModal');
                    htm = '';
                    $modal.find('#add_cache_info').html(htm);
                    $modal.find('#add_osdlist').html(htm);
                    $modal.find('.js-select-disk-pool').closest('.form-group').after(htm);
                    // var htm='<option value="default">default';
                    var htm='';

                    // 获取所有磁盘组
                    for(var i=0;i<totaldgnamearr.length;i++){
                        htm+='<option value="'+totaldgnamearr[i]+'">'+totaldgnamearr[i]+''
                    }
                    $modal.find('#dgname').html(htm);
                    // 获取故障域

                    var value = $('#createStoragepoolModal').find('#dgname').val();
                    var arroption = [];
                    var htmloption = '';
                    $('.bs-disk-grid .dglist-level').each(function () {
                      if($(this).data('dglevel') == value){
                        arroption = $(this).data('strfaultdomain').split(",")
                      }
                    });
                    for(var m=0;m<arroption.length;m++){
                        htmloption += '<option value="'+arroption[m]+'">'+arroption[m]+'</option>'
                    }

                    $('#failure_domain').html(htmloption);

                    // $modal.find('#failure_domain').html('<option value="host">host</option><option value="disk">disk</option>');


                    $modal.modal('show');
                    setTimeout(function () {
                        $("#storage_pool_name").focus();
                    }, 500);
                })
                .on('change', '#data_protect', function (ev) {
                    $this = $(this);
                    var dvalue = $this.val();
                    if (dvalue == 0 || dvalue == '0') {
                        $('#erasurecode').removeClass('hidden');
                        $('#duplicate').closest('.form-group').addClass('hidden');
                    } else if (dvalue == 1 || dvalue == '1') {
                        $('#erasurecode').addClass('hidden');
                        if ($('#duplicate').closest('.form-group.hidden').length) {
                            $('#duplicate').closest('.form-group').removeClass('hidden');
                        }
                    }
                })
                .on('change', '#storage_tiering', function (ev) {
                    $this = $(this);
                    var tvalue = $this.val();
                    if (tvalue == 0 || tvalue == '0') {
                        $('#data_layer').closest('.form-group').removeClass('hidden');
                    } else if (tvalue == 1 || tvalue == '1') {
                        $('#data_layer').closest('.form-group').addClass('hidden');
                    }
                })
                //添加缓存层
                .on('click', '.js-edit-tier', function (ev) {
                    $this = $(this);
                    $grid = $this.closest('.storage-pool-detail');
                    $grid.siblings('.storage-pool-detail').removeClass('deling');
                    $grid.addClass('deling');
                    var poolname = $grid.data('poolname');
                    $modal = $('#addPoolTierModal');
                    var para = {
                        'cache_pool': 'no',
                    };
                    var dncallback = function (result){
                        $modal.find('.modal-header').LoadData("hide");
                        if(result == undefined)
                            return;
                        if(result.code == 200){
                            var data = result.result;
                            var htm = "";
                            for (var i = 0; i < data.length; i++) {
                                htm += '<option value="' + data[i].poolname + '">' + data[i].poolname + '</option>';
                            };
                            $modal.find('#tiername').html(htm);
                        } else {
                            DisplayTips(result.result);
                        }
                    }
                    $modal.find('.modal-header').LoadData("show");
                    DataModel["listSpool"]( para, dncallback, true, "")
                    $modal.modal('show');
                    $modal.data('name', poolname);
                })
                .on('click', '#addPoolTierModal .btn-primary', function (ev) {
                    $modal = $('#addPoolTierModal');
                    var poolname = $modal.data('name');
                    var tierpoolname = $modal.find('#tiername option:selected').val();
                    var tiermode = $modal.find('#tier_mode option:selected').val();
                    var para = {
                        'basepool': poolname,
                        'tierpool': tierpoolname,
                        'mode': tiermode,
                    }
                    var dncallback = function (result) {
                        $modal.find('.modal-header').LoadData("hide");
                        if (result == undefined)
                            return;
                        if (result.code == 200) {
                            DisplayTips(result.result);
                            $('.dt_g_left_bar .activel >ul>li.sub-menu:last').trigger('click')
                        } else {
                            DisplayTips(result.result);
                        }
                        $modal.modal('hide');
                    }
                    $modal.find('.modal-header').LoadData("show");
                    DataModel['addTier'](para, dncallback, true, '');
                })
                //删除缓存层
                .on('click', '.js-delete-tier', function (ev) {
                    var poolname;
                    var tierpoolname;
                    $this = $(this);
                    $grid = $this.closest('.storage-pool-detail');
                    $grid.siblings('.storage-pool-detail').removeClass('deling');
                    $grid.addClass('deling');
                    $modal = $('#removePoolTierModal');
                    $modal.find('.modal-body p').html(lang.storage.sureto_del_tier + '<span style="color:red;">&nbsp;' + $grid.data('poolname') + '</span>' + '?');
                    $modal.modal('show');
                    if($grid.data('basepool')){
                        tierpoolname = $grid.data('poolname');
                        poolname = $grid.data('basepool');
                    }else {
                        tierpoolname = $grid.data('tierpool');
                        poolname = $grid.data('poolname');
                    }
                    $modal.data('poolname', poolname);
                    $modal.data('tierpoolname', tierpoolname);
                })
                .on('click', '#removePoolTierModal .btn-primary', function (ev) {
                    $modal = $('#removePoolTierModal');
                    var poolname = $modal.data('poolname');
                    var tierpoolname = $modal.data('tierpoolname');
                    var para = {
                        'basepool': poolname,
                        'tierpool': tierpoolname,
                    }
                    var dncallback = function (result) {
                        $modal.find('.modal-header').LoadData("hide");
                        if (result == undefined)
                            return;
                        if (result.code == 600) {
                            DisplayTips(result.result);
                            $('.dt_g_left_bar .activel >ul>li.sub-menu:last').trigger('click')
                        } else {
                            DisplayTips(result.result);
                        }
                        $modal.modal('hide');
                    }
                    $modal.find('.modal-header').LoadData("show");
                    DataModel['removeTier'](para, dncallback, true, '');
                })
                //删除存储池
                .on('click', '.js-delete-pool', function (ev) {
                    $this = $(this);
                    $grid = $this.closest('.storage-pool-detail');
                    $grid.siblings('.storage-pool-detail').removeClass('deling');
                    $grid.addClass('deling');
                    var poolname = $grid.data('poolname');
                    $modal = $('#delStoragePoolModal');
                    $modal.find('.modal-body p').html(lang.storage.sureto_del_storagepool + '<span style="color:red;">&nbsp;' + poolname + '</span>' + '?');
                    $modal.modal('show');
                    $modal.data('name', poolname);
                })
                .on('click', '#delStoragePoolModal .btn-danger', function (ev) {
                    $modal = $('#delStoragePoolModal');
                    var poolname = $modal.data('name');
                    var para = {
                        'poolName': poolname,
                    }
                    var dncallback = function (result) {
                        $modal.find('.modal-body').LoadData("hide");
                        if (result == undefined)
                            return;
                        if (result.code == 200) {
                            DisplayTips(result.result);
                            $('.storage-pool-detail.deling').remove();
                            $('.grid').masonry({
                                itemSelector: '.grid-item',
                                columnWidth: '.col-lg-6',
                                percentPosition: true,
                            });
                        } else {
                            DisplayTips(result.result);
                        }
                        $modal.modal('hide');
                    }
                    $modal.find('.modal-body').LoadData("show");
                    DataModel['delStoragePool'](para, dncallback, true, lang.storage.del_storagepool);
                })
                //展开磁盘详情(存储池)
                .on('click', '.js-unfold-osds', function (ev) {
                    $this = $(this);
                    $grid = $this.closest('.storage-pool-detail');
                    $list = $grid.find('.spool-diskinfo-list');
                    foldDiskInfo($this, $grid, $list);
                })
                //展开磁盘详情
                .on('click', '.js-unfold-cacheosds', function (ev) {
                    $this = $(this);
                    $grid = $this.closest('.storage-pool-detail');
                    $list = $grid.find('.cache-diskinfo-list');
                    foldDiskInfo($this, $grid, $list);
                })
                //set quota
                .on ( 'click' ,'.js-set-quota', function (ev) {
                    $modal = $('#setPoolQuotaModal');
                    var poolname = $this.closest('.storage-pool-detail').data('poolname');
                    $this.closest('.storage-pool-detail').removeClass('gridactive');
                    $this.closest('.storage-pool-detail').addClass('gridactive');
                    $('#pool_quota_cached').removeClass('disabled');
                    if($this.closest('.storage-pool-detail').data('type') == 0){
                        $('#pool_quota_cached').addClass('disabled');
                    }
                    var para = {
                        'poolname': poolname,
                        'cached': 'no',
                    }
                    var callback = function (result) {
                        $modal.find('.modal-header').LoadData ("hide");
                        if (result == undefined)
                            return;
                        if (result.code == 200) {
                            var quatavalue = formatCapacity(result.result.quota_max_bytes);
                            var arr = quatavalue.split(' ');
                            var quotaunit = arr[0];
                            $modal.find('#pool_quota_value').val(quotaunit);
                            if(quotaunit == 0){
                                $modal.find('#pool_quota_unit').val('GB');
                            }else{
                                $modal.find('#pool_quota_unit').val(quatavalue.substr(-2));
                            }
                        } else {
                        }
                    }
                    $modal.find('.modal-header').LoadData ("show");
                    DataModel['poolQuotaget'] (para, callback, true, '' );
                    $modal.find('#pool_quota_name').text($this.closest('.storage-pool-detail').data('poolname'));
                    $modal.modal('show');
                })
                .on ('click', '#setPoolQuotaModal .btn-primary', function (ev) {
                    $modal = $('#setPoolQuotaModal');
                    $grid = $('.storage-pool-detail.gridactive');
                    var poolname = $modal.find('#pool_quota_name').text();
                    var cached = $modal.find("#pool_quota_cached option:selected").text();
                    var quatavalue = $modal.find('#pool_quota_value').val().trim();
                    var quataunit = $modal.find("#pool_quota_unit option:selected").text();
                    if(cached == 'no'){
                        var maxquotavalue = $grid.find('.max_avail_spool').data('spool');
                    }else{
                        var maxquotavalue = $grid.find('.max_avail_cachepool').data('spool');
                    }
                    if(!valifyNumber(quatavalue) || quatavalue >= 1024 || quatavalue < 1) {
                        DisplayTips(lang.storage.quotavalue_range);
                        return;
                    }
                    if(quataunit == 'TB'){
                        quatavalue = quatavalue* 1024*1024*1024*1024;
                    }else if(quataunit == 'GB'){
                        quatavalue = quatavalue* 1024*1024*1024;
                    }
                    if(quatavalue > maxquotavalue * 1024){
                        DisplayTips(lang.storage.quotavalue_over);
                        return;
                    }
                    var para = {
                        'poolname': poolname,
                        'type': 'byte',
                        'value': quatavalue,
                        'cached': cached,
                    }
                    var callback = function (result) {
                        $modal.find('.modal-header').LoadData ("hide");
                        if (result == undefined)
                            return;
                        if (result.code == 200) {
                            DisplayTips( lang.storage.storagepool + ": " + para.poolname + " " + lang.storage.set_pool_quota_success );
                            setTimeout("refresh()", 2000);
                        } else {
                            DisplayTips( lang.storage.set_pool_quota_fail );
                        }
                        $modal.modal('hide');
                    }
                    $modal.find('.modal-header').LoadData ("show");
                    DataModel['poolQuotaset'] (para, callback, true, '' );
                })
                .on ('click', '#setPoolQuotaModal .btn-danger', function (ev) {
                    $modal = $('#setPoolQuotaModal');
                    var poolname = $modal.find('#pool_quota_name').text();
                    var cached = $modal.find("#pool_quota_cached option:selected").text();
                    var para = {
                        'poolname': poolname,
                        'type': 'byte',
                        'value': 0,
                        'cached': cached,
                    }
                    var callback = function (result) {
                        $modal.find('.modal-header').LoadData ("hide");
                        if (result == undefined)
                            return;
                        if (result.code == 200) {
                            DisplayTips( lang.storage.del_pool_quota_success );
                            setTimeout("refresh()", 2000);
                        } else {
                            DisplayTips( lang.storage.del_pool_quota_fail );
                        }
                        $modal.modal('hide');
                    }
                    $modal.find('.modal-header').LoadData ("show");
                    DataModel['poolQuotaset'] (para, callback, true, '' );
                })
                .on('input', '#createStoragepoolModal #storage_pool_name', function (ev) {
                  var poolName = $(this).val();
                  var reg = valifyKeyWord(poolName);
                  if (reg) {
                    DisplayTips( lang.storage.key_word_error  );
                    $('#createStoragepoolModal .btn.btn-primary').addClass('disabled');
                    // $(this).val(poolName.replace(reg, ''));
                  }else {
                    $('#createStoragepoolModal .btn.btn-primary').removeClass('disabled');
                  }
                })
                //创建存储池
                .on('click', '#createStoragepoolModal .btn-primary', function (ev) {
                    $modal = $('#createStoragepoolModal');
                    var poolName = trim($modal.find('#storage_pool_name').val());
                    var failureDomain = $('#failure_domain option:selected').val();
                    var applicationType = $('#application_type option:selected').val();
                    var dgName = $('#dgname option:selected').val();
                    var datapro = $modal.find('#data_protect').val();
                    var redundancy = '',
                        repNum = '',
                        kNum = '',
                        mNum = ''
                    if (poolName == '') {
                        DisplayTips(lang.storage.input_storagepool_name);
                        return;
                    }
                    if (poolName.length > 32) {
                        DisplayTips(lang.cluster.name_too_long);
                        return;
                    }
                    reg = /[\W]/g;
                    if (reg.test(poolName)) {
                        DisplayTips(lang.storage.input_storagepool_wrong);
                        return;
                    }

                    // if(pooldgnamearr.indexOf(dgName) >= 0){
                    //     DisplayTips(lang.storage.dg_no_disk);
                    //     return;
                    // }
                    if (datapro == '0') {
                        redundancy = 'erasure';
                        kNum = trim($modal.find('#erasurecode .k-eras-value').find('input').val());
                        mNum = trim($modal.find('#erasurecode .m-eras-value').find('input').val());
                        if (kNum == '' || mNum == '') {
                            DisplayTips(lang.storage.input_erasure_k_or_m);
                            return;
                        }
                        //纠删码k>m>0
                        else if (parseInt(kNum) <= parseInt(mNum)) {
                            DisplayTips(lang.storage.k_more_than_m);
                            return;
                        } else if (kNum.match(/^[1-9]\d*$/) === null || mNum.match(/^[1-9]\d*$/) === null) {
                            DisplayTips(lang.storage.input_erasure_int);
                            return;
                        }
                    } else if (datapro == '1') {
                        redundancy = 'replicated';
                        repNum = trim($modal.find('#duplicate').val());
                    }

                    var param = {
                        'name': poolName,
                        'type': redundancy,
                        'size': repNum,
                        'ksize': kNum,
                        'msize': mNum,
                        'dg_name': dgName,
                        'failure_domain': failureDomain,
                        'application': applicationType,
                    };
                    var para = {
                        'info': JSON.stringify(param),
                    }

                    /* ------------------- 验证磁盘组复用 ------------------- */
                    $modal.find('.modal-header').LoadData("show");
                    DataModel['dgRepeatCheck']({dg_name: param.dg_name}, function (rsp) {
                      $modal.find('.modal-header').LoadData("hide");
                      if (rsp.code == 200) {
                        if (rsp.result === false) {

                          $modal.find('.modal-header').LoadData("show");
                          DataModel['createStoragePool'](para, function (result) {
                            $modal.find('.modal-header').LoadData("hide");
                            if (result == undefined)
                                return;
                            if (result.code == 200) {
                                DisplayTips(result.result);
                                $('.dt_g_left_bar .activel >ul>li.sub-menu:last').trigger('click')
                                $modal.modal('hide');
                            } else {
                                DisplayTips(result.result);
                            }
                          }, true, lang.storage.create_storagepool);

                        }else {
                           $('#confirmToReuse .modal-body > p').text(lang.storage.dg_reuse_tips);
                           $('#confirmToReuse').data('data', para);
                           $('#confirmToReuse').data('action', 'createPool');
                           $('#confirmToReuse').modal('show');
                        }
                      }else {
                        DisplayTips(lang.storage.dg_reuse_check_fail)
                      }

                    }, true, null);
                })

                // 取消设置故障域
                .on('click', '#changeFailureDomainModal .btn-default', function () {
                  resetFailureDomain();
                })

                // 设置故障域弹窗
                .on('click', '#changeFailureDomainModal .btn-danger', function () {

                  var $modal = $('#changeFailureDomainModal');
                  var checkPara = {
                    dg_name: $modal.data('diskgroup'),
                    failure_domain: $modal.data('domain'),
                    size: $modal.data('size'),
                  }
                  var poolName = $modal.data('pool');
                  var oldDomain = $modal.data('oldDomain');

                  var $that = $('.storage-pool-detail[data-poolname='+poolName+']');
                  var value = checkPara.failure_domain;

                  $modal.modal('hide');

                  if ( checkPara.dg_name === '' || checkPara.size === '' ) {
                    return;
                  }

                  var parameter = {
                      'property': 'failure_domain',
                      'name': poolName,
                      'value': value,
                  };

                  var callback = function (result){
                    $that.find('.share_header').LoadData ("hide");
                      removeWaitMask();
                      if (result == undefined){
                        DisplayTips( lang.storage.fault_domain_edit_fail );
                        resetFailureDomain();  // 重置界面
                        return;
                      }
                      if (result.code == 200) {
                          DisplayTips( lang.storage.storagepool+': '+parameter.name+' '+lang.storage.fault_domain_edit_success );
                          for (var i = 0; i < allStorages.length; i++) {
                            if (allStorages[i].name == poolName) {
                              allStorages[i].failure_domain = value;
                              break;
                            }
                          }
                      } else {
                        DisplayTips( result.result || lang.storage.fault_domain_edit_fail );
                        resetFailureDomain();  // 重置界面
                      }
                  }

                  $that.find('.share_header').LoadData ("show");
                  DataModel['poolSet'](parameter, callback, true, "");

                })

                // 设置故障域
                .on('change','.fault-domain-select',function(){

                  // /* ------------------- 检测故障域是否可以更改 ------------------- */
                  var that = this;
                  var $modal = $('#changeFailureDomainModal');
                  var $parent =  $(this).parents('.storage-pool-detail');  // 父级
                  var poolName = $parent.data('poolname');
                  var nowFailureDomain = '';
                  var value = $(this).val();
                  var checkPara = {
                    dg_name: '',
                    failure_domain: value,
                    size: ''
                  };

                  for (var i = 0; i < allStorages.length; i++) {
                    if (allStorages[i].name == poolName) {
                      checkPara.dg_name = allStorages[i].dg_name;
                      nowFailureDomain = allStorages[i].failure_domain;
                      if (allStorages[i].ksize == 0 && allStorages[i].msize == 0) {
                        checkPara.size = allStorages[i].size;
                      }else {
                        checkPara.size = parseInt(allStorages[i].msize) + parseInt(allStorages[i].ksize);
                      }
                      break;
                    }
                  }

                  if ( checkPara.dg_name === '' || checkPara.size === '' ) {
                    return;
                  }

                  $modal.data('diskgroup', checkPara.dg_name);
                  $modal.data('domain', checkPara.failure_domain);
                  $modal.data('size', checkPara.size);
                  $modal.data('pool', poolName);
                  $modal.data('oldDomain', nowFailureDomain);

                  $parent.find('.share_header').LoadData('show');

                  // 检查故障域是否满足
                  DataModel['checkFailureDomain'](checkPara, function (result) {
                    $parent.find('.share_header').LoadData('hide');

                    if (result.code != 200 || result.result != true) {
                      removeWaitMask();
                      resetFailureDomain();  // 重置界面
                      return DisplayTips( result.result || lang.storage.fault_domain_rule_fail);
                    }else {
                      $modal.modal('show');
                    }
                  });

                })
                // 显示磁盘组对应的故障域
                .on('change','#dgname',function(){
                    $modal = $(this).closest('.storage-pool-detail')
                    var value = $(this).val();
                    var arroption;
                    var htmloption = '';
                    if(value == 'default'){
                        arroption =['host','disk']
                    }else{
                        $('.bs-disk-grid .dglist-level').each(function () {
                            if($(this).data('dglevel') == value){
                                arroption = $(this).data('strfaultdomain').split(",")
                            }
                        })
                    }
                    for(var m=0;m<arroption.length;m++){
                        htmloption += '<option value="'+arroption[m]+'">'+arroption[m]+'</option>'
                    }
                    $('#failure_domain').html(htmloption);
                })
        });

        // 存储池状态检测-用于禁用/启用故障域
        var poolStatusCheck = function () {
          DataModel['poolStatusCheck'](null, function (rsp) {
            if (rsp.code == 200) {
              if (!rsp.result) return DisplayTips(lang.storage.pool_status_check_fail);

              Object.keys(rsp.result).forEach(function (poolname) {

                if (!rsp.result[poolname]) {  // 禁用对应存储池的故障域切换
                  $('.storage-pool-detail[data-poolname='+poolname+']').find('.fault-domain-select').addClass('hidden');
                  var value = $('.storage-pool-detail[data-poolname='+poolname+']').find('.fault-domain-select').val();
                  $('.storage-pool-detail[data-poolname='+poolname+']').find('.select_disable').remove();
                  $('.storage-pool-detail[data-poolname='+poolname+']').find('.fault-domain-select').after($('<span class="select_disable">'+value+'</span>'));
                  $('.storage-pool-detail[data-poolname='+poolname+']').find('.select_disable').on('click', function () {
                    DisplayTips(lang.storage.pool_change_domain_disable);
                  });

                }else { //启用故障域编辑
                  $('.storage-pool-detail[data-poolname='+poolname+']').find('.fault-domain-select').removeClass('hidden');
                  var value = $('.storage-pool-detail[data-poolname='+poolname+']').find('.fault-domain-select').val();
                  $('.storage-pool-detail[data-poolname='+poolname+']').find('.select_disable').remove();
                }
              });

            }else {
              DisplayTips(lang.storage.pool_status_check_fail);
            }
          }, true, null);
        };

        // 取消设置故障域 func
        var resetFailureDomain = function () {

          // 将界面的故障域下拉框恢复
          var $modal = $('#changeFailureDomainModal');
          var oldDomain = $modal.data('oldDomain');
          var poolName = $modal.data('pool');
          var $that = $('.storage-pool-detail[data-poolname='+poolName+']');
          var $option = $that.find('select > option');

          var rollBackPage = function (oldDomain) {
            var html = '';
            var totalDomain = [];
            for (var i = 0; i < $option.length; i++) {
              var tempDomain = $that.find('select > option:eq('+i+')').attr('value');
              if (tempDomain != oldDomain) {
                totalDomain.push( tempDomain );
              }
            }
            totalDomain.unshift(oldDomain);
            totalDomain.forEach(function (domain) {
              html += '<option value="'+domain+'">'+domain+'</option>'
            });
            $that.find('select').html(html);
          };

          oldDomain && rollBackPage(oldDomain);

        };

    //创建存储池时，显示模态框上的磁盘列表
    function showDiskList(hostdiskData, type) {
        var htm = '';
        for (var i = 0; i < hostdiskData.length; i++) {
            var host = hostdiskData[i];
            if (host[type].length > 0) {
                htm += '<tr class="subdisks" data-ip="' + host['ip'] + '" data-host="' + host['hostname'] + '">' +
                    '<td colspan="6" style="padding:0;">' +
                    '<table class="table table-condensed table-hover" style="margin-left:11px;">' +
                    '<tbody>';
                for (var j = 0; j < host[type].length; j++) {
                    var disk = host[type][j];
                    var name, status, disktype, availble, size;
                    var usage = disk['usage'];
                    if (usage != '' && usage != undefined) {
                        if (usage['device'] == '') {
                            name = '--';
                        } else {
                            name = usage['device'].slice(5);
                        }
                        if (usage['available'] == '') {
                            availble = '--';
                        } else {
                            availble = disk['usage']['available'];
                            availble = formatCapacityKB(availble);
                        }
                        ;
                        if (disk['status'] == 'up') {
                            status = '<span style="color:green;">normal</span>';
                        } else {
                            status = '<span style="color:red;">abnormal</span>';
                        }
                        if (usage['size'] == '') {
                            size = '--';
                        } else {
                            size = usage['size'];
                            size = formatCapacityKB(size);
                        }
                        disktype = disk['disktype'];
                        if (disktype == '0' || disktype == 0) {
                            disktype = 'HDD';
                        } else if (disktype == '1' || disktype == 1) {
                            disktype = 'SSD';
                        } else {
                            disktype = '--';
                        }

                        htm += '<tr class="js-disk" data-id="' + disk['id'] + '">' +
                            '<td class="showleftborder" style="width:16.66%;">' +
                            '<div class="showcenterline" style="width:15px;float:left;"></div>' +
                            '<span class="flex">' + name + '</span>' +
                            '</td>' +
                            '<td style="width:16.66%;">' + status + '</td>' +
                            '<td style="width:16.66%;">' + disktype +
                            '</td>' +
                            '<td style="width:16.66%;">' + availble +
                            '</td>' +
                            '<td style="width:16.66%;">' + size +
                            '</td>' +
                            '<td style="width:16.66%;padding-left:22px;">' +
                            '<input type="checkbox" class="sub-check-disk">' +
                            '</td>' +
                            '</tr>';
                    }
                }
                ;
                htm += '</tbody>' +
                    '</table>' +
                    '</td>' +
                    '</tr>';
            }
        }
        ;
        return htm;
    }

    //创建储存池时显示已选择磁盘信息
    function stpoolAddDiskdetail($nodeinputs) {
        var htm = "";
        var hostList = [];
        var diskList = [];
        var arr = [];
        var para = '';
        htm += '<table class="table">' +
            '<thead>' +
            '<tr> <th class="col-sm-6">' + lang.storage.selected_disk +
            '</th> <th class="col-sm-6">' + lang.storage.part_detail + '</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';
        $nodeinputs.each(function (j) {
            $this_node = $(this);
            var isnodecheck = $this_node.find('input.sub-check-disk').prop('checked');
            $disks = $this_node.next('.subdisks').find('.js-disk input[type="checkbox"]:checked');
            var dlen = $disks.length;
            if (dlen > 0) {
                $tr = $this_node;
                var ip = $tr.data('ip');
                var host = $tr.data('name');
                var id = $tr.data('id');
                hostList.push(ip);
                htm += '<tr>' + '<td>' + host + '<li class="disk"><a style="display: none">disk</a><input style="display: none" value=' + id + '></li>' + '</td>' + '<td>';
                var idisk = "";
                for (var i = 0; i < $disks.length; i++) {
                    $disk = $($disks[i]).closest('.js-disk');
                    var diskid = $disk.data('id');
                    idisk += diskid + ',';
                    var text = trim($disk.find('.showleftborder span').text());
                    if (text == '')
                        htm += '-';
                    else
                        htm += text;
                    if (i != $disks.length - 1)
                        htm += ' , ';
                }
                idisk = idisk.substring(0, idisk.length - 1);
                diskList[j] = idisk;
                htm += '</td>' + '</tr>';
                para += host + ':' + idisk + ';';
                arr.push([host, idisk]);
            }
        })
        htm += '</tbody>' +
            '</table>';
        para = para.substring(0, para.length - 1);
        return {
            htm: htm,
            arr: arr,
            para: para,
        };
    }

    function addDiskdetailInfo($nodeinputs) {
        var htm = "";
        var hostList = [];
        var diskList = [];
        var arr = [];
        var para = '';
        $nodeinputs.each(function (j) {
            $this_node = $(this);
            var isnodecheck = $this_node.find('input.sub-check-disk').prop('checked');
            $disks = $this_node.next('.subdisks').find('.js-disk input[type="checkbox"]:checked');
            var dlen = $disks.length;
            //如果被选中，则说明他下面的子元素也都被选中（判断下其下是否有子元素）
            if (dlen > 0) {
                $tr = $this_node;
                var ip = $tr.data('ip');
                var host = $tr.data('name');
                hostList.push(ip);
                htm += '<tr class="js-node">' +
                    '<td class="left">' +
                    '<span title>' + host + '</span>' +
                    '<span>(' + ip + ')</span>' +
                    '</td>' +
                    '</tr>' +
                    '<tr class="subdisks" data-ip="' + ip + '" data-host="' + host + '">' +
                    '<td colspan="2" style="padding:0;">' +
                    '<table class="table table-condensed table-hover" style="margin-left:11px;">' +
                    '<tbody>';
                var idisk = "";
                for (var i = 0; i < $disks.length; i++) {
                    $disk = $($disks[i]).closest('.js-disk');
                    var diskid = $disk.data('id');
                    idisk += diskid + ',';
                    var text = trim($disk.find('.showleftborder span').text());
                    htm += '<tr class="js-disk">' +
                        '<td class="showleftborder">' +
                        '<div class="showcenterline" style="width:15px;float:left;"></div>' +
                        '<span style="float:left;">' + text + '</span>' +
                        '</td>' +
                        '</tr>';
                }
                idisk = idisk.substring(0, idisk.length - 1);
                diskList[j] = idisk;
                htm += '</tbody>' +
                    '</table>' +
                    '</td>' +
                    '</tr>';
                para += host + ':' + idisk + ';';
                arr.push([host, idisk]);
            }
        })
        para = para.substring(0, para.length - 1);
        return {
            htm: htm,
            arr: arr,
            para: para,
        };
    }

    //获取页面上已添加的磁盘信息
    function addedOsdList($hostrows, host) {
        var addedosd = "";
        for (var i = 0; i < $hostrows.length; i++) {
            var id = "";
            host = $($hostrows[i]).data('host');
            $subdisksrows = $($hostrows[i]).next('.spool_disks_list').find('.js-subdiskmgm-row');
            for (var j = 0; j < $subdisksrows.length; j++) {
                id += $($subdisksrows[j]).data('id') + ',';
            }
            ;
            id = id.substring(0, id.length - 1);
            addedosd += host + ':' + id + ';';
        }
        return addedosd;
    }

    //合并页面上已经添加的磁盘列表和将要添加或者删除的磁盘列表
    function mergeOsdList(addedosd, osdarr) {
        var res = '', endindex, str;
        for (var i = 0; i < osdarr.length; i++) {
            res = addedosd.indexOf(osdarr[i][0]);
            //返回值为-1，则说明已添加的里面没有这个hostname，就直接添加，不用合并
            if (res == '-1') {
                //判断一下，如果当前host下没有可用磁盘，就不添加
                if (osdarr[i][1] != '' && osdarr[i][1] != undefined) {
                    addedosd += osdarr[i][0] + ':' + osdarr[i][1] + ';';
                }
            } else {
                //就说明要进行合并
                endindex = addedosd.indexOf('!', res);
                //把字符串分成三部分截取
                var addedosd1 = addedosd.slice(0, res);
                var addedosd2 = addedosd.slice(res, endindex);//加上要添加的，然后每一部分合并
                addedosd2 += ',' + osdarr[i][1];
                var addedosd3 = addedosd.slice(endindex, addedosd.length);
                addedosd = addedosd1 + addedosd2 + addedosd3;
            }
        }
        str = addedosd.substring(0, addedosd.length - 1);
        return str;
    }

    //折叠、展开磁盘详情
    function foldDiskInfo($this_act, $grid, $list) {
        var value = trim($this_act.find('span.hidden').attr('value'));
        if (value == '1') {
            $this_act.find('span.js-unfold').removeClass('hidden');
            $this_act.find('span.js-fold').addClass('hidden');
            $list.addClass('hidden');
        } else if (value == '2') {
            $this_act.find('span.js-unfold').addClass('hidden');
            $this_act.find('span.js-fold').removeClass('hidden');
            $list.removeClass('hidden');
        }
        $('.grid').masonry({
            itemSelector: '.grid-item',
            columnWidth: '.col-lg-6',
            percentPosition: true,
        });
    }
    function formatDiskGroup(status) {
        if (status == 'root') {
            status = lang.storage.root;
        } else if (status == 'datacenter') {
            status = lang.storage.datacenter;
        } else if (status == 'room') {
            status = lang.storage.room;
        } else if (status == 'rack') {
            status = lang.storage.rack;
        } else if (status == 'chassis') {
            status = lang.storage.chassis;
        } else if (status == 'host') {
            status = lang.storage.host;
        } else if (status == 'disk') {
            status = lang.storage.disk;
        }
        return status;
    }
    function formatToDiskGroup(status) {
        if (status == lang.storage.root) {
            status = 'root';
        } else if (status == lang.storage.datacenter) {
            status = 'datacenter';
        } else if (status == lang.storage.room) {
            status = 'room';
        } else if (status == lang.storage.rack) {
            status = 'rack';
        } else if (status == lang.storage.chassis) {
            status = 'chassis';
        } else if (status == lang.storage.host) {
            status = 'host';
        } else if (status == lang.storage.disk) {
            status = 'disk';
        }
        return status;
    }
    function levelToRank(result){
        for(var i=0;i<dgrankarr.length;i++){
            if(dgrankarr[i].indexOf(result) >= 0){
                return i
            }
        }
    }

    function expandToDisk(diskgroupname,hostresult,style, disks){
        var $thismodal = $('#expandCapacityModal');
        var addlevel = '';

        if(typeof diskgroupname === "object") {
          addlevel = diskgroupname.addlevel;
          diskgroupname = diskgroupname.diskgroupname;
        }

        var result = "";
        var lastrank = 6;
        var position ;
        var positionshow ;
        for (var j=0;j<$('.js-level-mark').length;j++){
            if($('.js-level-mark:eq('+j+')').data('name') == diskgroupname){
              if (addlevel && addlevel != $('.js-level-mark:eq('+j+')').data('mark')) continue;

                if(style == 0){
                    position = j+1;
                    positionshow = j
                }else if(style == 1){
                    position = j-1
                    positionshow = j-1
                }else{
                    position = j
                    positionshow = j
                }
            }
        }
        if(style == 0 && levelToRank($('.js-level-mark:eq('+position+')').data('mark')) > levelToRank($('.js-level-mark:eq('+(position-1)+')').data('mark'))){
            for(var i=position;i<$('.js-level-mark').length;i++){
                var disklevel = $('.js-level-mark:eq('+i+')').data('mark');
                var name = $('.js-level-mark:eq('+i+')').data('name');
                if(disklevel == $('.js-level-mark:eq('+position+')').data('mark')){
                    if(hostresult == ''){
                        hostresult += '{"type":"'+disklevel+'","name":"'+name+'","items":[]}';
                    }else{
                        hostresult = '{"type":"'+disklevel+'","name":"'+name+'","items":[]},'+hostresult+'';
                    };
                }else if(levelToRank(disklevel) < levelToRank($('.js-level-mark:eq('+position+')').data('mark'))){
                    break
                }
            }
        }
        result += hostresult
        for(var i=positionshow;i>=0;i--){
            var disklevel = $('.js-level-mark:eq('+i+')').data('mark');
            var name = $('.js-level-mark:eq('+i+')').data('name');
            if(levelToRank(disklevel) < lastrank){
                result='{"type":"'+disklevel+'","name":"'+name+'","items":['+result+']}';
                lastrank = levelToRank(disklevel);
            }
        }
        result = '{"type":"root","name":"'+$thismodal.find('.root-name').val()+'","items":['+result+']}';
        var parameter = {
            'info': result,
        };

        return result;

        // -------- 暂时屏蔽
        // $modal.find('.modal-header').LoadData('show');
        // addWaitMask();
        // DataModel['addDiskgroup'](parameter, callback, true, lang.disk_rescan);
    }

    /* ------------------- host - disk 对应关系层级检查,host至少对应一个disk ------------------- */
    function dgHostDiskCheck(diskid) {
      backupDgData;  // 磁盘组原始数据
      var dgName = $('#expandCapacityModal input.root-name').val();  // 磁盘组名字
      var dg = '';  // 目标磁盘组
      var isRemovable = false;  // 磁盘是否能删除
      for (var i = 1; i < backupDgData.length; i++) {
        if(backupDgData[i].type === 'root' && backupDgData[i].name == dgName) {
          dg = backupDgData[i];
          break;
        }
      }

      if (dg) {
        function checkHost(level) {
          if (!level.items) {
            return;
          }
          for (var j = 0; j < level.items.length; j++) {
            if(level.items[j].type === 'host'){
              var disks = level.items[j].items || [];
              if (disks.length > 1) {
                disks.forEach(function (disk, index) {
                  if (disk.detail.id == diskid) {
                    isRemovable = true;
                    // 优化
                    // disks.splice(index, 1);
                  }
                });
              }
            }else {
              checkHost(level.items[j]);
            }
          }
        }
        checkHost(dg);
      }

      return isRemovable;
    }

    /* ------------------- 成功删除后更新备份数据 ------------------- */
    function successDeleteDisk(diskid) {
      backupDgData;  // 磁盘组原始数据
      var dgName = $('#expandCapacityModal input.root-name').val();  // 磁盘组名字
      var dg = '';  // 目标磁盘组
      for (var i = 1; i < backupDgData.length; i++) {
        if(backupDgData[i].type === 'root' && backupDgData[i].name == dgName) {
          dg = backupDgData[i];
          break;
        }
      }

      if (dg) {
        function checkHost(level) {

          if (!level.items) {
            return;
          }
          for (var j = 0; j < level.items.length; j++) {
            if(level.items[j].type === 'host'){
              var disks = level.items[j].items || [];
              if (disks.length > 1) {
                disks.forEach(function (disk, index) {
                  if (disk.detail.id == diskid) {
                    // 优化
                    disks.splice(index, 1);
                  }
                });
              }
            }else {
              checkHost(level.items[j]);
            }
          }
        }
        checkHost(dg);
      }
    }


    /* ------------------- 成功添加后更新备份数据 ------------------- */
    function successAddDisk(hostname, diskid) {
      backupDgData;  // 磁盘组原始数据
      var dgName = $('#expandCapacityModal input.root-name').val();  // 磁盘组名字
      hostname = (dgName + '_' + hostname);
      var dg = '';  // 目标磁盘组
      for (var i = 1; i < backupDgData.length; i++) {
        if(backupDgData[i].type === 'root' && backupDgData[i].name == dgName) {
          dg = backupDgData[i];
          break;
        }
      }

      if (dg) {
        function checkHost(level) {
          if (!level.items) {
            return;
          }
          for (var j = 0; j < level.items.length; j++) {
            if(level.items[j].type === 'host' && level.items[j].name === hostname){
              if (!level.items[j].items) {
                level.items[j].items = [
                  {
                    name: diskid,
                    type: 'disk',
                    detail: {
                      id: diskid,
                      type: 'disk'
                    }
                  }
                ]
              }else {
                level.items[j].items.push({
                  name: diskid,
                  type: 'disk',
                  detail: {
                    id: diskid,
                    type: 'disk'
                  }
                })
              }
            }else {
              checkHost(level.items[j]);
            }
          }
        }
        checkHost(dg);
      }
    }

})
