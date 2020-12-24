import { CenterSendOpcode } from "../../protocol/opcodes/center/send";
import { PacketWriter } from "../../protocol/packets/packetWriter";
import { ServerType } from "../baseServer";


export class CenterPackets {
    static getWorkerHandshake() {
        const packet = new PacketWriter(3);
        packet.writeShort(CenterSendOpcode.WORKER_HANDSHAKE.getValue());
        packet.writeByte(ServerType.CENTER);
        return packet.getPacket();
    }

    static getPreLoginPasswordAck(found: boolean, obj: any) {
        const packetLength = (found ? obj.password.length + obj.pin.length + obj.pic.length + 14 : 0) + 9 + obj.username.length;
        const packet = new PacketWriter(packetLength);
        packet.writeShort(CenterSendOpcode.PRE_LOGIN_PASSWORD_ACK.getValue());
        packet.writeBoolean(found);
        packet.writeInt(obj.sessionId);
        if (found) {
            packet.writeInt(obj.id);
            packet.writeMapleAsciiString(obj.password);
            packet.writeByte(obj.gender);
            packet.writeBoolean(obj.banned);
            packet.writeMapleAsciiString(obj.pin);
            packet.writeMapleAsciiString(obj.pic);
            packet.writeByte(obj.character_slots);
            packet.writeBoolean(obj.tos);
            packet.writeByte(obj.language);
            return packet.getPacket();
        }

        packet.writeMapleAsciiString(obj.username);
        return packet.getPacket();
    }
}