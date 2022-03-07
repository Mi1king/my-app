import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Buoy, MassMarker, Project } from '../interfaces';
import { Lan } from '../interfaces';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DriftingBuoy, OneData, Position } from '../interfaces';
import { Data } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BuoyService } from '../buoy.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzFormTooltipIcon } from 'ng-zorro-antd/form';
import { Utility, DateFormatOption } from '../helper';
import { Timestamp } from 'rxjs/internal/operators/timestamp';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';
import { NzMarks } from 'ng-zorro-antd/slider';
// import * as $ from 'jQuery';
declare let $: any;
declare var AMap: any;
declare var AMapUI: any;
declare var RemoGeoLocation: any;

// 为速度和进度创建range slider
declare var speedSlider: any;
declare var processSlider: any;
var VEHICLE_PLAY_PROCESS = 0; //车辆当前回放到的百分比进度
var VEHICLE_PATH_REPLAY_START = 0;//当前回放的起点索引, 
// 改变速度和改变进度条的时候，根据进度条百分比重新计算该数值，并从该位置开始再次回放
var routeInfo: any[] = [];


@Component({
  selector: 'app-new-map',
  templateUrl: './new-map.component.html',
  styleUrls: ['./new-map.component.scss']
})


export class NewMapComponent implements OnInit {

  //new
  isTrackingMode = true;
  timeFormatStr = 'yyyy-MM-dd HH:mm:ss';
  // dateRange: Date[] = [];
  //data from database
  buoyList: Buoy[] = [];
  projectList: Project[] = [];
  positionList: Position[] = [];

  showingBuoy: Buoy = {
    id: -1,
    name: "",
    imei: "",
    projectId: -1,
  };
  showingProject: Project = {
    id: -1,
    name: "",
    createtime: new Date(),
    description: "",
  };






  NewBuoyId: number = -1;

  buoyForm!: FormGroup;
  projectForm!: FormGroup;
  buoyFormVisible = false;
  projectFormVisible = false;
  addBuoyFormVisible = false;
  addProjectFormVisible = false;

  getBuoyList() {
    this.buoyService.getAllBuoy().subscribe(p => this.buoyList = p.data.list);
  }
  getProjectList() {
    this.buoyService.getAllProject().subscribe(p => this.projectList = p.data.list);
  }
  getPositionList(buoy: any) {
    // if (this.dateRange.length <= 0) {
    if (this.selectedStartDate == null || this.selectedEndDate == null) {
      this.createMessage("info", "choose date range first");
    } else {
      let dateRange = [Utility.formatDate(this.selectedStartDate, this.timeFormatStr), Utility.formatDate(this.selectedEndDate, this.timeFormatStr)];
      console.log('imei:', buoy.imei);
      console.log('start time:', dateRange[0]);
      console.log('end time:', dateRange[1]);
      this.buoyService.getConditionalPosition(buoy, dateRange).subscribe(p => {
        // this.loading = false;
        this.positionList = p.data.list;
        // console.log(this.positionList);

        let historyPositionList = this.filterPositionBuoy(buoy)
        if (historyPositionList.length <= 0) {
          console.log("no data with buoy:", buoy.imei);
        } else {
          console.log("start with buoy:", buoy.imei);
            this.gethistorical(historyPositionList);
            this.showPositions(historyPositionList);
        }
      })
    }
  }

  showBuoyInfo(buoy: Buoy) {
    this.showingBuoy = buoy;
    this.buoyFormOpen();
  }
  showProjectInfo(project: Project) {
    this.showingProject = project;
    this.projectFormOpen();
  }

  addBuoyFormOpen(): void {
    this.addBuoyFormVisible = true;
    console.log("add buoy form open");
  }

  addProjectFormOpen(): void {
    this.addProjectFormVisible = true;
    console.log("add project form open");
  }

  buoyFormOpen(): void {
    this.buoyFormVisible = true;
    console.log("buoy form open");
  }

  buoyFormClose(): void {
    this.buoyFormVisible = false;
    console.log("buoy form close");
  }
  addBuoyFormClose(): void {
    this.addBuoyFormVisible = false;
    console.log("add buoy form close");
  }
  addProjectFormClose(): void {
    this.addProjectFormVisible = false;
    console.log("add project form close");
  }


  projectFormOpen(): void {
    this.projectFormVisible = true;
    console.log("project form open");
  }

  projectFormClose(): void {
    this.projectFormVisible = false;
    console.log("project form close");
  }


  // 添加新游标
  addBuoy(): void {
    console.log('add buoy');
    if (this.buoyForm.valid) {
      console.log(this.buoyForm.value, this.buoyService.addBuoy(this.buoyForm.value));
    } else {
      Object.values(this.buoyForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      console.log("fail");
    }
  }

  deleteBuoy(): void {
    console.log("delete buoy", this.showingBuoy);

    this.buoyService.deleteBuoy(this.showingBuoy);
  }

  // 更新游标信息
  submitBuoyForm(): void {
    console.log('update buoy');
    if (this.buoyForm.valid) {
      console.log(this.buoyForm.value, this.buoyService.updateBuoy(this.buoyForm.value));
    } else {
      Object.values(this.buoyForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      console.log("fail");
    }
  }


  // 添加新项目
  addProject(): void {
    console.log('add project');
    if (this.projectForm.valid) {
      console.log(this.projectForm.value, this.buoyService.addProject(this.projectForm.value));
    } else {
      Object.values(this.projectForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      console.log("fail");
    }
  }

  deleteProject(): void {
    console.log("delete project", this.showingProject);
    this.buoyService.deleteProject(this.showingProject);
  }


  updateProject(): void {
    console.log('update prject')
    if (this.projectForm.valid) {
      console.log(this.projectForm.value, this.buoyService.updateProject(this.projectForm.value));
    } else {
      Object.values(this.projectForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      console.log("fail");
    }
  }










  getBuoyInProject(project: any): any[] {
    let buoy = this.buoyList.filter(p => p.projectId === project.id);
    console.log("Buoy in project ", project.id, " is ", buoy);
    return buoy;
  }



  //old
  city = '苏州';
  zoom = 12;
  viewMode = "3D";
  languageList = [{ lable: 'English', value: 'en' },
  { lable: 'Chinese', value: 'zh_cn' },
  { lable: 'ChineseEnglish', value: 'zh_en' }];
  selectedValue = this.languageList[0];
  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.value === o2.value : o1 === o2);

  map: any;

  positions: Lan[] = [];
  data: OneData[] = [];

  driftingBuoyList: DriftingBuoy[] = [];

  massMarkerData: MassMarker[] = [];

  project_list = [{ label: 'Project 1', value: '1' },
  { label: 'Projet 2', value: '2' },
  { label: 'Real Data', value: '11', checked: true }];

  isTracking = false;
  trackingMarker: any[] = []; //实时存储正在回放的游标Marker
  currentTrackingLineList: any[] = []; //实时存储正在回放的线

  massMarkerStyle = [{
    //   url: 'https://a.amap.com/jsapi_demos/static/images/mass0.png',
    //   anchor: new AMap.Pixel(6, 6),
    //   size: new AMap.Size(11, 11)
    // }, {
    //   url: 'https://a.amap.com/jsapi_demos/static/images/mass1.png',
    //   anchor: new AMap.Pixel(4, 4),
    //   size: new AMap.Size(7, 7)
    // }, {
    url: 'https://a.amap.com/jsapi_demos/static/images/mass2.png',
    anchor: new AMap.Pixel(3, 3),
    size: new AMap.Size(5, 5)
  }
  ];
  constructor(
    private buoyService: BuoyService,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.buoyForm = new FormGroup({
      id: new FormControl(null, Validators.required),
      name: new FormControl(null, Validators.required),
      imei: new FormControl(null, Validators.required),
      projectId: new FormControl(null, Validators.required),
    });

    this.projectForm = new FormGroup({
      id: new FormControl(null, Validators.required),
      name: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required),
      createtime: new FormControl(null, Validators.required),
    });

    // this.getPositions();
    this.getBuoyList();
    this.getProjectList();
    this.createMap();
    // this.addplugin();
    // this.addControls(this.map);
    // this.showPositions();
    // this.makerTrackback();

    speedSlider = $("#ionrange_speed").ionRangeSlider({
      min: 1,
      max: 10,
      step: 0.5,
      from: 5,
      prefix: "x",
      prettify: false,
      hasGrid: true,
      onFinish(data: any): void {
        console.log(this);
        console.log(data);

        // if (this.carMarker) {
        //   carMarker.stopMove();
        // }
        // // 拖动速度条，放下后触发： 设定车辆速度为当前指定的速度
        // carSpeed = data.from * 1000;
        // VEHICLE_PATH_REPLAY_START = Math.round(routeInfo.length * VEHICLE_PLAY_PROCESS / 100);
        // playCar();
      },
    });
    processSlider = $("#ionrange_process").ionRangeSlider({
      min: 0,
      max: 100,
      step: 1,
      from: 0,
      postfix: "%",
      prettify: false,
      hasGrid: true,
      onUpdate(data: any): void {
        //车辆移动的时候，使用JS方法更新进度条，触发该方法： 记录车辆回放的进度
        VEHICLE_PLAY_PROCESS = data.from;
      },
      // onChange: function (data: any) {
      //   //手动拖动进度条过程中触发：移动车辆，定位车辆回放位置
      //   var currentIndex = Math.round(routeInfo.length * data.from / 100);
      //   var vehicleLocation = routeInfo[currentIndex];
      //   carMarker.setPosition(new AMap.LngLat(vehicleLocation.lng, vehicleLocation.lat));
      // },
      onFinish: function (data: any) {
        //拖动进度条，确定释放后触发，从当前位置开始回放
        VEHICLE_PLAY_PROCESS = data.from;
        // VEHICLE_PATH_REPLAY_START = Math.round(routeInfo.length * VEHICLE_PLAY_PROCESS / 100);
        // playCar();
      }
    });

  }

  addControls(map: any) {
    // //设置DomLibrary，jQuery或者Zepto
    // AMapUI.setDomLibrary($);

    // //加载BasicControl，loadUI的路径参数为模块名中 'ui/' 之后的部分
    // AMapUI.loadUI(['control/BasicControl'], function (BasicControl: any) {

    //   //缩放控件
    //   map.addControl(new BasicControl.Zoom({
    //     position: 'lt', //left top，左上角
    //     showZoomNum: true //显示zoom值
    //   }));

    //   //图层切换控件
    //   map.addControl(new BasicControl.LayerSwitcher({
    //     position: 'rt' //right top，右上角
    //   }));

    //   //实时交通控件
    //   map.addControl(new BasicControl.Traffic({
    //     position: 'lb'//left bottom, 左下角
    //   }));
    // });
  }

  addplugin() {
    let customMarker = new AMap.Marker({
      // 这个是在高德API里面的参考手册的基础类里面
      // 自定义偏移量
      offset: new AMap.Pixel(-14, -34), // 使用的是Pixel类
      // 这个是在高德API里面的参考手册的覆盖物里面
      //  自定义图标
      icon: new AMap.Icon({ // 复杂图标类
        // 设定图标的大小
        size: new AMap.Size(27, 36),
        // 图片地址
        imgae: '//vdata.amap.com/icons/b18/1/2.png',
        imageOffset: new AMap.Pixel(-28, 0)// 相对于大图的取图位置
      })
    });
    //  添加地图插件：地图工具条
    this.map.plugin(['AMap.ToolBar'], () => {
      // 设置地位标记为自定义标
      let toolBar = new AMap.ToolBar({
        locationMarker: customMarker
      });
      //  添加插件
      this.map.addControl(new toolBar);
    });
    //  添加比例尺插件
    this.map.plugin(['AMap.Scale'], () => {
      //   初始化插件
      let scale = new AMap.Scale();
      //   加载插件
      this.map.addControl(new scale);
    });
    //  加载地图实景
    this.map.plugin(["AMap.MapType"], () => {
      let type = new AMap.MapType();
      this.map.addControl(type);
    });
    // //  加载鹰眼
    this.map.plugin(["AMap.OverView"], () => {
      let view = new AMap.OverView({
        // 鹰眼是否展示
        visible: true,
        // 鹰眼是否展开
        isOpen: true
      });
      this.map.addControl(view);
      // 调用方法 显示鹰眼窗口
      view.show();
    });
    // 添加定位
    this.map.plugin('AMap.Geolocation', () => {
      let geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, // 是否使用高精度定位，默认:true
        timeout: 10000,          // 超过10秒后停止定位，默认：无穷大
        maximumAge: 0,           // 定位结果缓存0毫秒，默认：0
        convert: true,           // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
        showButton: true,        // 显示定位按钮，默认：true
        buttonPosition: 'LB',    // 定位按钮停靠位置，默认：'LB'，左下角
        buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        showMarker: true,         //    定位成功后在定位到的位置显示点标记，默认：true
        showCircle: true,        // 定位成功后用圆圈表示定位精度范围，默认：true
        panToLocation: true,     // 定位成功后将定位到的位置作为地图中心点，默认：true
        zoomToAccuracy: true,      // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false

      });
      // 加载插件
      this.map.addControl(geolocation);
      // 调用方法 获取用户当前的精确位置信息
      geolocation.getCurrentPosition();
      //  定时刷新位置
      geolocation.watchPosition(
        2
      );
      AMap.event.addListener(geolocation, 'complete', (data: any) => {
        console.log(data);
        console.log("定位成功");
      }); //  返回定位信息
      AMap.event.addListener(geolocation, 'error', () => {
        console.log("定位失败");
      });      // 返回定位出错信息
    });
  }


  // getPositions(): void {
  //   this.positionsService.getData()
  //     .subscribe(p => this.data = p.data.list);
  // }

  createMap() {
    this.map = new AMap.Map('amapContainer', {
      resizeEnable: true,
      zoom: this.zoom,
      city: this.city,
      viewMode: this.viewMode,
      lang: this.languageList[0].value,
      mapStyle: 'amap://styles/359cd302f9c595376f3cff175297f6c6',
    });
  }

  showPositions(positionList: any[]) {
    var data: object[] = [];

    positionList.forEach((position: { id: any; longitude: any; latitude: any; driftingbuoyImei: any; sendtime: any; direction: any; speed: any; }) => {
      // console.log('DEBUG:', position.longitude, position.latitude);
      data.push(
        {
          // name: position.id,
          imei: position.driftingbuoyImei,
          lnglat: [position.longitude, position.latitude],
          sendTime: position.sendtime,
          direction: position.direction,
          speed: position.speed,
        }
      )
    });

    // 实例化 AMap.MassMarks
    var massMarks = new AMap.MassMarks(data, {
      zIndex: 199, 	// 海量点图层叠加的顺序
      zooms: [3, 19],	 // 在指定地图缩放级别范围内展示海量点图层
      opacity: 0,
      style: this.massMarkerStyle 	//多种样式对象的数组
    });

    massMarks.setMap(this.map);

    //鼠标移到mass marker上显示信息

    var marker = new AMap.Marker({ content: ' ', map: this.map });
    massMarks.on('mouseover', function (e: any) {
      marker.setPosition(e.data.lnglat);
      console.log(e.data.lnglat);

      marker.setLabel({
        content:
          [
            // ["ID:", e.data.id].join(" "),
            ["MEI:", e.data.imei].join(" "),
            ["Longitude:", e.data.lnglat.Q].join(" "),
            ["Latitude:", e.data.lnglat.R].join(" "),
            ["SendTime:", e.data.sendTime].join(" "),
            ["Direction:", e.data.direction].join(" "),
            ["Speed:", e.data.speed].join(" "),
          ].join("<br>")
      })
    });
  }

  getDataByIMEI(index: string) {
    let filterData = this.data.filter(p => p.project === Number(index));
    console.log("index: " + index);
    console.log(filterData);
    return filterData;
  }

  // showHistory(ids: string[]) {
  //   ids.forEach(id => {
  //     this.gethistorical(this.getDataByIMEI(id));
  //   });
  // } 
  showHistory(buoyList: any[]) {
    if (buoyList == undefined) {
      console.log("No buoy need to track");
    } else {
      // if (this.isTrackingMode) {//回放模式
      console.log("Prepare to tracking for buoy: ", buoyList);
      if (this.currentTrackingLineList.length > 0) {
        this.stopHistoryTracking();
      }

      buoyList.forEach(buoy => {
        this.getPositionList(buoy)
      });
      // } else {//展示历史轨迹数据模式
      //   console.log("Prepare to position for buoy: ", buoyList);
      //   buoyList.forEach(buoy => {
      //     this.showPositions(buoy);
      //   });
      // }
    }
  }

  showMassPoint(ids: string[]) {
    ids.forEach(id => {
      this.showPositions(this.getDataByIMEI(id));
    });
  }

  hideMassPoint(ids: string[]) {
    // ids.forEach(id => {
    //   this.showPositions(this.getDataByIMEI(id));
    // });
  }



  filterPositionBuoy(buoy: any): any[] {
    let positionList = this.positionList;
    let historyPositionList = positionList.filter(p => p.driftingbuoyImei === buoy.imei);
    return historyPositionList;
  }


  //轨迹回放
  gethistorical(data: any) {
    var lineArr: any[] = [];
    data.forEach((element: { longitude: any; latitude: any; }) => {
      lineArr.push([element.longitude, element.latitude])
    });
    routeInfo=lineArr;
    var marker = new AMap.Marker({
      map: this.map,
      position: lineArr[0],
      icon: "assets/res/images/DriftingBuoy30.png",
      offset: new AMap.Pixel(-15, -15),
      autoRotation: false,
      angle: 0,
    });

    this.trackingMarker.push(marker);

    // 绘制轨迹
    var polyline = new AMap.Polyline({
      map: this.map,
      path: lineArr,
      showDir: true,
      strokeColor: "#28F",  //线颜色
      // strokeOpacity: 1,     //线透明度
      strokeWeight: 6,      //线宽
      // strokeStyle: "solid"  //线样式
    });


    var passedPolyline = new AMap.Polyline({
      map: this.map,
      // path: lineArr,
      strokeColor: "#ff8040",  //线颜色
      // strokeOpacity: 1,     //线透明度
      strokeWeight: 6,      //线宽
      // strokeStyle: "solid"  //线样式
    });

    this.currentTrackingLineList.push(polyline);
    this.currentTrackingLineList.push(passedPolyline);

    marker.on('moving', function (e: any) {
      passedPolyline.setPath(e.passedPath);
    });

    this.map.setFitView();

    //开始移动
    marker.moveAlong(lineArr, 200);
    //暂停移动
    // marker.pauseMove();
    // //继续播放
    // marker.resumeMove();
    // //停止播放
    // marker.stopMove();

    //添加监听事件： 车辆移动的时候，更新速度窗体位置，记录当前回放百分比
    AMap.event.addListener(marker, 'moving',  (e:any) => {
      var lastLocation = e.passedPath[e.passedPath.length - 1];
      //移动窗体
      // carWindow.setPosition(lastLocation);
      //根据gps信息，在源数据中查询当前位置速度
      // setVehicleSpeedInWidowns(lastLocation);
      //更新进度条
      this.buoyMarkerProcess = Math.round((e.passedPath.length + VEHICLE_PATH_REPLAY_START) / routeInfo.length * 100);
      // $("#ionrange_process").data('ionRangeSlider').update({from: Math.round((e.passedPath.length + VEHICLE_PATH_REPLAY_START) / routeInfo.length * 100)})
  });
  }

  //显示游标信息方法
  infoWindow(p: Lan) {
    var content = [
      ["MEI:", p.Id as unknown as string].join(" "),
      ["Longitude:", p.Longitude].join(" "),
      ["Latitude:", p.Latitude].join(" "),
    ];

    // 创建 infoWindow 实例	
    var infoWindow = new AMap.InfoWindow({
      anchor: 'bottom-center',
      content: content.join("<br>")  //传入 dom 对象，或者 html 字符串
    });

    // 打开信息窗体
    infoWindow.open(this.map, [p.Longitude, p.Latitude]);
    console.log(content);
  }

  pauseHistoryTracking() {
    this.trackingMarker.forEach(marker => {
      marker.resumeMove();
      console.log(marker);
    });
  }

  stopHistoryTracking() {
    this.trackingMarker.forEach(marker => {
      marker.hide();
      console.log(marker);
    });

    this.currentTrackingLineList.forEach(line => {
      line.hide();
      console.log(line);
    });
  }


















  /**
   * Change map`s language
   * @param value contains language`s name (eg.'Chinese', 'English') and code (eg.'en', 'zh_cn')
   */
  changeLan(value: any) {
    try {
      this.map.setLang(value.value);
      this.createMessage("success", `Change language to ${value.lable}`);
      console.log(value);
    } catch (error) {
      this.createMessage("fail", `Fail change language to ${value.lable}\nError: ${error}`);
      console.log(value, error);
    }
  }

  createMessage(type: string, msg: string): void {
    this.message.create(type, msg);
  }



  //dev method
  logBuoyListDev(): void {
    console.log('current buoy list:', this.buoyList);
  }
  logPositionListDev(): void {
    console.log('current position list:', this.positionList);
  }
  logPorjectListDev(): void {
    console.log('current project list:', this.projectList);
  }







  // date picker
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  @ViewChild('endDatePicker') endDatePicker!: NzDatePickerComponent;

  disabledStartDate = (selectedStartDate: Date): boolean => {
    if (!selectedStartDate || !this.selectedEndDate) {
      return false;
    }
    return selectedStartDate.getTime() > this.selectedEndDate.getTime();
  };

  disabledEndDate = (selectedEndDate: Date): boolean => {
    if (!selectedEndDate || !this.selectedStartDate) {
      return false;
    }
    return selectedEndDate.getTime() <= this.selectedStartDate.getTime();
  };

  handleStartOpenChange(open: boolean): void {
    if (!open) {
      this.endDatePicker.open();
    }
    console.log('handleStartOpenChange', open);
  }

  handleEndOpenChange(open: boolean): void {
    console.log('handleEndOpenChange', open);
  }

  baseBuoySpeed = 200;
  buoySpeed=this.baseBuoySpeed;
  buoyMarkerSpeed = 1;
  buoyMarkerProcess = 0;
  buoySpeedMarks: NzMarks = {
    1: 'x1',
    2: 'x2',
    3: 'x3',
    4: 'x4',
    5: 'x5',
    6: 'x6',
    7: 'x7',
    8: 'x8',
    9: 'x9',
    10: 'x10',
  };
  buoyProcessMarks: NzMarks = {
    // 10: '10%',
    20: '20%',
    // 30: '30%',
    40: '40%',
    // 50: '50%',
    60: '60%',
    // 70: '70%',
    80: '80%',
    // 90: '90%',
    100: '100%',
  };

  speedOnChange(value: number): void {
    console.log(`speedOnChange: ${value}`);
  }

  speedOnAfterChange(value: number[] | number): void {
    console.log(`speedOnAfterChange: ${value}`);
    if (this.trackingMarker) {
      this.trackingMarker.forEach(buoyMarker => {
        buoyMarker.stopMove();
      });
    }
    // 拖动速度条，放下后触发： 设定车辆速度为当前指定的速度
    this.buoySpeed = <number>value * this.baseBuoySpeed;
    VEHICLE_PATH_REPLAY_START = Math.round(routeInfo.length * this.buoyMarkerProcess /100); //计算出当前回放的起点index
    this.playCar();

  }


  processOnChange(value: number): void {
    //手动拖动进度条过程中触发：移动车辆，定位车辆回放位置
    console.log(`processOnChange: ${value}`);
    var currentIndex = Math.round(routeInfo.length * <number>value /100);
    var vehicleLocation = routeInfo[currentIndex];
    this.trackingMarker.forEach(buoyMarker => {
      buoyMarker.stopMove()
      buoyMarker.setPosition(new AMap.LngLat(vehicleLocation.lng, vehicleLocation.lat));
      console.log('change susss');
    });
  }
  processOnAfterChange(value: number[] | number): void {
    //拖动进度条，确定释放后触发，从当前位置开始回放
    console.log(`processOnAfterChange: ${value}`);
    VEHICLE_PLAY_PROCESS = <number>value;
    VEHICLE_PATH_REPLAY_START = Math.round(routeInfo.length * VEHICLE_PLAY_PROCESS/100);
    this.playCar();
  }



  // 车辆开始回放
  playCar(): void {
    if (this.trackingMarker) {
      this.trackingMarker.forEach(buoyMarker => {
        buoyMarker.stopMove();
      });
    }
    //计算需要回放的GPS路径
    var replayPath: any[] = [];
    for (var i = VEHICLE_PATH_REPLAY_START; i < routeInfo.length; i++) {
      replayPath.push(new AMap.LngLat(routeInfo[i].lng, routeInfo[i].lat));
    }
    this.trackingMarker.forEach(buoyMarker => {
      buoyMarker.moveAlong(replayPath, this.buoySpeed, function (k:any) {
        return k
    }, false);
    });
  }
}