/**
 * Given a ipfsHash it returns a ipfs url. Format: ipfs://hash
 * @param ipfsHash
 */
export const getIpfsURL = (ipfsHash: string): string =>
    `ipfs://${cleanHash(ipfsHash)}`;

/**
 * As it is a hash that is going to be read by Kleros, it needs to have an extra path
 * @param ipfsHash
 */
export const getIpfsURLWithKlerosPath = (ipfsHash: string): string =>
    `ipfs/${cleanHash(ipfsHash)}`;

export const isIpfsUrl = (value: unknown): value is string => {
    return (
        typeof value === 'string' &&
        (value.startsWith('ipfs://') || value.startsWith('ipfs/'))
    );
};

/**
 * Given a IPFS Hash or Url it returns just the hash to be used to fetch data
 * @param hash
 */
export function cleanHash(hash: string) {
    // First replace the "ipfs://" and then the "ipfs/" that is needed for kleros
    // Expected hash as example: ipfs://ipfs/QmSaqcFHpTBP4Ks1DoLuE4yjDSWcr4xBxsnRvW3k8EFc6F
    return hash.replace(/^ipfs?:\/\//, '').replace(/^ipfs\//, '');
}
