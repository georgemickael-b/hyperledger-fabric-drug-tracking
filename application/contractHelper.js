const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const constants = require('./constants')
const ORG_MSP_MAP = constants.ORG_MSP_MAP
const ORG_ADMIN_IDENTITY_LABEL_MAP = constants.ORG_ADMIN_IDENTITY_LABEL_MAP
let gateway;

async function getContractInstance(org) {

	// A gateway defines which peer is used to access Fabric network
	// It uses a common connection profile (CCP) to connect to a Fabric Peer
	// A CCP is defined manually in file connection-profile-mhrd.yaml
	gateway = new Gateway();

	// A wallet is where the credentials to be used for this transaction exist
	// Credentials for user MHRD_ADMIN was initially added to this wallet.
	const wallet = new FileSystemWallet(`./identity/${org}`);

	// What is the username of this Client user accessing the network?
	const fabricUserName = ORG_ADMIN_IDENTITY_LABEL_MAP[org];

	// Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
	let connectionProfile = yaml.safeLoad(fs.readFileSync(`./connection-profile-${org}.yaml`, 'utf8'));

	// Set connection options; identity and wallet
	let connectionOptions = {
		wallet: wallet,
		identity: fabricUserName,
		discovery: { enabled: false, asLocalhost: true }
	};

	// Connect to gateway using specified parameters
	console.log('.....Connecting to Fabric Gateway');
	await gateway.connect(connectionProfile, connectionOptions);

	// Access certification channel
	console.log('.....Connecting to channel - pharmachannel');
	const channel = await gateway.getNetwork('pharmachannel');

	// Get instance of deployed Certnet contract
	// @param Name of chaincode
	// @param Name of smart contract
	console.log('.....Connecting to pharmanet Smart Contract');
	return channel.getContract('pharmanet', `org.pharma-network.pharmanet.contract.${org}`);
}

function disconnect() {
	console.log('.....Disconnecting from Fabric Gateway');
	gateway.disconnect();
}

module.exports.getContractInstance = getContractInstance;
module.exports.disconnect = disconnect;