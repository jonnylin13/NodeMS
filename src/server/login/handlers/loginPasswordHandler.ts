import { PacketReader } from "../../../protocol/packets/packetReader";
import { PacketHandler } from "../../baseHandler";
import { LoginServer } from "../loginServer";
import { Session } from "../../session";
import { LoginPackets } from "../loginPackets";
import * as bcrypt from 'bcrypt';
import { Config } from "../../../util/config";
import { LoginService } from "../loginService";
import { PreLoginClient } from "../types/preLoginClient";


export class PreLoginPasswordHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {

        const username = packet.readMapleAsciiString();
        const password = packet.readMapleAsciiString();
        packet.skip(6);
        const hwidBytes = packet.read(4);
        const hwidNibbles = hwidBytes.toString('hex');

        let preLoginClient;
        if (LoginServer.instance.preLoginStore.has(session.id)) {
            preLoginClient = LoginServer.instance.preLoginStore.get(session.id);
            preLoginClient.attempts++;

            if (preLoginClient.attempts > 4) {
                // TODO: Do something else here lol
                const encSession = LoginServer.instance.sessionStore.get(session.id);
                encSession.write(LoginPackets.getLoginFailed(6));
                LoginServer.instance.logger.warn(`Remote address ${session.socket.remoteAddress} maxed out on login attempts`);
                return;
            }
        } else {
            preLoginClient = {username: username, password: password, hwidNibbles: hwidNibbles, attempts: 1, sessionId: session.id} as PreLoginClient;
            LoginServer.instance.preLoginStore.set(session.id, preLoginClient);
        }

        // Send request to CenterServer to get account information
        LoginServer.instance.centerServerSession.socket.write(LoginPackets.getPreLoginRequest(preLoginClient));
    }
}

export class PreLoginPasswordAckHandler implements PacketHandler {
    async handlePacket(packet: PacketReader, session: Session): Promise<void> {

        const sessionId = packet.readInt();
        const found = packet.readBoolean();
        const preLoginClient = LoginServer.instance.preLoginStore.get(sessionId);
        const encSession = LoginServer.instance.sessionStore.get(sessionId);

        if (!preLoginClient || !encSession) {
            LoginServer.instance.logger.warn(`Could not fetch PreLoginClient or EncryptedSession for session ${sessionId}`);
            return; // Something went wrong
        }

        if (!found) {
            // Account not found
            if (Config.instance.login.useAutoRegister) {
                // Write AutoRegister packet to CenterServer using username and password
                LoginServer.instance.logger.info(`Auto registering ${preLoginClient.username}`);
                const hashedPassword = bcrypt.hashSync(preLoginClient.password, 12);
                session.socket.write(LoginPackets.getAutoRegister(sessionId, preLoginClient.username, hashedPassword));
                return;
            }
            LoginServer.instance.logger.debug(`Username ${preLoginClient.username} not found when attempting login`);
            encSession.write(LoginPackets.getLoginFailed(5));
            return;
        }

        // Parse the information
        // TODO: Check if all these fields are necessary
        const loginInfo = LoginService.readLoginInfo(packet);
        LoginService.login(preLoginClient, encSession, loginInfo);
    }
}

export class AutoRegisterAckHandler implements PacketHandler {
    handlePacket(packet: PacketReader, session: Session): void {

        const sessionId = packet.readInt();
        const success = packet.readBoolean();

        if (!success) {
            // Something went wrong
            return;
        }

        const preLoginClient = LoginServer.instance.preLoginStore.get(sessionId);
        const encSession = LoginServer.instance.sessionStore.get(sessionId);

        if (!preLoginClient || !encSession) {
            LoginServer.instance.logger.warn(`Could not fetch PreLoginClient or EncryptedSession for session ${sessionId}`);
            return;
        }

        const loginInfo = LoginService.readLoginInfo(packet);
        LoginService.login(preLoginClient, encSession, loginInfo, true);
    }
    
}