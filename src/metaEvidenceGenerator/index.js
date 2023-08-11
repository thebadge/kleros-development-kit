const ipfsGateway = "https://ipfs.kleros.io";
const SUBGRAPH_ENDPOINT_PREFIX = "https://api.thegraph.com/subgraphs/name";
const subgraphEndpoints = {
    1: `${SUBGRAPH_ENDPOINT_PREFIX}/thebadgeadmin/staging`,
    5: `${SUBGRAPH_ENDPOINT_PREFIX}/thebadgeadmin/develop`,
};
const TB_FRONT_END_URL = {
    1: 'https://dev-app.thebadge.xyz/',
    5: 'https://dev-app.thebadge.xyz/'
}

/**
 * Helpers that allows us to call the TheGraph to fetch needed data
 * @param chainID
 * @param query
 */
function gqlQuery(chainID, query) {
    return fetch(subgraphEndpoints[chainID], {
        headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: query,
        }),
        method: "POST",
        mode: "cors",
    })
        .then((r) => r.json())
        .then((json) => json.data);
}

/**
 * Helpers functions that allows us to fetch items from ipfs
 * @param ipfsHash
 */
function getContentOnIPFS(ipfsHash) {
    return fetch(ipfsGateway + ipfsHash).then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not OK");
        }
        return response.json().then();
    });
}

async function getMetaEvidence() {
    const { disputeID, arbitrableChainID, arbitrableContractAddress } = scriptParameters;
    if (!disputeID || !arbitrableChainID) {
        console.log("missing parameters");
        resolveScript({});
        return;
    }

    // Generate the url to allow the jurors see the Submission on TheBadge App
    const linkToSubmissionView = TB_FRONT_END_URL[arbitrableChainID] + '/badge/preview/1'

    // Fetch badge and badgeModel object related to this DisputeID using TheGraph
    const badge = {}

    resolveScript({
        // Generate the url to allow the jurors see the evidences
        arbitrableInterfaceURI: TB_FRONT_END_URL[arbitrableChainID] + '/',
        title: `Badge Dispute for [BadgeName]`,
        description: `
        There is a challenge over [a submission](${linkToSubmissionView}) on a certificate. 
        Here are the relevant details:\n\n
        - Badge ID: ${badge.id}\n
        - Badge Model ID: ${badge.badgeModel.id}\n
        - Contract Address: ${arbitrableContractAddress}\n
        - Network ID: ${arbitrableChainID}\n\n
        Here you can read [the curation policy](${ipfsGateway}${fileURI}). 
        
        Based on this information, please vote on the validity of the challenge.\n\n
        `,
    });
}

// module.exports = { getMetaEvidence };
