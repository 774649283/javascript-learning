$(function (ev) {
    var timer = null;//用来解决当移入到磁盘路径上时，可以移入到框里

	// 加载分区信息
	var dataPart = '';
	var node = $('.node-nav-sub-left li.active').data('ip');
	var ismounted = 'NULL';
	var fstype = 'NULL';
	var arrPart = [];
	var parameter = {
		'node': node,
		'ismounted': ismounted,
		'fstype': fstype
	};
	var mdscallback = function (result){
		$(".partition_nodeinfo").LoadData ("hide");
		if (result == undefined)
			return;
		if (result.code == 200) {
			showPartList (result.result);
			$('.grid').masonry({
			  itemSelector: '.grid-item',
			  columnWidth: '.col-lg-6',
			  percentPosition: true
			})
		}
	}	
	if(node){
		$(".partition_nodeinfo").LoadData ("show");
		DataModel['partList'](parameter, mdscallback, true, null);
	}

	// var $progressInfo = $('[name="' + node + '"]');
	// $('.js-progress-info').each(
	// 	function(ev){
	// 		if ($(this).attr('name') == node) {
	// 			$progressInfo = $(this);
	// 		}
	// 	})
	// var progressCallback = function (result){
	// 	data = result.result;
	// 	if (result == undefined) {
	// 		return;
	// 	}
	// 	var $progressBar = $progressInfo.find('.progress .progress-bar');
	// 	var countProgress = 0;
	// 	//取所有 for循环
	// 	for(var i = 0; i < data.length; i++){
	// 		if (data[i].status == 'new') {
	// 		$progressInfo.removeClass('hidden');

	// 		var percent = data[i].progress * 100;
	// 		percent = percent.toFixed(2);
	// 		$progressBar
	// 			.attr('aria-valuenow', percent)
	// 			.css('width', percent + '%')
	// 			.text(percent + '%');

	// 		if (percent == 100) {
	// 			DisplayTips(lang.part.format_part_success);
	// 			setTimeout(function(ev){
	// 				$progressInfo.addClass('hidden');	
	// 			}, 3*1000);
	// 			//refresh();
	// 		}
	// 		countProgress++;
	// 		}
	// 	}
	// 	if (countProgress == 0) {
	// 		$progressBar
	// 			.attr('aria-valuenow', 0)
	// 			.css('width', '0%')
	// 			.text('0%');
	// 		$progressInfo.addClass('hidden');
	// 	}
	// }
	// var progPara = {
	// 	'name' : node,
	// 	'status' : 'new',
	// 	// 'tag':'disk.format'
	// }
	// DataModel['showAddDiskProgress'](progPara, progressCallback, true, null);

	// //轮询进度
	// setInterval( function(){
	// 	var hasProgressBar = !($progressInfo.hasClass('hidden'));
	// 	if (hasProgressBar) {
	// 		DataModel['showAddDiskProgress'](progPara, progressCallback, true, null);
	// 	} else{
	// 		$progressInfo.addClass('hidden');
	// 	}
	// } , 6*1000 );

	$(document)
	//以下四个移入移出事件用来处理，鼠标可以移到显示分区详情的popver框上
	.delegate('.part-content .part-mag .path-part', 'mouseover', function (ev) {
		clearInterval( timer );
		$this = $(this);
		$part = $this.closest('.part-mag');
		$popver = $('#js-popver-usage');
		mouseoverPart ($this, $part, $popver);
	})
	.delegate('#js-popver-usage', 'mouseover', function (ev) {
		clearInterval( timer );
		$this = $(this);
		$part = $('.part-content .part-mag.part-mouseover');
		$el = $part.find('.path-part');
		$popver = $('#js-popver-usage');

		mouseoverPart ($el, $part, $popver);
	})
	.delegate('.part-content .part-mag .path-part', 'mouseout', function (ev) {
		$this = $(this);
		$popver = $('#js-popver-usage');
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(popverOut($popver), 300);
	})
	.delegate ('#js-popver-usage', 'mouseleave', function (ev) {
		$popver = $('#js-popver-usage');
        popverOut($popver);
	})
	//分区
	.delegate('.is-select-all input', 'click', function (ev) {
		var $inputs = $(this).closest('.basic_content_list').siblings('.part-content').find('.part-mag .pic-part input');
		if ($(this).prop('checked') == true) {
			$inputs.each(function (i) {
				$(this).prop("checked", true);
				selectInputSingle($(this));
			})
		} else {
			$inputs.each(function (i) {
				$(this).prop("checked", false);
				selectInputSingle($(this));
			})
		}
	})
	.delegate('.part-content .part-mag .pic-part input', 'click', function (ev) {
		//全选按钮不勾选
		var $this = $(this);
		selectInputSingle($this);
	})
	//删除单个分区
	.delegate ( '.js-part-del-single', 'click', function (ev) {
		$this = $(this);
		$p = $('#delSinglePartModel .modal-body p');
		var partname = trim ( $this.closest('.part-mag').find('.path-part span').text() );
		var name = $this.closest('.part-mag').data('name');
		var inuse = $this.closest('.part-mag').find('.path-part').data('inuse');

		$p.html(lang.part.sureto_del_part + '<span style="color:red;">&nbsp;' + partname + '</span>' + ' ?');
		$p.data('path', partname);
		$p.data('name', name);
		$p.data('inuse', inuse);
		$('#delSinglePartModel').modal('show');
	} )
	.delegate ('#delSinglePartModel .btn-primary', 'click', function (ev) {
		$modal = $('#delSinglePartModel');
		$p = $modal.find('.modal-body p');
		var name = $p.data('name');
		var inuse = $p.data('inuse');
		//首先判断分区是否正在使用中
		if ( inuse == 1 ) {
			DisplayTips (lang.part.inuse_not_permit_del);
			return false;
		}
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
			'name': name,
		};
		var dncallback = function (result){
            removeWaitMask();
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips (lang.part.del_part_success);
				//注：比如删除分区名为sda，那么sda这个磁盘上的所有分区都将要被移除
				// $part = $('.part-content').find('.part-mag');
				// $part.each(function (i) {
				// 	$this = $(this);
				// 	if ($this.data('name') == name) {
				// 		$this.remove();
				// 	}
				// })
				refresh();
			}else {						
				DisplayTips(lang.part.del_part_fail );
			}
			$('#delSinglePartModel').modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
        addWaitMask();
		DataModel["delPart"](parameter, dncallback, true, lang.part.del_part);
	})
	//批量删除分区
	.delegate ( '#delMultiPart', 'click', function (ev) {
		$this = $(this);
		$modal = $('#delMultiPartModel');
		$p = $modal.find('.modal-body p');
		$select = $('.part-mag.select');
		var name = '';
		var path = '';
		var prevname ='';
		var curname = '';
		var prevpath = '';
		var curpath = '';
		$select.each (function () {
			$this = $(this);
			if ($this.data("inuse") == 1) {
				DisplayTips (lang.part.inuse_not_permit_del);
				return false;
			}
			prevname = $this.prev().data('name');
			curname = $this.data('name');
			if (prevname != curname ) {
				name += $this.data('name');
				name += ',';
			}

			curpath = trim( $this.find('.path-part span').text() );
			prvpath = trim( $this.prev().find('.path-part span').text() );
			if (prevpath != curpath ) {
				path += trim( $this.find('.path-part span').text() );
				path += ',';
			}
		});
		name = name.substring(0,name.length-1);
		path = path.substring(0,path.length-1);

		$p.html(lang.part.sureto_del_part + '<span style="color:red;">&nbsp;' + path + '</span>' + ' ?');
		$p.data('path', path);
		$p.data('name', name);
		$modal.modal('show');
	} )
	.delegate ('#delMultiPartModel .btn-primary', 'click', function (ev) {
		$modal = $('#delMultiPartModel');
		$p = $modal.find('.modal-body p');
		var name = $p.data('name');
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
			'name': name,
		};
		var dncallback = function (result){
            removeWaitMask();
			$modal.find('.modal-header').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
                //隐藏批量删除图标，显示新建分区图标
                $('#addNewPart').removeClass('hidden');
				$('#delMultiPart').addClass('hidden');
				DisplayTips (lang.part.del_part_success);
				//注：比如删除分区名为sda，那么sda这个磁盘上的所有分区都将要被移除
				// $part = $('.part-content').find('.part-mag');
				// $part.each(function (i) {
				// 	$this = $(this);
				// 	if ($this.data('name') == name) {
				// 		$this.remove();
				// 	}
				// })
				refresh();
			}else {						
				DisplayTips(lang.part.del_part_fail );
			}
			$modal.modal('hide');
		}
		$modal.find('.modal-header').LoadData ("show");
        addWaitMask();
		DataModel["delPart"](parameter, dncallback, true, lang.part.del_part);
	})
	//新建分区按钮显示
	.on('mouseover', '.partition_nodeinfo', function (ev) {
		$('.partition_nodeinfo #addNewPart').removeClass('hidden');
	})
	.on('mouseout', '.partition_nodeinfo', function (ev) {
		$('.partition_nodeinfo #addNewPart').addClass('hidden');
	})
	//创建分区的全选按钮
	.on( 'click','#select_create_part', function (ev) {
		var check = false;
		if ($(this).prop("checked") == true) {
			check = true;
		}
		$(this).closest ("table").find ("tbody input[type='checkbox']").each (function (){
			if (check) {
				$(this).prop ("checked", true);
			}else {
				$(this).prop ("checked", false);
			}
		});	
	})
	//新建分区
	.delegate ( '#addPartModel .btn-primary', 'click', function (ev) {
		$modal = $('#addPartModel');
		var tds = $("#addPartModel tbody input[type='checkbox']:checked");
		if (tds.length == 0) {
			DisplayTips(lang.part.select_block_part);
			return;
		}
		var list = "";
		tds.each (function (){
			if (list != "")
				list += ",";
			list += $(this).data ("name");
		});
		// list = list.substring(0, list.length-1);
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
			'name': list,
		};		
		var mycallback = function (result){
			removeWaitMask();
			$modal.find('modal-body').LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips(lang.part.create_part_success);
				refresh ();
			} else {
				DisplayTips(lang.part.create_part_fail);
			}
			$("#addPartModel").modal ("hide");
		}
		$modal.find('modal-body').LoadData ("show");
		addWaitMask();
		DataModel['partCreate'](parameter, mycallback, true, lang.part.create_part);
	} )
	//卸载单个分区
	.delegate ( '.unmount_single_part', 'click', function (ev) {
		$this = $(this);
		$p = $('#umountSingleModel .modal-body p');
		var partname = trim ( $this.closest('.part-mag').find('.path-part span').text() );
		var name = $this.closest('.part-mag').data('mount');
		var inuse = $this.closest('.part-mag').find('.path-part').data('inuse');

		$p.html(lang.part.sureto_unmount_part + '<span style="color:red;">&nbsp;' + partname + '</span>' + ' ?');
		$p.data('path', partname);
		$p.data('name', name);
		$p.data('inuse', inuse);
		$('#umountSingleModel').modal('show');
	})
	.delegate ( '#umountSingleModel .btn-primary', 'click', function (ev) {
		$p = $('#umountSingleModel .modal-body p');
		var name = $p.data('name');
		var inuse = $p.data('inuse');
		var path = $p.data('path');
		//首先判断分区是否正在使用中
		if ( inuse == 1 ) {
			DisplayTips (lang.part.inuse_not_permit_unmount);
			return false;
		}

		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
			'name': path,
		};
		var dncallback = function (result){
            removeWaitMask();
			$(".partition_nodeinfo").LoadData ("hide");

			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips (lang.part.unmount_part_success);
                refresh();
				//注：比如删除分区名为sda，那么sda这个磁盘上的所有分区都将要被移除
				$part = $('.part-content').find('.part-mag');
				$part.each(function (i) {
					$this = $(this);
					if ($this.data('name') == name) {
						$this.remove();
					}
				})
			}else {						
				DisplayTips(lang.part.unmount_part_fail + '(' + result.result + ')');
			}
			$('#umountSingleModel').modal('hide');
		}
		$(".partition_nodeinfo").LoadData ("show");
        addWaitMask();
		DataModel["unmountPart"](parameter, dncallback, true, lang.part.unmount_part);
	})
	//批量卸载分区
	.delegate ( '#umountMulti', 'click', function (ev) {
		$this = $(this);
		$p = $('#umountMultiModel .modal-body p');
		$select = $('.part-mag.select');
		var name = '';
		var path = '';
		var prevname ='';
		var curname = '';
		var prevpath = '';
		var curpath = '';
		$select.each (function () {
			$this = $(this);
			if ($this.data("inuse") == 1) {
				DisplayTips (lang.part.inuse_not_permit_unmount);
				return false;
			}
			prevname = $this.prev().data('mount');
			curname = $this.data('mount');
			if (prevname != curname ) {
				name += curname;
				name += ',';
			}
			curpath = trim( $this.find('.path-part span').text() );
			prvpath = trim( $this.prev().find('.path-part span').text() );
			if (prevpath != curpath ) {
				path += curpath;
				path += ',';
			}
		});
		name = name.substring(0, name.length-1);
		path = path.substring(0, path.length-1);

		$p.html(lang.part.sureto_unmount_part + '<span style="color:red;">&nbsp;' + path + '</span>' + ' ?');
		$p.data('path', path);
		$p.data('name', name);
		$('#umountMultiModel').modal('show');
	} )
	.delegate ('#umountMultiModel .btn-primary', 'click', function (ev) {
		$p = $('#umountMultiModel .modal-body p');
		var name = $p.data('name');
		var path = $p.data('path');
		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
			'name': path,
		};
		var dncallback = function (result){
            removeWaitMask();
			$("#umountMultiModel").find('.modal-header').LoadData ('hide');

			if (result == undefined)
				return;
			if (result.code == 200) {
				DisplayTips (lang.part.unmount_part_success);
				//注：比如删除分区名为sda，那么sda这个磁盘上的所有分区都将要被移除
				// $part = $('.part-content').find('.part-mag');
				// $part.each(function (i) {
				// 	$this = $(this);
				// 	if ($this.data('name') == name) {
				// 		$this.remove();
				// 	}
				// })
				//refresh();
				setTimeout(function () {
					refresh();
				}, 1500);
			} else if (result.code == -1) {		
				DisplayTips(lang.part.unmount_part_fail + ': ' + result.result);
				setTimeout(function () {
					refresh();
				}, 3000);
			} else {
				DisplayTips(lang.part.unmount_part_fail);			
			}
			$('#umountMultiModel').modal('hide');
		}
		$("#umountMultiModel").find('.modal-header').LoadData ('show');
        addWaitMask();
		DataModel["unmountPart"](parameter, dncallback, true, lang.part.unmount_part);
	})
	//格式化分区
	.delegate( '.js-part-format-single', 'click', function (ev) {
		$p = $('#formatModel .format_list');
		var partname = trim ( $this.closest('.part-mag').find('.path-part span').text() );
		var name1 = $this.closest('.part-mag').data('name');
		var name = $this.closest('.part-mag').data('mount');
		var inuse = $this.closest('.part-mag').find('.path-part').data('inuse');

		$p.html( partname );
		$p.data('path', name1);
		$p.data('name', name);
		$p.data('inuse', inuse);
		$('#formatModel').modal('show');
	})
	//批量格式化分区
	.delegate ( '#formatMulti', 'click', function (ev) {
		$this = $(this);
		$p = $('#formatModel .format_list');
		$select = $('.part-mag.select');
		var name = '';
		var pathname = '';
		var path = '';
		var prevname ='';
		var curname = '';
		var prevpath = '';
		var curpath = '';
		$select.each (function () {
			$this = $(this);
			if ($this.data("inuse") == 1) {
				DisplayTips (lang.part.inuse_not_permit_format);
				return false;
			}
			// prevname = $this.prev().data('mount');
			// curname = $this.data('mount');
			// if (prevname != curname ) {
			// 	name += curname;
			// 	name += ',';
			// }
			prevname = $this.prev().data('name');
			curname = $this.data('name');
			if (prevname != curname ) {
				pathname += $this.data('name');
				pathname += ',';
			}
			curpath = trim( $this.find('.path-part span').text() );
			prevpath = trim( $this.prev().find('.path-part span').text() );
			if (prevpath != curpath ) {
				path += curpath;
				path += ',';
			}
		});
		path = path.substring(0, path.length-1);
		name = pathname.substring(0, path.length-1);

		$p.html(path);
		$p.data('path', path);
		$p.data('name', name);
		$('#formatModel').modal('show');
	} )
	.delegate ( '#formatModel .btn-primary', 'click', function (ev) {
		$p = $('#formatModel .format_list');
		var name = $p.data('name');
		var inuse = $p.data('inuse');
		var path = $p.data('path');
		//首先判断分区是否正在使用中
		if ( inuse == 1 ) {
			DisplayTips (lang.part.inuse_not_permit_unmount);
			return false;
		}

		$node = $('.fixed_nav_left .v-menu li.active');
		var host = $node.data('ip');
		var parameter = {
			'host': host,
			'name': name,
		};
		var dncallback = function (result){
			removeWaitMask();
			$('#formatModelLabel').closest('.modal-header').LoadData ("hide");

			if (result == undefined)
				return;
			if (result.code == 200) {
				//DisplayTips (lang.part.format_part_success);
				//注：比如删除分区名为sda，那么sda这个磁盘上的所有分区都将要被移除
				// $part = $('.part-content').find('.part-mag');
				// $part.each(function (i) {
				// 	$this = $(this);
				// 	if ($this.data('name') == name) {
				// 		$this.remove();
				// 	}
				// })
				// DataModel['showAddDiskProgress'](progPara, progressCallback, true, null);
			}else {						
				DisplayTips(lang.part.format_part_fail + '(' + result.result + ')');
			}
			$('#formatModel').modal('hide');
		}
		$('#formatModelLabel').closest('.modal-header').LoadData ("show");
		addWaitMask();
		DataModel["formatPart"](parameter, dncallback, true, lang.part.format_part);
	})
	$('.part-content').on ('mouseover', '.part-mag', partMouseover);
	$('.part-content').on ('mouseout', '.part-mag', partMouseout);
	//
	function partMouseover (ev) {
		ev.stoppropagation;
		$this = $(this);
		$this.find('.other-act-part div.hidden').removeClass('hidden');
		$this.find('.pic-part img').css('display', 'none');
		$this.find('.pic-part input').css('display', 'inline-block');
	}

	function partMouseout (ev) {
		ev.stoppropagation;
		$this = $(this);
		$this.find('.other-act-part div').addClass('hidden');
		$this.find('.pic-part img').css('display', 'inline-block');
		$this.find('.pic-part input').css('display', 'none');
	}

	function partMouseover1 (ev) {
		ev.stoppropagation;
		$this = $(this);
		$this.find('.other-act-part div.hidden').removeClass('hidden');
		$this.find('.pic-part img').css('display', 'none');
		$this.find('.pic-part input').css('display', 'inline-block');
	}

	function partMouseout1 (ev) {
		ev.stoppropagation;
		$this = $(this);
		$this.find('.pic-part img').css('display', 'none');
		$this.find('.pic-part input').css('display', 'inline-block');
		$this.find('.other-act-part div').addClass('hidden');
	}

	//复选框被勾选时调用
	function selectInputSingle (el) {
		$content = el.closest('.part-content');
		$part = el.closest('.part-mag');
		$selAll = el.closest('.part-content').siblings('.basic_content_list').find('.part-mag .is-select-all input');
		if (el.prop('checked') == true) {
			//添加pink 、user-mag-pink类，移除user-mag
			$part.removeClass('js-part-mag').addClass('select');
			$part.find('div').addClass('pink');
			$part.find('.other-act-part div.hidden').removeClass('hidden');
			//解除mouseout的绑定事件
			$content.off('mouseout', '.part-mag', partMouseout);
			$content.on('mouseout', '.part-mag', partMouseover);

			$content.find('.part-mag .pic-part img').css('display', 'none');
			$content.find('.part-mag .pic-part input').css('display', 'inline-block');
			//重新添加绑定的mouseout事件
			$content.on('mouseout', '.js-part-mag', partMouseout1);
			$('#addNewPart').addClass('hidden');
			$('#delMultiPart').removeClass('hidden');
			$('#formatMulti').removeClass('hidden');
			$('#umountMulti').removeClass('hidden');
			$('.partition_nodeinfo #addNewPart').removeClass('hidden');
			//判断是否全选，如果全选，则全选按钮也勾选
			var plen = $('.part-content').find('.js-part-mag').length;
			if (plen < 1) {
				//则全选按钮被勾选
				$selAll.prop('checked', true);
			}
		} else{
			//取消勾选，变换成之前的
			//如果页面上一个被勾选的都没有，此时重置密码和删除图标才消失，否则就出现
			var len = ( $content.find('.part-mag').length - $content.find('.js-part-mag').length ) - 1;
			if (len < 1) {
				$('#addNewPart').removeClass('hidden');
				$('#delMultiPart').addClass('hidden');
				$('#formatMulti').addClass('hidden');
				$('#umountMulti').addClass('hidden');
				//移除userMouseout1这个事件，并重新绑定
				$content.off('mouseout', '.part-mag', partMouseout1);
				$content.on('mouseout', '.part-mag', partMouseout);
				$content.find('.part-mag .pic-part img').css('display', 'inline-block');
				$content.find('.part-mag .pic-part input').css('display', 'none');
				el.closest('.basic_content_list').siblings('.part-content').find('.part-mag .is-select-all input').prop('checked', false);
			}
			//一旦勾选取消，立刻移除pink类
			el.closest('.part-mag').addClass('js-part-mag').removeClass('select');
			el.closest('.part-mag').find('div').removeClass('pink');
			$part.find('.other-act-part>div').addClass('hidden');
			var plen = $('.part-content').find('.js-part-mag').length;
			if (plen > 0) {
				//则全选按钮被勾选
				$selAll.prop('checked', false);
			}
		}
		var countChose = 0;
		var countTotal = 0;
		$('.partition_nodeinfo .basic_content .part-content .pic-part input').each(function(i){
			if ($(this).prop('checked') == true){
				countChose++;
			}
			countTotal++;
		})
		var countChoseTotal = countChose + '/' + countTotal;
		$('.partition_nodeinfo .basic_header').find('.badge').eq(0).text(countChoseTotal);
	}

	function showPartList (result) {
		var html = '';
		var countTotal = 0;

        if ( result.length > 0 ) {
            for (var j = 0; j < result.length; j++) {
                countTotal++;
                (function(part) {
					arrPart.push(part['devicename']);
                    html += '<div class="part-mag js-part-mag" data-name="'+ part['devicename'] +'" data-mount="'+ part['mountpoint'] +'">' +
                            //'<div class="col-lg-1 pic-part">' +
                            //    '<img src="css/image/part_small.png" style="width:20px;height:20px;">'+
                            //        '<input type="checkbox" class="mg-part-checked" style="display:none;">'+
                            //    '</div>'+
                                '<div class="col-lg-3 basic-lg-3 path-part left" data-used="' + part['used'] + '" data-total="'+ part['totalsize'] +'" data-filetype="' + part['fstype'] +'" data-inuse="' + part['inuse'] + '">'+
                                    '<span>'+ part['path'] + '</span>'+
                                '</div>'+
                                '<div class="col-lg-3 basic-lg-3 usage-part left" style="cursor:pointer;">'+
                                    '<span>' + Number(part['usage']).toFixed(2) + '%' + '</span>'+
                                '</div>'+
                                '<div class="col-lg-5 basic-lg-5 mount-part left ellipsis" style="cursor:pointer;">';
                                if (part['mountpoint'] == "") {
                                    html += '<span>--</span>';
                                } else{
                                    html += '<span title="'+ part['mountpoint'] +'">' + part['mountpoint'] + '</span>';
                                }
                        html +=	'</div>'+
                                '<div class="col-lg-1 other-act-part right" style="padding-right:33px!important;">' +
                                    '<div class="hidden">';
                                if(part['mountpoint']==''){
                  //                   html += 
									// // '<a href="javascript:;" class="js-part-format-single" title="'+ lang.part.format_the_part +'">' +
                  //                   // '<span class="glyphicon glyphicon-repeat"></span>' +
                  //                   // '</a>' +
                  //                   '<a href="javascript:;" class="js-part-del-single" title="'+ lang.part.del_part +'">' +
                  //                   '<span class="glyphicon glyphicon-trash"></span>' +
                  //                   '</a>';
                                }else {
                                    // html += '<a href="javascript:;" class="unmount_single_part" title="'+ lang.part.unmount_part +'">' +
                                    //     '<span class="glyphicon glyphicon-remove-circle"></span>' +
                                    //     '</a>';
                                }
                            html +='</div>'+
                                '</div>'+
                            '</div>';
                })(result[j])
            };
        }
        var countChoseTotal = '0/'+ countTotal;
        $('.partition_nodeinfo .basic_header').find('.badge').eq(0).text(countChoseTotal);
		$('.partition_nodeinfo .part-content').html(html);
	}

    $(document).on('click','#addNewPart',function(){
        createPart();//添加分区的信息
    });
	//创建分区
	function createPart () {
		var callback = function(data){
            removeWaitMask();
			if(data.code==200){
				var htm = '';
				var dataPart = data.result;
				for (var i = 0; i < dataPart.length; i++) {
					if(jQuery.inArray(dataPart[i]['devicename'], arrPart) === -1){
						htm += '<tr>' +
							'<td>'+
							'<input type="checkbox"/ data-name="' + dataPart[i]['devicename'] + '">'+
							'</td>'+
							'<td>' + dataPart[i]['devicename'] + '</td>' +
							'<td>' + dataPart[i]['path'] + '</td>' +
							'<td align="right">' + (formatCapacity( dataPart[i]['totalsize'])) + '</td>' +
							'</tr>';
					}
				}
				if(!dataPart.length){
                    htm += '<tr>';
                    htm += '<td colspan="4"><p style="font: normal 44px Roboto,arial,sans-serif;text-align: center;color: #eeeeee">无可用块设备</></td>';
                    htm += '</tr>';
				}
				$('#addPartModel .modal-body table tbody').html(htm);
			}
		}
        var node = $('.node-nav-sub-left li.active').data('ip');
        var parameter = {
            'node': node,
        };
        addWaitMask();
		DataModel['showAddPartList'](parameter, callback, true, null);
	}

	//移入到分区路径上，显示相关的信息
	function mouseoverPart ($el, $part, $popver) {
		$part.siblings().removeClass('part-mouseover');
		$part.removeClass('part-mouseover').addClass('part-mouseover');
		var used = formatCapacity( $el.data('used') );
		if(used==0){
			used=lang.disk.unknown;
		}
		var total = formatCapacity( $el.data('total') );
		$filetype = $el.data('filetype');
		$status = $el.data('inuse');
		//var fstype = getFsType($filetype);
		var fstype = $filetype.toUpperCase();
		var status = $status == 1 ? lang.storage.usage : lang.disk.avail;
		$('#js-popver-usage .js-used-part').text(used);
		$('#js-popver-usage .js-used-total').text(total);
		$('#js-popver-usage .js-used-status').text(status);
		$('#js-popver-usage .js-used-type').text(fstype);

		popverPosition($popver, $el);
	}
})