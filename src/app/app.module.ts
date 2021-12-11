import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxAmapModule } from 'ngx-amap';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { CommonModule, registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzTableModule } from 'ng-zorro-antd/table';

//ng-zorro components
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';//全局NG配置https://ng.ant.design/docs/global-config/zh
import { NzMenuModule } from 'ng-zorro-antd/menu';  //导航菜单
import { NzLayoutModule } from 'ng-zorro-antd/layout';  //layout布局
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';



import { NzButtonModule } from 'ng-zorro-antd/button';
import { NewMapComponent } from './new-map/new-map.component';
registerLocaleData(en);

import { APP_INITIALIZER } from '@angular/core';
import { AppConfig } from './app.config';

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

const ngZorroConfig: NzConfig = {
  // 注意组件名称没有 nz 前缀
  message: { nzTop: 120, nzDuration: 3000 },
  notification: { nzTop: 120 },
};

@NgModule({
  declarations: [
    AppComponent,
    NewMapComponent
  ],
  imports: [
    NzDatePickerModule,
    NzGridModule,
    NzDrawerModule,
    NzLayoutModule,
    NzMenuModule,
    CommonModule,
    NzMessageModule,
    NzSelectModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NzTableModule,
    NzButtonModule,
    NzCheckboxModule,
    NgxAmapModule.forRoot({
      apiKey: 'ae9d7720758acf7f423656134f0913e5'
    }),
    FormsModule,
  ],
  providers: [
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true
    },
    { provide: NZ_I18N, useValue: en_US },
    { provide: NZ_CONFIG, useValue: ngZorroConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
