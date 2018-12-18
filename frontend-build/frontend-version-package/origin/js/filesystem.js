$(function (ev) {
	var spoolLoaded = 'no';
  var storagepoolLoaded = false;  // 存储池是否已经列举
  var checkLoading = false; //
  var usedPool = []; // 统计已经被使用的存储池
  var poolType = {
    replicated: [],  // 副本
    erasure: []  // 纠删码
  }

  /**
   * [检查当前数据存储池]
   * [元数据只列纠删码]
   * [数据和元数据存储池不能相同]
   */
  var checkDataStoragePool = function () {

    function check() {
      var htm = '';
      var total = [];

      // 过滤掉已经被使用的存储池
      usedPool.forEach(function (poolname) {
        poolType['replicated'].includes(poolname) &&
        (poolType['replicated'].splice( poolType['replicated'].indexOf(poolname),1 ) );

        poolType['erasure'].includes(poolname) &&
        (poolType['erasure'].splice( poolType['erasure'].indexOf(poolname),1 ) );
      });


      poolType['replicated'].length && poolType['replicated'].forEach(function (pool) {
        (htm += '<option value="'+pool+'">'+pool+'</option>');
      });
      $('#metadata_storage_pool').html(htm);

      total = [].concat(poolType['replicated'], poolType['erasure']);
      htm = '';
      total.length && total.forEach(function (pool) {
        (htm += '<option value="'+pool+'">'+pool+'</option>');
      });
      $('#data_storage_pool').html(htm);
    }

    if (!storagepoolLoaded) {
      $('#createFileSysModal .modal-header').LoadData('show');
      DataModel['listAllStorages'](null, function (rsp) {
        $('#createFileSysModal .modal-header').LoadData('hide');
        if (rsp.code == 200) {
          getStoragepoolType(rsp.result);
          storagepoolLoaded = true;
          check();
        }else {
          DisplayTips(lang.statis.list_pool_statis_fail);
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
    pools.length && pools.forEach(function (pool) {
      poolType[pool.type] &&
      pool.application.includes('infinityfs') &&
      poolType[pool.type].push(pool.name);
    });

  };




	// 加载文件系统信息
	var fscallback = function (result){
		$('.bs-docs-grid').LoadData ("hide");
    checkLoading = false;

		if (result == undefined)
			return;
		if (result.code == 200 && result.result.name == 'infinityfs1') {
			var data = result.result;

      usedPool.push(data.metadata_pool);
      usedPool.push(data.data_pool);
      checkDataStoragePool();

			var htm = "";
			htm += '<div class="basic_content">'+
				'<div class="share_header">'+
				'<img src="css/image/infinityfs.png" style="width:43px">'+
				'<span>' + data['name'] + '</span>' +
				'<a class="fl-rt js-delete-fs hidden" href="javascript:;" title="' + lang.delete + '">'+
				'<img src="css/image/delete.png" style="width:43px" class="test">'+
				'</a>'+
				'</div>'+
				'<div class="left">'+
				'<div class="basic_cont_row">'+
				'<div class="fl-lt">' + lang.storage.metadata_storage_pool + '：</div>'+
				'<div class="fl-lt">'+ data['metadata_pool'] + '</div>' +
				'</div>' +
				'<div class="basic_cont_row">'+
				'<div class="fl-lt">' + lang.storage.data_storage_pool + '：</div>' +
				'<div class="fl-lt">' + data['data_pool'] + '</div>' +
				'</div>' +
				'<div class="basic_cont_row">' +
				'<div class="fl-lt">' + lang.storage.storage_used_capacity + '：</div>' +
				'<div class="fl-lt">' + formatCapacity(data['capacity']['used']) + '</div>' +
				'</div>' +
				'<div class="basic_cont_row">' +
				'<div class="fl-lt">' + lang.storage.storage_total_capacity + '：</div>'+
				'<div class="fl-lt">' + formatCapacity(data['capacity']['total']) + '</div>' +
				'</div>' +
				'<div class="basic_cont_row" style="display:block;margin-left:0;">'+
				'<div class="fl-lt">' + lang.storage.mount_dir + '：</div>' +
				'<div class="fl-lt" style="width:70%;">' +
				'<span>' + data['mountpoints'] + '</span>' +
				'<a href="javascript:;" class="fl-rt js-remove-dir hidden">' +
				'<span class="glyphicon glyphicon-remove" title="' + lang.storage.unmount_dir + '"></span>' +
				'</a>' +
				'<a href="javascript:;" class="fl-rt js-mount-dir hidden" style="padding-right:12px;" title="' + lang.storage.mount_dir + '">'+
				'<span class="glyphicon glyphicon-link"></span>' +
				'</a>'+
				'</div>'+
				'</div>'+
				'</div>'+
				'</div>'
			$('.fs-detail').html(htm).removeClass('hidden');
			DataModel['nodeismounted'](null, mountcallback, true, null);
		} else {
			$('.fs-detail').remove();
			$('.fs-mount').remove();
		}
	}
	$('.grid').masonry({
		itemSelector: '.grid-item',
		columnWidth: '.col-lg-6',
		percentPosition: true
	})
	$('.bs-docs-grid').LoadData ("show");
  checkLoading = true;
	DataModel['listFs'](null, fscallback, true, null);

	var mountcallback = function (result){
		$(".js-masonry").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			var data = result.result;
			var htm ='';
			htm += '<div class="basic_header" style="border-bottom:1px solid #f5f5f5">' +
				'<img src="css/image/storagenode.png">' +
				'<span>'+lang.storage.file_mount_state+'</span>' +
				'</div>' +
				'<div class="basic_content_list">' +
				'<div class="basic_cont_row">' +
				'<div class="col-lg-4 basic-lg-4 inlineblock" style="padding: 0 !important;text-align: left !important;">'+
				'<span style="padding-left: 50px;">'+ lang.node.node +'</span>' +
				'</div>' +
				'<div class="col-lg-2 basic-lg-2 inlineblock left">' +
				'<span>' + lang.cluster.status +'</span>' +
				'</div>' +
				'<div class="col-lg-2 basic-lg-2 inlineblock left">' +
				'<span>' + lang.storage.mount_path +'</span>' +
				'</div>' +
				'<div class="col-lg-3 basic-lg-3 inlineblock">' +
				'<span>' + lang.storage.mount_and_unmount +'</span>' +
				'</div>'+
				'</div>';
			for (var i = 0; i < data.length; i++) {
				htm += '<div class="basic_cont_row js-storage-row">';
				htm +=     '<div class="col-lg-4 basic-lg-4 inlineblock" style="padding: 0 !important;text-align: left !important;">' +
					'<span style="padding-left: 50px;">' + data[i]['ip'] + '</span>'+
					'</div>'+
					'<div class="col-lg-2 basic-lg-2 inlineblock js-status mount-status left">';
				if ( data[i]['status'] == 1 ) {
					htm += '<span style="color:green;">' + lang.storage.file_mount + '</span>' ;
				} else if( data[i]['status'] == 0 ){
					htm += '<span style="color:red;">' + lang.storage.file_unmount + '</span>' ;
				}else{
					htm += '<span style="color:red;">' + lang.cluster.unknown + '</span>' ;
				}
				htm+= '</div><div class="col-lg-2 basic-lg-2 inlineblock js-status left">' + data[i]['mountpoint'] + '';
				htm += '</div>' + '<div class="col-lg-3 basic-lg-3 inlineblock" style="height:30px;" data-ip="' + data[i]['ip'] + '">' +
					'<a href="javascript:;" class="js-mount-service" title="' + lang.storage.mount_dir + '" style="margin-right:15px;">'+
					'<span class="glyphicon glyphicon-link" title="' +lang.storage.mount_dir+ '"></span>' +
					'</a>'+
					'<a href="javascript:;" class="js-unmount-service" title="'+ lang.storage.unmount_dir +'" style="margin-right:15px;">'+
					'<span class="glyphicon glyphicon-remove" title="' + lang.storage.unmount_dir + '"></span>' +
					'</a>'+
					'</div>'+
					'</div>';
			}
			htm +='</div>'

			$('.fs-mount').html(htm).removeClass('hidden');
			$('.grid').masonry({
				itemSelector: '.grid-item',
				columnWidth: '.col-lg-6',
				percentPosition: true
			})
		} else {
			$('.fs-mount').remove();
		}
	}

	//删除文件系统
	$(document)
		.on ( 'click', '.js-delete-fs', function (ev) {
			$this = $(this);
			$modal = $('#delFSlModal');
			$grid = $this.closest('.fs-detail');
			$grid.siblings('.fs-detail').removeClass('deling');
			$grid.addClass('deling');
			var name = $('.fs-detail .share_header span').html()
			$modal = $('#delFSlModal');
			$modal.find('.modal-body p').html( lang.storage.sureto_del_filesystem + '<span style="color:red;">&nbsp;' + name + '</span>' + '?');
			$modal.modal('show');
			$modal.data('name', name);
		})
		.on ( 'click', '#delFSlModal .btn-danger', function (ev) {
			$modal = $('#delFSlModal');
			var fsname = $modal.data('name');
			var para = {
				'fsname': fsname,
			}
			var dncallback = function (result) {
				$modal.find('.modal-body').LoadData ("hide");
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(result.result);
					setTimeout(function() {
						refresh();
					}, 2000);
					$('.grid').masonry({
						itemSelector: '.grid-item',
						columnWidth: '.col-lg-6',
						percentPosition: true
					});
				} else {
					DisplayTips(result.result);
				}
				$modal.modal('hide');
			}
			$modal.find('.modal-body').LoadData ("show");
			DataModel['delFS'] (para, dncallback, true, lang.storage.del_filesystem );
		})

		//手动挂载，卸载fs
		.on('mouseover','.fs-detail',function(ev){
			$this = $(this);
			$this.find('.js-mount-dir').removeClass('hidden');
			$this.find('.js-remove-dir').removeClass('hidden');
			$this.find('.js-delete-fs').removeClass('hidden');
		})

		.on('mouseout','.fs-detail',function(ev){
			$this = $(this);
			$this.find('.js-mount-dir').addClass('hidden');
			$this.find('.js-remove-dir').addClass('hidden');
			$this.find('.js-delete-fs').addClass('hidden');
		})

		//单个节点挂载，卸载
		.on('click','.js-mount-service',function(ev){
			$this = $(this);
			var ip = $(this).closest('.js-mount-service').parent().data('ip');
			var para = {
				'ipaddr': ip,
			}
			var dncallback = function (result){
				if(result == undefined)
					return;
				if(result.code == 200) {
					DisplayTips(lang.storage.mount_dir_success);
					removeWaitMask();
					setTimeout(function() {
						refresh();
					}, 2000);
        } else if (result.code == 602) {
          DisplayTips(lang.cluster.check_license_fail);
				} else {
					removeWaitMask();
					DisplayTips(lang.storage.mount_dir_fail);
				}
			}
			addWaitMask();
			DataModel["nodemount"](para, dncallback, true, lang.storage.mount_dir);
		})
		.on('click','.js-unmount-service',function(ev){
			$this = $(this);
      if ($(this).closest('.js-storage-row').find('.mount-status').text() == lang.storage.file_unmount) {
          return DisplayTips(lang.storage.unmount_already);
      }
			var ip = $(this).closest('.js-unmount-service').parent().data('ip');
			var para = {
				'ipaddr': ip,
			}
			var dncallback = function (result){
				if(result == undefined)
					return;
				if(result.code == 200){
					DisplayTips(lang.storage.unmount_dir_success);
					removeWaitMask();
					setTimeout(function() {
						refresh();
					}, 2000);
				} else {
					removeWaitMask();
					DisplayTips(lang.storage.unmount_dir_fail);
				}
			}
			addWaitMask();
			DataModel["nodeumount"]( para, dncallback, true, lang.storage.unmount_dir);
		})
		//文件系统挂载，卸载
		.on('click','.js-mount-dir',function(ev){
			$this = $(this);

			var dncallback = function (result){
				$this.closest('.fs-detail').LoadData("hide");
				if(result == undefined)
					return;
				if(result.code == 200) {
					DisplayTips(result.result);
					DataModel['nodeismounted'](null, mountcallback, true, null);
				} else {
					DisplayTips(result.result);
				}
			}
			$this.closest('.fs-detail').LoadData("show");
			DataModel["mount"](null, dncallback, true, lang.storage.mount_dir);
		})
		.on('click','.js-remove-dir',function(ev){
			$this = $(this);
			var dncallback = function (result){
				$this.closest('.fs-detail').LoadData("hide");
				if(result == undefined)
					return;
				if(result.code == 200){
					DisplayTips(result.result);
					DataModel['nodeismounted'](null, mountcallback, true, null);
				} else {
					DisplayTips(result.result);
				}
			}
			$this.closest('.fs-detail').LoadData("show");
			DataModel["umount"]( null, dncallback, true, lang.storage.unmount_dir);
		})
		/* ------------------- 创建文件系统 ------------------- */
		.on ( 'click', '.js-create-fs', function (ev) {
			$modal = $('#createFileSysModal');
			var para = {
				'cache_pool': 'no'
			};

      if (checkLoading) {
        return DisplayTips(lang.please_wait);
      }

      if ($('.fs-detail').length) {
        return DisplayTips(lang.disk.file_sys_exists);
      }
			// var dncallback = function (result){
			// 	$modal.find('.modal-header').LoadData("hide");
			// 	if(result == undefined)
			// 		return;
			// 	if(result.code == 200){
			// 		var data = result.result.infinityfs || result.result.cephfs || [];
			// 		var htm = "";
			// 		for (var i = 0; i < data.length; i++) {
      //       htm += '<option value="' + data[i] + '">' + data[i] + '</option>';
			// 		};
			// 		$modal.find('#metadata_storage_pool').html(htm);
			// 		$modal.find('#data_storage_pool').html(htm);
			// 		$modal.find('#fs_name').val('infinityfs1');
			// 	} else {
			// 		DisplayTips(result.result);
			// 	}
			// }
      $modal.find('#fs_name').val('infinityfs1');
			if ( spoolLoaded == 'no' ) {
				spoolLoaded = 'yes';
				// $modal.find('.modal-header').LoadData("show");
				// DataModel["listPoolApplication"]( para, dncallback, true, "")
        checkDataStoragePool();
			}
			$modal.modal('show');
		} )


		.on ( 'click', '#createFileSysModal .btn-primary', function (ev) {
			$modal = $('#createFileSysModal');
			var	metapoolname ,
				datapoolname,
				mountpoint,
				fsname;
			fsname = trim ( $modal.find('#fs_name').val() );
			mountpoint = trim ( $modal.find('#fs_path').val() );
			metapoolname = trim( $modal.find('#metadata_storage_pool').val() ) ;
			datapoolname = trim( $modal.find('#data_storage_pool').val() ) ;
			if ( metapoolname == datapoolname ) {
				DisplayTips( lang.storage.storagepool_not_same );
				return;
			}
			if (!valifyUsername(fsname)) {
				DisplayTips( lang.storage.name_format_error );
				return;
			}
			if (!valifyPath(mountpoint)) {
				DisplayTips( lang.storage.path_format_error );
				return;
			}
			mountpoint = mountpoint.substring(1);
			var para = {
				'metapoolname': metapoolname,
				'datapoolname': datapoolname,
				'path': mountpoint,
				'fsname': fsname,
			};
			var dncallback = function (result) {
				$modal.find('.modal-header').LoadData ("hide");
				if (result == undefined)
					return;
				if (result.code == 200) {
					$modal.modal('hide');
					DisplayTips(lang.storage.create_filesystem_success);
					setTimeout(function(){
						refresh();
					},2000)
				} else {
					DisplayTips(result.result || lang.storage.create_filesystem_fail);
				}
			}
			$modal.find('.modal-header').LoadData ("show");
			DataModel['createFS'] (para, dncallback, true, lang.storage.create_filesystem );
		})
		//设置配额焦点
		.on('shown.bs.modal','#createFileSysModal',function(ev){
			$('#createFileSysModal').find('#fs-capacity').find(':text').focus();
		})
		.on ( 'mouseover', '.js-fs-availcapacity', function (ev) {
			//移到上面，编辑可用容量的按钮出现
			$this = $(this);
			$this.find('.js-edit-availcapacity').removeClass('hidden');
		})
		.on ( 'mouseout', '.js-fs-availcapacity', function (ev) {
			//移到上面，编辑可用容量的按钮出现
			$this = $(this);
			$this.find('.js-edit-availcapacity').addClass('hidden');
		})
		.on ( 'click', '#editAvailCapacityModal .btn-primary', function (ev) {
			$modal = $('#editAvailCapacityModal');
			$input = $modal.find('input');
			$select = $modal.find('select');
			var size = trim( $input.val() );
			var inputsize = size;
			var unit =  trim( $select.val() );
			size = transformUnit( size, unit);
			var para = {
				'size': size,
			}
			var dncallback = function (result) {
				$modal.find('.modal-header').LoadData ("hide");
				if (result == undefined)
					return;
				if (result.code == 200) {
					DisplayTips(result.result);
					$('.fs-detail').find('.js-fs-availcapacity input').val(inputsize+unit);
					$modal.modal('hide');
				} else {
					DisplayTips(result.result);
				}
			}
			$modal.find('.modal-header').LoadData ("show");
			DataModel['editFSAvail'] (para, dncallback, true, lang.storage.edit_avail );
		})
})
