import { install as installCommand } from './index';
export function install() {
    installCommand(require('./active-users').command);
    installCommand(require('./actor-moved').command);
    installCommand(require('./connected').command);
    installCommand(require('./debug').command);
    installCommand(require('./disconnected').command);
    installCommand(require('./error').command);
    installCommand(require('./help').command);
    installCommand(require('./pong').command);
    installCommand(require('./room-description').command);
    installCommand(require('./system').command);
    installCommand(require('./talk-global').command);
    installCommand(require('./talk-private').command);
    installCommand(require('./talk-room').command);
}
