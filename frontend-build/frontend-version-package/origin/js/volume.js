$(function (ev) {
  var poolLoaded = 'no';
  var storage = false;  // 存储池是否已经列举
  var checkLoading = false;
  var volumePoolInfo = [];  // 一直更新的volume存储池和卷信息
  var volumePoolInfoLoaded = false;  // 卷的使用情况载入完成
  var volumecallback;
  var poolType = {
    replicated: [],  // 副本
    erasure: []  // 纠删码
  }

  var checkDataStoragePool_clone = function (isInit) {
    var dataPoolname = $('#dest_storage_pool').val();

    function check() {
      // 筛选已经被使用的volumn存储池
      volumePoolInfo.forEach(function (pinfo) {
        if (pinfo.image && pinfo.image.length) {
        }
      });

      var htm = '';
      if (poolType['erasure'].includes(dataPoolname)) {  // 当前数据存储池是纠删码模式
        $('.dest_meta').removeClass('hidden');
        // 统计所有副本类型的volumn存储池
        poolType['replicated'].length && poolType['replicated'].forEach(function (pool) {
          (pool != dataPoolname) && (htm += '<option value="'+pool+'">'+pool+'</option>');
        });
        $('#dest_meta_pool').html(htm);
      }else {
        $('.dest_meta').addClass('hidden');
      }

      // 筛选数据存储池，不复用
      if (isInit) {
        htm = '';
        var totalPool = poolType['erasure'].concat(poolType['replicated']);
        if (totalPool.includes(dataPoolname)) {
          totalPool.splice(totalPool.indexOf(dataPoolname), 1);
          totalPool.unshift(dataPoolname);
        }
        totalPool.length && totalPool.forEach(function (pool) {
          (htm += '<option value="'+pool+'">'+pool+'</option>');
        });
        $('#dest_storage_pool').html(htm);
      }
    }

    if (true || !storagepoolLoaded) {
      $('#createCloneModal').find('.modal-header').LoadData('show');
      DataModel['listAllStorages'](null, function (rsp) {
        checkLoading = false;
        $('#createCloneModal').find('.modal-header').LoadData('hide');
        if (rsp.code == 200) {
          getStoragepoolType(rsp.result);
          storagepoolLoaded = true;
          $('#dest_storage_pool').removeClass('disabled');
          check();
        }else {
          DisplayTips('列举存储池失败!');
        }
      }, true, null);

    }else {
      check();
    }
  };

  /**
   * [检查当前数据存储池]
   */
  var checkDataStoragePool = function (isInit) {

    var dataPoolname = $('#datastorage_pool').val();

    function check() {

      // 筛选已经被使用的volumn存储池
      volumePoolInfo.forEach(function (pinfo) {
        if (pinfo.image && pinfo.image.length) {
          // poolType['erasure'].includes(pinfo.pool_name.poolname) &&
          // ( poolType['erasure'].splice(poolType['erasure'].indexOf(pinfo.pool_name.poolname), 1) );
          //
          // poolType['replicated'].includes(pinfo.pool_name.poolname) &&
          // ( poolType['replicated'].splice(poolType['replicated'].indexOf(pinfo.pool_name.poolname), 1) );
        }
      });

      var htm = '';
      if (poolType['erasure'].includes(dataPoolname)) {  // 当前数据存储池是纠删码模式
        $('.meta_pool').removeClass('hidden');
        // 统计所有副本类型的volumn存储池
        poolType['replicated'].length && poolType['replicated'].forEach(function (pool) {
          (pool != dataPoolname) && (htm += '<option value="'+pool+'">'+pool+'</option>');
        });
        $('#metastorage_pool').html(htm);
      }else {
        $('.meta_pool').addClass('hidden');
      }

      // 筛选数据存储池，不复用
      if (isInit) {
        htm = '';
        var totalPool = poolType['erasure'].concat(poolType['replicated']);
        if (totalPool.includes(dataPoolname)) {
          totalPool.splice(totalPool.indexOf(dataPoolname), 1);
          totalPool.unshift(dataPoolname);
        }
        totalPool.length && totalPool.forEach(function (pool) {
          (htm += '<option value="'+pool+'">'+pool+'</option>');
        });
        $('#datastorage_pool').html(htm);
      }
    }

    if (true || !storagepoolLoaded) {
      $('#createVolumeModal').find('.modal-header').LoadData('show');
      DataModel['listAllStorages'](null, function (rsp) {
        checkLoading = false;
        $('#createVolumeModal').find('.modal-header').LoadData('hide');
        if (rsp.code == 200) {
          getStoragepoolType(rsp.result);
          storagepoolLoaded = true;
          $('#datastorage_pool').removeClass('disabled');
          check();
        }else {
          DisplayTips('列举存储池失败!');
        }
      }, true, null);

    }else {
      check();
    }
  };

  /**
   * [统计所有存储池的策略信息]
   * @param  {[Array]} pools [所有存储池]
   */
  var getStoragepoolType = function (pools) {
    poolType = {
      replicated: [],  // 副本
      erasure: []  // 纠删码
    };
    pools.length && pools.forEach(function (pool) {
      poolType[pool.type] &&
      pool.application.includes('volume') &&
      poolType[pool.type].push(pool.name);
    });

  };

  DataModel["listPoolApplication"]( {  'cache_pool': 'no'}, function (rsp) {

  if (rsp.code != 200) {
    return;
  }
  var rbdPool =  rsp.result.rbd || rsp.result.volume || [];

    //加载卷信息
    volumecallback = function(result){
        $('.bs-docs-grid').LoadData('hide');
        volumePoolInfoLoaded = true;
        if(result == undefined)
            return;
        if(result.code == 200){
            var data = result.result;
            volumePoolInfo = result.result;
            if ( data != '' ) {
            	var htm = "";
            	htm += '<div class="row show-grid grid js-masonry">';
	            var amountOfPool = data.length;
	            //文件系统个数 data.length
	            for(i = 0;i < amountOfPool;i++){
                if (rbdPool.indexOf(data[i].pool_name.poolname) === -1) {
                  continue;
                }
	                htm +=  '<div class="col-xs-12 col-md-5 col-lg-6  box-shadow grid-item  grid-item-style volume-detail-body" data-poolname="' + data[i].pool_name.poolname + '">' +
	                            '<div class="basic_content">' +
	                                '<div class="share_header">' +
						                '<img src="css/image/volume.png" style="width:43px">'+
	                                    '<span>' + data[i].pool_name.poolname +'</span>' +
	                                '</div>' +
	                                '<div id="' + data[i].pool_name.poolname + '_contentDiv" class="basic_content_list js-volume-content" style="margin-left:0;">' +
	                                    '<div class="basic_cont_row">' +
	                                        '<div class="col-lg-4 basic-lg-4 left ellipsis" title="' + lang.storage.volume_name_snapshot_name + '">' +
	                                            '<span>' + lang.storage.volume_name_snapshot_name + '</span>' +
	                                        '</div>' +
						                    '<div class="col-lg-3 basic-lg-3">' +
						                    '<span>' + lang.storage.volume_snapshot_usedsize + '</span>' +
						                    '</div>' +
	                                        '<div class="col-lg-2 basic-lg-2">' +
	                                            '<span>' + lang.storage.volume_snapshot_size + '</span>' +
	                                        '</div>' +
	                                        '<div class="col-lg-3 basic-lg-3">' +
	                                        '</div>' +
	                                    '</div>';
	                //image个数 data[i].image.length
	                for(j = 0;j < data[i].image.length;j++){
						htm +=	            '<div class="basic_cont_row js-volume-row" data-volname="' + data[i].image[j].name + '" data-size="' + formatCapacity(data[i].image[j].size) + '">' +
	                                        '<div class="col-lg-4 basic-lg-4 left">' +
	                                            '<span title="' + data[i].image[j].name + '">' + data[i].image[j].name + '</span>' +
	                                        '</div>' +
							                '<div class="col-lg-3 basic-lg-3">' +
							                '<span class="js-volume-usedsize">' + formatCapacity(data[i].image[j].used_size) + '</span>' +
							                '</div>' +
	                                        '<div class="col-lg-2 basic-lg-2">' +
	                                            '<span class="js-volume-size">' + formatCapacity(data[i].image[j].size) + '</span>' +
	                                        '</div>' +
	                                        '<div class="col-lg-3 basic-lg-3" style="height:30px;">' +
	                                            '<div class="hidden js-volume-act" style="display:inline;">' +
	                                                '<a class="fl-rt js-create-snapshot" href="javascript:;" title="' + lang.storage.create_snapshot + '" style="margin-right: 15px;">' +
	                                                    '<span class="glyphicon glyphicon-plus-sign"></span>' +
	                                                '</a>' +
	                                                '<a class="fl-rt js-delete-volume" href="javascript:;" title="' + lang.storage.del_volume + '" style="margin-right:15px;">' +
	                                                    '<span class="glyphicon glyphicon-trash"></span>' +
	                                                '</a>' +
	                                                // '<a class="fl-rt js-edit-volume" href="javascript:;" title="' + lang.storage.edit_volume + '" style="margin-right: 15px;">' +
	                                                //     '<span class="glyphicon glyphicon-edit"></span>' +
	                                                // '</a>' +
	                                            '</div>' +
	                                        '</div>' +
	                                    '</div>' +
	                                    '<div class="basic_content_list" data-volname="' + data[i].image[j].name + '" style="margin-left:0;">';

	                    //快照个数 data[i].image[j].snapshot.length
	                    for(k = 0;k < data[i].image[j].snapshot.length;k++){
	                        htm +=      '<div class="basic_cont_row js-snapshot-row" data-sname="' + data[i].image[j].snapshot[k].name + '" data-size="' + formatCapacity(data[i].image[j].snapshot[k].size) + '">' +
	                                            '<div class="col-lg-4 basic-lg-4 left" style="padding-left:10px!important;">' +
	                                                '<div class="showleftborder" style="width:1px;height:30px;display:inline;"></div>' +
	                                                '<div class="showcenterline" style="width:15px;display:inline-block;"></div>' +
	                                                '<span> ' + data[i].image[j].snapshot[k].name + '</span>' +
	                                            '</div>' +
								                '<div class="col-lg-3 basic-lg-3">' +
								                '<span>' + formatCapacity(data[i].image[j].snapshot[k].used_size) + '</span>' +
								                '</div>' +
	                                            '<div class="col-lg-2 basic-lg-2">' +
	                                                '<span>' + formatCapacity(data[i].image[j].snapshot[k].size) + '</span>' +
	                                            '</div>' +
	                                            '<div class="col-lg-3 basic-lg-3 center" style="height:30px;">' +
	                                               ' <div class="hidden js-snapshot-act" style="display:inline;">' +
	                                                    '<a class="fl-rt js-new-clone" href="javascript:;" title="' + lang.storage.create_clone + '" style="margin-right: 15px;">' +
	                                                        '<span class="glyphicon glyphicon-plus-sign"></span>' +
	                                                    '</a>' +
	                                                    '<a class="fl-rt js-delete-snapshot" href="javascript:;" title="' + lang.storage.del_snapshot + '" style="margin-right:15px;">' +
	                                                        '<span class="glyphicon glyphicon-trash"></span>' +
	                                                    '</a>' +
	                                                '</div>' +
	                                            '</div>' +
	                                        '</div>';
							if(data[i].image[j].snapshot[k].task){
								htm +='<div id="overflowProgress" data-task="' + data[i].image[j].snapshot[k].task.progress.current + '" class="progress" style="width: 60%; bottom: 40px;">'+
									'<div class="js-progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="10" aria-valuemin="10" aria-valuemax="100" style="min-width: 2em;">'+
									'<span>10% Complete</span>'+
									'</div>'+
									'</div>'
							}
	                    }
	                    htm +=          '</div>';
	                }
	                htm +=          '</div>' +
	                            '</div>' +
	                        '</div>';
	            }
	            htm += '</div>';
	            $('.bs-docs-grid').html(htm);
              setTimeout(function () {
                $('.grid').masonry({
                  itemSelector: '.grid-item',
                  columnWidth: '.col-lg-6',
                  percentPosition: true
                })
              }, 500);
            } else {
            	htm = '<div class="no-record-parent"><span class="no-record" style="color:#ccc;">'+lang.no_record+'</span></div>';
				$('.dt_g_right_subdiv_second').find('.bs-docs-grid').html(htm);
            }


        }
		else if(result.code == 701){}
        else{
            DisplayTips(result.result || lang.request_error);
        }
    }
    $(".bs-docs-grid").LoadData ("show");
    DataModel['listVolume'](null, volumecallback, true, null);

	setInterval( function(){
	DataModel['listVolume'](null, volumecallback, true, null);
		//if($('#overflowProgress').data('task') == '100'){
		//	$('#overflowProgress .js-progress-bar').attr('aria-valuenow', 100);
		//	$('#overflowProgress .js-progress-bar').css('width', '100%');
		//	$('#overflowProgress .js-progress-bar').find('span').text('100%');
		//	DisplayTips(lang.cluster.add_osd_disk_success);
		//	setTimeout(function (ev) {
		//		$('#overflowProgress').addClass('hide');
		//		$('.progressInfo').addClass('hide');
		//	}, 3 * 1000);
		//	return;
		//}else if($('#overflowProgress').data('task') == '0'){
		//	$('#overflowProgress .js-progress-bar').attr('aria-valuenow', 10);
		//	$('#overflowProgress .js-progress-bar').css('width', '10%');
		//	$('#overflowProgress .js-progress-bar').find('span').text('10%');
		//}
	} , 15*1000 );

}, true, "");

	$(document)
	.on ( 'mouseover', '.volume-detail-body .js-volume-row', function (ev) {
		$this = $(this);
		$this.find('.js-volume-act').removeClass('hidden');
	})
	.on ( 'mouseout', '.volume-detail-body .js-volume-row', function (ev) {
		$this = $(this);
		$this.find('.js-volume-act').addClass('hidden');
	})
	.on ( 'mouseover', '.volume-detail-body .js-snapshot-row', function (ev) {
		$this = $(this);
		$this.find('.js-snapshot-act').removeClass('hidden');
	})
	.on ( 'mouseout', '.volume-detail-body .js-snapshot-row', function (ev) {
		$this = $(this);
		$this.find('.js-snapshot-act').addClass('hidden');
	})
  // 创建卷的时候选择数据存储池如果是纠删码就要多选择一项元数据存储池
  .on('change', '#datastorage_pool', function () {
    checkLoading = true;
    checkDataStoragePool();
  })

  .on('change', '#dest_storage_pool', function () {
    checkLoading = true;
    checkDataStoragePool_clone();
  })

	//创建卷
	.on ( 'click', '.js-create-volume', function (ev) {

    if (!volumePoolInfoLoaded) {
      return DisplayTips(lang.please_wait);
    }

    setTimeout(function () {
      var dncallback = function(result){
          $modal.find('.modal-header').LoadData("hide");
          if(result == undefined){
            poolLoaded = 'no';
            return;
          }
          if(result.code == 200){
              var data = result.result.volume || [];
              var htm = ""
              for(var i = 0;i < data.length;i++){
                htm += '<option value="' + data[i] + '">' + data[i] + '</option>';
              }
              $('#datastorage_pool').html(htm);
              $('#dest_storage_pool').html(htm);

              // 检查数据存储池
              $('#datastorage_pool').addClass('disabled');
              checkDataStoragePool(true);
          }
          else{
              DisplayTips(result.result || lang.request_error);
              poolLoaded = 'no';
          }
      }

      if(poolLoaded == 'no'){
          var para = {
              'cache_pool': 'no'
          };
          poolLoaded = 'yes';
          $modal.find('.modal-header').LoadData("show");
          DataModel["listPoolApplication"]( para, dncallback, true, "");
      }
    }, 1e3);

		$modal = $('#createVolumeModal');
    $modal.modal('show');

	})
    .on ('shown.bs.modal','#createVolumeModal',function(ev){
        $('#new_volume_name').focus();
    })
    .on ('click', '#createVolumeModal .btn-default', function(ev){
    	$modal = $('#createVolumeModal');
    	$modal.find('#new_volume_name').val('');
    	$modal.find('#v_size').val('');
    } )

    /* ------------------- 创建卷 ------------------- */
	.on ( 'click', '#createVolumeModal .btn-primary', function (ev) {
		$modal = $('#createVolumeModal');
		var volname = trim ( $modal.find('#new_volume_name').val() );//卷名称
    if (checkLoading) {
      return DisplayTips(lang.please_wait);
    }
		if( volname == '' || volname == 'undefined') {
			DisplayTips( lang.storage.input_volume_name );
			return;
		}
		if (!valifyUsername(volname)) {
			DisplayTips( lang.storage.name_format_error );
			return;
		}
		var dspoolname = trim( $modal.find('#datastorage_pool').val() );
    // dspoolname = dspoolname ? dspoolname.replace(/\s/g, '') : '';
    var metapoolname = trim( $modal.find('#metastorage_pool').val() );
    // metapoolname = metapoolname ? metapoolname.replace(/\s/g, '') : '';

		var size = trim ( $modal.find('#v_size').val() );
		var bsize = size;
		function hasDot(num) {
			if (!isNaN(num)) {
				return ((num + '').indexOf('.') != -1) ? true : false;
			}
		}
		if(hasDot(size) || size < 0 ){
			DisplayTips( lang.storage.input_volume_size_int );
			return;
		}
		if ( size == '' ) {
			DisplayTips( lang.storage.input_volume_size );
			return;
		}

    if (!dspoolname) {
      DisplayTips( lang.storage.select_volume_pool_info);
      return ;
    }
    if (!$('.meta_pool').hasClass('hidden')) {
      if (!metapoolname) {
        DisplayTips( lang.storage.select_volume_pool_info);
        return ;
      }
    }else {
      metapoolname = '';
    }

		var unit = trim ( $modal.find('#v_size_unit').val() );
		size = transformUnitM(size, unit);
		var para = {
			'poolname': dspoolname,
      'metapool': metapoolname,
			'imagename': volname,
			'size': size,
		}
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
			return;
			if (result.code == 200) {
				DisplayTips(result.result);
        setTimeout(function () {
          refresh();
        }, 2e3);
				var htm = "";
				htm += 	'<div class="basic_cont_row js-volume-row" data-volname="' + volname + '">' +
				            '<div class="col-lg-4 basic-lg-4 left">'+
				            	'<span title="' + volname + '">'+ volname +'</span>'+
				            '</div>'+
					        '<div class="col-lg-3 basic-lg-3">'+
					        '<span class="js-volume-usedsize">0</span>'+
					        '</div>' +
				            '<div class="col-lg-2 basic-lg-2">'+
				              	'<span class="js-volume-size">'+ bsize + unit +'</span>'+
				            '</div>' +
				            '<div class="col-lg-3 basic-lg-3" style="height:30px;">' +
				              	'<div class="js-volume-act hidden" style="display:inline;">' +
				              		'<a class="fl-rt js-create-snapshot" href="javascript:;" title="'+ lang.storage.create_snapshot +'" style="margin-right: 15px;">'+
				      					'<span class="glyphicon glyphicon-plus-sign"></span>'+
				      				'</a>'+
									'<a class="fl-rt js-delete-volume" href="javascript:;" title="'+ lang.storage.del_volume +'" style="margin-right:15px;">'+
				      					'<span class="glyphicon glyphicon-trash"></span>'+
				      				'</a>'+
									// '<a class="fl-rt js-edit-volume" href="javascript:;" title="'+ lang.storage.edit_volume +'" style="margin-right: 15px;">'+
				     //  					'<span class="glyphicon glyphicon-edit"></span>'+
				     //  				'</a>'+
		      					'</div>'+
				            '</div>'+
				        '</div>'+
				        '<div class="basic_content_list" data-volname="'+ volname +'" style="margin-left:0;">'+
			        	'</div>';
				$vbodys = $('.volume-detail-body');
				$vbodys.each(function (i) {
					$this = $(this);
					var pool = $this.data('poolname');
          if ( metapoolname && pool == metapoolname ) {
            $this.find('.js-volume-content').append(htm);
            return;
          }
					if ( !metapoolname && pool == dspoolname ) {
						$this.find('.js-volume-content').append(htm);
						return;
					}
				})

        $modal.modal('hide');

        setTimeout(function () {
          $('.grid').masonry({
            itemSelector: '.grid-item',
            columnWidth: '.col-lg-6',
            percentPosition: true
          });
        }, 500);
			} else {
				DisplayTips(result.result || lang.request_error);
			}
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['createVolume'] (para, dncallback, true, lang.storage.create_volume );
	})
	//编辑卷
	.on ( 'click', '.js-edit-volume', function (ev) {
		$this = $(this);
		$modal = $('#editVolumeModal');
		$body = $this.closest('.volume-detail-body');
		$row = $this.closest('.js-volume-row');
		$body.find('.js-volume-row').removeClass('volactive');
		$row.addClass('volactive');
		var poolname = $body.data('poolname');
		var volname = $row.data('volname');
		$modal.find('.js-volume-belongpool').val(poolname);
		$modal.find('.js-volume-nowname').val(volname);
		$modal.modal('show');
		$modal.data('poolname', poolname);
		$modal.data('volname', volname);
	} )
	.on ( 'click', '#editVolumeModal .btn-primary', function (ev) {
		$modal = $('#editVolumeModal');
		var poolname = $modal.data('poolname');
		var volname = $modal.data('volname');
		var destimagename = trim( $modal.find('#new-volumename').val() );
		var newsize = trim( $modal.find('#v_new_size').val() );
		if ( destimagename == '' && newsize == '' ) {
			DisplayTips(lang.storage.no_input_no_act);
			return;
		}
		var newsize_v = newsize;
		var newunit = trim( $modal.find('#v_new_size_unit').val() );
		newsize = transformUnitM(newsize, newunit);
		var para = {
			'poolname': poolname,
			'imagename': volname,
			'destimagename': destimagename,
			'newsize': newsize,
		};
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
			return;
			if (result.code == 200) {
				DisplayTips(result.result);
				$name = $('.js-volume-row.volactive').find('.basic-lg-5 span');
				$size = $('.js-volume-row.volactive').find('.js-volume-size');
				if ( destimagename != '' && destimagename != undefined ) {
					$name.attr('title', destimagename);
					$name.text(destimagename);
				}
				if ( newsize != '' && newsize != undefined ) {
					$size.text(newsize_v+newunit);
				}
			} else {
				DisplayTips(result.result || lang.request_error);
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['editVolume'] (para, dncallback, true, lang.storage.edit_volume );
	})
	//删除卷
	.on ( 'click', '.js-delete-volume', function (ev) {
		$this = $(this);
		$modal = $('#delVolumeModal');
		$body = $this.closest('.volume-detail-body');
		$row = $this.closest('.js-volume-row');
		$body.find('.js-volume-row').removeClass('volactive');
		$row.addClass('volactive');
		var poolname = $body.data('poolname');
		var volname = $row.data('volname');
		$modal.data('poolname', poolname);
		$modal.data('volname', volname);
		$modal.find('.modal-body p').html( lang.storage.confirm_del_volume + '<span style="color:red;">&nbsp;' + volname +'</span>' + '?');
		$modal.modal('show');
	})
	.on ( 'click', '#delVolumeModal .btn-danger', function (ev) {
		$modal = $('#delVolumeModal');
		var poolname = $modal.data('poolname');
		var volname = $modal.data('volname');
		//删除卷的时候要给出判断，如果当前卷里面包含的有快照，则不允许删除
		$snapshotrows = $('.js-volume-row.volactive').next('.basic_content_list').find('.js-snapshot-row');
		if ( $snapshotrows.length > 0 ) {
			DisplayTips(lang.storage.del_snapshot_then_del_volume);
			return false;
		}
		var para = {
			'poolname': poolname,
			'imagename': volname,
		};
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
			return;
			if (result.code == 200) {
				DisplayTips(result.result);
				$('.js-volume-row.volactive').remove();
        setTimeout(function () {
          $('.grid').masonry({
            itemSelector: '.grid-item',
            columnWidth: '.col-lg-6',
            percentPosition: true
          });
        }, 500);
			} else {
				DisplayTips(result.result || lang.request_error);
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['delVolume'] (para, dncallback, true, lang.storage.del_volume );
	})
	//创建快照
	.on ( 'click', '.js-create-snapshot', function (ev) {
		$this = $(this);
		$modal = $('#createSnapshotModal');
		$body = $this.closest('.volume-detail-body');
		$row = $this.closest('.js-volume-row');
		$body.find('.js-volume-row').removeClass('volactive');
		$row.addClass('volactive');
		var poolname = $body.data('poolname');
		var volname = $row.data('volname');
		var size = trim( $row.find('.js-volume-size').text() );
		$modal.find('.js-poolname').text(poolname);
		$modal.find('.js-volname').text(volname);
		$modal.modal('show');
		$modal.data('poolname', poolname);
		$modal.data('volname', volname);
		$modal.data('size', size);
		setTimeout(function(){
			$("#new_snapshot_name").focus();
		},500);
	})
	.on ( 'click', '#createSnapshotModal .btn-primary', function (ev) {
		$modal = $('#createSnapshotModal');
		var poolname = $modal.data('poolname');
		var volname = $modal.data('volname');
		var size = $modal.data('size');
		var sname = trim( $modal.find('#new_snapshot_name').val() );
		if ( sname == '') {
			DisplayTips( lang.storage.input_snapshot_name );
			return;
		}
		if (!valifyUsername(sname)) {
			DisplayTips( lang.storage.name_format_error );
			return;
		}
		var para = {
			'poolname': poolname,
			'imagename': volname,
			'snapname': sname,
		}
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");

      setTimeout(function () {
        DataModel['listVolume'](null, volumecallback, true, null);
      }, 1e3);

			if (result == undefined)
			return;
			if (result.code == 200) {
				DisplayTips(result.result);
				var htm = '';
				htm += 	'<div class="basic_cont_row js-snapshot-row" data-sname="' + sname + '">'+
				            '<div class="col-lg-4 basic-lg-4 left" style="padding-left:10px!important;">'+
				            	'<div class="showleftborder" style="width:1px;height:30px;display:inline;"></div>'+
				            	'<div class="showcenterline" style="width:15px;display:inline-block;"></div>'+
				              	'<span> ' + sname + '</span>'+
				            '</div>'+
					        '<div class="col-lg-3 basic-lg-3">'+
					        '<span>0</span>'+
					        '</div>'+
				            '<div class="col-lg-2 basic-lg-2">'+
				              	'<span>' + size + '</span>'+
				            '</div>'+
				            '<div class="col-lg-3 basic-lg-3 center" style="height:30px;">'+
				        		'<div class="js-snapshot-act hidden" style="display:inline;">'+
				              		'<a class="fl-rt js-new-clone" href="javascript:;" title="' + lang.storage.create_clone + '" style="margin-right: 15px;">'+
				      					'<span class="glyphicon glyphicon-plus-sign"></span>'+
				      				'</a>'+
									'<a class="fl-rt js-delete-snapshot" href="javascript:;" title="' + lang.storage.delete_clone + '" style="margin-right:15px;">'+
				      					'<span class="glyphicon glyphicon-trash"></span>'+
				      				'</a>'+
		      					'</div>'+
				            '</div>'+
				        '</div>';
				$('#' + poolname + '_contentDiv').find('.js-volume-row.volactive').next('.basic_content_list').append(htm);
        setTimeout(function () {
          $('.grid').masonry({
            itemSelector: '.grid-item',
            columnWidth: '.col-lg-6',
            percentPosition: true
          });
        }, 500);
			} else {
				DisplayTips(result.result || lang.request_error);
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['createSnapshot'] (para, dncallback, true, lang.storage.create_snapshot );
	})
	//删除快照
	.on ( 'click', '.js-delete-snapshot', function (ev) {
		$this = $(this);
		$modal = $('#delSnapshotModal');
		$body = $this.closest('.volume-detail-body');
		$row = $this.closest('.js-snapshot-row');
		$volume = $row.closest('.basic_content_list').prev('.js-volume-row');
		$body.find('.js-snapshot-row').removeClass('snapactive');
		$row.addClass('snapactive');
		var poolname = $body.data('poolname');
		var snapname = $row.data('sname');
		var volname = $volume.data('volname');
		$modal.data('poolname', poolname);
		$modal.data('volname', volname);
		$modal.data('snapname', snapname);
		$modal.find('.modal-body p').html( lang.storage.confirm_del_snapshot + '<span style="color:red;">&nbsp;' + snapname +'</span>' + '?');
		$modal.modal('show');
	})
	.on ( 'click', '#delSnapshotModal .btn-danger', function (ev) {
		$modal = $('#delSnapshotModal');
		var poolname = $modal.data('poolname');
		var volname = $modal.data('volname');
		var snapname = $modal.data('snapname');
		var para = {
			'poolname': poolname,
			'imagename': volname,
			'snapname': snapname,
		};
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
			return;
			if (result.code == 200) {
				DisplayTips(result.result);
				$('.js-snapshot-row.snapactive').remove();
        setTimeout(function () {
          $('.grid').masonry({
            itemSelector: '.grid-item',
            columnWidth: '.col-lg-6',
            percentPosition: true
          });
        }, 500);
			} else {
				DisplayTips(result.result || lang.request_error);
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['delSnapshot'] (para, dncallback, true, lang.storage.del_snapshot );
	})
	//创建克隆
	.on ( 'click', '.js-new-clone', function (ev) {
		$this = $(this);
		$modal = $('#createCloneModal');
		$body = $this.closest('.volume-detail-body');
		$row = $this.closest('.js-snapshot-row');
		$volume = $row.closest('.basic_content_list').prev('.js-volume-row');
		$body.find('.js-snapshot-row').removeClass('snapactive');
		$row.addClass('snapactive');
		var poolname = $body.data('poolname');
		var snapname = $row.data('sname');
        var size = $volume.data('size');
		var used_size = $volume.data('used_size');
		var volname = $volume.data('volname');
		$modal.data('poolname', poolname);
		$modal.data('volname', volname);
		$modal.data('snapname', snapname);
        $modal.data('size',size);
		$modal.data('used_size',used_size);
		$modal.find('.js-poolname').text(poolname);
		$modal.find('.js-volname').text(volname);
		$modal.find('.js-snapshot').text(snapname);
        var dncallback = function(result){
            $modal.find('.modal-header').LoadData("hide");
            if(result == undefined)
                return;
            if(result.code == 200){
                var data = result.result.volume || [];
                var htm = ""
                for(var i = 0;i < data.length;i++){
                    htm += '<option value="' + data[i] + '">' + data[i] + '</option>';
                }
                $('#datastorage_pool').html(htm);
                $('#dest_storage_pool').html(htm);
                $('#dest_storage_pool').addClass('disabled');
                checkDataStoragePool_clone(true);
            }
            else{
                DisplayTips(result.result || lang.request_error);
                poolLoaded = 'no';
            }
        }
        if(poolLoaded == 'no'){
            var para = {
                'cache_pool': 'no'
            };
            poolLoaded = 'yes';
            $modal.find('.modal-header').LoadData("show");
            DataModel["listPoolApplication"]( para, dncallback, true, "")
        }
		$modal.modal('show');
	})
    .on ( 'shown.bs.modal', '#createCloneModal', function (ev) {
        $('#dest_volume_name').focus();
    })


	.on ( 'click', '#createCloneModal .btn-primary', function (ev) {
		$modal = $('#createCloneModal');
		var poolname = $modal.data('poolname');
		var volname = $modal.data('volname');
		var snapname = $modal.data('snapname');
        var size = $modal.data('size');
		var used_size = $modal.data('size');
		var destpoolname = trim( $modal.find('#dest_storage_pool').val() ); // 数据存储池
    var destmetapool = trim( $modal.find('#dest_meta_pool').val() );  // 元数据存储池
		var destimagename = trim( $modal.find('#dest_volume_name').val() );
		var volnameAll = [];
    var isCp = $('#createCloneModal .dest_meta').hasClass('hidden') ? true : false;

		$volname = $('#' + destpoolname + '_contentDiv');
		for(var i = 0;i < $volname.find('.js-volume-row').length; i++){
			volnameAll.push($volname.find('.js-volume-row:eq('+i+')').find('div span:first').html());
		}
		if ( destimagename == '') {
			DisplayTips( lang.storage.input_dest_volume_name );
			return;
		}
		if (!valifyUsername(destimagename)) {
			DisplayTips( lang.storage.name_format_error );
			return;
		}
		if (volnameAll.indexOf(destimagename) >= 0) {
			DisplayTips( lang.storage.clone_name_repeat );
			return;
		}
		var para = {
			'poolname': poolname,
			'imagename': volname,
			'snapname': snapname,
			'destpoolname': isCp ? '' : destpoolname,
      'destmetapool': destmetapool,
			'destimagename': destimagename,
		};
		var dncallback = function (result) {
			$modal.find('.modal-header').LoadData ("hide");
      setTimeout(function () {
        DataModel['listVolume'](null, volumecallback, true, null);
      }, 1e3);
			if (result == undefined)
			return;
			if (result.code == 200) {
				DisplayTips(result.result);
                //显示克隆
                var htm = "";
    			//htm +=  '<div class="basic_cont_row js-volume-row" data-volname="' + destimagename + '" data-size="' + size + '">' +
                 //           '<div class="col-lg-4 basic-lg-4 left">' +
                 //               '<span title="' + destimagename + '">' + destimagename + '</span>' +
                 //           '</div>' +
					//        '<div class="col-lg-3 basic-lg-3">' +
					//        '<span class="js-volume-usedsize">' + used_size + '</span>' +
					//        '</div>' +
                 //           '<div class="col-lg-2 basic-lg-2">' +
                 //               '<span class="js-volume-size">' + size + '</span>' +
                 //           '</div>' +
                 //           '<div class="col-lg-3 basic-lg-3" style="height:30px;">' +
                 //               '<div class="hidden js-volume-act" style="display:inline;">' +
                 //                   '<a class="fl-rt js-create-snapshot" href="javascript:;" title="' + lang.storage.create_snapshot + '" style="margin-right: 15px;">' +
                 //                       '<span class="glyphicon glyphicon-plus-sign"></span>' +
                 //                   '</a>' +
                 //                   '<a class="fl-rt js-delete-volume" href="javascript:;" title="' + lang.storage.del_volume + '" style="margin-right:15px;">' +
                 //                       '<span class="glyphicon glyphicon-trash"></span>' +
                 //                   '</a>' +
                 //                   // '<a class="fl-rt js-edit-volume" href="javascript:;" title="' + lang.storage.edit_volume + '" style="margin-right: 15px;">' +
                 //                   //     '<span class="glyphicon glyphicon-edit"></span>' +
                 //                   // '</a>' +
                 //               '</div>' +
                 //           '</div>' +
                 //       '</div>' +
                 //       '<div class="basic_content_list" data-volname="' + destimagename + '" style="margin-left:0;">' +
                 //       '</div>';
                //$('#' + destpoolname + '_contentDiv').append(htm);
				htm ='<div id="overflowProgress" class="progress" style="width: 60%; bottom: 40px;">'+
					'<div class="js-progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="20" aria-valuemin="20" aria-valuemax="100" style="min-width: 2em;">'+
					'<span>10</span>'+
					'</div>'+
					'</div>';
				$('#' + destpoolname + '_contentDiv').find("div[data-sname='" + snapname + "']").append(htm);
				//$('#' + snapname + '_contentDiv').append(htm)
			} else {
				DisplayTips(result.result || lang.request_error);
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
		DataModel['createClone'] (para, dncallback, true, lang.storage.create_clone );
	})
})
