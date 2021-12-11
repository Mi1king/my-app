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
    private driftingBuoyInDB: DriftingBuoyInDB = {
        no: -1,
        name: 'uncreated',
        imei: 'uncreated',
    };

    public DriftingBuoy(driftingBuoyInDB: DriftingBuoyInDB) {
        this.driftingBuoyInDB = driftingBuoyInDB;
    }


    public get getNumber(): number {
        return this.driftingBuoyInDB.no;
    }

    public get getName(): string {
        return this.driftingBuoyInDB.name;
    }
    public get getIMEI(): string {
        return this.driftingBuoyInDB.imei;
    }


}

export interface DriftingBuoyInDB {
    no: number,
    name: string,
    imei: string,
}

export interface Project{
    id: number,
    name: string,
    driftingbuoies: string[],
    description: string,
    createtime: Time,
}

export interface Position{
    rowid: number,
    imei: number,
    longitude: string,
    latitude: string,
    sendtime: Time,
    direction: number,
    speed: number,
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