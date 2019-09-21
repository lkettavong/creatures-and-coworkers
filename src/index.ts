import { default as initServer } from './initServer';

const { PORT } = process.env;

const server = initServer();
server.listen(PORT);
console.log(`Server running on port: ${PORT}`);

import {go} from './stateReconstructor';

//go();
