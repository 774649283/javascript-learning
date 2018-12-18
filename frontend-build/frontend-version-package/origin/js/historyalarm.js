$(function (ev) {
	// //对日志信息分页
	var totalpage;
	var count;
  var lastQueryStart = '';  // 上次查询的开始时间
  var lastQueryEnd = '';  // 上次查询的结束时间
  var lastQueryKeywords = '';  // 上次查询的关键字

	var h = $('.all_table_list_third').height();
	perpage = parseInt( h/43 );//判断一页显示多少个


  /**
   * [根据传入日期获取当前日期]
   * @param {[String]} [开始时间]
   * @param {[String]} [结束时间]
   */
  var getDate = function (starttime, endtime) {

    if (!endtime) {
      var year = new Date().getFullYear();
      year = year < 10 ? ('0' + year) : year;
      var month = new Date().getMonth() + 1;
      month = month < 10 ? ('0' + month) : month;
      var day = new Date().getDate();
      day = day < 10 ? ('0' + day) : day;
      endtime = year + '-' + month + '-' + day;
    }

    if (!starttime) {
      starttime = '1970-01-01';
    }

    return {
      starttime: starttime,
      endtime: endtime
    }
  };


  /**
   * [获取日志并渲染页面]
   * @param  {[Number]} page    [日志页数]
   * @param  {[Number]} perpage [每页个数]
   * @param  {[Bool]} isJump [是否是跳页]
   */
  var getLogsAndRender = function (params, isJump) {

    var parameter = {
        'page' : parseInt(params.page),
        'perpage' : params.perpage,
        'logType' : 'monlog',
        'starttime': getDate(params.starttime, params.endtime).starttime,
        'endtime': getDate(params.starttime, params.endtime).endtime,
        'keywords': replaceSystemKeyword(params.keywords)
    };
		var dncallback = function (result) {
			if (result == undefined)
				return;
			if (result.code == 200) {
				$(".dt_system_bar_third").LoadData ("hide");
        // 关键字替换
        // result = replaceSystemKeyword(result);
        lastQueryStart = parameter.starttime;
        lastQueryEnd = parameter.endtime;
        lastQueryKeywords = parameter.keywords;

				var htm = '';
				var level = '';
				var data = result.result.records;
				count = result.result.count;
				totalpage = Math.ceil( count/perpage );

        if (totalpage == 0) {
          $('.page-jump-wrapper').addClass('hidden');
        }else {
          $('.page-jump-wrapper').removeClass('hidden');
        }

				for (var i = 0; i < data.length; i++) {
					htm +=  '<div class="alarm-mag" date-time="'+ data[i]["time"] +'">' +
								'<div class="col-lg-2 basic-lg-2 col-format-row ellipsis">'+
									'<span>' + data[i]["time"] + '</span>'+
								'</div>'+
								'<div class="col-lg-1 basic-lg-1 col-format-row ellipsis">'+
									'<span>' + data[i]["module"] + '</span>'+
								'</div>'+
                '<div class="col-lg-1 basic-lg-1 col-format-row ellipsis">'+
									'<span>' + data[i]["hostname"] + '</span>'+
								'</div>'+
								'<div class="col-lg-1 basic-lg-1 col-format-row ellipsis">'+
									'<span>' + data[i]["user"] + '</span>'+
								'</div>'+
								'<div class="col-lg-2 basic-lg-2 col-format-row ellipsis">'+
									'<span>' + data[i]["level"] + '</span>'+
								'</div>'+
								'<div class="col-lg-5 basic-lg-5 col-format-row ellipsis left">'+
									'<span title="' + data[i]["message"] + '">' + data[i]["message"] + '</span>'+
								'</div>'+
							'</div>';
				};
				$('#historyalarmlist').html(htm);
				getHistoryAlarmspage();
				autoHeightPermit();
        // 重新渲染pagenation
        if (isJump) {
          var $paginationFather = $('#pagination_alarm').parent();
          $('#pagination_alarm').remove();
          $paginationFather.append($('<div id="pagination_alarm" class="js-pagination" style="text-align:center;"></div>'));

          totalpage && $('#pagination_alarm').twbsPagination({
            totalPages: totalpage,
            startPage: params.page,
            visiblePages: 5,
            first: lang.optlog.first_page,
            prev: lang.optlog.prev_page,
            next: lang.optlog.next_page,
            last: lang.optlog.last_page,
            lother: lang.optlog.total + totalpage + lang.optlog.page,
            onPageClick: function (event, page) {
              var beginTime = lastQueryStart;
              var endTime = lastQueryEnd;
              var keywords = lastQueryKeywords;

              getLogsAndRender({
                page: page,
                perpage: perpage,
                starttime: beginTime,
                endtime: endTime,
                keywords: keywords
              }, false );
            }
          })
        }
			}
			else if(result.code == INFI_STATUS.warning || INFI_STATUS.faild) {
				$(".dt_system_bar_third").LoadData ("hide");
			}
			else {
				DisplayTips( lang.optlog.list_alarms_fail );
			}
		}
		$(".dt_system_bar_third").LoadData ("show");
    // 根据参数情况选择接口调用
    DataModel["selectHistoryAlarmLogs"](parameter, dncallback, true);
    // if ((parameter.starttime || parameter.endtime) || parameter.keywords) {
    //   DataModel["selectHistoryAlarmLogs"](parameter, dncallback, true);
    // }else {
    //   DataModel["listOptLogs"](parameter, dncallback, true);
    // }

  };

  /* ------------------- 初始化 ------------------- */
  getLogsAndRender({
    page: 1,
    perpage: perpage,
    starttime: '',
    endtime: '',
    keywords: ''
  }, true );


	function getHistoryAlarmspage(){
		totalpage && $('#pagination_alarm').twbsPagination({
			totalPages: totalpage,
			visiblePages: 5,
			first: lang.optlog.first_page,
			prev: lang.optlog.prev_page,
			next: lang.optlog.next_page,
			last: lang.optlog.last_page,
			lother: lang.optlog.total + totalpage + lang.optlog.page,
			onPageClick: function (event, page) {

        var beginTime = $('.dateSelectBegin').val() || '';
        var endTime = $('.dateSelectEnd').val() || '';
        var keyword = $('.log_keyword_input > input').val().trim() || '';

        getLogsAndRender({
          page: page,
          perpage: perpage,
          starttime: beginTime,
          endtime: endTime,
          keywords: keyword
        }, false );
			}
		})
	}
	autoHeightPermit();
	 //自适应列表高度
    function autoHeightPermit () {
        var h1 = $('.magtable_list_third').height();
        var h2 = $('.magtable_list_parent').height();
        if ( h1 == 0 ) {
            html = '<div class="no-record-parent">' +
                   '<span class="no-record">' +
                   lang.user.no_record +
                   '</span>'+
                   '</div>';
            $('.magtable_list_third').append(html);
        }
        if ( h1 < h2 ) {
            $('.all_table_list_third').css('height', 'auto');
            $('.magtable_list_parent').css('overflow', 'hidden');
        }
    }


    /* ************************* 日志筛选和跳页 ************************* */

    $(document)
    .on('click','#downloadLogs',function(ev){
  		$modal = $('#downloadModal');
  		$modal.modal('show');
  		$modal.find('.modal-header').LoadData('show');
  		$modal.find('.btn-default').attr('disabled','disabled');
  		$modal.find('.modal-body').html('<p>' + lang.optlog.exporting_logs +'</p>')

  		function callback(result){
  			$modal.find('.modal-header').LoadData('hide');
  			$modal.find('.btn-default').removeAttr('disabled');
  			if(!result){
  				return;
  			}
  			var link = result.result;
  			var mark = link.indexOf('/download');
  			link = '.' + link.substring(mark);
  			if(result.code == 200){
  				htm = '<a href="'+link+'" download="monlog.csv"><button type="button" id="startDownload" class="btn btn-info btn-block" ' +
  						'style="float: none;margin: 0;height: 40px;;width: 100px;">' + lang.optlog.start_download + '</button></a>';
  				$modal.find('.modal-body').html(htm);
  				$modal.find('#startDownload').data('url',result.result);
  			}
  			else{
  				htm = '<p style="color:#FF0000;">' + lang.optlog.export_logs_fail +'</p>';
  				$modal.find('.modal-body').html(htm);
  			}
  		}

			var beginTime = $('.dateSelectBegin').val();
			var endTime = $('.dateSelectEnd').val();

  		DataModel['downloadLog']({
        page: 1, perpage: perpage, logType: 'monlog',
        starttime: getDate(beginTime, endTime).starttime,
        endtime: getDate(beginTime, endTime).endtime,
        keywords: replaceSystemKeyword(lastQueryKeywords)
      },callback,true,null);
  	})

    /* ------------------- 跳页 ------------------- */
      .on('click', '.page-jump-button', function (ev) {
        var pagenum = Number($('.page-jump-input').val().trim());
        var beginTime = lastQueryStart;
        var endTime = lastQueryEnd;
        var keyword = lastQueryKeywords;

        if (!pagenum) {
          return DisplayTips(lang.optlog.pagenum_input_not_none);
        }

        if (!checkPageNum(pagenum)) {
          DisplayTips(lang.optlog.pagenum_input_check);
        }else if (!checkPageNumRange(pagenum)) {
          DisplayTips(lang.optlog.pagenum_range_check);
        }else {
          getLogsAndRender({
            page: pagenum,
            perpage: perpage,
            starttime: beginTime,
            endtime: endTime,
            keywords: keyword
          }, true );
        }

      })

    /* ------------------- 筛选 ------------------- */
      .on('click', '.log_submit_button > input', function (ev) {
        var beginTime = $('.dateSelectBegin').val();
        var endTime = $('.dateSelectEnd').val();
        var keyword = $('.log_keyword_input > input').val().trim();

        if (beginTime || endTime) {  // p1 -- 起始时间和终止时间其中有输入，keyword任意
          if ( new Date( getDate(beginTime, endTime).starttime) > new Date(getDate(beginTime, endTime).endtime) ) {
            return DisplayTips(lang.optlog.begin_end_time_sort);
          }
        }

        getLogsAndRender({
          page: 1,
          perpage: perpage,
          starttime: beginTime,
          endtime: endTime,
          keywords: keyword
        }, true );

      })


    /**
     * [检查输入的日志页数是否合法]
     * @param  {[Number]} pagenum [日志页数]
     */
    var checkPageNum = function (pagenum) {
      if (!pagenum) {
        return false;
      }

      if ( !(typeof(pagenum) === 'number' ) ) {
        return false;
      }
      if (pagenum <= 0) {
        return false;
      }
      return true;
    };

    /**
     * [检查当前输入的页码数是否在范围内]
     * @param {[Number]} pagenum [页码数]
     */
    var checkPageNumRange = function (pagenum) {
      var $pagenation = $('#pagination_logs');  // 总页数
      totalpage;  // 总页数
      if (pagenum > totalpage) {
        return false;
      }
      return true;
    };


})
