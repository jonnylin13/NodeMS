import { MapleClient } from "../client";
import { MaplePet } from "./inventory/pet";
import { MapleJob } from "./job";
import { MapleSkinColor } from "./skin-color";


export class MapleCharacter {
    name: string;
    id: number;
    account_id: number;
    client: MapleClient;
    logged_in: boolean;
    gm_level: number;
    rank: number;
    rank_move: number;
    job_rank: number;
    job_rank_move: number;
    job: MapleJob;
    gender: number;
    face: number;
    hair: number;
    level: number;
    str: number;
    dex: number;
    int: number;
    luk: number;
    hp: number;
    client_max_hp: number;
    mp: number;
    client_max_mp: number;
    remaining_ap: number;
    remaining_sp: number;
    exp: number;
    fame: number;
    gacha_exp: number;
    map_id: number;
    spawn_point: number;
    skin_color: MapleSkinColor;
    pets: Array<MaplePet> = new Array(3);

    is_gm(): boolean {
        return this.gm_level > 0;
    }
}