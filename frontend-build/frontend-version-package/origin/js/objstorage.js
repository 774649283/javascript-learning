
$(function (ev) {
    var spoolLoaded = 'no';
    var storagepoolLoaded = false;  // 存储池是否已经列举
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
        $('#index_storage_pool').html(htm);

        total = [].concat(poolType['replicated'], poolType['erasure']);
        htm = '';
        total.length && total.forEach(function (pool) {
          (htm += '<option value="'+pool+'">'+pool+'</option>');
        });
        $('#data_storage_pool').html(htm);
      }

      if (!storagepoolLoaded) {
        $('#createObjSysModal .modal-header').LoadData('show');
        DataModel['listAllStorages'](null, function (rsp) {
          $('#createObjSysModal .modal-header').LoadData('hide');
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
        pool.application.includes('rgw') &&
        poolType[pool.type].push(pool.name);
      });

    };



    /* ------------------- 加载对象存储信息 ------------------- */
    var fscallback = function (result){
        $(".js-masonry").LoadData ("hide");
        if (result == undefined)
            return;
        if (result.code == 200) {
            var data = result.result;

            usedPool.push(data.data_pool);
            usedPool.push(data.index_pool);
            checkDataStoragePool();

            if (!data.data_pool) {
              return;
            }
            var htm = "";
            htm += 	'<div class="col-xs-12 col-md-5 col-lg-6  box-shadow grid-item grid-item-style2 obj-detail" data-name="'+ data['name'] + '">'+
                '<div class="basic_content">'+
                '<div class="share_header">'+
                '<img src="css/image/obj_storage.png" style="width:43px">'+
                '<span>' + lang.storage.objstorage_name + '</span>' +
                '<a class="fl-rt js-delete-obj hidden" href="javascript:;" title="' + lang.delete + '">'+
                '<img src="css/image/delete.png" style="width:43px" class="test">'+
                '</a>'+
                '</div>'+
                '<div class="left">'+
                '<div class="basic_cont_row">'+
                '<div class="fl-lt">' + lang.storage.data_storage_pool + '：</div>' +
                '<div class="fl-lt">' + data['data_pool'] + '</div>' +
                '</div>' +
                '<div class="basic_cont_row">'+
                '<div class="fl-lt">' + lang.storage.index_storage_pool + '：</div>' +
                '<div class="fl-lt">' + data['index_pool'] + '</div>' +
                '</div>' +
                '<div class="basic_cont_row">'+
                '<div class="fl-lt">' + lang.storage.shards_name + '：</div>' +
                '<div class="fl-lt">' + data['shards'] + '</div>' +
                '</div>' +
                '<div class="basic_cont_row">' +
                '<div class="fl-lt">' + lang.storage.storage_used_capacity + '：</div>' +
                '<div class="fl-lt">' + formatCapacity(data['used_bytes']) + '</div>' +
                '</div>' +
                '<div class="basic_cont_row">' +
                '<div class="fl-lt">' + lang.storage.storage_avail_capacity + '：</div>'+
                '<div class="fl-lt">' + formatCapacity(data['avail_bytes']) + '</div>' +
                '</div>' +
                '<div class="basic_cont_row" style="display:block;margin-left:0;">'+
                '</div>'+
                '</div>'+
                '</div>';
            $('.js-masonry').html(htm);
            $('.grid').masonry({
                itemSelector: '.grid-item',
                columnWidth: '.col-lg-6',
                percentPosition: true
            })
        } else {

        }
    }
    $(".js-masonry").LoadData ("show");
    DataModel['listObject'](null, fscallback, true, null);


    //删除文件系统
    $(document)
        .on ( 'click', '.js-delete-obj', function (ev) {
            $this = $(this);
            $modal = $('#delObjSysModal');
            $modal.find('.modal-body p').html( lang.user.confirm_del_object_sys + '?');
            $modal.modal('show');
        })
        .on ( 'click', '#delObjSysModal .btn-danger', function (ev) {
            $modal = $('#delObjSysModal');
            var para = {
                'datapoolname': '',
                'indexpoolname': '',
                'shards' : 0,
            }
            var dncallback = function (result) {
                $modal.find('.modal-body').LoadData ("hide");
                if (result == undefined)
                    return;
                if (result.code == 200) {
                    DisplayTips( lang.user.del_objuser_success );
                    $('.obj-detail.deling').remove();
                    $('.grid').masonry({
                        itemSelector: '.grid-item',
                        columnWidth: '.col-lg-6',
                        percentPosition: true
                    });
                    refresh();
                } else {
                    DisplayTips( result.result || lang.user.del_objuser_fail );
                }
                $modal.modal('hide');
            }
            $modal.find('.modal-body').LoadData ("show");
            DataModel['createObject'] (para, dncallback, true, null );
        })
        .on('mouseover','.obj-detail',function(ev){
            $this = $(this);
            $this.find('.js-delete-obj').removeClass('hidden');
        })
        .on('mouseout','.obj-detail',function(ev){
            $this = $(this);
            $this.find('.js-delete-obj').addClass('hidden');
        })

        //创建对象存储 -- 元数据存储池 不能是 纠删码
        //创建对象存储 -- 数据存储池不能和元数据存储池 相同
        .on ( 'click', '.js-create-obj', function (ev) {
          if (!storagepoolLoaded) {
            return DisplayTips(lang.please_wait);
          }
          var isObjExists = $('.obj-detail').length;
          if (isObjExists) {
            return DisplayTips(lang.user.app_obj_exists);
          }
            $modal = $('#createObjSysModal');
            var para = {
                'cache_pool': 'no'
            };
            // var dncallback = function (result){
            //     $modal.find('.modal-header').LoadData("hide");
            //     if(result == undefined)
            //         return;
            //     if(result.code == 200){
            //         var data = result.result.rgw || [];
            //         var htm = "";
            //         for (var i = 0; i < data.length; i++) {
            //           htm += '<option value="' + data[i] + '">' + data[i] + '</option>';
            //         }
            //         $modal.find('#data_storage_pool').html(htm);
            //         $modal.find('#index_storage_pool').html(htm);
            //         $modal.find('#shards_name').val('8');
            //     } else {
            //         DisplayTips(result.result || lang.request_error);
            //     }
            // }
            if($('.obj-detail').length > 0 && $('#createObjSysModal').find('span').text() == ''){
                var html = "";
                html += '<span style="color: red;">'+lang.user.confirm_recreate_object_sys+'</span>';
                $modal.find('.modal-header').append(html);
            }
            $modal.find('#shards_name').val('8');
            if ( spoolLoaded == 'no' ) {
                spoolLoaded = 'yes';
                // DataModel["listPoolApplication"]( para, dncallback, true, "")
                checkDataStoragePool();
            }
            $modal.modal('show');
        } )
        .on ( 'click', '#createObjSysModal .btn-primary', function (ev) {
            $modal = $('#createObjSysModal');
            var datapoolname = trim( $modal.find('#data_storage_pool').val() ) ;
            var indexpoolname = trim( $modal.find('#index_storage_pool').val() ) ;
            var shards = $modal.find('#shards_name').val();
            if(datapoolname == 'null'|| indexpoolname == 'null'){
                $modal.modal('hide');
                return;
            }
            if (datapoolname === indexpoolname) {
              return DisplayTips(lang.user.obj_meta_data_pool_not_same);
            }
            if( shards < 0 || shards > 8192 ){
                DisplayTips( lang.storage.input_shards_int );
                return;
            }else if( shards == '' ){
                DisplayTips( lang.storage.input_shards_erasure );
                return;
            }else if(shards.match(/^[1-9]\d*$/) === null || shards.match(/^[1-9]\d*$/) === null){
                DisplayTips( lang.storage.input_shards_int );
                return;
            }
            $input = $modal.find('#obj-capacity').find('input');
            $select = $modal.find('#obj-capacity').find('select');
            var para = {
                'datapoolname': datapoolname,
                'indexpoolname': indexpoolname,
                'shards' : shards,
            };
            var dncallback = function (result) {
                $modal.find('.modal-header').LoadData ("hide");
                if (result == undefined)
                    return;
                if (result.code == 200) {
                    $modal.modal('hide');
                    DisplayTips(result.result);
                    refresh();
                } else {
                    DisplayTips(result.result || lang.request_error);
                }
            }
            $modal.find('.modal-header').LoadData ("show");
            DataModel['createObject'] (para, dncallback, true, lang.storage.create_filesystem );
        })
})
