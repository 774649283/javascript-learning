/**
 * Created by manan on 2016/10/10.
 */
$(function () {
    var timer = null;//用来解决当移入到磁盘路径上时，可以移入到框里
    var StorageInfoLoaded = false;
    var StorageInfoData = null;
    var ipsParam = ''; // 用于请求接口的参数，集群的所有ip
    // 获取服务器时间，不用浏览器本地时间作为时间轴
    var serverTime = ''; //服务器时间字符串 MM/DD/YY HH:mm:ss
    // 定义四个全局变量用来存储带宽读、带宽写、IOPS读、IOPS写
    var rData = [],
        wData = [],
        ropData = [],
        wopData = [];
    var	timeTicket = null; // 带宽和IOPS的定时器
    window.onerror=function(){return true;}

    // echarts 路径配置
    require.config({
      paths: {
        echarts: 'js/lib/dist/'
      }
    });

    // 获取服务器时间
    var getTimeCallback = function (result) {
  		if (result.result.time) {
  			serverTime = result.result.time;
  		} else {
  			serverTime = undefined;
  		}
  	}
  	DataModel['listClock'](null, getTimeCallback, false, null);

    var serverNow = moment(serverTime, 'MM/DD/YY HH:mm:ss');	//服务器时间
  	var diff = serverNow.diff(moment()); 	//服务器与客户端的时间差 服务器时间 = moment() + diff;

    //存储空间饼图
    var storageCallback = function(result) {
      $('#storagePie').html('');
      $('#storageLegend').html('');
      if (result == undefined) {
        return;
      }
      var legendHtm = '';
        legendHtm += '<div class="js-storage-legend" data-legend="real"><span class="legend_icon" style="background-color: #F5A623;"></span>' + lang.storage.real_data + lang.statis.space + '</div>';
        legendHtm += '<div class="js-storage-legend" data-legend="redundant"><span class="legend_icon" style="background-color: #BFD9EB;"></span>' + lang.storage.redundant_data + lang.statis.space + '</div>';
        legendHtm += '<div class="js-storage-legend" data-legend="unused"><span class="legend_icon" style="background-color: #2C82BE;"></span>' + lang.storage.unused + lang.statis.space + '</div>'; 
      if (result.code == 200 && !$.isEmptyObject(result.result)) {
        var storage = result.result;
        if (storage.total_space != 0) {
          // 实际百分比，保留2位小数
          var realPer = Math.ceil(storage.real_data_space / storage.total_space * 100 * 100) / 100,
              redunPer = Math.ceil(storage.redundant_data_space / storage.total_space * 100 * 100) / 100,
              unusedPer = (100 - realPer - redunPer).toFixed(2);
          var totalSpaceArr = formatCapacity(storage['total_space']).split(' ');

          require(
            [
              'echarts',
              'echarts/chart/pie',
            ],
            function (ec) {
              var pieChart = ec.init(document.getElementById('storagePie'));
              var option = {
                color: ['#F5A623', '#BFD9EB', '#2C82BE'],
                calculable: false,
                tooltip: {
                  trigger: 'item',
                  // 解决tooltip抖动问题
                  position:function(p){
                    var id = document.getElementById('main');
                    if ($(id).width() - p[0]- $(id).find("div .echarts-tooltip").width()-20 <0) {
                      p[0] = p[0] - $(id).find("div .echarts-tooltip").width() -40;
                    }
                    return [p[0], p[1]];
                  },
                  formatter: function(params, ticket, callback) {
                    var per, value;
                    if (params.name == lang.storage.real_data) {
                      per = realPer;
                      value = storage['real_data_space'];
                    } else if (params.name == lang.storage.redundant_data) {
                      per = redunPer;
                      value = storage['redundant_data_space'];
                    } else if (params.name == lang.storage.unused) {
                      per = unusedPer;
                      value = storage['available_data_space'];
                    }
                    return params.name + '：' + formatCapacity(value) + '(' + per + '%)';
                  },
                  backgroundColor: '#fff',
                  borderColor: '#ccc',
                  borderRadius: 0,
                  borderWidth: 1,
                  textStyle: {
                    color: '#333',
                  },
                },
                series: [{
                  name: lang.storage.storage_space,
                  type: 'pie',
                  radius: ['60%', '85%'],
                  center: ['60%', '50%'],
                  startAngle: 135,
                  minAngle: '6',
                  data: [
                    {
                      name: lang.storage.real_data,
                      value: realPer,
                      itemStyle: {
                        normal: {
                          color:'#F5A623',
                          label: {
                            formatter: realPer + '%',
                          },
                        },
                      },
                    },
                    {
                      name: lang.storage.redundant_data,
                      value: redunPer,
                      itemStyle: {
                        normal: {
                          color: '#BFD9EB',
                          label: {
                            formatter: redunPer + '%',
                          },
                        },
                      },
                    },
                    {
                      name: lang.storage.unused,
                      value: unusedPer,
                      itemStyle: {
                        normal: {
                          color: '#2C82BE',
                          label: {
                            formatter: unusedPer + '%',
                          },
                        },
                      },
                    },
                  ],
                  itemStyle: {
                    normal: {
                      borderWidth: 1, //设置border的宽度有多大
                      borderColor: '#fff',
                      label: {
                        show: false,
                      },
                      labelLine: {
                        show: false,
                      },
                    },
                    emphasis: {
                      borderWidth: 1, //设置border的宽度有多大
                      borderColor: '#fff',
                      label: {
                        show: false,
                      },
                    },
                  }
                }],
              };
              setBorder(option.series[0]);
              // 使用zrender在饼图上添加文本
              var _zr = pieChart.getZrender();
              var TextShape = require('zrender/shape/Text');
              _zr.addShape(new TextShape({
                style : {
                  x: _zr.getWidth() * 0.6,
                  y: _zr.getHeight() * 0.5,
                  color: '#666',
                  text: lang.storage.total + '\n' + totalSpaceArr[0] + '\n' + totalSpaceArr[1],
                  textAlign : 'center',
                  textFont: 'normal 13px Arial',
                }
              }));
              // 为echarts对象加载数据
              pieChart.setOption(option);
              $('#storageLegend').html(legendHtm);

              var tooltip = pieChart.component.tooltip;
              // 图例悬浮事件
              $(document).on('mouseover', '.js-storage-legend', function() {
                tooltip.hideTip();
                var legend = $(this).data('legend');
                legend == 'real' && storage.real_data_space != 0 && tooltip.showTip({ seriesIndex: 0, name: lang.storage.real_data });
                legend == 'redundant' && storage.redundant_data_space != 0 && tooltip.showTip({ seriesIndex: 0, name: lang.storage.redundant_data });
                legend == 'unused' && storage.available_data_space != 0 && tooltip.showTip({ seriesIndex: 0, name: lang.storage.unused });
              }).on('mouseout', '.js-storage-legend', function () {
                tooltip.hideTip();
              })
            }
          );
        } else {
          var htm = '';
          htm += '<div style="height: 100%; position: relative;"><div class="nodata_pie" style="width: 84px; height: 84px; line-height: 64px; margin-top: -42px;"></div></div>';
          $('#storagePie').html(htm);
          $('#storageLegend').html(legendHtm);
        }
      } else if (result.code == 200 && $.isEmptyObject(result.result)){
        var htm = '';
        htm += '<div style="height: 100%; position: relative;"><div class="nodata_pie" style="width: 84px; height: 84px; line-height: 64px; margin-top: -42px;">' + lang.storage.not_configure + '</div></div>';
        $('#storagePie').html(htm);
        $('#storageLegend').html(legendHtm);
      } else {
        DisplayTips(result.result);
      }
    }
    // 图表数据为100%时设置borderWidth为0
    function setBorder(opt) {
      $.each(opt.data, function (i, item) {
        if (item.itemStyle.normal.label.formatter == '100.00%' || item.itemStyle.normal.label.formatter == '100%') {
          opt.itemStyle.normal.borderWidth = 0;
          opt.itemStyle.emphasis.borderWidth = 0;
        }
      });
    }
    DataModel['listStorageSpace'](null, storageCallback, true, null);

    // 节点
    var nodesInfoCallback = function(result) {
      $('.js-node-sort').find('.js-node-expire-box').parent().remove();
      if (result == undefined)
        return;
      if (result.code == 200 && result.result) {
        var nodesInfo = result.result;
        var expireNum = 0;
        var expireInfo = [];
        $('.js-node-total').text(nodesInfo['count']);
        $('.js-node-on').text(nodesInfo['nodes_open_number']);
        $('.js-node-off').text(nodesInfo['nodes_closed_number']);
        $('.js-node-off-box').data('num', nodesInfo['nodes_closed_number']).data('info', nodesInfo['closed_nodes_info']);
        var licenseInfo = nodesInfo['test_license_info'];
        for (var i = 0; i < licenseInfo.length; i++) {
          if (licenseInfo[i].days > 0.0 && licenseInfo[i].days <= 15.0) {
            expireNum += 1;
            expireInfo.push(licenseInfo[i]);
          }
        }
        expireInfo = JSON.stringify(expireInfo).replace(/\"/g,"'");
        if (expireNum > 0) {
          var htm = '<div><span class="js-node-expire-box" data-num="' + expireNum + '" data-info="' + expireInfo + '"><b class="sy_bold" style="color: #F5A623;">';
          htm += expireNum;
          htm += '</b>&nbsp;' + lang.node.about_expire + '</span></div>';
          $('.js-node-sort').append(htm);
        }
      } else {
        $('.js-node-total').text('?');
        $('.js-node-on').text('?');
        $('.js-node-off').text('?');
        DisplayTips(result.result);
      }
    }
    DataModel['listNodesInfo'](null, nodesInfoCallback, true, null);

    // 磁盘
    var diskInfoCallback = function(result) {
      if (result == undefined) {
        return;
      }
      if (result.code == 200) {
        var diskInfo = result.result;
        $('.js-disk-total').text(diskInfo['disk_total_number']);
        $('.js-disk-health').text(diskInfo['disk_healthy_number']);
        $('.js-disk-unhealth').text(diskInfo['disk_unhealthy_number']);
        $('.js-disk-unhealth-box').data('num', diskInfo['disk_unhealthy_number']).data('info', diskInfo['disk_unhealthy_detail']);
      } else {
        $('.js-disk-total').text('?');
        $('.js-disk-health').text('?');
        $('.js-disk-unhealth').text('?');
        DisplayTips(result.result);
      }
    }
    DataModel['listDisksInfo'](null, diskInfoCallback, true, null);

    //负载状态
    var loadCallback = function (result) {
      $('.load_box').LoadData("hide");
      var data = result.result;
      var htm = '';
      if (result.code == undefined) {
        return;
      }
      if (result.code == 200) {
        // var levelShow = '';
        for (var i = 0; i < data.length; i++) {
          var thisElem = $('.load_one[name="' + data[i].ip +'"]');
          var abnormalSerFlag = '';
          // if (data[i].percent.level == 'notice') {
          //   levelShow = 1;
          // } else if (data[i].percent.level == 'warning') {
          //   levelShow = 2;
          // } else if (data[i].percent.level == 'busy') {
          //   levelShow = 4;
          // } else if (data[i].percent.level == 'unknown') {
          //   levelShow = 3;
          // }

          var abnormalSer = data[i].percent.abnormal_service || [];
          if (abnormalSer.length > 0) {
            abnormalSerFlag = '<span style="color: #f00; font-weight: bold;">!&nbsp;</span>';
          } else {
            abnormalSerFlag = '';
          }
          var parseAbnormalSer = JSON.stringify(abnormalSer).replace(/\"/g,"'");
          thisElem.children('.load_pic').data('services', parseAbnormalSer).data('mem', data[i].percent.mem).data('io', data[i].percent.io).data('level', data[i].percent.level).data('cpu', data[i].percent.cpu).data('disk', data[i].percent.disk)
            .data('net', data[i].percent.net).data('sessions', data[i].percent.sessions);
          thisElem.children('.load_pic').find('img').attr('src', 'css/image/load_balance_' + data[i].percent.level + '.svg');
          thisElem.children('.load_name').prepend(abnormalSerFlag);
        }
      }
    }
    // 获取所有node，展示负载状态的所有node
    var nodeCallback = function (result) {
      $('.load_box').html('');
      var data = result.result;
      var htm = '';
      if (result.code == undefined) {
        return;
      }
      if (result.code == 200) {
        var nodesArr = data.nodes;
        var ipresultArr = [];

        htm += '<div class="part-mag js-part-mag" style="width: 100%;height: 100%">';
        for (var i = 0; i < nodesArr.length; i++) {
          if (nodesArr.length <= 3) {
            if (window.screen.height == 1080 && window.screen.width == 1920) {
              htm += '<div class="load_one" name="' + nodesArr[i].ip + '">' +
                  '<div class="load_pic" style="">' +
                  '<a href="/nodeinfo?node=' + nodesArr[i].ip + '"><img src="css/image/load_balance_notice.svg"></a></div>' +
                  '<div class="load_name ellipsis" style="line-height: 43px;"><span>' + nodesArr[i].hostname + '</span></div>' +
                  '</div>';
            } else {
              htm += '<div class="load_one" name="' + nodesArr[i].ip + '">' +
                  '<div class="load_pic" style="width: 110px; height: 84px;">' +
                  '<a href="/nodeinfo?node=' + nodesArr[i].ip + '"><img src="css/image/load_balance_notice.svg"></a></div>' +
                  '<div class="load_name ellipsis" style="width: 110px; line-height: 43px;"><span>' + nodesArr[i].hostname + '</span></div>' +
                  '</div>';
            }
          } else {
            htm += '<div class="load_one" name="' + nodesArr[i].ip + '">' +
                '<div class="load_pic" style="width: 84px;height: 84px;">' +
                '<a href="/nodeinfo?node=' + nodesArr[i].ip + '"><img src="css/image/load_balance_notice.svg"></a></div>' +
                '<div class="load_name ellipsis" style="font-size: 10px; width: 80px; line-height: 30px;"><span>' + nodesArr[i].hostname + '</span></div>' +
                '</div>';
          }
        }
        htm += '</div>';
        $('.load_box').html(htm);

        for (var i = 0; i < nodesArr.length; i++) {
          if (nodesArr[i].ip) {
            ipresultArr.push(nodesArr[i].ip);
          }
        }
        ipsParam = ipresultArr.join(',');
        var param = {
          'ips': ipsParam,
        };
        $('.load_box').LoadData("show");
        DataModel['loadStatus'](param, loadCallback, true, 'Got loadStatus');
      }
    }
    DataModel['listAllNode']("", nodeCallback, true, 'Got Node IP');
    setInterval(function () {
      DataModel['listAllNode']("", nodeCallback, true, 'Got Node IP');
    }, 60 * 1000);

    // 集群健康状态
    var healthcallback = function(result) {
      if (result == undefined)
        return;
      var healthstatus = '';
      if (result.code == 200) {
        var records = result.result[0].records || [];
        var warnCount = 0,
            errorCount = 0,
            warnDetails = [],
            errorDetails = [];
        for (var i =0; i < records.length; i++) {
          if (records[i].severity == 'WARNING') {
            warnCount += 1;
            warnDetails.push({
              'hostname': records[i].hostname,
              'detail': records[i].description,
              'time': records[i].latest_time || records[i].time,
            });
          } else if (records[i].severity == 'ERROR' || records[i].severity == 'FATAL') {
            errorCount += 1;
            errorDetails.push({
              'hostname': records[i].hostname,
              'detail': records[i].description,
              'time': records[i].latest_time || records[i].time,
            });
          }
        }
        // 判断健康状态
        if (warnCount == 0 && errorCount == 0) {
          healthstatus = 'health';
        } else if (errorCount > 0) {
          healthstatus = 'error';
        } else {
          healthstatus = 'alarm';
        }

        if (warnCount == 0) {
          $('.js-health-status.warn').attr('href', 'javascript:void();');
        }
        if (errorCount == 0) {
          $('.js-health-status.error').attr('href', 'javascript:void();');
        }
        $('.js-warn-count').text(warnCount);
        $('.js-error-count').text(errorCount);
        $('.js-health-status.warn').data('count', warnCount).data('details', warnDetails);
        $('.js-health-status.error').data('count', errorCount).data('details', errorDetails);
      } else {
        healthstatus = 'unknown';
        $('.js-warn-count').text('?');
        $('.js-error-count').text('?');
        $('.js-health-status.warn').attr('href', 'javascript:void();');
        $('.js-health-status.error').attr('href', 'javascript:void();');
      }
      var imgHtm = '<img src="css/image/home_'+healthstatus+'.svg" title="'+healthstatus+'">';
      $('.health_img_box').append(imgHtm);
    }
    DataModel['getRealAlarm'](null, healthcallback, true, '');

    // 获取数据状态饼图
    var hasDamageData = false;  // 是否有数据损坏
    var dataStatusCallback = function(result) {
      if (result == undefined) {
        return;
      }
      var legendHtm = '';
        legendHtm += '<div class="js-data-legend" data-legend="health"><span class="legend_icon" style="background-color: #04965A ;"></span>' + lang.health + '</div>';
        legendHtm += '<div class="js-data-legend" data-legend="migrate"><span class="legend_icon" style="background-color: #2C82BE;"></span>' + lang.migrate + '</div>';
        legendHtm += '<div class="js-data-legend" data-legend="degrade"><span class="legend_icon" style="background-color: #F5A623;"></span>' + lang.degrade + '</div>';
        legendHtm += '<div class="js-data-legend" data-legend="damage"><span class="legend_icon" style="background-color: #E31100;"></span>' + lang.disk.damage + '</div>';

      if (result.code == 200 && !$.isEmptyObject(result.result)) {
        $('#dataStatusPie').html('');
        var datas = result.result;
        var healthRate = datas.healthy.health_rate,
            migrateRate = datas.migrating.migrating_rate,
            degradeRate = datas.degrading.degrading_rate,
            damageRate = datas.inconsistent.inconsistent_rate;
        var healthCount = datas.healthy.health_count,
            migrateCount = datas.migrating.migrating_count,
            degradeCount = datas.degrading.degrading_count,
            damageCount = datas.inconsistent.inconsistent_count;
        hasDamageData = datas.inconsistent.inconsistent_count == 0 ? false : true;
        require(
          [
            'echarts',
            'echarts/chart/pie',
          ],
          function (ec) {
            var pieChart = ec.init(document.getElementById('dataStatusPie'));
            var option = {
              color: ['#04965A', '#2C82BE', '#F5A623', '#E31100'],
              calculable: false,
              animation: false,
              tooltip: {
                trigger: 'item',
                formatter: function(params, ticket, callback) {
                  var per, value;
                  if (params.name == lang.health) {
                    per = healthRate;
                  } else if (params.name == lang.migrate) {
                    per = migrateRate;
                  } else if (params.name == lang.degrade) {
                    per = degradeRate;
                  } else if (params.name == lang.disk.damage) {
                    per = damageRate;
                  }
                  return params.name + '：' + per;
                },
                backgroundColor: '#fff',
                borderColor: '#ccc',
                borderRadius: 0,
                borderWidth: 1,
                textStyle: {
                  color: '#333',
                },
              },
              series: [{
                name: lang.data_status,
                type: 'pie',
                radius: ['30px', '42px'],
                center: ['60%', '50%'],
                minAngle: '6',
                data: [
                  {
                    name: lang.health,
                    value: healthCount,
                    itemStyle: {
                      normal: {
                        label: {
                          formatter: healthRate,
                        },
                      },
                    },
                  },
                  {
                    name: lang.migrate,
                    value: migrateCount,
                    itemStyle: {
                      normal: {
                        label: {
                          formatter: migrateRate,
                        },
                      },
                    },
                  },
                  {
                    name: lang.degrade,
                    value: degradeCount,
                    itemStyle: {
                      normal: {
                        label: {
                          formatter: degradeRate,
                        },
                      },
                    },
                  },
                  {
                    name: lang.disk.damage,
                    value: damageCount,
                    itemStyle: {
                      normal: {
                        label: {
                          formatter: damageRate,
                        },
                      },
                    },
                  },
                ],
                itemStyle: {
                  normal: {
                    borderWidth: 1, //设置border的宽度有多大
                    borderColor: '#fff',
                    label: {
                      show: false,
                    },
                    labelLine: {
                      show: false,
                    },
                  },
                  emphasis: {
                    borderWidth: 1, //设置border的宽度有多大
                    borderColor: '#fff',
                    label: {
                      show: false,
                    },
                  },
                },
              }],
            };
            setBorder(option.series[0]);
           
            // 为echarts对象加载数据
            pieChart.setOption(option);
            $('#dataStatusLegend').html(legendHtm);

            var tooltip = pieChart.component.tooltip;
            // 图例悬浮事件
            $(document).on('mouseover', '.js-data-legend', function() {
              tooltip.hideTip();
              var legend = $(this).data('legend');
              legend == 'health' && healthCount != 0 && tooltip.showTip({ seriesIndex: 0, name: lang.health });
              legend == 'migrate' && migrateCount != 0 && tooltip.showTip({ seriesIndex: 0, name: lang.migrate });
              legend == 'degrade' && degradeCount != 0 && tooltip.showTip({ seriesIndex: 0, name: lang.degrade });
              legend == 'damage' && damageCount != 0 && tooltip.showTip({ seriesIndex: 0, name: lang.disk.damage });
            }).on('mouseout', '.js-data-legend', function () {
              tooltip.hideTip();
            })
          }
        );
      } else if (result.code == 200 && $.isEmptyObject(result.result)) {
        var htm = '';
        htm += '<div style="height: 100%; position: relative;"><div class="nodata_pie">' + lang.storage.not_configure + '</div></div>';
        $('#dataStatusPie').html(htm);
        $('#dataStatusLegend').html(legendHtm);
      } else {
        DisplayTips(result.result);
      }
    }
    // 获取数据迁移状态
    var migrationCallback = function(result) {
      if (result == undefined) {
        return;
      }
      var htm = '';
      if (result.code == 200) {
        if (result.result.maintence_status == 1) {
          htm += '<div style="font-size: 12px; text-align: center; color: orange;">' +
            '<div style="padding-bottom: 5px;">' + lang.cluster.migration_off + '</div>' +
            '<div>' + lang.cluster.goto_maintenance_page + '</div>' +
            '</div>';
        } else {
          if (hasDamageData) {
            htm += '<div style="font-size: 12px; text-align: center; color: #f00;">' + lang.cluster.some_data_damaged + '</div>';
          } else if (result.result.migration_status == 1 && result.result.migration_detail) {
            var detail = result.result.migration_detail;
            htm += '<div style="font-size: 12px; text-align: center;">' +
              lang.cluster.migration_surplus + ':<span>' + detail.migration_residual_rate + '</span>&nbsp;&nbsp;' +
              lang.cluster.migration_speed + ':<span>' + detail.migration_speed + '<span>&nbsp;&nbsp;' +
              lang.cluster.remain_time + ':<span>' + detail.recovering_time + '</span>' +
              '</div>';
          }
        }
      } else {
        DisplayTips(result.result);
      }
      // 调整集群健康状态和数据状态的高度
      if (htm) {
        $('.js-health-box').css('height', '21%');
        $('.js-data-status').css('height', '35%');
      } else {
        $('.js-health-box').css('height', '24%');
        $('.js-data-status').css('height', '32%');
      }
      $('.js-data-status .js-tips').html(htm);
    }
    DataModel['getDataStatus'](null, dataStatusCallback, true, null);
    DataModel['getMigrationStatus'](null, migrationCallback, true, null);
    setInterval(function() {
      DataModel['getDataStatus'](null, dataStatusCallback, true, null);
      DataModel['getMigrationStatus'](null, migrationCallback, true, null);
    }, 5 * 1000);

  // 月健康状况
    var myday = [];
    var nowDate = DateDemo();
    var dateArr = nowDate.split('\/');
    var curYear = dateArr[0];  // 当前年份
    var curMonth = dateArr[1]; // 当前月份
    var curDay = dateArr[2];  // 当前日
    var showYear = dateArr[0];  // 当前页面显示的年份
    var showMonth = dateArr[1]; // 当前页面显示的月份
    // 初始化部署时间年月日和系统时间年月日
    var deployYear,
        deployMonth,
        deployDay,
        sysYear,
        sysMonth,
        sysDay;
    if (showMonth < 10) {
        showMonth = '0' + showMonth;
    }
    // //var showDate=calculateDate.compute(dateArr);

    // 计算每月1号是星期几，据此算出1号前空几格
    var beforeDay1 = function (year, month) {
        var day = new Date(year + '\/' + month + '\/' + 1);
        var weekday = day.getDay();
        var blank = '';
        for (var i = 0; i < weekday; i++) {
            blank += '<li clas="blankLi"><span></span></li>';
        }
        return blank;
    }
    //罗列时间表
    var dateList = function (year1, month1) {
        var year = parseInt(year1);
        var month = parseInt(month1);
        var liDay = beforeDay1(year, month);
        var day = 0;
        if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            day = 32;
        } else if (month == 4 || month == 6 || month == 8 || month == 9 || month == 11) {
            day = 31;
        } else if (month == 2) {
            var isleapyear = false;
            if (0 == year % 4 && (year % 100 != 0 || year % 400 == 0)) {
                isleapyear = true;
            }
            if (isleapyear) {
                day = 30;
            } else {
                day = 29;
            }
        }
        for (var i = 1; i < day; i++) {
            // if (i < 10) {
            //     liDay += '<li class="day status-1"><i class="fa fa-circle"></i><span>' + "0" + i + '</span></li>';
            // } else {
            //     liDay += '<li class="day status-1"><i class="fa fa-circle"></i><span>' + i + '</span></li>';
            // }
            if (i < 10) {
              liDay += '<li class="day status-1"><span>'+ '0' + i + '</span></li>';
            } else {
              liDay += '<li class="day status-1"><span>' + i + '</span></li>';
            }
        }
        $('.week_body').html(liDay);
    }
    var showDaybg = function() {
      var parseShowYear = parseInt(showYear);
      var parseShowMonth = parseInt(showMonth)
      var spanNum = $('.day');
      // 部署年月等于当前年月且当前年月等于系统年月
      if ((deployYear == parseShowYear && deployMonth == parseShowMonth) && (parseShowYear == sysYear && parseShowMonth == sysMonth)) {
        for (var i = 0; i < spanNum.length; i++) {
          if ((i < deployDay - 1) || (i > sysDay -1)) {
            spanNum.eq(i).removeClass('status-1').addClass('status-1');
          } else {
            spanNum.eq(i).removeClass('status-1').addClass('status0');
          }
        }
      // 部署年月等于当前年月且当前年月小于系统年月
      } else if ((deployYear == parseShowYear && deployMonth == parseShowMonth) && (parseShowYear < sysYear || (parseShowYear == sysYear && parseShowMonth < sysMonth))) {
        for (var i = 0; i < spanNum.length; i++) {
          if (i < deployDay - 1) {
            spanNum.eq(i).removeClass('status-1').addClass('status-1');
          } else {
            spanNum.eq(i).removeClass('status-1').addClass('status0');
          }
        }
      // 部署年月等于当前年月且当前年月大于系统年月
      } else if ( (deployYear == parseShowYear && deployMonth == parseShowMonth) && (parseShowYear > sysYear || (parseShowYear == sysYear && parseShowMonth > sysMonth)) ) {

      // 部署年月小于当前年月且当前年月等于系统年月
      } else if ((deployYear < parseShowYear || (deployYear == parseShowYear && deployMonth < parseShowMonth)) && (parseShowYear == sysYear && parseShowMonth == sysMonth)) {
        for (var i = 0; i < spanNum.length; i++) {
          if (i > sysDay -1) {
            spanNum.eq(i).removeClass('status-1').addClass('status-1');
          } else {
            spanNum.eq(i).removeClass('status-1').addClass('status0');
          }
        }
      // 部署年月小于当前年月且当前年月小于系统年月
      } else if ( (deployYear < parseShowYear || (deployYear == parseShowYear && deployMonth < parseShowMonth)) && ((parseShowYear < sysYear || (parseShowYear == sysYear && parseShowMonth < sysMonth))) ) {
        for (var i = 0; i < spanNum.length; i++) {
          spanNum.eq(i).removeClass('status-1').addClass('status0');
        }
      // 部署年月小于当前年月且当前年月大于系统年月
      } else if ( (deployYear < parseShowYear || (deployYear == parseShowYear && deployMonth < parseShowMonth)) && (parseShowYear > sysYear || (parseShowYear == sysYear && parseShowMonth > sysMonth)) ) {

      }
    }
    //获取月健康状况
    var stateCallback = function (result) {
        var data = result.result.records;
        showDaybg();
        if (result.code == 200) {
            // showDaybg();
            for (var i = 0; i < data.length; i++) {
                var oneDay = data[i].time.split('-')[2];
                if ( (parseInt(showYear) < sysYear) || (parseInt(showYear) == sysYear && parseInt(showMonth) < sysMonth) || (parseInt(showYear) == sysYear && parseInt(showMonth) == sysMonth && oneDay <= sysDay) ) {
                  var orderNum = parseInt(oneDay) - 1;
                  var spanNum = $('.day');
                  myday.push(data[i].time);
                  var newStyle = spanNum.eq(orderNum).removeClass('status-1').removeClass('status0');
                  var dayState = data[i].level;
                  if (dayState == 'NOTICE') {
                      newStyle.addClass('status0');
                  } else if (dayState == 'WARNING') {
                      newStyle.addClass('status1');
                  } else if (dayState == 'ERROR') {
                      newStyle.addClass('status2');
                  } else {
                      newStyle.addClass('status-1');
                  }
                  // newStyle.find('span').css({display: "none"});
                  $('.week_body .day:eq(' + orderNum + ')').find('#alert_detail').remove();
                  var htm = '<div id="alert_detail" data-date="' + data[i].time + '" data-num="' + data[i].abstract.length + '">';
                  for (var j = 0; j < data[i].abstract.length; j++) {
                      htm += '<span class="hidden" data-time="' + data[i].abstract[j].time + '" data-user="' + data[i].abstract[j].user + '" data-message="' + data[i].abstract[j].message + '"></span>'
                  }
                  htm += '</div>'
                  $('.week_body .day:eq(' + orderNum + ')').append(htm);
                }
            }
        }
    }
    var showStatus = function () {
        dateList(showYear, showMonth);
        // var time = year + '-' + month;
        var param = {
            'logType': 'monlog',
            'date': showYear + '-' + showMonth,
            'num': 10,
        }

        DataModel['getRunState'](param, stateCallback, true, 'Get platform runSate');
        setInterval(function () {
            DataModel['getRunState']({
              'logType': 'monlog',
              'date': showYear + '-' + showMonth,
              'num': 10,
            }, stateCallback, true, 'Get platform runSate');
        }, 60 * 1000);

    }
    var calculateDate = {
        compute: function (y_m_Arr, type) {
            var y = y_m_Arr[0], m = y_m_Arr[1],
                m_int = parseInt(m), y_int = parseInt(y), y_m, y_m_str;
            if (type == 'prev') {

                if (m_int == 1) {
                    m_int = 12;
                    y_int -= 1;
                } else {
                    m_int -= 1;
                }

            } else if (type == 'next') {

                if (m_int == 12) {
                    m_int = 1;
                    y_int += 1;
                } else {
                    m_int += 1;
                }

            }
            if (m_int < 10) {
                m = '0' + m_int;
            } else {
                m = m_int;
            }
            y_m = [y_int, m].join('-');
            y_m_str = y_int + lang.storage.year + m + lang.storage.month;
            return {
                'y_m': y_m,
                'y_m_str': y_m_str
            };
        },
        showStatus: function () {
            //var newDate=new Date();
            //var mymonth=newDate.getMonth();
            var liDay = beforeDay1("2016", "10");
            for (var i = 0; i < 31; i++) {
                if (i < 9) {
                    liDay += '<li class="day status-1">' +
                            //'<i class="fa fa-circle"></i>'+
                        '<span>' + '0' + (i + 1) + '</span>' +
                        '</li>';
                } else {
                    liDay += '<li class="day status-1">' +
                            //'<i class="fa fa-circle"></i>'+
                        '<span>' + (i + 1) + '</span>' +
                        '</li>';
                }

            }
            $('.calendar').append(liDay);
        }
    };
    //获取当前时间
    function DateDemo() {
        var d, s;
        d = new Date();
        s = d.getFullYear() + "/";
        s += (d.getMonth() + 1) + "/";
        s += d.getDate();
        return (s);
    }

    // 展示年月，比较当前显示时间、部署时间和系统时间来判断是否置灰月份翻页
    function displayTime() {
      var showDate = showYear + lang.storage.year + showMonth + lang.storage.month;
      $('#curDate').text(showDate);
      var parseShowYear = parseInt(showYear);
      var parseShowMonth = parseInt(showMonth);
      $('.status .js-next').addClass('dis');
      $('.status .js-prev').addClass('dis');
      if ( (deployYear < parseShowYear) || (deployYear == parseShowYear && deployMonth < parseShowMonth) ) {
        $('.status .js-prev').removeClass('dis');
      }
      if ( (sysYear > parseShowYear) || (sysYear == parseShowYear && sysMonth > parseShowMonth) ) {
        $('.status .js-next').removeClass('dis');
      }
    }

    // 获取初次部署时间和系统时间
    var deployCallback = function(result) {
      if (result == undefined) {
        return;
      }
      if (result.code == 200) {
        var deployTime = moment.unix(result.result['init-time']).format('YYYY/MM/DD');
        var sysTime = moment.unix(result.result['now-time']).format('YYYY/MM/DD');
        var deployArr = deployTime.split('\/');
        var sysArr = sysTime.split('\/');
        deployYear = parseInt(deployArr[0]);
        deployMonth = parseInt(deployArr[1]);
        deployDay = parseInt(deployArr[2]);
        sysYear = parseInt(sysArr[0]);
        sysMonth = parseInt(sysArr[1]);
        sysDay = parseInt(sysArr[2]);
        // 若系统年月小于当前年月
        if ( (sysYear && sysYear < parseInt(curYear)) || (sysYear == parseInt(curYear) && sysMonth < parseInt(curMonth)) ) {
          showYear = sysYear;
          showMonth = sysMonth < 10 ? '0' + sysMonth : sysMonth;
        }
        // displayTime();
        // showStatus();
      } else {
        DisplayTips(result.result);
      }
      displayTime();
      showStatus();
    }
    DataModel['getInitTime'](null, deployCallback, true, null);

    //时间翻页
    $(document).delegate('.status .js-prev,.status .js-next', 'click', function (event) {
        var that = $(this);
        var split_year = $('#curDate').text().split(lang.storage.year);
        var year = parseInt(split_year[0]);
        var month = parseInt(split_year[1].split(lang.storage.month)[0]);
        var eleSpan = that.siblings('span');
        var type = that.data('type');
        var newDate = '';
        if (type === 'prev') {
            if (that.hasClass('dis')) {
              DisplayTips(lang.optlog.not_choose_month_before_deploy);
              return;
            }
            if (month <= 10 && month > 1) {
                month = "0" + (month - 1);
            } else if (month <= 12 && month > 10) {
                month = month - 1;
            } else if (month = 1) {
                month = 12;
                year = year - 1;
            }
        }
        if (type === 'next') {
            if (that.hasClass('dis')) {
              DisplayTips(lang.optlog.not_choose_future_month);
              return;
            }
            if (month < 9 && month >= 1) {
                month = "0" + (month + 1);
            } else if (month < 12 && month >= 9) {
                month = month + 1;
            } else if (month = 12) {
                month = "01";
                year = year + 1;
            }
        }
        showYear = year;
        showMonth = month;
        displayTime();
        showStatus();
    });

    $(document)
    //日历焦点变化
        .on('mouseover', '.week_body .day', function (ev) {
            $this = $(this);
            var str = $('#curDate').html().substring(0, 4) + '-' + $('#curDate').html().substring(5, 7) + '-';
            var mychooseday = str + $this.find('span').html();
            if (myday.indexOf(mychooseday) >= 0) {
                // $this.addClass('status-1');
                // $this.find('span').css({display: "block"});
                // $this.css('background-color', '#f6f6f6');
                $this.siblings().removeClass('disk-mouseover');
                $this.removeClass('disk-mouseover').addClass('disk-mouseover');
                clearInterval(timer);
                popverMouseover($this);
                $popver = $('#smart');
                $el = $this;
                popverPosition($popver, $el, 'topleft');
            }
        })
        .delegate('#smart', 'mouseover', function (ev) {
            var $this = $(this);
            clearInterval(timer);
            popverMouseover($('.disk-mouseover'));
            $popver = $('#smart');
            $el = $('.disk-mouseover');
            popverPosition($popver, $el, 'topleft');
        })
        .on('mouseout', '.week_body .day', function (ev) {
            $this = $(this);
            var str = $('#curDate').html().substring(0, 4) + '-' + $('#curDate').html().substring(5, 7) + '-';
            var mychooseday = str + $this.find('span').html();
            if (myday.indexOf(mychooseday) >= 0) {
                // $this.removeClass('status-1');
                // $this.find('span').css({display: "none"});
                // $(this).css('background-color', '#fff');
                if (timer) {
                    clearTimeout(timer);
                }
                $popver = $('#smart');
                timer = setTimeout(popverOut($popver), 300);
            }
        })
        .delegate('#smart', 'mouseout', function (ev) {
            $popver = $('#smart');
            popverOut($popver);
        })
        //以下四个移入移出事件用来处理，鼠标可以移到显示分区详情的popver框上
        .delegate('.load_one .load_pic', 'mouseover', function (ev) {
            clearInterval(timer);
            $this = $(this);
            $this.css('background-color', '#f6f6f6');
            $part = $this.closest('.load_one');
            $popver = $('#js-popver-load');
            mouseoverPart($this, $part, $popver);
        })
        .delegate('#js-popver-load', 'mouseover', function (ev) {
            clearInterval(timer);
            $this = $(this);
            $part = $('.load_one.part-mouseover');
            $el = $part.find('.load_pic');
            $popver = $('#js-popver-load');

            mouseoverPart($el, $part, $popver);
        })
        .delegate('.load_one .load_pic', 'mouseout', function (ev) {
            $this = $(this);
            $this.css('background-color', '#fff');
            $popver = $('#js-popver-load');
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(popverOut($popver), 300);
        })
        .delegate('#js-popver-load', 'mouseleave', function (ev) {
            $popver = $('#js-popver-load');
            popverOut($popver);
        })
        // 左侧关闭节点移入移出
        .delegate('.js-node-off-box', 'mouseover', function(ev) {
          var $this = $(this);
          if ($this.data('num') == 0 || !$this.data('num')) {
            return;
          }
          clearInterval(timer);
          $el = $this;
          $popver = $('#js-popver-nodeoff');
          mouseoverNodeOff($el, $popver);
        })
        .delegate('#js-popver-nodeoff', 'mouseover', function(ev) {
          var $this = $(this);
          clearInterval(timer);
          $el = $('.js-node-off-box');
          $popver = $('#js-popver-nodeoff');
          mouseoverNodeOff($el, $popver);
        })
        .delegate('.js-node-off-box', 'mouseout', function(ev) {
          $this = $(this);
          $popver = $('#js-popver-nodeoff');
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(popverOut($popver), 300);
        })
        .delegate('#js-popver-nodeoff', 'mouseout', function(ev) {
          popverOut($(this));
        })
        // 左侧授权即将过期节点移入移出
        .delegate('.js-node-expire-box', 'mouseover', function(ev) {
          var $this = $(this);
          if ($this.data('num') == 0 || !$this.data('num')) {
            return;
          }
          clearInterval(timer);
          $el = $this;
          $popver = $('#js-popver-nodeexpire');
          mouseoverNodeExpire($el, $popver);
        })
        .delegate('#js-popver-nodeexpire', 'mouseover', function(ev) {
          var $this = $(this);
          clearInterval(timer);
          $el = $('.js-node-expire-box');
          $popver = $('#js-popver-nodeexpire');
          mouseoverNodeExpire($el, $popver);
        })
        .delegate('.js-node-expire-box', 'mouseout', function(ev) {
          $this = $(this);
          $popver = $('#js-popver-nodeexpire');
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(popverOut($popver), 300);
        })
        .delegate('#js-popver-nodeexpire', 'mouseout', function(ev) {
          popverOut($(this));
        })
        // 左侧不健康磁盘移入移出
        .delegate('.js-disk-unhealth-box', 'mouseover', function(ev) {
          var $this = $(this);
          if ($this.data('num') == 0) {
            return;
          }
          clearInterval(timer);
          $el = $this;
          $popver = $('#js-popver-disk-unhealth');
          mouseoverDiskUnhealth($el, $popver);
        })
        .delegate('#js-popver-disk-unhealth', 'mouseover', function(ev) {
          var $this = $(this);
          clearInterval(timer);
          $el = $('.js-disk-unhealth-box');
          $popver = $('#js-popver-disk-unhealth');
          mouseoverDiskUnhealth($el, $popver);
        })
        .delegate('.js-disk-unhealth-box', 'mouseout', function(ev) {
          $this = $(this);
          $popver = $('#js-popver-disk-unhealth');
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(popverOut($popver), 300);
        })
        .delegate('#js-popver-disk-unhealth', 'mouseout', function(ev) {
          popverOut($(this));
        })
        // 实时健康状态警告或错误移入移出
        .delegate('.js-health-status', 'mouseover', function(ev) {
          var $this = $(this);
          if ($this.data('count') == 0) {
            return;
          }
          clearInterval(timer);
          $el = $this;
          $popver = $('#js-popver-health-status');
          mouseoverHealthStatus($el, $popver);
        })
        .delegate('#js-popver-health-status', 'mouseover', function(ev) {
          clearInterval(timer);
          var $this = $(this);
          $el = $('.js-health-status.health-mouseover');
          $popver = $('#js-popver-health-status');
          mouseoverHealthStatus($el, $popver);
        })
        .delegate('.js-health-status', 'mouseout', function(ev) {
          $this = $(this);
          $popver = $('#js-popver-health-status');
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(popverOut($popver), 300);
        })
        .delegate('#js-popver-health-status', 'mouseout', function(ev) {
          popverOut($(this));
        })

    // 带宽图表和IOPS图表
    var listStatisChart = function() {
      require(
        [
          'echarts',
          'echarts/chart/line',
        ],
        function(ec) {
          var myChart = ec.init(document.getElementById('broadbandStatis'));
          var option = {
            backgroundColor: '#fff',
            title: {
              text: lang.statis.broadband,
              padding: 0,
            },
            tooltip: {
              trigger: 'axis',
              formatter: function (params,ticket,callback) {
                return lang.statis.stime + '：' + params[0].name + '<br>' +
                  params[0]['seriesName'] + '：' + params[0].value + ' MB/S' + '<br>' +
                  params[1]['seriesName'] + '：' + params[1].value + ' MB/S';
              },
              backgroundColor: '#fff',
              borderColor: '#ccc',
              borderRadius: 0,
              borderWidth: 1,
              padding: 10,
              textStyle: {
                color: '#333',
              },
              axisPointer: {
                lineStyle: {
                  color: '#BFD9EB',
                },
              },
            },
            legend: {
              data: [ lang.statis.read, lang.statis.write ],
              x: 'right',
            },
            calculable : true,
            xAxis: [
              {
                type: 'category',
                boundaryGap : true,
                splitLine : {show : false},
                axisLine: {
                  lineStyle: {
                    color: '#BFD9EB',
                  },
                },
                data: (function() {
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
            yAxis: [
              {
                type: 'value',
                scale: true,
                name: 'MB/S',
                nameTextStyle: {
                  color: '#333',
                },
                boundaryGap: [0, 0],
                axisLine: {
                  lineStyle: {
                    color: '#BFD9EB',
                  },
                },
              }
            ],
            grid: {
              x: 37,
              y: 50,
              x2: 10,
              y2: 25,
            },
            series: [
              {
                name: lang.statis.read,
                type:'line',
                smooth:true,
                // symbol: 'none',
                itemStyle: {
                  normal: {
                    color: '#2C82BE',
                  },
                },
                data: (function() {
                  var res = [];
                  var len = 10;
                  while (len--) {
                    res.push(0);
                  }
                  return res;
                })()
              },
              {
                name: lang.statis.write,
                type:'line',
                smooth:true,
                // symbol: 'none',
                itemStyle: {
                  normal: {
                    color: '#04965A',
                  },
                },
                data: (function() {
                  var res = [];
                  var len = 10;
                  while (len--) {
                    res.push(0);
                  }
                  return res;
                })()
              },
            ],
          };

          var iopsChart = ec.init(document.getElementById('iopsStatis'));
          var iopsOption = {
            backgroundColor: '#fff',
            title: {
              text: 'IOPS',
              padding: 0,
            },
            tooltip: {
              trigger: 'axis',
              formatter: function (params,ticket,callback) {
                return lang.statis.stime + '：' + params[0]['name'] + '<br>' +
                params[0]['seriesName'] + '：' + params[0]['value'] + ' 次/S' + '<br>'+
                params[1]['seriesName'] + '：' + params[1]['value'] + ' 次/S' + '<br>';
              },
              backgroundColor: '#fff',
              borderColor: '#ccc',
              borderRadius: 0,
              borderWidth: 1,
              textStyle: {
                color: '#333',
              },
              axisPointer: {
                lineStyle: {
                  color: '#BFD9EB',
                },
              },
            },
            legend: {
              data: [ lang.statis.read, lang.statis.write ],
              x: 'right',
            },
            calculable : true,
            xAxis: [
              {
                type: 'category',
                boundaryGap : true,
                splitLine : {show : false},
                axisLine: {
                  lineStyle: {
                    color: '#BFD9EB',
                  },
                },
                data: (function() {
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
            yAxis: [
              {
                type: 'value',
                scale: true,
                name: '次/S',
                nameTextStyle: {
                  color: '#333',
                },
                boundaryGap: [0, 0],
                axisLine: {
                  lineStyle: {
                    color: '#BFD9EB',
                  },
                },
              }
            ],
            grid: {
              x: 37,
              y: 50,
              x2: 10,
              y2: 25,
            },
            series: [
              {
                name: lang.statis.read,
                type: 'line',
                smooth: true,
                // symbol: 'none',
                itemStyle: {
                  normal: {
                    color: '#2C82BE',
                  },
                },
                data: (function() {
                  var res = [];
                  var len = 10;
                  while (len--) {
                    res.push(0);
                  }
                  return res;
                })()
              },
              {
                name: lang.statis.write,
                type: 'line',
                smooth: true,
                // symbol: 'none',
                itemStyle: {
                  normal: {
                    color: '#04965A',
                  },
                },
                data: (function() {
                  var res = [];
                  var len = 10;
                  while (len--) {
                    res.push(0);
                  }
                  return res;
                })()
              },
            ],
          };

          var axisData;
          clearInterval(timeTicket);
          timeTicket = setInterval(function (){
            var callback = function(result) {
              if (result == undefined) { return; }
              if (result.code == 200) {
                var data = '';
                data = result.result;
                for (var i = 0; i < data.length; i++) {
									if ( data[i]['name'] == 'summary' ) {
                    ropData = parseInt(data[i].r_op);
                    wopData = parseInt(data[i].w_op);
									}
								};
              } else {
                // DisplayTips(result.result);
                ropData = [];
                wopData = [];
              }
            }
            var bwCallback = function(result) {
              if (result == undefined) { return; }
              if (result.code == 200) {
                var bwData = result.result;
                rData = (bwData.bytes_sent/1024/1024).toFixed(2); // 单位从字节转换为MB
                wData = (bwData.bytes_recv/1024/1024).toFixed(2);
              } else {
                DisplayTips(result.result);
                rData = [];
                wData = [];
              }
            }
            var param = {
              'ips': ipsParam,
            };
            DataModel['getPoolStatis']({'poolname': ''}, callback, true, null);
            DataModel['getExtBandwidth'](param, bwCallback, true, null);
            axisData = (moment().add(diff, 'milliseconds').format('HH:mm:ss'));

            // 动态数据接口 addData
            myChart.addData([
              [
                0,        // 系列索引
                rData, // 新增数据
                false,    // 新增数据是否从队列头部插入
                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
                axisData  // 坐标轴标签
              ],
              [
                1,        // 系列索引
                wData, 		// 新增数据
                false,     // 新增数据是否从队列头部插入
                false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
              ]
            ]);

            // 动态数据接口 addData
            iopsChart.addData([
              [
                0,        // 系列索引
                ropData, // 新增数据
                false,    // 新增数据是否从队列头部插入
                false,    // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
                axisData  // 坐标轴标签
              ],
              [
                1,        // 系列索引
                wopData, 		// 新增数据
                false,     // 新增数据是否从队列头部插入
                false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
              ]
            ]);
          }, 5*1000);
          // 为echarts对象加载数据
			    myChart.setOption(option);
          iopsChart.setOption(iopsOption);
        }
      );
    }
    listStatisChart();

    // 移入到关闭节点详细信息上，显示相关的信息
    function mouseoverNodeOff($el, $popver) {
      var htm = '';
      var offNodes = $el.data('info');
      $('#js-popver-nodeoff .js-off-title').find('span').text($el.data('num'));
      for (var i = 0; i < offNodes.length; i++) {
        htm += '<tr><td>';
        htm += offNodes[i].hostname;
        htm += ' </td><td>';
        htm += offNodes[i].ip;
        htm += ' </td></tr>';
      }
      $('#js-popver-nodeoff table tbody').html(htm);
      popverPosition($popver, $el);
    }
    // 移入到授权即将过期节点详细信息上，显示相关的信息
    function mouseoverNodeExpire($el, $popver) {
      var htm = '';
      var expireNodes = JSON.parse(($el.data('info')).replace(/'/g, '"'));
      $('#js-popver-nodeexpire .js-expire-title').find('span').text($el.data('num'));
      for (var i = 0; i < expireNodes.length; i++) {
        htm += '<tr><td>';
        htm += expireNodes[i]['hostname'];
        htm += ' </td><td>';
        htm += expireNodes[i]['ip'];
        htm += ' </td><td>';
        htm += expireNodes[i]['days'] + lang.per_day;
        htm += ' </td></tr>';
      }
      $('#js-popver-nodeexpire table tbody').html(htm);
      popverPosition($popver, $el);
    }
    // 移入到不健康磁盘详细信息上，显示相关的信息
    function mouseoverDiskUnhealth($el, $popver) {
      var htm = '';
      var unhealthDisk = $el.data('info');
      $('#js-popver-disk-unhealth .js-unhealth-title').find('span').text($el.data('num'));
      for (var i = 0; i < unhealthDisk.length; i++) {
        htm += '<tr><td>';
        htm += unhealthDisk[i]['hostname'];
        htm += ' </td><td>';
        htm += unhealthDisk[i]['path'];
        htm += ' </td></tr>';
      }
      $('#js-popver-disk-unhealth table tbody').html(htm);
      popverPosition($popver, $el);
    }
    // 移入到实时健康状态告警或错误详细信息上，显示相关的信息
    function mouseoverHealthStatus($el, $popver) {
      $el.siblings().removeClass('health-mouseover');
      $el.removeClass('health-mouseover').addClass('health-mouseover');
      var count = $el.data('count');
      var details = $el.data('details');
      var htm = '';
      var title = '';
      if ($el.hasClass('warn')) {
        title = count + lang.node.warn_mes;
      } else if ($el.hasClass('error')) {
        title = count + lang.node.error_mes;
      }
      $('#js-popver-health-status .js-status-title').text(title);
      for (var i = 0; i < details.length; i++) {
        htm += '<tr><td>';
        htm += details[i].hostname;
        htm += ' </td><td>';
        htm += details[i].detail;
        htm += ' </td><td>';
        htm += moment.unix( details[i].time ).format('YYYY.MM.DD HH:mm:ss');
        htm += ' </td></tr>';
      }
      $('#js-popver-health-status table tbody').html(htm);
      popverPosition($popver, $el, 'bottomleft');
    }
    //移入到分区路径上，显示相关的信息
    function mouseoverPart($el, $part, $popver) {
        $part.siblings().removeClass('part-mouseover');
        $part.removeClass('part-mouseover').addClass('part-mouseover');
        if ($el.data('level') == 'unknown' || !$el.data('level')) {
          return;
        }
        var mem = $el.data('mem') + '%';
        var cpu = $el.data('cpu') + '%';
        var io = $el.data('io') + '%';
        var disk = $el.data('disk') + '%';
        var net = $el.data('net') + '%';
        var sessions = $el.data('sessions');
        var level = $el.data('level');
        var services = $el.data('services').length == 0 ? [] : JSON.parse(($el.data('services')).replace(/'/g, '"'));

        $('#js-popver-load .js-used-memory').text(mem);
        $('#js-popver-load .js-used-cpu').text(cpu);
        $('#js-popver-load .js-used-io').text(io);
        $('#js-popver-load .js-used-disk').text(disk);
        $('#js-popver-load .js-used-net').text(net);
        $('#js-popver-load .js-used-sessions').text(sessions);
        $('#js-popver-load .js-used-status').text(level);
        if (services.length == 0) {
          $('#js-popver-load .js-abnormal-services').html('<div class="use-cont"><span>' + lang.node.no_abnormal_service + '</span></div>');
        } else {
          var htm = '';
          var abnormaMap = {'2': lang.stopped, '3': lang.fail, '4': lang.unknown};
          for (var i = 0; i < services.length; i++) {
            var status = services[i].status;
            htm += '<div class="use-cont"><span>' + services[i].name + '&nbsp;' + abnormaMap[status] + '</span></div>'
          }
          $('#js-popver-load .js-abnormal-services').html(htm);
        }

        popverPosition($popver, $el);
    }
    //移到磁盘健康状态上，显示smart详情的popver框
    function popverMouseover(el) {
        var htm = "";
        var alertNum = el.find('#alert_detail').data('num');
        $("#smart .popover-title").html(el.find('#alert_detail').data('date') + " " + lang.disk.alert_info);
        for (var i = 0; i < alertNum; ++i) {
            htm += "<tr><td>";
            htm += el.find('#alert_detail span:eq(' + i + ')').data('time');
            htm += "</td><td>";
            htm += el.find('#alert_detail span:eq(' + i + ')').data('user');
            htm += "　</td><td>";
            htm += el.find('#alert_detail span:eq(' + i + ')').data('message');
            htm += "　</td><td>";
            htm += "　</td></tr>";
        }

        $("#smart .dt_dtable_body table tbody").html(htm);
        $("#smart").css("display", "inline-block");
        adjustSMART();
    }

    // 跳转告警详细信息的
    function adjustSMART() {
        var tdws = new Array()
        $(".dt_dtable_body table tbody tr:first td").each(function () {
            var tdw = $(this).width();
            tdws[tdws.length] = tdw + 10;
        });

        // 有滚动条时菜单偏右
        var obj = $(".dt_dtable_body");
        if (obj != undefined) {
            if (obj.scrollHeight > obj.clientHeight || obj.offsetHeight - 4 > obj.clientHeight) {
                $(".dt_dtable_head").css("padding-right", "25px");
            } else {
                $(".dt_dtable_head").css("padding-right", "9px");
            }
        }
        if (tdws.length != 0) {
            var i = 0;
            $(".dt_dtable_head table thead tr:first th").each(function () {
                $(this).width(tdws[i]);
                ++i;
            });
        }
    }
});
