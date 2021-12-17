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

// import * as $ from 'jquery';
declare var AMap: any;
declare var AMapUI: any;
declare var RemoGeoLocation: any;

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


  buoyForm!: FormGroup;
  projectForm!: FormGroup;
  buoyFormVisible = false;
  projectFormVisible = false;

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
        console.log(this.positionList);

        let historyPositionList = this.filterPositionBuoy(buoy)
        if (historyPositionList.length <= 0) {
          console.log("no data with buoy:", buoy.imei);
        } else {
          console.log("start with buoy:", buoy.imei);
          if (this.isTrackingMode) {
            this.gethistorical(historyPositionList);
          } else {
            this.showPositions(historyPositionList);
          }
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

  addBuoy(): void {//TODO:please complete add buoy function

  }
  addProject(): void {//TODO:please complete add project function

  }

  buoyFormOpen(): void {
    this.buoyFormVisible = true;
    console.log("buoy form open");
  }

  buoyFormClose(): void {
    this.buoyFormVisible = false;
    console.log("buoy form close");
  }


  projectFormOpen(): void {
    this.projectFormVisible = true;
    console.log("project form open");
  }

  projectFormClose(): void {
    this.projectFormVisible = false;
    console.log("project form close");
  }

  submitBuoyForm(): void {
    console.log('submit buoy');
    if (this.buoyForm.valid) {
      console.log(this.buoyForm.value, this.buoyService.updateBuoy(this.buoyForm.value));
      //TODO:compelet the buoy update form function...to database
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

  submitProjectForm(): void {
    console.log('submit prject')
    if (this.projectForm.valid) {
      console.log(this.projectForm.value, this.buoyService.updateProject(this.projectForm.value));
      //TODO:compelet the project update form function...to database
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
      project: new FormControl(null, Validators.required),
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
      zIndex: 5, 	// 海量点图层叠加的顺序
      zooms: [3, 19],	 // 在指定地图缩放级别范围内展示海量点图层
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
      marker.stopMove();
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




}