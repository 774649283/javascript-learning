$(function (ev) {
    var h = $('.all_table_list_third').height();
    var totalpage = 0;

    var lastQueryStart = '';  // 上次查询的开始时间
    var lastQueryEnd = '';  // 上次查询的结束时间
    var lastQueryKeywords = '';  // 上次查询的关键字

    //global
	  perpage = parseInt( h/36 - 1 );
    if (perpage < 1) perpage = 1;
    //用于储存搜索状态
    searchMode = {
        isSearching: false,
        keyword: ''
    }

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
    var getLogsAndRender = function (params, isJump, isSelect) {

      var para = {
          'page' : parseInt(params.page),
          'perpage' : params.perpage,
          'starttime': getDate(params.starttime, params.endtime).starttime,
          'endtime': getDate(params.starttime, params.endtime).endtime,
          'keywords': replaceSystemKeyword(params.keywords),
          'sort' : 'time'
      };

      var callback = function (result) {
          $('.all_table_list_third').LoadData('hide')


          if (!result) {
              return;
          }
          if (result.code === 200) {
              var totalPages = Math.ceil( result.result[0].count / perpage );
              totalpage = totalPages;
              var tableHtml = renderLogsTable(result.result[0].records);
              var paginationHtml = renderPagination(totalPages, para.page);

              lastQueryStart = para.starttime;
              lastQueryEnd = para.endtime;
              lastQueryKeywords = para.keywords;

              $('#js-audit-log-table').html(tableHtml);
              $('#js-audit-pagination').html(paginationHtml);

              autoHeightPermit();

              if (totalpage == 0) {
                $('.page-jump-wrapper').addClass('hidden');
              }else {
                $('.page-jump-wrapper').removeClass('hidden');
              }

              // 重新渲染pagenation
              if (isJump) {
                var $paginationFather = $('#pagination_logs').parent();
                $('#pagination_logs').remove();
                $paginationFather.append($('<div id="pagination_logs" class="js-pagination" style="text-align:center;"></div>'));

                totalpage && $('#pagination_logs').twbsPagination({
                  totalPages: totalpage,
                  startPage: para.page,
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
                      'sort': 'time',
                      perpage: perpage,
                      starttime: beginTime,
                      endtime: endTime,
                      keywords: keyword
                    }, false);
                  }
                })
              }

          }
          else if(result.code ==701){
              $(".all_table_list_third").LoadData ("hide");
          }
          else {
              console.log('fail!');
          }
      }

      $('.all_table_list_third').LoadData('show');

      // 根据参数情况选择接口调用
      DataModel["selectAuditLogs"](para, callback, true);

    };

    var showLog = function (targetPage, isJump) {
      var beginTime = $('.dateSelectBegin').val() || '';
      var endTime = $('.dateSelectEnd').val() || '';
      var keyword = $('.log_keyword_input > input').val().trim() || '';

        getLogsAndRender({
          page: targetPage,
          'sort': 'time',
          perpage: perpage,
          starttime: beginTime,
          endtime: endTime,
          keywords: keyword
        }, isJump);
    }

    var searchLog = function (keyword, targetPage) {
        var para = {
            'page' : targetPage,
            'perpage' : perpage,
            'keyword' : keyword
        }

        var callback = function (result) {
            $('.dt_system_bar_third').LoadData('hide')
            if (!result) {
                return;
            }
            if (result.code === 200) {
                var totalPages = Math.ceil( result.result.count / perpage );
                var tableHtml = renderLogsTable(result.result.records);
                var paginationHtml = renderPagination(totalPages, targetPage);

                $('#js-audit-log-table').html(tableHtml);
                $('#js-audit-pagination').html(paginationHtml);

                autoHeightPermit();
            } else {
                console.log('fail!');
            }
        }

        $('.dt_system_bar_third').LoadData('show')
        DataModel["searchAudit"](para, callback, true, null);
    }

    showLog(1, true);

    $(document)
    //点击页码
    .on('click', '.js-audit-page', function (ev) {
        var target = $(this).data('target');
        if (searchMode.isSearching) {
            searchLog(searchMode.keyword, target);
        } else {
            showLog(target);
        }
    })
    //搜索
    .on('click', '#js-allsearch-audit', function (ev) {
        var keyword = trim($('#js-filter-audit').val());
        searchMode.keyword = keyword;
        if (keyword === '') {
            $('#js-filter-audit').val('');
            searchMode.isSearching = false;
            showLog(1);
            return;
        } else {
            searchMode.isSearching = true;
            searchLog(keyword, 1);
        }
    })
    .on('keypress', '#js-filter-audit', function (ev) {
        if (ev.which == 13) {
            $('#js-allsearch-audit').click()
        }
    })

    //生成列表
    function renderLogsTable (data) {
        var html = '';
        if (data.length < 1) {
            // html += '<tr class="no-content"><td style="color: grey">' + lang.no_record + '</td></tr>';
            html += '';
        }
        for (var i = 0; i < data.length; i++) {
            var formatTime = data[i].time.slice(5,7) + "/" + data[i].time.slice(8,10)+"/" + data[i].time.slice(0,4) + "  "+data[i].time.slice(11,19);
            html += '<tr>' +
                        '<td class="ellipsis" title="' + data[i].user_name + '">' + data[i].user_name + '</td>' +
                        '<td>' + formatTime + '</td>' +
                        '<td>' + data[i].user_op + '</td>' +
                        '<td class="ellipsis" title="' + data[i].user_op_target + '">' + data[i].user_op_target + '</td>' +
                        '<td class="ellipsis" title="' + data[i].share_name + '">' + data[i].share_name + '</td>' +
                        '<td>' + data[i].user_ip + '</td>' +
                    '</tr>';
        }
        return html;
    }

    //生成分页
    function renderPagination (total, curpage) {
		var html = '';
		var prevPages = 0;
		var nextPages = 0;

		if (curpage > total) {
			curpage = total;
		} else if (curpage < 1) {
			curpage = 1;
		}
		//计算前后页数
		if (total <= 11) {
			prevPages = curpage - 1;
			nextPages = total - curpage;
		} else {
			if (curpage <= 6) {
				prevPages = curpage - 1;
			} else {
				prevPages = 5;
			}
			if (total - curpage <= 6) {
				nextPages = total - curpage;
			} else {
				nextPages = 10 - prevPages;
			}
		}
		//上一页
		if (curpage !== 1) {
			html += '<li>' +
						'<a class="js-audit-page" data-target="' + (curpage - 1) + '" aria-label="Previous">' +
							'<span aria-hidden="true">&laquo;</span>' +
						'</a>' +
					'</li>';
		} else {
			html += '<li class="disabled">' +
						'<a aria-label="Previous">' +
							'<span aria-hidden="true">&laquo;</span>' +
						'</a>' +
					'</li>';
		}

		if (prevPages + 1 === curpage) { 	//前页无省略
			for (var i = 0; i < prevPages; i++) {
				html += '<li><a class="js-audit-page" data-target="' + (i + 1) + '">' + (i + 1) + '</a></li>';
			}
		} else {
			html += '<li><a class="js-audit-page" data-target="1">1</a></li>' +
					'<li class="disabled"><a>…</a></li>';
			for (var i = 3; i > 0; i--) {
				html += '<li><a class="js-audit-page" data-target="' + (curpage - i) + '">' + (curpage - i) + '</a></li>';
			}
		}

		//当前页
		html += '<li class="active"><a>' + curpage + '</a></li>';

		if (curpage + nextPages === total) {	//后页无省略
			for (var j = 0; j < nextPages; j++) {
				html += '<li><a class="js-audit-page" data-target="' + (curpage + j + 1) + '">' + (curpage + j + 1) + '</a></li>';
			}
		} else {
			for (var j = 0; j < nextPages - 2; j++) {
				html += '<li><a class="js-audit-page" data-target="' + (curpage + j + 1) + '">' + (curpage + j + 1) + '</a></li>';
			}
			html += '<li class="disabled"><a>…</a></li>' +
					'<li><a class="js-audit-page" data-target="' + total + '">' + total + '</a></li>';
		}

		//下一页
		if (curpage !== total) {
			html += '<li>' +
						'<a class="js-audit-page" data-target="' + (curpage + 1) + '" aria-label="Next">' +
							'<span aria-hidden="true">&raquo;</span>' +
						'</a>' +
					'</li>';
		} else {
			html += '<li class="disabled">' +
						'<a aria-label="Next">' +
							'<span aria-hidden="true">&raquo;</span>' +
						'</a>' +
					'</li>';
		}

		return html;
	}

    function autoHeightPermit () {
        $('.all_table_list_third').height($('.audit-log-table').height());
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
  				htm = '<a href="'+link+'" download="auditlog.csv"><button type="button" id="startDownload" class="btn btn-info btn-block" ' +
  						'style="float: none;margin: 0;height: 40px;;width: 100px;">' + lang.optlog.start_download + '</button></a>';
  				$modal.find('.modal-body').html(htm);
  				$modal.find('#startDownload').data('url',result.result);
  			}
  			else{
  				htm = '<p style="color:#FF0000;">' + lang.optlog.export_logs_fail +'</p>';
  				$modal.find('.modal-body').html(htm);
  			}
  		}

      var beginTime = $('.dateSelectBegin').val() || '';
      var endTime = $('.dateSelectEnd').val() || '';

  		DataModel['downloadAuditLog']({
        page: 1,
        perpage: perpage,
        sort: 'time',
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
            'sort': 'time',
            perpage: perpage,
            starttime: beginTime,
            endtime: endTime,
            keywords: keyword
          }, true);
        }

      })

    /* ------------------- 筛选 ------------------- */
      .on('click', '.log_submit_button > input', function (ev) {
        var beginTime = $('.dateSelectBegin').val() || '';
        var endTime = $('.dateSelectEnd').val() || '';
        var keyword = $('.log_keyword_input > input').val().trim() || '';

        if (beginTime || endTime) {  // p1 -- 起始时间和终止时间其中有输入，keyword任意
          if ( new Date( getDate(beginTime, endTime).starttime) > new Date(getDate(beginTime, endTime).endtime) ) {
            return DisplayTips(lang.optlog.begin_end_time_sort);
          }
        }

        // 请求
        getLogsAndRender({
          page: 1,
          'sort': 'time',
          perpage: perpage,
          starttime: beginTime,
          endtime: endTime,
          keywords: keyword
        }, true)

      });


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
