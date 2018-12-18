$(function (ev) {
	//获取服务器时间，不用浏览器本地时间作为时间轴
	var firstNodeIp = '';
	var serverTime = ''; //服务器时间字符串 MM/DD/YY HH:mm:ss
	var nodeData = undefined;

	var listNodeCallback = function (result) {
		if (result.code === 200) {
			nodeData = result;
			firstNodeIp = result.result.nodes[0].ip;
		}
	}
	DataModel["listStatisNode"](null, listNodeCallback, false, null);
	var getTimeCallback = function (result) {
		if (result.result.time) {
			serverTime = result.result.time;
		} else {
			serverTime = undefined;
		}
	}
	DataModel['listClock']({'host': firstNodeIp}, getTimeCallback, false, null);

	var serverNow = moment(serverTime, 'MM/DD/YY HH:mm:ss');	//服务器时间
	var diff = serverNow.diff(moment()); 	//服务器与客户端的时间差 服务器时间 = moment() + diff;

	//时间插件格式问题
	var now = moment().add(diff, 'milliseconds');
	var today = moment().add(diff, 'milliseconds').format('YYYY-MM-DD');
	var s_end = now.format('YYYY-MM-DD');
	var ago30 = moment().add(diff, 'milliseconds').subtract('days', 29);
	var s_begin = ago30.format('YYYY-MM-DD');
	var stime = ago30.format('YYYY-MM-DD');
	var starttime = ago30.format('YYYY-MM-DD');
	var etime = now.format('YYYY-MM-DD');
	var endtime = now.format('YYYY-MM-DD');
	$('#pooltime').html( moment().add(diff, 'milliseconds').format('YYYY'+lang.year+'MM'+lang.month+'DD'+lang.day+' HH:mm:ss') );
	$('#nodetime').html( moment().add(diff, 'milliseconds').format('YYYY'+lang.year+'MM'+lang.month+'DD'+lang.day+'')+ ' - ' + moment().add(diff, 'milliseconds').add(1, 'days').format('YYYY'+lang.year+'MM'+lang.month+'DD'+lang.day+'') );
	var poolTimeGobal=[];
	var nodeTimeGobal=[];
   	formatDatetime ( 'pooltime', poolTimeGobal );
   	formatDatetime ( 'nodetime', nodeTimeGobal );

	// echarts 路径配置
    require.config({
        paths: {
            echarts: 'js/lib/dist/'
        }
    });
    //定义三个全局变量用来存储读、写、OPS   定义一个定时器
	var	timeTicket = null; //存储池实时信息定时器
	var	mTime = null; //节点信息定时器


	var rData = [],
		wData = [],
		opsData = [],
		mavaildata = [],
		mtotaldata = [],
		mpercentdata = []
		csystemdata = [],
		cuserdata = [],
		cpupercentdata = [];
	$('#pooltime').on('apply.daterangepicker', function(ev, picker) {
  		$ul = $('ul.js-pool-statis');
		$li = $ul.find('li.chartactive');
		poolname = $li.data('pool');
		if (poolname == "all") {
			poolname = '#!total';
		}
  		var textsel = picker.chosenLabel;
  		var startData = picker.startDate;
	  	var endData = picker.endDate;
  		var para = {};
  		var syear,
  			endyear,
  			smonth,
  			endmonth,
  			sday,
  			endday,
  			shour,
  			endhour,
  			smin,
  			endmin,
  			ssec,
  			endsec;
  		var starttime, endtime;//存放参数

  		syear = parseInt( startData.format('YYYY') );
  		endyear = parseInt( endData.format('YYYY') );
  		smonth = parseInt( startData.format('MM') );
  		endmonth = parseInt( endData.format('MM') );
  		sday = parseInt( startData.format('DD') );
  		endday = parseInt( endData.format('DD') );
  		shour = parseInt( startData.format('HH') );
  		endhour = parseInt( endData.format('HH') );
		smin = parseInt( startData.format('mm') );
  		endmin = parseInt( endData.format('mm') );
  		ssec = parseInt( startData.format('ss') );
  		endsec = parseInt( endData.format('ss') );

  		if ( textsel === 'customize the date' ) {
	  		if ( syear == endyear ) {
	  			//先比较年,如果开始年 == 结束年 ,就接着比较月
	  			if ( smonth == endmonth ) {
	  				//月相等 比较天
	  				if ( sday == endday ) {
	  					//天相等 比较小时
	  					if ( shour == endhour ) {
	  						//小时相等 比较分钟
	  						if ( smin == endmin ) {
	  							//分钟相等,精确到 ‘s’
	  							starttime = startData.format('YYYYMMDDHHmmss');
	  							endtime = endData.format('YYYYMMDDHHmmss');
	  						} else{
	  							//5s 一个数据，1min有12个数据，60min 12*60=720，一天24*12*60 = 18200
	  							//已测试 这么多的数据会导致点铺满插件
	  							//所以精确到分钟 但是在10分钟内，会导致可能只取到几个点

	  							//先比较是否在半个小时内，如果小于等于30min，就精确到秒

	  							starttime = startData.format('YYYYMMDDHHmm');
	  							endtime = endData.format('YYYYMMDDHHmm');
	  						}
	  					} else{
	  						//精确到小时
	  						starttime = startData.format('YYYYMMDDHH');
	  						endtime = endData.format('YYYYMMDDHH');
	  					}
	  				} else if ( sday < endday ){
	  					//精确到天
	  					starttime = startData.format('YYYYMMDD');
	  					endtime = endData.format('YYYYMMDD');
	  				}

	  			} else if ( smonth < endmonth ) {
	  				//精确到月
	  				starttime = startData.format('YYYYMM');
	  				endtime = endData.format('YYYYMM');
	  			}

	  		} else if ( syear < endyear ) {
	  			//精确到月
  				starttime = startData.format('YYYYMM');
  				endtime = endData.format('YYYYMM');
	  		}

	  		var para = {
  				'start_time': starttime,
  				'end_time': endtime,
  				'pool_name': poolname
  			}

  			listPoolHistoryStatistics ( poolname, para );
  		} else if ( textsel === 'real time' ) {
			$now = moment().add(diff, 'milliseconds');
			var now = $now.format('YYYY'+lang.year+'MM'+lang.month+'DD'+lang.day+' HH:mm');
			$('#pooltime').html(now.format(now));
			$ul = $('ul.js-pool-statis');
			$li = $ul.find('li.chartactive');
			poolname = $li.data('pool');
			listPoolStatistics ( poolname );
		} else {
  			if (  textsel == 'today' ) {
	  			//今天
	  			var start = startData.format('YYYYMMDD');
	  			var end = endData.format('YYYYMMDD');

	  			para = {
	  				'start_time': start,
	  				'end_time': end,
	  				'pool_name': poolname
	  			}
	  		} else if (  textsel == 'yesterday' ) {
	  			//昨天
	  			var start = startData.format('YYYYMMDD');
	  			var end = endData.format('YYYYMMDD');
	  			para = {
	  				'start_time': start,
	  				'end_time': end,
	  				'pool_name': poolname
	  			}
	  		} else if (  textsel === '7 days ago' || textsel === '30 days ago' || textsel === 'this month' || textsel === 'last month' ) {
	  			//过去7天、过去30天、本月、上月
	  			var start = picker.startDate.format('YYYYMMDD');
	  			var end = picker.endDate.format('YYYYMMDD');
	  			para = {
	  				'start_time': start,
	  				'end_time': end,
	  				'pool_name': poolname
	  			}
	  		}
  			listPoolHistoryStatistics ( poolname, para );
  		}
	});

	// $('#nodetime').on('apply.daterangepicker', function(ev, picker) {
	//   	$ul = $('ul.js-node-statis');
	// 	$li = $ul.find('li.chartactive');
	// 	var ip = $li.data('ip');
 //  		var textsel = picker.chosenLabel;
 //  		var startData = picker.startDate;
	//   	var endData = picker.endDate;
 //  		var para = {};
 //  		var syear,
 //  			endyear,
 //  			smonth,
 //  			endmonth,
 //  			sday,
 //  			endday,
 //  			shour,
 //  			endhour,
 //  			smin,
 //  			endmin,
 //  			ssec,
 //  			endsec;
 //  		var starttime, endtime;//存放参数

 //  		syear = parseInt( startData.format('YYYY') );
 //  		endyear = parseInt( endData.format('YYYY') );
 //  		smonth = parseInt( startData.format('MM') );
 //  		endmonth = parseInt( endData.format('MM') );
 //  		sday = parseInt( startData.format('DD') );
 //  		endday = parseInt( endData.format('DD') );
 //  		shour = parseInt( startData.format('HH') );
 //  		endhour = parseInt( endData.format('HH') );
	// 	smin = parseInt( startData.format('mm') );
 //  		endmin = parseInt( endData.format('mm') );
 //  		ssec = parseInt( startData.format('ss') );
 //  		endsec = parseInt( endData.format('ss') );
 //  		if ( textsel === lang.custom_date ) {
	//   		if ( syear == endyear ) {
	//   			//先比较年,如果开始年 == 结束年 ,就接着比较月
	//   			if ( smonth == endmonth ) {
	//   				//月相等 比较天
	//   				if ( sday == endday ) {
	//   					//天相等 比较小时
	//   					starttime = startData.format('YYYYMMDD');
	//   					endtime = endData.format('YYYYMMDD');
	//   				} else if ( sday < endday ){
	//   					//精确到天
	//   					starttime = startData.format('YYYYMMDD');
	//   					endtime = endData.format('YYYYMMDD');
	//   				}

	//   			} else if ( smonth < endmonth ) {
	//   				//精确到月
	//   				starttime = startData.format('YYYYMM');
	//   				endtime = endData.format('YYYYMM');
	//   			}

	//   		} else if ( syear < endyear ) {
	//   			//精确到月
 //  				starttime = startData.format('YYYYMM');
 //  				endtime = endData.format('YYYYMM');
	//   		}

	//   		var para = {
 //  				'start_time': starttime,
 //  				'end_time': endtime,
 //  				'ip': ip
 //  			}
 //  			listNodeStatistics ( ip, para );
 //  		} else {
 //  			if (  textsel == lang.today ) {
	//   			//今天
	//   			var start = startData.format('YYYYMMDD');
	//   			var end = endData.format('YYYYMMDD');

	//   			para = {
	//   				'start_time': start,
	//   				'end_time': end,
	//   				'ip': ip
	//   			}
	//   		} else {
	//   			//昨天
	//   			var start = startData.format('YYYYMMDD');
	//   			var end = endData.format('YYYYMMDD');
	//   			para = {
	//   				'start_time': start,
	//   				'end_time': end,
	//   				'ip': ip
	//   			}
	//   		}
 //  			listNodeStatistics ( ip, para );
 //  		}
	// })

	$(document)
	.on ( 'click', 'ul.js-pool-statis > li a', function (ev) {
		$this = $(this);
		$li = $this.closest('li');
		$ul = $this.closest('ul.js-pool-statis');
		$ul.find('li').removeClass('chartactive');
		$li.addClass('chartactive');
		var poolname = $li.data('pool');
		var startDate, endDate;
		startDate = poolTimeGobal.s_time;
		endDate = poolTimeGobal.e_time;

		if ( poolname == 'all' && poolTimeGobal.label == 'real time') {
			listPoolStatistics ( poolname );
		} else if ( poolname != 'all' && poolTimeGobal.label == 'real time') {
			listPoolStatistics ( poolname );
		} else if ( poolTimeGobal.label == 'customize the date') {
			if (poolname == "all") {
	  			poolname = "#!total";
	  		}
			//自定义时间
			var syear,
	  			endyear,
	  			smonth,
	  			endmonth,
	  			sday,
	  			endday,
	  			shour,
	  			endhour,
	  			smin,
	  			endmin,
	  			ssec,
	  			endsec;
	  		var starttime, endtime;//存放参数

	  		syear = parseInt( startDate.substring(0, 4) );
	  		endyear = parseInt( endDate.substring(0, 4) );
	  		smonth = parseInt( startDate.substring(4, 6) );
	  		endmonth = parseInt( endDate.substring(4, 6) );
	  		sday = parseInt( startDate.substring(6, 8) );
	  		endday = parseInt( endDate.substring(6, 8) );
	  		shour = parseInt( startDate.substring(8, 10) );
	  		endhour = parseInt( endDate.substring(8, 10) );
			smin = parseInt( startDate.substring(10, 12) );
	  		endmin = parseInt( endDate.substring(10, 12) );
	  		ssec = parseInt( startDate.substring(12, 14) );
	  		endsec = parseInt( endDate.substring(12, 14) );
	  		if ( syear == endyear ) {
	  			//先比较年,如果开始年 == 结束年 ,就接着比较月
	  			if ( smonth == endmonth ) {
	  				//月相等 比较天
	  				if ( sday == endday ) {
	  					//天相等 比较小时
	  					if ( shour == endhour ) {
	  						//小时相等 比较分钟
	  						if ( smin == endmin ) {
	  							//分钟相等,精确到 ‘s’
	  							starttime = startDate.substring(0, startDate.length);
	  							endtime = endDate.substring(0, startDate.length);
	  						} else{
	  							//5s 一个数据，1min有12个数据，60min 12*60=720，一天24*12*60 = 18200
	  							//已测试 这么多的数据会导致点铺满插件
	  							//所以精确到分钟 但是在10分钟内，会导致可能只取到几个点

	  							//先比较是否在半个小时内，如果小于等于30min，就精确到秒

	  							starttime = startDate.substring(0, startDate.length-2);
	  							endtime = endDate.substring(0, startDate.length-2);
	  						}
	  					} else{
	  						//精确到小时
	  						starttime = startDate.substring(0, startDate.length-4);
	  						endtime = endDate.substring(0, startDate.length-4);
	  					}
	  				} else if ( sday < endday ){
	  					//精确到天
	  					starttime = startDate.substring(0, startDate.length-6);
	  					endtime = endDate.substring(0, startDate.length-6);
	  				}

	  			} else if ( smonth < endmonth ) {
	  				//精确到月
	  				starttime = startDate.substring(0, 6);
	  				endtime = endDate.substring(0, 6);
	  			}

	  		} else if ( syear < endyear ) {
	  			//精确到月
  				starttime = startDate.substring(0, 6);
  				endtime = endDate.substring(0, 6);
	  		}

	  		var para = {
  				'start_time': starttime,
  				'end_time': endtime,
  				'pool_name': poolname
  			}
  			listPoolHistoryStatistics ( poolname, para );
		} else if ( poolname != 'all' && poolTimeGobal.label == undefined) {
			//当页面没进行任何操作，直接点击存储池进行实时信息的切换
			listPoolStatistics ( poolname );
		}  else if ( poolname === 'all' && poolTimeGobal.label == undefined) {
			//当页面没进行任何操作，直接点击存储池进行实时信息的切换
			listPoolStatistics ( poolname );
		} else {
			var start = startDate.substring(0, startDate.length-6);
			var end = endDate.substring(0, endDate.length-6);
			if ( poolname == "all" ) {
				poolname = '#!total';
			}
			var para = {
  				'start_time': start,
  				'end_time': end,
  				'pool_name': poolname
  			};
  			listPoolHistoryStatistics ( poolname, para );
		}
	})
	.on ( 'click', '.btn-minimize', function(ev){
	    ev.preventDefault();
	    ev.stopPropagation ();
	    var $target = $(this).closest('.box').find('.box-content');
	    if( $target.is(':visible') ) {
	    	$('i',$(this)).removeClass('glyphicon-chevron-up')
	    				  .addClass('glyphicon-chevron-down');
	    } else {
	    	$('i',$(this)).removeClass('glyphicon-chevron-down')
	    			      .addClass('glyphicon-chevron-up');
	    }
	    $target.slideToggle('slow');
	})
	.on ( 'click', '.js-node-statis > li a', function (ev) {
		$this = $(this);
		$li = $this.closest('li');
		$ul = $this.closest('ul.js-node-statis');
		$ul.find('li').removeClass('chartactive');
		$li.addClass('chartactive');
		var ip = $li.data('ip');
		var para = {
			'ip': ip,
		};
		var ischangeNode = true;
		listNodeStatistics( ip, ischangeNode );

	})

	//刚加载页面的时候，默认是第一个存储池的性能
	function initPoolChart () {
		//发请求获取存储池名
		var para = {
			'cache_pool': 'no'
		};
		var dncallback = function (result){
	    	$('ul.js-pool-statis').LoadData("hide");
	      	if(result == undefined)
				return;
	      	if(result.code == 200){
	        	var data = result.result;
	        	var htm = "";
	        	for (var i = 0; i < data.length; i++) {
	        		spool = data[i];
	        		htm += 	'<li class="fl-lt" style="padding:5px 15px;" data-pool="'+ spool.poolname+'">' +
								'<a href="javascript:;" title="'+ spool.poolname +'">' +
									'<span>'+ spool.poolname + '</span>' +
								'</a>' +
							'</li>';
	        	};
	        	htm +=  '<li class="fl-lt js-pool-allinfo" data-pool="all" style="padding:5px 15px;">' +
							'<a href="javascript:;" title="all">' +
								'<span style="color:red;">'+ lang.statis.pool_all_performance +'</span>'+
							'</a>'+
						'</li>';
	        	$('ul.js-pool-statis').html(htm);

				$ul = $('ul.js-pool-statis');
				$li = $ul.find('li:last');
				$ul.find('li').removeClass('chartactive');
				$li.addClass('chartactive');
				//var poolname = $li.data('pool');
				if ( data.length > 0 ) {
					listPoolStatistics ( 'all' );
				}
	    	} else if (result.code == INFI_STATUS.uninitialized) {}
	    	else {
	        	DisplayTips( lang.storage.list_metadata_and_data_pool_fail );
	      	}
	    }
    	$('ul.js-pool-statis').LoadData("show");
    	DataModel["listSpool"]( para, dncallback, true, "");
	}
	initPoolChart ();//初始化存储池性能统计信息

	//刚加载页面的时候，默认是第一个节点的性能
	function initNodeChart () {
		var dncallback = function (result){
	    	$('ul.js-node-statis').LoadData("hide");
	      	if(result == undefined)
				return;
	      	if(result.code == 200){
	        	var data = result.result.nodes;
	        	var htm = "";
	        	for (var i = 0; i < data.length; i++) {
	        		var node = data[i];
	        		htm += 	'<li class="fl-lt" style="padding:5px 15px;" data-ip="'+ node['ip'] +'">'+
								'<a href="javascript:;" title="'+ node['hostname'] +'">'+
									'<span>'+ node['hostname'] +'（' + node['ip'] +'）</span>' +
								'</a>'+
							'</li>';
	        	};
	        	$ul = $('ul.js-node-statis');
	        	$ul.html(htm);
				if ( $ul.find('li').length > 0 ) {
					$li = $ul.find('li:first');
					$ul.find('li').removeClass('chartactive');
					$li.addClass('chartactive');
					nodeip = $li.data('ip');
					listNodeStatistics( nodeip );
				}
	    	}
	    }
    	$('ul.js-node-statis').LoadData("show");
		if (nodeData === undefined) {
			DataModel["listStatisNode"]( null, dncallback, true, "");
		} else {
			dncallback(nodeData);
		}
	}
	initNodeChart ();//初始化存储池性能统计信息
	//列举存储池性能统计信息
	function listPoolStatistics ( poolName ) {
		require(
		    [
		        'echarts',
		        'echarts/chart/bar',
		        'echarts/chart/line',
		    ],
		    function (ec) {
				var myChart = ec.init(document.getElementById('main-pool-statis'));
			    var option = {
			    	title : {
				        text: poolName + lang.statis.of_performance
				    },
				    tooltip : {
				        trigger: 'axis',
				        formatter: function (params,ticket,callback) {
				        	if ( params.length === 3 ) {
				        		return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' OPS' + '<br>'+
				            	   params[1]['seriesName'] + '：' + params[1]['value'] + ' MB' + '<br>'+
				            	   params[2]['seriesName'] + '：' + params[2]['value'] + ' MB' + '<br>';
				        	} else if ( params.length === 2 ) {
				        		if ( params[0]['seriesName'] == 'IOPS' && params[1]['seriesName'] == lang.statis.write_broadband ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' OPS' + '<br>'+
				            	   params[1]['seriesName'] + '：' + params[1]['value'] + ' MB' + '<br>';
				        		} else if ( params[0]['seriesName'] == 'IOPS' && params[1]['seriesName'] == lang.statis.read_broadband ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' OPS' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + ' MB' + '<br>';
				        		} else if ( params[0]['seriesName'] == lang.statis.read_broadband && params[1]['seriesName'] == lang.statis.write_broadband) {
					            	return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' MB' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + ' MB' + '<br>';
				        		}
				        	} else if ( params.length === 1 ) {
				        		if ( params[0]['seriesName'] === 'IOPS' ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' OPS' + '<br>';
				        		} else {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' MB' + '<br>';
				        		}
				        	}
				        }
				    },
				    legend: {
				        data:['IOPS', lang.statis.write_broadband, lang.statis.read_broadband ]
				    },
				    toolbox: {
						show : true,
						feature : {
							dataView : {show: false, readOnly: false},
							magicType : {show: true, type: ['line', 'bar']},
							dataZoom : {
								show : true,
								title : {
									dataZoom : lang.statis.area_zoom,
									dataZoomReset : lang.statis.area_zoom_back
								}
							},
							restore : {show: true},
							saveAsImage : {show: true}
						}
					},
			    	calculable : true,
				    xAxis : [
				    	{
				    		type : 'category',
				            boundaryGap : true,
				            splitLine : {show : false},
				            data : (function (){
				                var now = moment().add(diff, 'milliseconds');
				                res = [];
				                var len = 10;
				                while (len--) {
				                    res.unshift(now.format('HH:mm:ss'));
				                    now = moment(now - 5000);
				                }
				                return res;
				            })()
				        }
				    ],
				    yAxis : [
				    	{
				            type : 'value',
				            scale: true,
				            name : 'iops（OPS）',
				            boundaryGap: [0, 0]
				        },
				    	{
				            type : 'value',
				            scale: true,
				            name : lang.statis.broadband + '（MB/S）',
				            boundaryGap: [0, 0],
				        }
				    ],
				    series : [
				    	{
				            name:'IOPS',
				            type:'line',
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.read_broadband,
				            type:'line',
				            yAxisIndex: 1,
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.write_broadband,
				            type:'line',
				            yAxisIndex: 1,
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        }
				    ]
				}

				var lastData = 11;
			    var axisData;
			    clearInterval(timeTicket);
			    timeTicket = setInterval(function (){
			    	var para = {};
			    	if (poolName == 'all') {
			    		para = {
							'poolname': ''
						};
			    	} else{
			    		para = {
							'poolname': poolName
						};
			    	}
					var callback = function (result){
						$("#main-pool-statis").LoadData ("hide");
						if (result == undefined)
							return;
						if (result.code == 200) {
							var data = '';
							data = result.result;
							if ( poolName == 'all' ) {
								for (var i = 0; i < data.length; i++) {
									if ( data[i]['name'] == 'summary' ) {
										rData = (data[i].r/1024/1024).toFixed(2);
										wData = (data[i].w/1024/1024).toFixed(2);
										opsData = parseInt(data[i].op);
									}
								};
							} else{
								rData = (data[0].r/1024/1024).toFixed(2);
								wData = (data[0].w/1024/1024).toFixed(2);
								opsData = parseInt(data[0].op);
							};
						} else {
							DisplayTips ( lang.statis.list_pool_statis_fail );
							rData = [];
							wData = [];
							opsData = [];
						}
					}
					DataModel['getPoolStatis'](para, callback, true, null);
			        axisData = (moment().add(diff, 'milliseconds').format('HH:mm:ss'));

			        // 动态数据接口 addData
			        myChart.addData([
			        	[
			                0,        // 系列索引
			                opsData, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			                axisData  // 坐标轴标签
			            ],
			            [
			                1,        // 系列索引
			                rData, 		// 新增数据
			                false,     // 新增数据是否从队列头部插入
			                false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ],
			            [
			                2,        // 系列索引
			                wData, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ]
			        ]);
			    }, 5*1000);
			    // 为echarts对象加载数据
			    myChart.setOption(option);
			}
		);
	}

	//按时间列举存储池历史信息
	function listPoolHistoryStatistics ( poolName, para ) {
		var callback = function (result){
			$("#main-pool-statis").LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
			    clearInterval(timeTicket);
				var data = '';
				data = result.result.pool;
				var readdata = [],
					writedata = [],
					opsdata = [],
					pointdata = [];
				for (var i = 0; i < data.length; i++) {
					var xaxis = data[i].point;
					var value = data[i].value;
					pointdata.push( xaxis );
					readdata.push( ( value[0]['read']/1024/1024 ).toFixed(2) );
					writedata.push( ( value[0]['write']/1024/1024 ).toFixed(2) );
					opsdata.push( parseInt( value[0]['iops'] ) );
				}
				require(
				    [
				        'echarts',
				        'echarts/chart/bar',
				        'echarts/chart/line',
				    ],
				    function (ec) {
						var myChart = ec.init(document.getElementById('main-pool-statis'));
						if (poolName == '#!total') {
							poolName = 'all';
						}
					    var option = {
					    	title : {
						        text: poolName + lang.statis.of_performance
						    },
						    tooltip : {
						        trigger: 'axis',
						        formatter: function (params,ticket,callback) {
						        	if ( params.length === 3 ) {
						        		return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
						            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' OPS' + '<br>'+
						            	   params[1]['seriesName'] + '：' + params[1]['value'] + ' MB/S' + '<br>'+
						            	   params[2]['seriesName'] + '：' + params[2]['value'] + ' MB/S' + '<br>';
						        	} else if ( params.length === 2 ) {
						        		if ( params[0]['seriesName'] == 'IOPS' && params[1]['seriesName'] == lang.statis.write_broadband ) {
						        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
						            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' OPS' + '<br>'+
						            	   params[1]['seriesName'] + '：' + params[1]['value'] + ' MB/S' + '<br>';
						        		} else if ( params[0]['seriesName'] == 'IOPS' && params[1]['seriesName'] == lang.statis.read_broadband ) {
						        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
							            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' OPS' + '<br>'+
							            	   params[1]['seriesName'] + '：' + params[1]['value'] + ' MB/S' + '<br>';
						        		} else if ( params[0]['seriesName'] == lang.statis.read_broadband && params[1]['seriesName'] == lang.statis.write_broadband) {
							            	return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
							            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' MB/S' + '<br>'+
							            	   params[1]['seriesName'] + '：' + params[1]['value'] + ' MB/S' + '<br>';
						        		}
						        	} else if ( params.length === 1 ) {
						        		if ( params[0]['seriesName'] === 'IOPS' ) {
						        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
						            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' OPS' + '<br>';
						        		} else {
						        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
						            	   params[0]['seriesName'] + '：' + params[0]['value'] + ' MB/S' + '<br>';
						        		}
						        	}
						        }
						    },
						    legend: {
						        data:['IOPS', lang.statis.write_broadband, lang.statis.read_broadband ]
						    },
						    toolbox: {
								show : true,
								feature : {
									dataView : {show: true, readOnly: false},
									magicType : {show: true, type: ['line', 'bar']},
									dataZoom : {
										show : true,
										title : {
											dataZoom : lang.statis.area_zoom,
											dataZoomReset : lang.statis.area_zoom_back
										}
									},
									restore : {show: true},
									saveAsImage : {show: true}
								}
							},
					    	calculable : true,
						    xAxis : [
						    	{
						    		type : 'category',
						            boundaryGap : true,
						            splitLine : {show : false},
						            data : pointdata
						        }
						    ],
						    yAxis : [
						    	{
						            type : 'value',
						            scale: true,
						            name : 'iops（OPS）',
						            boundaryGap: [0, 0]
						        },
						    	{
						            type : 'value',
						            scale: true,
						            name : lang.statis.broadband + '（MB/S）',
						            boundaryGap: [0, 0],
						        }
						    ],
						    series : [
						    	{
						            name:'IOPS',
						            type:'line',
						            data:opsdata
						        },
						        {
						            name:lang.statis.read_broadband,
						            type:'line',
						            yAxisIndex: 1,
						            data:readdata
						        },
						        {
						            name:lang.statis.write_broadband,
						            type:'line',
						            yAxisIndex: 1,
						            data:writedata
						        }
						    ]
						}
					    // 为echarts对象加载数据
					    myChart.setOption(option);
					}
				);
			} else {
				DisplayTips ( lang.statis.list_pool_statis_fail );
				rData = [];
				wData = [];
				opsData = [];
			}
		}
		DataModel['getHistoryPoolStatis'](para, callback, true, null);
	}
	//自定义历史信息
	function listPoolHistoryStatisticsCustom (poolName, para) {
		var callback = function (result){
			$("#main-pool-statis").LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
			    clearInterval(timeTicket);
				var data = '';
				data = result.result.pool;
				var readdata = [],
					writedata = [],
					opsdata = [],
					pointdata = [];
				for (var i = 0; i < data.length; i++) {
					var arr = [], temp;
					var xaxis = data[i].point;
					var str = xaxis;
					var value = data[i].value;
					var len = str.indexOf(' ');
					var stxaxis = xaxis.substring(0, len);
					var endxaxis = xaxis.substring(len);
					stxaxis = stxaxis.split('-');
					for (var k = 0; k < stxaxis.length; k++) {
						if (k == 1) {
							--stxaxis[k];
						}
						arr.push(stxaxis[k]);
					};
					endxaxis = endxaxis.split(':');
					for (var j = 0; j < endxaxis.length; j++) {
						arr.push(endxaxis[j]);
					};

					temp = (moment(arr)['_i'][1]);
					pointdata.push( temp );
					var rdata = value[0]['read'];
					rdata = rdata.substr(0, rdata.indexOf('.'));
					readdata.push( rdata );

					var wdata = value[0]['write'];
					wdata = wdata.substr(0, wdata.indexOf('.'));
					writedata.push( wdata );

					opsdata.push( parseInt( value[0]['iops'] ) );
				}
				require(
				    [
				        'echarts',
				        'echarts/chart/bar',
				        'echarts/chart/line',
				    ],
				    function (ec) {
						var myChart = ec.init(document.getElementById('main-pool-statis'));
						option = {
						    title : {
						        text : poolname + lang.statis.historical_information
						    },
						    tooltip : {
						        trigger: 'item',
						        formatter : function (params) {
						            var date = new Date(params.value[0]);
						            data = date.getFullYear() + '-'
						                   + (date.getMonth() + 1) + '-'
						                   + date.getDate() + ' '
						                   + date.getHours() + ':'
						                   + date.getMinutes();
						            return data + '<br/>'
						            	   + params.seriesName + '：'
						                   + params.value[1] + ', '
						        }
						    },
						    toolbox: {
								show : true,
								feature : {
									dataView : {show: false, readOnly: false},
									magicType : {show: true, type: ['line', 'bar']},
									dataZoom : {
										show : true,
										title : {
											dataZoom : lang.statis.area_zoom,
											dataZoomReset : lang.statis.area_zoom_back
										}
									},
									restore : {show: true},
									saveAsImage : {show: true}
								}
							},
						    dataZoom: {
						        show: true,
						        start : 70
						    },
						    legend : {
						        data : ['IOPS', lang.statis.read_broadband, lang.statis.write_broadband]
						    },
						    grid: {
						        y2: 80
						    },
							xAxis : [
								{
									type : 'time',
									splitNumber:10
								}
							],
						  	yAxis : [
							    {
							      type : 'value',
							      scale: true,
							      name : 'iops（OPS）',
							    },
							    {
							      type : 'value',
							      scale: true,
							      name : lang.statis.broadband +'（Bytes/S）',
							    }
						  	],
						    series : [
						        {
						            name: 'IOPS',
						            type: 'line',
						            showAllSymbol: true,
						            symbolSize: function (value){
						                return Math.round(value[2]/10) + 2;
						            },
						            data: (function () {
						                var d = [];
						                var len = 0;
						                var value;
						                for (var i = 0; i < pointdata.length; i++) {
						                	d.push([
						                        pointdata[i],
						                        opsdata[i]
						                    ]);
						                };
						                return d;
						            })()
						        },
						      	{
						            name: lang.statis.read_broadband,
						            type: 'line',
						        	yAxisIndex: 1,
						            showAllSymbol: true,
						            symbolSize: function (value){
						                return Math.round(value[2]/10) + 2;
						            },
						            data: (function () {
						                var d = [];
						                var len = 0;
						                var value;
						                for (var i = 0; i < pointdata.length; i++) {
						                	d.push([
						                        pointdata[i],
						                        readdata[i]
						                    ]);
						                };
						                return d;
						            })()
						        },
						        {
						            name: lang.statis.write_broadband,
						            type: 'bar',
						         	yAxisIndex: 1,
						            showAllSymbol: true,
						            symbolSize: function (value){
						                return Math.round(value[2]/10) + 2;
						            },
						            data: (function () {
						                var d = [];
						                var len = 0;
						                var value;
						                for (var i = 0; i < pointdata.length; i++) {
						                	d.push([
						                        pointdata[i],
						                        writedata[i]
						                    ]);
						                };
						                return d;
						            })()
						        }
						    ]
						};
						myChart.setOption(option);
		            }
				);
			} else {
				DisplayTips ( lang.statis.list_pool_statis_fail );
				rData = [];
				wData = [];
				opsData = [];
			}
		}
		DataModel['getHistoryPoolStatis'](para, callback, true, null);
	}

	var loaded = 'no';
	var diskdata, netdata = [];
	//列举节点统计信息  实时的，所有
	function listNodeStatistics (ip, ischangeNode ) {
		//memory，cpu
		var memoryChart, cpuChart;
		var memoryOption, cpuOption;
		//net
		var netChart = [], netOption = [];
		var nsentdata = [], //存的是网络数据
			nrecvdata = [],
			npacketssentdata = [],
			npacketsrecvdata = [],
			netNameArr = [];//存储网络流量名
		//disk
		var diskChart = [], diskOption = [];
		var dreaddata = [], //存的是网络数据
			dwritedata = [],
			dreadcount = [],
			dwritecount = [],
			diskNameArr = [];//存储磁盘名
		var memoryhtm = "";
		memoryhtm += '<div id="main-node-memory-statis" style="height:300px;width:50%;">' +
					 '</div>';
		var cpuhtm = "";
		cpuhtm += '<div id="main-node-cpu-statis" style="height:300px;width:50%;">' +
				  '</div>';
		$('.js-node-allcharts').html(memoryhtm + cpuhtm);
		require(
		    [
		        'echarts',
		        'echarts/chart/bar',
		        'echarts/chart/line',
		    ],
		    function (ec) {
				var memoryChart = ec.init(document.getElementById('main-node-memory-statis'));
			    var memoryOption = {
			    	title : {
				        text: ip + lang.statis.of_memory_performance
				    },
				    tooltip : {
				        trigger: 'axis',
				        formatter: function (params,ticket,callback) {
				        	if ( params.length === 3 ) {
				        		return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>'+
				            	   params[1]['seriesName'] + '：' + params[1]['value'] + 'MB' + '<br>'+
				            	   params[2]['seriesName'] + '：' + params[2]['value'] + '%' + '<br>';
				        	} else if ( params.length === 2 ) {
				        		if ( params[0]['seriesName'] == lang.statis.avail_space && params[1]['seriesName'] == lang.statis.total_space ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + 'MB' + '<br>';
				        		} else if ( params[0]['seriesName'] == lang.statis.avail_space && params[1]['seriesName'] == lang.statis.used_space_percentage ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + '%' + '<br>';
				        		} else if ( params[0]['seriesName'] == lang.statis.total_space && params[1]['seriesName'] == lang.statis.used_space_percentage ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + '%' + '<br>';
				        		}
				        	} else if ( params.length === 1 ) {
				        		if ( params[0]['seriesName'] === lang.statis.used_space_percentage ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + '%' + '<br>';
				        		} else {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>';
				        		}
				        	}
				        }
				    },
				    legend: {
				        x: 'right',
						data:[lang.statis.avail_space, lang.statis.total_space, lang.statis.used_space_percentage]
				    },
				    toolbox: {
						show : true,
				        orient: 'vertical',
				        x: 'left',
				        y: 'center',
						feature : {
							dataView : {show: false, readOnly: false},
							magicType : {show: true, type: ['line', 'bar']},
							dataZoom : {
								show : true,
								title : {
									dataZoom : lang.statis.area_zoom,
									dataZoomReset : lang.statis.area_zoom_back
								}
							},
							restore : {show: true},
							saveAsImage : {show: true}
						}
					},
			    	calculable : true,
				    xAxis : [
				    	{
				    		type : 'category',
				            boundaryGap : true,
				            splitLine : {show : false},
				            data : (function (){
				                var now = moment().add(diff, 'milliseconds');
				                res = [];
				                var len = 10;
				                while (len--) {
				                    res.unshift(now.format('HH:mm:ss'));
				                    now = moment(now - 5000);
				                }
				                return res;
				            })()
				        }
				    ],
				    yAxis : [
				    	{
				            type : 'value',
				            scale: true,
				            name : lang.statis.space + '（MB）',
				            boundaryGap: [0, 0]
				        },
				    	{
				            type : 'value',
				            scale: true,
				            name : lang.statis.percentage + '（%）',
				            boundaryGap: [0, 0],
				            splitLine : {show : false},
				        }
				    ],
				    series : [
				    	{
				            name:lang.statis.avail_space,
				            type:'line',
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.total_space,
				            type:'line',
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.used_space_percentage,
				            type:'line',
				            yAxisIndex: 1,
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        }
				    ]
				}

				var cpuChart = ec.init(document.getElementById('main-node-cpu-statis'));
			    var cpuOption = {
			    	title : {
				        text: ip + lang.statis.of_cpu_performance
				    },
				    tooltip : {
				        trigger: 'axis',
				        formatter: function (params,ticket,callback) {
				        	if ( params.length === 3 ) {
				        		return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 's' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + 's' + '<br>'+
					            	   params[2]['seriesName'] + '：' + params[2]['value'] + '%' + '<br>';
				        	} else if ( params.length === 2 ) {
				        		if ( params[0]['seriesName'] == lang.statis.system_time && params[1]['seriesName'] == lang.statis.user_time ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 's' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + 's' + '<br>';
				        		} else{
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 's' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + '%' + '<br>';
				        		}
				        	} else if ( params.length === 1 ) {
				        		if ( params[0]['seriesName'] === lang.statis.cpu_occupancy_percentage ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + '%' + '<br>';
				        		} else {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + 's' + '<br>';
				        		}
				        	}
				        }
				    },
				    legend: {
				        x: 'right',
						data:[lang.statis.system_time, lang.statis.user_time, lang.statis.cpu_occupancy_percentage]
				    },
				    toolbox: {
						show : true,
				        orient: 'vertical',
				        x: 'left',
				        y: 'center',
						feature : {
							dataView : {show: false, readOnly: false},
							magicType : {show: true, type: ['line', 'bar']},
							dataZoom : {
								show : true,
								title : {
									dataZoom : lang.statis.area_zoom,
									dataZoomReset : lang.statis.area_zoom_back
								}
							},
							restore : {show: true},
							saveAsImage : {show: true}
						}
					},
			    	calculable : true,
				    xAxis : [
				    	{
				    		type : 'category',
				            boundaryGap : true,
				            splitLine : {show : false},
				            data : (function (){
				                var now = moment().add(diff, 'milliseconds');
				                res = [];
				                var len = 10;
				                while (len--) {
				                    res.unshift(now.format('HH:mm:ss'));
				                    now = moment(now - 5000);
				                }
				                return res;
				            })()
				        }
				    ],
				    yAxis : [
				    	{
				            type : 'value',
				            scale: true,
				            name : lang.statis.stime + '（s）',
				            boundaryGap: [0, 0]
				        },
				    	{
				            type : 'value',
				            scale: true,
				            name : lang.statis.percentage + '（%）',
				            boundaryGap: [0, 0],
				            splitLine : {show : false},
				        }
				    ],
				    series : [
				    	{
				            name:lang.statis.system_time,
				            type:'line',
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.user_time,
				            type:'line',
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.cpu_occupancy_percentage,
				            type:'line',
				            yAxisIndex: 1,
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        }
				    ]
				}

				var lastData = 11;
			    var axisData;
			    clearInterval(mTime);
			    mTime = setInterval(function (){
					var para = {
						'type': 'all',
						'ip': ip
					};
					var callback = function (result){
						// $("#main-pool-statis").LoadData ("hide");
						if (result == undefined)
							return;
						if (result.code == 200) {
							//memory
							var memorydata = '';
							memorydata = result.result.memory;
							mavaildata = (memorydata['available']/1024/1024).toFixed(2);
							mtotaldata = (memorydata['total']/1024/1024).toFixed(2);
							mpercentdata = (memorydata['percent']).toFixed(2);

							//cpu
							var cpudata = '';
							cpudata = result.result.cpu;
							//百分比
							var percent = (cpudata['percent'].toFixed(2));
							//系统时间
							var systemtime = cpudata['system_time'] / 1000; //毫秒变秒
							systemtime = systemtime.toFixed(2);
							//用户时间
							var usertime = cpudata['user_time'] / 1000;
							usertime = usertime.toFixed(2);
							csystemdata = systemtime;
							cuserdata = usertime;
							cpupercentdata = percent;

							//net
							diskdata = result.result.disk;
							netdata = result.result.network;

							//network
							netNameArr = [];
							for (var i = 0; i < netdata.length; i++) {
								var netinfo = netdata[i];
								var key = netinfo['nic_name'];
								netNameArr.push(key);
								var sentbytes, recvbytes, sentpackets, recvpackets;
								sentbytes = netinfo.bytes_sent / 1024/ 1024; //单位从字节转换为MB
								sentbytes = sentbytes.toFixed(2);

								recvbytes = netinfo.bytes_recv / 1024/ 1024;
								recvbytes = recvbytes.toFixed(2);

								sentpackets = parseInt( netinfo.packets_sent );
								recvpackets = parseInt( netinfo.packets_recv );

								nsentdata[key] = sentbytes;
								nrecvdata[key] = recvbytes;
								npacketssentdata[key] = sentpackets;
								npacketsrecvdata[key] = recvpackets;
							};
							diskNameArr = []; //每次重新调用的时候需要把存放名字的数组清空
							for (var i = 0; i < diskdata.length; i++) {
								var disk = diskdata[i];
								var key = disk['disk_name'];
								diskNameArr.push(key);
								var readbytes, writebytes, readcount, writecount;
								readbytes =  disk.read_bytes / 1024/ 1024; //转换为KB
								readbytes = readbytes.toFixed('2');
								//写字节
								writebytes = disk.write_bytes / 1024/ 1024;
								writebytes = writebytes.toFixed('2');
								//读计数
								readcount = parseInt( disk.read_count );
								writecount = parseInt( disk.write_count );

								dreaddata[key] = readbytes;
								dwritedata[key] = writebytes;
								dreadcount[key] = readcount;
								dwritecount[key] = writecount;
							};
							var networkhtm = "";
							var diskhtm = "";
							if ( loaded == 'no' || ischangeNode ) {
								ischangeNode = false;
								loaded = 'yes';
								for (var i = 0; i < netdata.length; i++) {
									var divid = '';
									divid = 'main-statis-net-'+ netdata[i]['nic_name'];
									networkhtm += '<div id="'+ divid +'" style="height:300px;" class="js-statis-net-charts">' +
											'</div>';
								};

								for (var i = 0; i < diskdata.length; i++) {
									var divid = '';
									divid = 'main-statis-disk-'+ diskdata[i]['disk_name'];
									diskhtm += '<div id="'+ divid +'" style="height:300px;" class="js-statis-disks-charts">' +
											'</div>';
								};
								$('.js-node-allcharts').append(networkhtm + diskhtm);
								//network
								for (var i = 0; i < netdata.length; i++) {
									(function (net) {
										var netname = net['nic_name'];
										var idstr = 'main-statis-net-' + netname;
										var myChart = ec.init(document.getElementById(idstr));
										var myOption = {
									    	title : {
										        text: ip + lang.statis.of + netname +lang.statis.flow
										    },
										    tooltip : {
										        trigger: 'axis'
										        // formatter: function (params,ticket,callback) {
										        // 	// if ( params.length === 4 ) {
										        // 		return lang.statis.stime + '：' + params[0]['name'] + '<br>' +
											       //      	   params[0]['seriesName'] + '：' + params[0]['value'] + 'KB' + '<br>'+
											       //      	   params[1]['seriesName'] + '：' + params[1]['value'] + 'KB' + '<br>'+
											       //      	   params[2]['seriesName'] + '：' + params[2]['value'] + lang.statis.per + '<br>' +
											       //      	   params[3]['seriesName'] + '：' + params[3]['value'] + lang.statis.per + '<br>';
										        // 	// }
										        // }
										    },
										    legend: {
										        x: 'right',
												data:[ lang.statis.send_broadband, lang.statis.recv_broadband, lang.statis.send_package, lang.statis.receive_package]
										    },
										    toolbox: {
												show : true,
										        orient: 'vertical',
										        x: 'left',
										        y: 'center',
												feature : {
													dataView : {show: false, readOnly: false},
													magicType : {show: true, type: ['line', 'bar']},
													dataZoom : {
														show : true,
														title : {
															dataZoom : lang.statis.area_zoom,
															dataZoomReset : lang.statis.area_zoom_back
														}
													},
													restore : {show: true},
													saveAsImage : {show: true}
												}
											},
									    	calculable : true,
										    xAxis : [
										    	{
										    		type : 'category',
										            boundaryGap : true,
										            splitLine : {show : false},
										            data : (function (){
										                var now = moment().add(diff, 'milliseconds');
										                res = [];
										                var len = 10;
										                while (len--) {
										                    res.unshift(now.format('HH:mm:ss'));
										                    now = moment(now - 5000);
										                }
										                return res;
										            })()
										        }
										    ],
										    yAxis : [
										    	{
										            type : 'value',
										            scale: true,
										            name : lang.statis.broadband + '（MB/S）',
										            boundaryGap: [0, 0]
										        },
										    	{
										            type : 'value',
										            scale: true,
										            name : lang.statis.count + '（' + lang.statis.per + '）',
										            boundaryGap: [0, 0],
										            splitLine : {show : false},
										        }
										    ],
										    series : [
										    	{
										            name:lang.statis.send_broadband,
										            type:'line',
										            data:(function (){
									                    var res = [];
									                    var len = 10;
									                    while (len--) {
									                        res.push(0);
									                    }
									                    return res;
									                })()
										        },
										        {
										            name:lang.statis.recv_broadband,
										            type:'line',
										            data:(function (){
									                    var res = [];
									                    var len = 10;
									                    while (len--) {
									                        res.push(0);
									                    }
									                    return res;
									                })()
										        },
										        {
										            name:lang.statis.send_package,
										            type:'line',
										            yAxisIndex: 1,
										            data:(function (){
									                    var res = [];
									                    var len = 10;
									                    while (len--) {
									                        res.push(0);
									                    }
									                    return res;
									                })()
										        },
										        {
										            name:lang.statis.receive_package,
										            type:'line',
										            yAxisIndex: 1,
										            data:(function (){
									                    var res = [];
									                    var len = 10;
									                    while (len--) {
									                        res.push(0);
									                    }
									                    return res;
									                })()
										        }
										    ]
										};
										netChart[netname] = myChart;
										netOption[netname] = myOption;
			    						netChart[netname].setOption(netOption[netname]);
									})(netdata[i])
								};

								//disk
								for (var i = 0; i < diskdata.length; i++) {
									(function (disk) {
										var key = disk['disk_name'];
										var idstr = 'main-statis-disk-' + key;

										var myChart = ec.init(document.getElementById(idstr));
										var myOption = {
									    	title : {
										        text: ip + lang.statis.of + key + lang.statis.disk_performance
										    },
										    tooltip : {
										        trigger: 'axis'
										        // formatter: function (params,ticket,callback) {
										        // 	// if ( params.length === 4 ) {
										        // 		return lang.statis.stime + '：' + params[0]['name'] + '<br>' +
											       //      	   params[0]['seriesName'] + '：' + params[0]['value'] + 'KB' + '<br>'+
											       //      	   params[1]['seriesName'] + '：' + params[1]['value'] + 'KB' + '<br>'+
											       //      	   params[2]['seriesName'] + '：' + params[2]['value'] + lang.statis.per + '<br>' +
											       //      	   params[3]['seriesName'] + '：' + params[3]['value'] + lang.statis.per + '<br>';
										        // 	// }
										        // }
										    },
										    legend: {
										        data:[lang.statis.read_broadband, lang.statis.write_broadband, lang.statis.read_count, lang.statis.write_count]
										    },
										    toolbox: {
												show : true,
												feature : {
													dataView : {show: false, readOnly: false},
													magicType : {show: true, type: ['line', 'bar']},
													dataZoom : {
														show : true,
														title : {
															dataZoom : lang.statis.area_zoom,
															dataZoomReset : lang.statis.area_zoom_back
														}
													},
													restore : {show: true},
													saveAsImage : {show: true}
												}
											},
									    	calculable : true,
										    xAxis : [
										    	{
										    		type : 'category',
										            boundaryGap : true,
										            splitLine : {show : false},
										            data : (function (){
										                var now = moment().add(diff, 'milliseconds');
										                res = [];
										                var len = 10;
										                while (len--) {
										                    res.unshift(now.format('HH:mm:ss'));
										                    now = moment(now - 5000);
										                }
										                return res;
										            })()
										        }
										    ],
										    yAxis : [
										    	{
										            type : 'value',
										            scale: true,
										            name : lang.statis.broadband + '（MB/S）',
										            boundaryGap: [0, 0]
										        },
										    	{
										            type : 'value',
										            scale: true,
										            name : lang.statis.count + '（' + lang.statis.per + '）',
										            boundaryGap: [0, 0],
										            splitLine : {show : false},
										        }
										    ],
										    series : [
										    	{
										            name:lang.statis.read_broadband,
										            type:'line',
										            data:(function (){
									                    var res = [];
									                    var len = 10;
									                    while (len--) {
									                        res.push(0);
									                    }
									                    return res;
									                })()
										        },
										        {
										            name:lang.statis.write_broadband,
										            type:'line',
										            data:(function (){
									                    var res = [];
									                    var len = 10;
									                    while (len--) {
									                        res.push(0);
									                    }
									                    return res;
									                })()
										        },
										        {
										            name:lang.statis.read_count,
										            type:'line',
										            yAxisIndex: 1,
										            data:(function (){
									                    var res = [];
									                    var len = 10;
									                    while (len--) {
									                        res.push(0);
									                    }
									                    return res;
									                })()
										        },
										        {
										            name:lang.statis.write_count,
										            type:'line',
										            yAxisIndex: 1,
										            data:(function (){
									                    var res = [];
									                    var len = 10;
									                    while (len--) {
									                        res.push(0);
									                    }
									                    return res;
									                })()
										        }
										    ]
										};
										diskChart[key] = myChart;
										diskOption[key] = myOption;
			    						myChart.setOption(myOption);
									})(diskdata[i])
								};
							}

						}
						$('#main-node-memory-statis').addClass('fl-lt');
						$('#main-node-cpu-statis').addClass('fl-lt');
						$('.js-statis-disks-charts').addClass('fl-lt');
						$('.js-statis-net-charts').addClass('fl-lt');
					}
					DataModel['getCurNodeStats'](para, callback, true, null);
			        axisData = (moment().add(diff, 'milliseconds').format('HH:mm:ss'));

			        // 动态数据接口 addData
			        memoryChart.addData([
			        	[
			                0,        // 系列索引
			                mavaildata, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			                axisData  // 坐标轴标签
			            ],
			            [
			                1,        // 系列索引
			                mtotaldata, 		// 新增数据
			                false,     // 新增数据是否从队列头部插入
			                false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ],
			            [
			                2,        // 系列索引
			                mpercentdata, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ]
			        ]);
			        // 动态数据接口 addData
			        cpuChart.addData([
			        	[
			                0,        // 系列索引
			                csystemdata, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			                axisData  // 坐标轴标签
			            ],
			            [
			                1,        // 系列索引
			                cuserdata, 		// 新增数据
			                false,     // 新增数据是否从队列头部插入
			                false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ],
			            [
			                2,        // 系列索引
			                cpupercentdata, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ]
			        ]);
			        for (var i = 0; i < netNameArr.length; i++) {
			        	(function (key) {
			        		netChart[key].addData([
					        	[
					                0,        // 系列索引
					                nsentdata[key], // 新增数据
					                false,    // 新增数据是否从队列头部插入
					                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
					                axisData  // 坐标轴标签
					            ],
					            [
					                1,        // 系列索引
					                nrecvdata[key], 		// 新增数据
					                false,     // 新增数据是否从队列头部插入
					                false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
					            ],
					            [
					                2,        // 系列索引
					                npacketssentdata[key], // 新增数据
					                false,    // 新增数据是否从队列头部插入
					                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
					            ],
					            [
					                3,        // 系列索引
					                npacketsrecvdata[key], // 新增数据
					                false,    // 新增数据是否从队列头部插入
					                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
					            ]
					        ]);
			        	})(netNameArr[i])

			        }
			        for (var i = 0; i < diskNameArr.length; i++) {
			        	(function (key) {
			        		diskChart[key].addData([
					        	[
					                0,        // 系列索引
					                dreaddata[key], // 新增数据
					                false,    // 新增数据是否从队列头部插入
					                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
					                axisData  // 坐标轴标签
					            ],
					            [
					                1,        // 系列索引
					                dwritedata[key], 		// 新增数据
					                false,     // 新增数据是否从队列头部插入
					                false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
					            ],
					            [
					                2,        // 系列索引
					                dreadcount[key], // 新增数据
					                false,    // 新增数据是否从队列头部插入
					                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
					            ],
					            [
					                3,        // 系列索引
					                dwritecount[key], // 新增数据
					                false,    // 新增数据是否从队列头部插入
					                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
					            ]
					        ]);
			        	})(diskNameArr[i])
			        }
			    }, 5*1000);
			    // 为echarts对象加载数据
			    memoryChart.setOption(memoryOption);
			    cpuChart.setOption(cpuOption);
			}
		);
		$('#main-node-memory-statis').addClass('fl-lt');
		$('#main-node-cpu-statis').addClass('fl-lt');
		$('.js-statis-disks-charts').addClass('fl-lt');
		$('.js-statis-net-charts').addClass('fl-lt');
	}

	//列举节点统计信息  （单个Memory）
	function listNodeMemoryStatistics (ip ) {
		var memoryhtm = "";
		memoryhtm += '<div id="main-node-memory-statis" style="height:300px;width:50%;">' +
					 '</div>';
		$('.js-node-allcharts').append(memoryhtm);
		require(
		    [
		        'echarts',
		        'echarts/chart/bar',
		        'echarts/chart/line',
		    ],
		    function (ec) {
				var myChart = ec.init(document.getElementById('main-node-memory-statis'));
			    var option = {
			    	title : {
				        text: ip + lang.statis.of_memory_performance
				    },
				    tooltip : {
				        trigger: 'axis',
				        formatter: function (params,ticket,callback) {
				        	if ( params.length === 3 ) {
				        		return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>'+
				            	   params[1]['seriesName'] + '：' + params[1]['value'] + 'MB' + '<br>'+
				            	   params[2]['seriesName'] + '：' + params[2]['value'] + '%' + '<br>';
				        	} else if ( params.length === 2 ) {
				        		if ( params[0]['seriesName'] == lang.statis.avail_space && params[1]['seriesName'] == lang.statis.total_space ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + 'MB' + '<br>';
				        		} else if ( params[0]['seriesName'] == lang.statis.avail_space && params[1]['seriesName'] == lang.statis.used_space_percentage ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + '%' + '<br>';
				        		} else if ( params[0]['seriesName'] == lang.statis.total_space && params[1]['seriesName'] == lang.statis.used_space_percentage ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + '%' + '<br>';
				        		}
				        	} else if ( params.length === 1 ) {
				        		if ( params[0]['seriesName'] === lang.statis.used_space_percentage ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + '%' + '<br>';
				        		} else {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>';
				        		}
				        	}
				        }
				    },
				    legend: {
				        x: 'right',
						data:[lang.statis.avail_space, lang.statis.total_space, lang.statis.used_space_percentage]
				    },
				    toolbox: {
						show : true,
				        orient: 'vertical',
				        x: 'left',
				        y: 'center',
						feature : {
							dataView : {show: false, readOnly: false},
							magicType : {show: true, type: ['line', 'bar']},
							dataZoom : {
								show : true,
								title : {
									dataZoom : lang.statis.area_zoom,
									dataZoomReset : lang.statis.area_zoom_back
								}
							},
							restore : {show: true},
							saveAsImage : {show: true}
						}
					},
			    	calculable : true,
				    xAxis : [
				    	{
				    		type : 'category',
				            boundaryGap : true,
				            splitLine : {show : false},
				            data : (function (){
				                var now = moment().add(diff, 'milliseconds');
				                res = [];
				                var len = 10;
				                while (len--) {
				                    res.unshift(now.format('HH:mm:ss'));
				                    now = moment(now - 5000);
				                }
				                return res;
				            })()
				        }
				    ],
				    yAxis : [
				    	{
				            type : 'value',
				            scale: true,
				            name : lang.statis.space + '（MB）',
				            boundaryGap: [0, 0]
				        },
				    	{
				            type : 'value',
				            scale: true,
				            name : lang.statis.percentage + '（%）',
				            boundaryGap: [0, 0],
				            splitLine : {show : false},
				        }
				    ],
				    series : [
				    	{
				            name:lang.statis.avail_space,
				            type:'line',
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.total_space,
				            type:'line',
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.used_space_percentage,
				            type:'line',
				            yAxisIndex: 1,
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        }
				    ]
				}

				var lastData = 11;
			    var axisData;
			    clearInterval(mTime);
			    mTime = setInterval(function (){
					var para = {
						'type': 'memory',
						'ip': ip
					};
					var callback = function (result){
						// $("#main-pool-statis").LoadData ("hide");
						if (result == undefined)
							return;
						if (result.code == 200) {
							var data = '';
							data = result.result;
							mavaildata = (data['available']/1024/1024).toFixed(2);
							mtotaldata = (data['total']/1024/1024).toFixed(2);
							mpercentdata = (data['percent']).toFixed(2);
						} else {
							// DisplayTips ( lang.statis.list_pool_statis_fail );
						}
					}
					DataModel['getCurNodeStats'](para, callback, true, null);
			        axisData = (moment().add(diff, 'milliseconds').format('HH:mm:ss'));

			        // 动态数据接口 addData
			        myChart.addData([
			        	[
			                0,        // 系列索引
			                mavaildata, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			                axisData  // 坐标轴标签
			            ],
			            [
			                1,        // 系列索引
			                mtotaldata, 		// 新增数据
			                false,     // 新增数据是否从队列头部插入
			                false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ],
			            [
			                2,        // 系列索引
			                mpercentdata, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ]
			        ]);
			    }, 3*1000);
			    // 为echarts对象加载数据
			    myChart.setOption(option);
			}
		);
		$('#main-node-memory-statis').addClass('fl-lt');
	}

	//列举节点统计信息  （CPU）
	function listNodeCpuStatistics (ip ) {
		var cpuhtm = "";
		cpuhtm += '<div id="main-node-cpu-statis" style="height:300px;width:50%;">' +
				  '</div>';
		$('.js-node-allcharts').append(cpuhtm);
		require(
		    [
		        'echarts',
		        'echarts/chart/bar',
		        'echarts/chart/line',
		    ],
		    function (ec) {
				var myChart = ec.init(document.getElementById('main-node-cpu-statis'));
			    var option = {
			    	title : {
				        text: ip + lang.statis.of_cpu_performance
				    },
				    tooltip : {
				        trigger: 'axis',
				        formatter: function (params,ticket,callback) {
				        	if ( params.length === 3 ) {
				        		return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 's' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + 's' + '<br>'+
					            	   params[2]['seriesName'] + '：' + params[2]['value'] + '%' + '<br>';
				        	} else if ( params.length === 2 ) {
				        		if ( params[0]['seriesName'] == lang.statis.system_time && params[1]['seriesName'] == lang.statis.user_time ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 's' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + 's' + '<br>';
				        		} else{
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
					            	   params[0]['seriesName'] + '：' + params[0]['value'] + 's' + '<br>'+
					            	   params[1]['seriesName'] + '：' + params[1]['value'] + '%' + '<br>';
				        		}
				        	} else if ( params.length === 1 ) {
				        		if ( params[0]['seriesName'] === lang.statis.cpu_occupancy_percentage ) {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + '%' + '<br>';
				        		} else {
				        			return lang.statis.stime +'：' + params[0]['name'] + '<br>' +
				            	   params[0]['seriesName'] + '：' + params[0]['value'] + 's' + '<br>';
				        		}
				        	}
				        }
				    },
				    legend: {
				        x: 'right',
						data:[lang.statis.system_time, lang.statis.user_time, lang.statis.cpu_occupancy_percentage]
				    },
				    toolbox: {
						show : true,
				        orient: 'vertical',
				        x: 'left',
				        y: 'center',
						feature : {
							dataView : {show: false, readOnly: false},
							magicType : {show: true, type: ['line', 'bar']},
							dataZoom : {
								show : true,
								title : {
									dataZoom : lang.statis.area_zoom,
									dataZoomReset : lang.statis.area_zoom_back
								}
							},
							restore : {show: true},
							saveAsImage : {show: true}
						}
					},
			    	calculable : true,
				    xAxis : [
				    	{
				    		type : 'category',
				            boundaryGap : true,
				            splitLine : {show : false},
				            data : (function (){
				                var now = moment().add(diff, 'milliseconds');
				                res = [];
				                var len = 10;
				                while (len--) {
				                    res.unshift(now.format('HH:mm:ss'));
				                    now = moment(now - 5000);
				                }
				                return res;
				            })()
				        }
				    ],
				    yAxis : [
				    	{
				            type : 'value',
				            scale: true,
				            name : lang.statis.stime + '（s）',
				            boundaryGap: [0, 0]
				        },
				    	{
				            type : 'value',
				            scale: true,
				            name : lang.statis.percentage + '（%）',
				            boundaryGap: [0, 0],
				            splitLine : {show : false},
				        }
				    ],
				    series : [
				    	{
				            name:lang.statis.avail_space,
				            type:'line',
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.total_space,
				            type:'line',
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        },
				        {
				            name:lang.statis.used_space_percentage,
				            type:'line',
				            yAxisIndex: 1,
				            data:(function (){
			                    var res = [];
			                    var len = 10;
			                    while (len--) {
			                        res.push(0);
			                    }
			                    return res;
			                })()
				        }
				    ]
				}

				var lastData = 11;
			    var axisData;
			    clearInterval(cTime);
			    cTime = setInterval(function (){
					var para = {
						'type': 'cpu',
						'ip': ip
					};
					var callback = function (result){
						// $("#main-pool-statis").LoadData ("hide");
						if (result == undefined)
							return;
						if (result.code == 200) {
							var data = '';
							data = result.result;
							//百分比
							var percent = (data['percent'].toFixed(2));
							// percent = percent.substr(0, percent.indexOf(".")+3);
							//系统时间
							var systemtime = data['system_time'] / 1000; //毫秒变秒
							systemtime = systemtime.toFixed(2);
							//用户时间
							var usertime = data['user_time'] / 1000;
							usertime = usertime.toFixed(2);

							csystemdata = systemtime;
							cuserdata = usertime;
							cpupercentdata = percent;
						}
					}
					DataModel['getCurNodeStats'](para, callback, true, null);
			        axisData = (moment().add(diff, 'milliseconds').format('HH:mm:ss'));

			        // 动态数据接口 addData
			        myChart.addData([
			        	[
			                0,        // 系列索引
			                csystemdata, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			                axisData  // 坐标轴标签
			            ],
			            [
			                1,        // 系列索引
			                cuserdata, 		// 新增数据
			                false,     // 新增数据是否从队列头部插入
			                false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ],
			            [
			                2,        // 系列索引
			                cpupercentdata, // 新增数据
			                false,    // 新增数据是否从队列头部插入
			                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
			            ]
			        ]);
			    }, 3.1*1000);
			    // 为echarts对象加载数据
			    myChart.setOption(option);
			}
		)
		$('#main-node-cpu-statis').addClass('fl-lt');
	}

	//列举节点统计信息  （历史记录，现在删除此功能了）
	function listHistoryNodeStatistics (ip, para ) {
		var callback = function (result){
			$("#main-node-statis").LoadData ("hide");
			if (result == undefined)
				return;
			if (result.code == 200) {
				var data = '';
				memoryData = result.result.memory;
				diskData = result.result.disk;
				networkData = result.result.network;
				cpuData = result.result.cpu;
				//memory数据
				var mavaildata = [],
					mtotaldata = [],
					mpercentdata = [],
					mpointdata = [];
				//CPU数据
				var csystemdata = [],
					cuserdata = [],
					cpupercentdata = [],
					cpointdata = [];

				//memory
				for (var i = 0; i < memoryData.length; i++) {
					var xaxis = memoryData[i].point;
					var value = memoryData[i].value;
					var percent = (value[0]['percent']);
					percent = percent.substr(0, percent.indexOf(".")+3);

					mpointdata.push( xaxis );
					mavaildata.push( (value[0]['available']/1024/1024).toFixed(2) );
					mtotaldata.push( (value[0]['total']/1024/1024).toFixed(2) );
					mpercentdata.push( percent );
				}
				//cpu
				for (var i = 0; i < cpuData.length; i++) {
					var cxaxis = cpuData[i].point;
					var cvalue = cpuData[i].value;
					var systemtime, usertime, percent;
					//百分比
					percent = (cvalue[0]['percent']);
					percent = percent.substr(0, percent.indexOf(".")+3);
					//系统时间
					systemtime = cvalue[0]['system_time'] / 1000; //毫秒变秒
					systemtime = systemtime.toFixed(2);
					//用户时间
					usertime = cvalue[0]['user_time'] / 1000;
					usertime = usertime.toFixed(2);

					csystemdata.push(systemtime);
					cuserdata.push(usertime);
					cpupercentdata.push(percent);
					cpointdata.push( cxaxis );
				}

				var memoryhtm = "";
				memoryhtm += '<div id="main-node-memory-statis" style="height:300px;width:50%;">' +
							 '</div>';
				var cpuhtm = "";
				cpuhtm += '<div id="main-node-cpu-statis" style="height:300px;width:50%;">' +
						  '</div>';

				var diskhtm = "";
				for (var i = 0; i < diskData.length; i++) {
					var divid = '';
					divid = 'main-statis-disk-'+ diskData[i]['name'];
					diskhtm += '<div id="'+ divid +'" style="height:300px;" class="js-statis-disks-charts">' +
							'</div>';
				};

				var networkhtm = "";
				for (var i = 0; i < networkData.length; i++) {
					var divid = '';
					divid = 'main-statis-net-'+ networkData[i]['name'];
					networkhtm += '<div id="'+ divid +'" style="height:300px;" class="js-statis-net-charts">' +
							'</div>';
				};
				var alldisknetHtm = memoryhtm + cpuhtm + networkhtm + diskhtm;
				$('.js-node-allcharts').html(alldisknetHtm);
				//memory
				require(
				    [
				        'echarts',
				        'echarts/chart/bar',
				        'echarts/chart/line',
				    ],
				    function (ec) {
						var myChart = ec.init(document.getElementById('main-node-memory-statis'));
					    var option = {
					    	title : {
						        text: ip + lang.statis.of_memory_performance
						    },
						    tooltip : {
						        trigger: 'axis',
						        formatter: function (params,ticket,callback) {
						            return params[0]['name'] + '<br>' +
						            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'MB' + '<br>'+
						            	   params[1]['seriesName'] + '：' + params[1]['value'] + 'MB' + '<br>'+
						            	   params[2]['seriesName'] + '：' + params[2]['value'] + '%' + '<br>';
						        }
						        //form
						    },
						    legend: {
						    	 x: 'right',
						        data:[lang.statis.avail_space, lang.statis.total_space, lang.statis.used_space_percentage]
						    },
						    toolbox: {
								show : true,
						        orient: 'vertical',
						        x: 'left',
						        y: 'center',
								feature : {
									dataView : {show: false, readOnly: false},
									magicType : {show: true, type: ['line', 'bar']},
									dataZoom : {
										show : true,
										title : {
											dataZoom : lang.statis.area_zoom,
											dataZoomReset : lang.statis.area_zoom_back
										}
									},
									restore : {show: true},
									saveAsImage : {show: true}
								}
							},
					    	calculable : true,
						    xAxis : [
						    	{
						    		type : 'category',
						            boundaryGap : true,
						            splitLine : {show : false},
						            data : mpointdata
						        }
						    ],
						    yAxis : [
						    	{
						            type : 'value',
						            scale: true,
						            name : lang.statis.space + '（MB）',
						            boundaryGap: [0.2, 0.2]
						        },
						    	{
						            type : 'value',
						            scale: true,
						            name : lang.statis.percentage + '（%）',
						            splitLine : {show : false},
						        }
						    ],
						    series : [
						    	{
						            name:lang.statis.avail_space,
						            type:'line',
						            data: mavaildata
						        },
						        {
						            name:lang.statis.total_space,
						            type:'line',
						            data: mtotaldata
						        },
						        {
						            name:lang.statis.used_space_percentage,
						            type:'line',
						            yAxisIndex: 1,
						            data:mpercentdata
						        }
						    ]
						}
					    // 为echarts对象加载数据
					    myChart.setOption(option);
					}
				);
				//cpu
				require(
				    [
				        'echarts',
				        'echarts/chart/bar',
				        'echarts/chart/line',
				    ],
				    function (ec) {
						var myChart = ec.init(document.getElementById('main-node-cpu-statis'));
					    var option = {
					    	title : {
						        text: ip + lang.statis.of_cpu_performance
						    },
						    tooltip : {
						        trigger: 'axis',
						        formatter: function (params,ticket,callback) {
						            return params[0]['name'] + '<br>' +
						            	   params[0]['seriesName'] + '：' + params[0]['value'] + 's' + '<br>'+
						            	   params[1]['seriesName'] + '：' + params[1]['value'] + 's' + '<br>'+
						            	   params[2]['seriesName'] + '：' + params[2]['value'] + '%' + '<br>';
						        }
						        //form
						    },
						    legend: {
						    	 x: 'right',
						        data:[lang.statis.system_time, lang.statis.user_time, lang.statis.cpu_occupancy_percentage]
						    },
						    toolbox: {
								show : true,
						        orient: 'vertical',
						        y: 'center',
								feature : {
									dataView : {show: false, readOnly: false},
									magicType : {show: true, type: ['line', 'bar']},
									dataZoom : {
										show : true,
										title : {
											dataZoom : lang.statis.area_zoom,
											dataZoomReset : lang.statis.area_zoom_back
										}
									},
									restore : {show: true},
									saveAsImage : {show: true}
								}
							},
					    	calculable : true,
						    xAxis : [
						    	{
						    		type : 'category',
						            boundaryGap : true,
						            splitLine : {show : false},
						            data : cpointdata
						        }
						    ],
						    yAxis : [
						    	{
						            type : 'value',
						            scale: true,
						            name : lang.statis.stime + '（s）',
						            boundaryGap: [0.2, 0.2]
						        },
						    	{
						            type : 'value',
						            scale: true,
						            name : lang.statis.percentage + '（%）',
						            splitLine : {show : false},
						        }
						    ],
						    series : [
						    	{
						            name:lang.statis.system_time,
						            type:'line',
						            data: csystemdata
						        },
						        {
						            name:lang.statis.user_time,
						            type:'line',
						            data: cuserdata
						        },
						        {
						            name:lang.statis.cpu_occupancy_percentage,
						            type:'line',
						            yAxisIndex: 1,
						            data:cpupercentdata
						        }
						    ]
						}
					    // 为echarts对象加载数据
					    myChart.setOption(option);
					}
				);
				//network
				for (var i = 0; i < networkData.length; i++) {
					var netinfo = networkData[i]['value_list'];
					var nsentdata = [],
						nrecvdata = [],
						npacketssentdata = [],
						npacketsrecvdata = [],
						npointdata = [];
					for (var k = 0; k < netinfo.length; k++) {
						var nxaxis = netinfo[k].point;
						var nvalue = netinfo[k].value;
						var sentbytes, recvbytes, sentpackets, recvpackets;
						sentbytes = nvalue.bytes_sent / 1024; //单位从字节转换为KB
						sentbytes = sentbytes.toFixed(2);

						recvbytes = nvalue.bytes_recv / 1024;
						recvbytes = recvbytes.toFixed(2);

						sentpackets = parseInt( nvalue.packets_sent );
						recvpackets = parseInt( nvalue.packets_recv );

						nsentdata.push( sentbytes );
						nrecvdata.push( recvbytes );
						npacketssentdata.push(sentpackets);
						npacketsrecvdata.push(recvpackets);
						npointdata.push( nxaxis );
					}

					require(
						    [
						        'echarts',
						        'echarts/chart/bar',
						        'echarts/chart/line',
						    ],
						    function (ec) {
						    	var idstr = 'main-statis-net-' + networkData[i]['name'];
								var myChart = ec.init(document.getElementById(idstr));
							    var option = {
							    	title : {
								        text: ip + lang.statis.of + networkData[i]['name'] +lang.statis.flow
								    },
								    tooltip : {
								        trigger: 'axis',
								        formatter: function (params,ticket,callback) {
								            return params[0]['name'] + '<br>' +
								            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'KB' + '<br>'+
								            	   params[1]['seriesName'] + '：' + params[1]['value'] + 'KB' + '<br>'+
								            	   params[2]['seriesName'] + '：' + params[2]['value'] + lang.statis.per + '<br>' +
								            	   params[3]['seriesName'] + '：' + params[3]['value'] + lang.statis.per + '<br>';
								        }
								    },
								    legend: {
								        data:[ lang.statis.send_bytes, lang.statis.receive_bytes, lang.statis.send_package, lang.statis.receive_package]
								    },
								    toolbox: {
										show : true,
										feature : {
											dataView : {show: false, readOnly: false},
											magicType : {show: true, type: ['line', 'bar']},
											dataZoom : {
												show : true,
												title : {
													dataZoom : lang.statis.area_zoom,
													dataZoomReset : lang.statis.area_zoom_back
												}
											},
											restore : {show: true},
											saveAsImage : {show: true}
										}
									},
							    	calculable : true,
								    xAxis : [
								    	{
								    		type : 'category',
								            boundaryGap : true,
								            splitLine : {show : false},
								            data : npointdata
								        }
								    ],
								    yAxis : [
								    	{
								            type : 'value',
								            scale: true,
								            name : lang.statis.bytes + '（KB）',
								            boundaryGap: [0.2, 0.2]
								        },
								    	{
								            type : 'value',
								            scale: true,
								            splitLine : {show : false},
								            name : lang.statis.count + '（' + lang.statis.per + '）',
								        }
								    ],
								    series : [
								    	{
								            name:lang.statis.send_bytes,
								            type:'bar',
								            data: nsentdata
								        },
								        {
								            name:lang.statis.receive_bytes,
								            type:'bar',
								            data: nrecvdata
								        },
								        {
								            name:lang.statis.send_package,
								            type:'bar',
								            yAxisIndex: 1,
								            data: npacketssentdata
								        },
								        {
								            name:lang.statis.receive_package,
								            type:'bar',
								            yAxisIndex: 1,
								            data:npacketsrecvdata
								        }
								    ]
								}
							    // 为echarts对象加载数据
							    myChart.setOption(option);
							}
						);
				};
				//disk
				for (var i = 0; i < diskData.length; i++) {
					var diskinfo = diskData[i]['value_list'];
					//磁盘
					var dreaddata = [],
						dwritedata = [],
						dreadcount = [],
						dwritecount = [],
						dpointdata = [],
						diskname = [];
					for (var k = 0; k < diskinfo.length; k++) {
						var dxaxis = diskinfo[k].point;
						var dvalue = diskinfo[k].value;
						var readbytes, writebytes, readcount, writecount;
						readbytes =  dvalue.read_bytes / 1024; //转换为KB
						readbytes = readbytes.toFixed('2');
						//写字节
						writebytes = dvalue.write_bytes / 1024;
						writebytes = writebytes.toFixed('2');
						//读计数
						readcount = parseInt( dvalue.read_count );
						writecount = parseInt( dvalue.write_count );

						dreaddata.push( readbytes );
						dwritedata.push( writebytes );
						dreadcount.push( readcount );
						dwritecount.push( writecount );
						dpointdata.push( dxaxis );
					}

					require(
						    [
						        'echarts',
						        'echarts/chart/bar',
						        'echarts/chart/line',
						    ],
						    function (ec) {
						    	var idstr = 'main-statis-disk-' + diskData[i]['name'];
								var myChart = ec.init(document.getElementById(idstr));
							    var option = {
							    	title : {
								        text: ip + lang.statis.of + diskData[i]['name'] + lang.statis.disk_performance
								    },
								    tooltip : {
								        trigger: 'axis',
								        formatter: function (params,ticket,callback) {
								            return params[0]['name'] + '<br>' +
								            	   params[0]['seriesName'] + '：' + params[0]['value'] + 'KB' + '<br>'+
								            	   params[1]['seriesName'] + '：' + params[1]['value'] + 'KB' + '<br>'+
								            	   params[2]['seriesName'] + '：' + params[2]['value'] + lang.statis.per + '<br>' +
								            	   params[3]['seriesName'] + '：' + params[3]['value'] + lang.statis.per + '<br>';
								        }
								    },
								    legend: {
								        data:[lang.statis.read_bytes, lang.statis.write_bytes, lang.statis.read_count, lang.statis.write_count]
								    },
								    toolbox: {
										show : true,
										feature : {
											dataView : {show: false, readOnly: false},
											magicType : {show: true, type: ['line', 'bar']},
											dataZoom : {
												show : true,
												title : {
													dataZoom : lang.statis.area_zoom,
													dataZoomReset : lang.statis.area_zoom_back
												}
											},
											restore : {show: true},
											saveAsImage : {show: true}
										}
									},
							    	calculable : true,
								    xAxis : [
								    	{
								    		type : 'category',
								            boundaryGap : true,
								            splitLine : {show : false},
								            data : dpointdata
								        }
								    ],
								    yAxis : [
								    	{
								            type : 'value',
								            scale: true,
								            name : lang.statis.bytes + '（KB）',
								            boundaryGap: [0.2, 0.2]
								        },
								    	{
								            type : 'value',
								            scale: true,
								            splitLine : {show : false},
								            name : lang.statis.count + '（'+ lang.statis.per +'）',
								        }
								    ],
								    series : [
								    	{
								            name:lang.statis.read_bytes,
								            type:'line',
								            data: dreaddata
								        },
								        {
								            name:lang.statis.write_bytes,
								            type:'line',
								            data: dwritedata
								        },
								        {
								            name:lang.statis.read_count,
								            type:'line',
								            yAxisIndex: 1,
								            data:dreadcount
								        },
								        {
								            name:lang.statis.write_count,
								            type:'line',
								            yAxisIndex: 1,
								            data:dwritecount
								        }
								    ]
								}
							    // 为echarts对象加载数据
							    myChart.setOption(option);
							}
						);
				};
				$('#main-node-memory-statis').addClass('fl-lt');
				$('#main-node-cpu-statis').addClass('fl-lt');
				$('.js-statis-disks-charts').addClass('fl-lt');
				$('.js-statis-net-charts').addClass('fl-lt');
		} else {
				DisplayTips ( lang.statis.list_node_statis_fail );
				rData = [];
				wData = [];
				opsData = [];
			}
		}
		DataModel['getHistoryNodeStatis'](para, callback, true, null);
	}

	//初始化时间插件
	function formatDatetime ( namestr, pGlobal ) {
		var dataRange,timePickerBool;
		if (namestr == 'pooltime') {
			dataRange = {
				'real time': [moment().add(diff, 'milliseconds'), moment().add(diff, 'milliseconds')],
				'today': [moment().add(diff, 'milliseconds'), moment().add(diff, 'milliseconds').add(1, 'days')],
				'yesterday': [moment().add(diff, 'milliseconds').subtract('days', 1), moment().add(diff, 'milliseconds')],
				'7 days ago': [moment().add(diff, 'milliseconds').subtract('days', 6), moment().add(diff, 'milliseconds')],
				'30 days ago': [moment().add(diff, 'milliseconds').subtract('days', 29), moment().add(diff, 'milliseconds')],
				'this month': [moment().add(diff, 'milliseconds').startOf('month'), moment().add(diff, 'milliseconds').endOf('month')],
				'last month': [moment().add(diff, 'milliseconds').subtract('month', 1).startOf('month'), moment().add(diff, 'milliseconds').subtract('month', 1).endOf('month')]
			};
			timePickerBool = true;
		} else if (namestr == 'nodetime'){
			dataRange = {
				'today': [moment().add(diff, 'milliseconds'), moment().add(diff, 'milliseconds').add(1, 'days')],
				'yesterday': [moment().add(diff, 'milliseconds').subtract('days', 1), moment().add(diff, 'milliseconds')],
				'7 days ago': [moment().add(diff, 'milliseconds').subtract('days', 6), moment().add(diff, 'milliseconds')],
				'30 days ago': [moment().add(diff, 'milliseconds').subtract('days', 29), moment().add(diff, 'milliseconds')],
				'this month': [moment().add(diff, 'milliseconds').startOf('month'), moment().add(diff, 'milliseconds').endOf('month')],
				'last month': [moment().add(diff, 'milliseconds').subtract('month', 1).startOf('month'), moment().add(diff, 'milliseconds').subtract('month', 1).endOf('month')]
			};
			timePickerBool = false;
		}

		$('#'+namestr).daterangepicker({
			startDate: moment().add(diff, 'milliseconds'),
			endDate: moment().add(diff, 'milliseconds'),
			minDate: '01/01/1990',
			maxDate: '12/31/2022',
			showDropdowns: true,
			showWeekNumbers: true,
			timePicker: timePickerBool,
			timePickerIncrement: 1,
			timePicker24Hour: true,
			ranges: dataRange,
			opens: 'left',
			buttonClasses: ['btn btn-default'],
			applyClass: 'btn-small btn-primary',
			cancelClass: 'btn-small',
			format: 'MM/DD/YYYY HH:mm A',
			separator: ' to ',
			locale: {
				applyLabel: lang.button_ok,
				cancelLabel: lang.button_cancel,
		        format: 'MM/DD/YYYY HH:mm',
				fromLabel: 'From',
				toLabel: 'To',
				customRangeLabel: 'customize the date',
				daysOfWeek: [ 'SUN','MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
				monthNames: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
				firstDay: 1
			}
		}, function(start, end, label) {
			if ('real time' == label) {
				$('#'+namestr).html(moment().add(diff, 'milliseconds').format('YYYY'+lang.year+'MM'+lang.month+'DD'+lang.day+' HH:mm:ss'));
			} else{
				$('#'+namestr).html(start.format('YYYY'+lang.year+'MM'+lang.month+'DD'+lang.day+'') + ' - ' + end.format('YYYY'+lang.year+'MM'+lang.month+'DD'+lang.day+''));
			}
			pGlobal.s_time = start.format('YYYYMMDDHHmmss');
			pGlobal.e_time = end.format('YYYYMMDDHHmmss');
			pGlobal.label = label;
			pGlobal.page = 1;
			stime = pGlobal.s_time;
			etime = pGlobal.e_time;
		});
	}
})
