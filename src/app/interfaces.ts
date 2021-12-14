import { Time } from "@angular/common";

export interface OneData {
    longitude: string,
    latitude: string,
    imei: string,
    project: number,
    sendtime: Time,
    speed: string,
    direction: string
}

export class DriftingBuoy {
    private buoy: Buoy = {
        id: -1,
        name: 'uncreated',
        imei: 'uncreated',
        projectId: -1,
    };

    public DriftingBuoy(buoy: Buoy) {
        this.buoy = buoy;
    }


    public get getNumber(): number {
        return this.buoy.id;
    }

    public get getName(): string {
        return this.buoy.name;
    }
    public get getIMEI(): string {
        return this.buoy.imei;
    }


}


export interface MassMarker {
    lnglat: Array<string | number>,
    name: string,
    id: number,
}

export interface Lan{
    Id: number
    Latitude: number;
    Longitude: number;
}


//database data types
export interface Buoy {
    id: number,
    imei: string,
    name: string,
    projectId: number,
}

export interface Project{
    id: number,
    name: string,
    description: string,
    createtime: Date,
}

export interface Position{
    id: number,
    driftingbuoyImei: string,
    longitude: string,
    latitude: string,
    sendtime: Date,
    direction: number,
    speed: number,
    projectId: number
}