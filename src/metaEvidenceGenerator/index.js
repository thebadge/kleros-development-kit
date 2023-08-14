const ipfsGateway = "https://ipfs.kleros.io/ipfs/";
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

function badgeByDisputeIdQuery(disputeId){
    return`
        {
            klerosBadgeRequests(where: {disputeID: "${disputeId}"}) {
                badgeKlerosMetaData {
                  badge {
                    id
                    uri
                    validUntil
                    createdTxHash
                    createdAt
                    badgeModel {
                      id
                      uri
                      badgeModelKleros {
                        removalUri
                        registrationUri
                      }
                    }
                  }
                }
                requester
                challenger
          }
    }`
}

/**
 * Helpers functions that allows us to fetch items from ipfs
 * @param ipfsHash
 */
function getContentOnIPFS(ipfsHash) {
    const hash = ipfsHash.replace(/^ipfs?:\/\//, '').replace(/^ipfs\//, '');
    return fetch(ipfsGateway + hash).then((response) => {
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

   const requestPromise = gqlQuery(arbitrableChainID, badgeByDisputeIdQuery(disputeID))


    Promise.all([requestPromise]).then(([request]) => {
        // Get badge and badgeModel object related to this DisputeID using TheGraph
        const klerosBadgeRequests = request.klerosBadgeRequests[0];

        const badge = klerosBadgeRequests.badgeKlerosMetaData.badge;
        const requester = klerosBadgeRequests.requester;
        const challenger = klerosBadgeRequests.challenger;

        const badgeModel = badge.badgeModel

        const badgeModelRemovalPromise = getContentOnIPFS(badgeModel.badgeModelKleros.removalUri)
        const badgeModelRegistrationPromise = getContentOnIPFS(badgeModel.badgeModelKleros.registrationUri)

        const badgeMetadataPromise = getContentOnIPFS(badge.uri)

        // Generate the url to allow the jurors see the Submission on TheBadge App
        const linkToSubmissionView = TB_FRONT_END_URL[arbitrableChainID] + `/badge/preview/${badge.id}`

        Promise.all([badgeModelRemovalPromise, badgeModelRegistrationPromise,badgeMetadataPromise])
            .then(([badgeModelRemoval, badgeModelRegistration,badgeMetadata]) => {
            resolveScript({
                // Generate the url to allow the jurors see the evidences
                arbitrableInterfaceURI: TB_FRONT_END_URL[arbitrableChainID] + '/',
                title: `Badge Dispute for **${badgeMetadata.name}**`,
                description: `There is a challenge over [a submission](${linkToSubmissionView}) for a certificate.\n\nCert Name: ${badgeMetadata.name}\n\nCert Description: ${badgeMetadata.description}\n\nHere are the relevant details:\n\n- Badge ID: ${badge.id}\n- Badge Model ID: ${badge.badgeModel.id}\n- Badge Requester: ${requester}\n- Challenged: ${challenger}\n\n- Contract Address: ${arbitrableContractAddress}\n- Network ID: ${arbitrableChainID}\n\nHere you can read [the curation policy](${ipfsGateway}${badgeModelRegistration.fileURI}).Based on this information, please vote on the validity of the challenge.\n\n`,
            });
        })
    })
}

// module.exports = { getMetaEvidence };
