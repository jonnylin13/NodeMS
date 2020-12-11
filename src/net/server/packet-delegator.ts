import { RecvOpcode } from '../opcodes/recv';
import { MaplePacketHandler } from '../packet-handler';


export class PacketDelegator {

    static instances: Map<string, PacketDelegator> = new Map();
    private handlers: Array<MaplePacketHandler>;

    constructor() {
        let max_opcode = 0;
        for (let op of Object.values(RecvOpcode)) {
            if (op.get_value() > max_opcode) {
                max_opcode = op.get_value();
            }
        }
        this.handlers = new Array<MaplePacketHandler>(max_opcode + 1);
    }

    get_handler(packet_id: number) {
        if (packet_id > this.handlers.length) return null;
        let handler = this.handlers[packet_id];
        return handler;
    }

    register_handler(code: RecvOpcode, handler: MaplePacketHandler) {
        this.handlers[code.get_value()] = handler;
    }

    static get_processor(world: number, channel: number) {
        let lolpair = world + ' ' + channel;
        let delegator = this.instances.get(lolpair);
        if (delegator = null) {
            delegator = new PacketDelegator();
            delegator.reset(channel);
            this.instances.set(lolpair, delegator);
        }
        return delegator;
    }

    reset(channel: number) {
        // TODO: Needs implementation
    }

}